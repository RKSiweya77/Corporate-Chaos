# wallet/views.py
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
from .providers.ozow import build_hosted_payment_url
from .services import WalletService

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
    """POST { amount: "50.00" } -> { redirect_url, reference }"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Validate amount
        raw_amount = str(request.data.get("amount", "")).strip()
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
        
        missing = [k for k, v in required.items() if not v or v.startswith("<")]
        if missing:
            return Response(
                {"detail": f"Server misconfiguration: {', '.join(missing)} not set. Please contact support."},
                status=500
            )

        # Create wallet & intent
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
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
                amount=_to_two_dp(amount),
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
        })

# ------------------------ Ozow: webhook ------------------------
@csrf_exempt
@api_view(["POST"])
@permission_classes([])
def ozow_webhook(request):
    """Handle Ozow TransactionNotificationResponse"""
    raw = request.body.decode("utf-8") or ""
    
    try:
        data = json.loads(raw)
    except Exception:
        data = request.POST.dict()

    # Log everything
    webhook_log = WebhookLog.objects.create(
        provider="ozow",
        event_time=timezone.now(),
        path=request.path,
        payload=data,
        status_code=200,
    )

    # Extract keys (case-insensitive)
    reference = data.get("TransactionReference") or data.get("transactionReference")
    status_text = (data.get("Status") or data.get("status") or "").strip().lower()
    amount_str = data.get("Amount") or data.get("amount") or "0"
    transaction_id = data.get("TransactionId") or data.get("transactionId")

    if not reference:
        webhook_log.notes = "Missing TransactionReference"
        webhook_log.save(update_fields=["notes"])
        return Response({"detail": "Missing reference"}, status=200)

    # Find intent
    intent = PaymentIntent.objects.filter(id=reference, provider="ozow").first()
    if not intent:
        webhook_log.notes = f"Intent not found: {reference}"
        webhook_log.save(update_fields=["notes"])
        return Response({"detail": "Unknown reference"}, status=200)

    # Idempotency check
    if intent.status in ["succeeded", "failed", "cancelled"]:
        webhook_log.notes = f"Already processed as {intent.status}"
        webhook_log.save(update_fields=["notes"])
        return Response({"detail": "Already processed"}, status=200)

    # Process based on status
    with db_transaction.atomic():
        if status_text == "complete":
            # Credit wallet
            WalletService.post_credit(
                user=intent.user,
                amount=intent.amount,
                source="ozow_deposit",
                reference=f"OZOW-{transaction_id or reference}",
                description=f"Deposit via Ozow (R {intent.amount})",
                idem=f"ozow-{reference}",
            )
            
            intent.status = "succeeded"
            intent.provider_reference = transaction_id or intent.provider_reference
            intent.save(update_fields=["status", "provider_reference"])
            
            webhook_log.notes = f"Credited R {intent.amount} to wallet"
            webhook_log.save(update_fields=["notes"])

        elif status_text in ["cancelled", "error", "abandoned"]:
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

        if not all([holder, bank_name, acc_no]):
            return Response({"detail": "Bank details incomplete."}, status=400)

        with db_transaction.atomic():
            payout = PayoutRequest.objects.create(
                user=request.user,
                wallet=wallet,
                amount=amount,
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
        return Response({
            "wallet_balance": str(wallet.balance),
            "wallet_pending": str(wallet.pending),
        })