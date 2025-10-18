# wallet/views.py - COMPLETE FINAL VERSION
from __future__ import annotations

import json
import re
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction as db_transaction

from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Wallet, LedgerEntry, PaymentIntent, PayoutRequest, WebhookLog
from .services import WalletService

# Import Ozow functions directly from the module
from wallet.providers.ozow import build_hosted_payment_url, verify_webhook_signature


# ------------------------ helpers ------------------------
def _to_two_dp(value: Decimal) -> str:
    return f"{value.quantize(Decimal('0.01'))}"


def _safe_bank_ref(seed: str) -> str:
    """Ozow requires <=20 chars; alnum, spaces and dashes allowed."""
    base = ("VDL-" + re.sub(r"[^A-Za-z0-9]", "", seed))[:20]
    return base or "VDL-REF-1"


# ------------------------ wallet overview ------------------------
class MeWalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        last5 = LedgerEntry.objects.filter(wallet=wallet).order_by("-created_at")[:5]
        return Response({
            "id": wallet.id,
            "balance": str(wallet.balance or Decimal("0")),
            "pending": str(wallet.pending or Decimal("0")),
            "currency": "ZAR",
            "created_at": wallet.created_at,
            "recent": [
                {
                    "id": str(e.id),
                    "entry_type": e.type,
                    "amount": str(e.amount),
                    "description": e.description,
                    "reference": e.reference,
                    "balance_after": str(e.balance_after),
                    "created_at": e.created_at,
                } for e in last5
            ]
        })


class TransactionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        qs = LedgerEntry.objects.filter(wallet=wallet).order_by("-created_at")
        data = [{
            "id": str(e.id),
            "entry_type": e.type,
            "amount": str(e.amount),
            "description": e.description,
            "reference": e.reference,
            "balance_after": str(e.balance_after),
            "created_at": e.created_at,
        } for e in qs]
        return Response(data)


# ------------------------ Ozow: start deposit ------------------------
class OzowDepositStartView(APIView):
    """
    POST { amount: "50.00", intent_id?: "uuid" }
    -> { redirect_url, reference, intent_id }
    
    Can be used for:
    1. Direct deposit (no intent_id) - creates new intent
    2. Order payment (with intent_id from checkout)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Validate amount
        raw_amount = str(request.data.get("amount", "")).strip()
        intent_id = request.data.get("intent_id")  # Optional: for order payments
        
        if not raw_amount:
            return Response({"detail": "Amount is required."}, status=400)
        
        try:
            amount = Decimal(raw_amount)
        except InvalidOperation:
            return Response({"detail": "Invalid amount."}, status=400)
        
        if amount < Decimal("10.00"):
            return Response({"detail": "Minimum deposit is R 10.00"}, status=400)

        # Validate settings
        required = {
            "OZOW_SITE_CODE": getattr(settings, "OZOW_SITE_CODE", None),
            "OZOW_API_KEY": getattr(settings, "OZOW_API_KEY", None),
            "OZOW_PRIVATE_KEY": getattr(settings, "OZOW_PRIVATE_KEY", None),
            "OZOW_SUCCESS_URL": getattr(settings, "OZOW_SUCCESS_URL", None),
            "OZOW_CANCEL_URL": getattr(settings, "OZOW_CANCEL_URL", None),
            "OZOW_ERROR_URL": getattr(settings, "OZOW_ERROR_URL", None),
            "OZOW_NOTIFY_URL": getattr(settings, "OZOW_NOTIFY_URL", None),
        }
        
        missing = [k for k, v in required.items() if not v or v.startswith("PLACEHOLDER")]
        if missing:
            return Response(
                {"detail": f"Server misconfiguration: {', '.join(missing)} not set. Please contact support."},
                status=500
            )

        # Get or create intent
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
        if intent_id:
            # Use existing intent from checkout
            try:
                intent = PaymentIntent.objects.get(id=intent_id, user=request.user)
                if intent.status not in ["created", "pending"]:
                    return Response({"detail": "Intent already processed"}, status=400)
            except PaymentIntent.DoesNotExist:
                return Response({"detail": "Invalid intent_id"}, status=404)
        else:
            # Create new intent for direct deposit
            intent = PaymentIntent.objects.create(
                user=request.user,
                wallet=wallet,
                provider="ozow",
                kind="deposit",
                amount=amount,
                currency="ZAR",
                status="created",
            )

        tx_ref = str(intent.id)
        bank_ref = _safe_bank_ref(tx_ref)
        is_test = getattr(settings, "OZOW_IS_TEST", not getattr(settings, "LIVE_MODE", False))

        try:
            redirect_url, payment_request_id, payload = build_hosted_payment_url(
                site_code=required["OZOW_SITE_CODE"],
                api_key=required["OZOW_API_KEY"],
                private_key=required["OZOW_PRIVATE_KEY"],
                amount=_to_two_dp(intent.amount),
                transaction_reference=tx_ref,
                bank_reference=bank_ref,
                success_url=required["OZOW_SUCCESS_URL"],
                cancel_url=required["OZOW_CANCEL_URL"],
                error_url=required["OZOW_ERROR_URL"],
                notify_url=required["OZOW_NOTIFY_URL"],
                customer=request.user.email or None,
                is_test=is_test,
            )
        except Exception as e:
            intent.status = "failed"
            intent.save(update_fields=["status"])
            return Response({"detail": f"Payment gateway error: {str(e)}"}, status=500)

        intent.provider_reference = payment_request_id
        intent.status = "pending"
        intent.save(update_fields=["provider_reference", "status"])

        return Response({
            "redirect_url": redirect_url,
            "reference": tx_ref,
            "intent_id": str(intent.id),
            "amount": str(intent.amount),
        })


# ------------------------ Ozow: webhook ------------------------
@csrf_exempt
@api_view(["POST", "GET"])
@permission_classes([])
def ozow_webhook(request):
    """
    Handle Ozow TransactionNotificationResponse
    Supports both POST (form data) and GET (query params)
    """
    raw = request.body.decode("utf-8") if request.body else ""
    
    # Try JSON first, then form data, then query params
    try:
        data = json.loads(raw) if raw else {}
    except Exception:
        data = {}
    
    # Merge POST data and GET params
    if request.method == "POST":
        data.update(request.POST.dict())
    else:
        data.update(request.GET.dict())

    # Log everything
    webhook_log = WebhookLog.objects.create(
        provider="ozow",
        event_time=timezone.now(),
        path=request.path,
        payload=data,
        raw_body=raw,
        status_code=200,
    )

    # Extract keys (case-insensitive)
    reference = data.get("TransactionReference") or data.get("transactionReference") or ""
    status_text = (data.get("Status") or data.get("status") or "").strip().lower()
    amount_str = data.get("Amount") or data.get("amount") or "0"
    transaction_id = data.get("TransactionId") or data.get("transactionId") or ""

    if not reference:
        webhook_log.notes = "Missing TransactionReference"
        webhook_log.save(update_fields=["notes"])
        return Response({"detail": "Missing reference"}, status=200)

    # Find intent
    try:
        intent = PaymentIntent.objects.select_related("user", "wallet").get(id=reference, provider="ozow")
    except (PaymentIntent.DoesNotExist, ValueError):
        webhook_log.notes = f"Intent not found: {reference}"
        webhook_log.save(update_fields=["notes"])
        return Response({"detail": "Unknown reference"}, status=200)

    # Idempotency check
    if intent.status in ["succeeded", "failed", "cancelled"]:
        webhook_log.notes = f"Already processed as {intent.status}"
        webhook_log.save(update_fields=["notes"])
        return Response({"detail": "Already processed"}, status=200)

    # Verify signature (optional but recommended)
    private_key = getattr(settings, "OZOW_PRIVATE_KEY", "")
    if private_key and not private_key.startswith("PLACEHOLDER"):
        if not verify_webhook_signature(data, private_key):
            webhook_log.notes = "Invalid signature"
            webhook_log.save(update_fields=["notes"])
            return Response({"detail": "Invalid signature"}, status=400)

    # Process based on status
    with db_transaction.atomic():
        if status_text == "complete":
            # Check if this is an order payment or direct deposit
            order_id = intent.metadata.get("order_id") if intent.metadata else None
            
            if order_id:
                # Order payment - mark order as paid and hold in escrow
                from main.models import Order
                try:
                    order = Order.objects.get(id=order_id)
                    
                    # Hold funds in escrow (pending)
                    intent.wallet.pending = (intent.wallet.pending or Decimal("0")) + intent.amount
                    intent.wallet.save(update_fields=["pending"])

                    LedgerEntry.objects.create(
                        wallet=intent.wallet,
                        type=LedgerEntry.Type.HOLD,
                        amount=intent.amount,
                        reference=f"ORDER-{order_id}",
                        description=f"Escrow hold for Order #{order_id} via Ozow",
                        balance_after=intent.wallet.balance,
                        source="ozow_payment",
                        status="posted",
                        idempotency_key=f"ozow-{reference}",
                    )

                    order.status = Order.Status.PAID
                    order.save(update_fields=["status"])
                    
                    webhook_log.notes = f"Order #{order_id} marked as PAID, funds held in escrow"
                except Order.DoesNotExist:
                    webhook_log.notes = f"Order #{order_id} not found"
            else:
                # Direct deposit - credit wallet immediately
                WalletService.post_credit(
                    user=intent.user,
                    amount=intent.amount,
                    source="ozow_deposit",
                    reference=f"OZOW-{transaction_id or reference}",
                    description=f"Deposit via Ozow (R {intent.amount})",
                    idem=f"ozow-{reference}",
                )
                webhook_log.notes = f"Credited R {intent.amount} to wallet"
            
            intent.status = "succeeded"
            intent.provider_reference = transaction_id or intent.provider_reference
            intent.save(update_fields=["status", "provider_reference"])
            webhook_log.save(update_fields=["notes"])

        elif status_text in ["cancelled", "error", "abandoned", "pending abandonment"]:
            intent.status = "failed"
            intent.save(update_fields=["status"])
            
            webhook_log.notes = f"Payment failed: {status_text}"
            webhook_log.save(update_fields=["notes"])

    return Response({"ok": True})


# ------------------------ Withdraw ------------------------
class WithdrawRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount_raw = str(request.data.get("amount", "")).strip()
        bank_account = request.data.get("bank_account", {})
        
        if not amount_raw:
            return Response({"detail": "Amount is required."}, status=400)
        
        try:
            amount = Decimal(amount_raw)
        except InvalidOperation:
            return Response({"detail": "Invalid amount."}, status=400)
        
        min_payout = Decimal(getattr(settings, "PAYOUT_MIN_AMOUNT", "10.00"))
        if amount < min_payout:
            return Response({"detail": f"Minimum withdrawal is R {min_payout}"}, status=400)

        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        if (wallet.balance or Decimal("0")) < amount:
            return Response({"detail": "Insufficient balance."}, status=400)

        # Extract bank details
        holder = bank_account.get("holder", "")
        bank_name = bank_account.get("bank_name", "")
        acc_no = bank_account.get("account_number", "")
        branch = bank_account.get("branch_code", "")
        acc_type = bank_account.get("account_type", "cheque")

        if not all([holder, bank_name, acc_no]):
            return Response({"detail": "Bank details incomplete."}, status=400)

        with db_transaction.atomic():
            payout = PayoutRequest.objects.create(
                user=request.user,
                wallet=wallet,
                amount=amount,
                bank_holder=holder,
                bank_name=bank_name,
                account_number=acc_no,
                branch_code=branch,
                account_type=acc_type,
                bank_account_last4=acc_no[-4:] if len(acc_no) >= 4 else acc_no,
                status="pending",
            )

            # Debit wallet immediately (freeze funds)
            WalletService.post_debit(
                user=request.user,
                amount=amount,
                source="payout_request",
                reference=f"PO-{payout.id}",
                description=f"Withdrawal request (R {amount})",
                idem=f"payout-{payout.id}",
            )

        return Response({
            "id": str(payout.id),
            "status": payout.status,
            "amount": str(amount),
            "created_at": payout.created_at,
        }, status=201)


# ------------------------ Vendor Profile endpoint for wallet ops ------------------------
class MeVendorProfileView(APIView):
    """Returns minimal vendor info needed for wallet UI"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
        # Try to get vendor profile
        from main.models import VendorProfile
        vendor = VendorProfile.objects.filter(user=request.user).first()
        
        return Response({
            "wallet_balance": str(wallet.balance),
            "wallet_pending": str(wallet.pending),
            "is_vendor": vendor is not None,
            "vendor_shop_name": vendor.shop_name if vendor else None,
        })