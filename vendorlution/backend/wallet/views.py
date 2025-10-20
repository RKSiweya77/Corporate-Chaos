from __future__ import annotations

import json
import re
import uuid
from decimal import Decimal, InvalidOperation

import requests
from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction as db_transaction

from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Wallet, LedgerEntry, PaymentIntent, PayoutRequest, WebhookLog
from .services import WalletService

from wallet.providers.ozow import (
    post_payment_request_payload,
    verify_webhook_signature,
)


def _to_two_dp(value: Decimal) -> str:
    return f"{value.quantize(Decimal('0.01'))}"


def _safe_bank_ref(seed: str) -> str:
    base = ("VDL-" + re.sub(r"[^A-Za-z0-9]", "", seed))[:20]
    return base or "VDL-REF-1"


def _ozow_base() -> str:
    return "https://stagingapi.ozow.com" if getattr(settings, "OZOW_IS_TEST", True) else "https://api.ozow.com"


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


# ------------------------ Ozow: start deposit (Create Payment Request) ------------------------
class OzowDepositStartView(APIView):
    """
    POST { amount: "50.00", intent_id?: "uuid" }
    -> { redirect_url, reference, intent_id }

    Creates/uses a PaymentIntent, POSTs to Ozow /PostPaymentRequest,
    stores paymentRequestId, and returns Ozow's redirect URL.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        raw_amount = str(request.data.get("amount", "")).strip()
        intent_id = request.data.get("intent_id")

        if not raw_amount:
            return Response({"detail": "Amount is required."}, status=400)

        try:
            amount = Decimal(raw_amount)
        except InvalidOperation:
            return Response({"detail": "Invalid amount."}, status=400)

        if amount < Decimal("10.00"):
            return Response({"detail": "Minimum deposit is R 10.00"}, status=400)

        required = {
            "OZOW_SITE_CODE": getattr(settings, "OZOW_SITE_CODE", None),
            "OZOW_API_KEY": getattr(settings, "OZOW_API_KEY", None),
            "OZOW_PRIVATE_KEY": getattr(settings, "OZOW_PRIVATE_KEY", None),
            "OZOW_SUCCESS_URL": getattr(settings, "OZOW_SUCCESS_URL", None),
            "OZOW_CANCEL_URL": getattr(settings, "OZOW_CANCEL_URL", None),
            "OZOW_ERROR_URL": getattr(settings, "OZOW_ERROR_URL", None),
            "OZOW_NOTIFY_URL": getattr(settings, "OZOW_NOTIFY_URL", None),
        }
        missing = [k for k, v in required.items() if not v or str(v).startswith("PLACEHOLDER")]
        if missing:
            return Response(
                {"detail": f"Server misconfiguration: {', '.join(missing)} not set."},
                status=500,
            )

        wallet, _ = Wallet.objects.get_or_create(user=request.user)

        if intent_id:
            try:
                intent = PaymentIntent.objects.get(id=intent_id, user=request.user)
                if intent.status not in ["created", "pending"]:
                    return Response({"detail": "Intent already processed"}, status=400)
                intent.amount = amount  # allow amount override if needed
                intent.save(update_fields=["amount"])
            except PaymentIntent.DoesNotExist:
                return Response({"detail": "Invalid intent_id"}, status=404)
        else:
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

        payload = post_payment_request_payload(
            site_code=required["OZOW_SITE_CODE"],
            api_key=required["OZOW_API_KEY"],
            private_key=required["OZOW_PRIVATE_KEY"],
            amount=_to_two_dp(intent.amount),
            transaction_reference=tx_ref,
            bank_reference=bank_ref,
            cancel_url=required["OZOW_CANCEL_URL"],
            error_url=required["OZOW_ERROR_URL"],
            success_url=required["OZOW_SUCCESS_URL"],
            notify_url=required["OZOW_NOTIFY_URL"],
            is_test=getattr(settings, "OZOW_IS_TEST", True),
            country_code="ZA",
            currency_code="ZAR",
            optional1=request.data.get("optional1", ""),
            optional2=request.data.get("optional2", ""),
            optional3=request.data.get("optional3", ""),
            optional4=request.data.get("optional4", ""),
            optional5=request.data.get("optional5", ""),
            customer=request.user.email or "",
            customer_identifier=request.data.get("customerIdentifier", ""),
            customer_cellphone_number=request.data.get("customerCellphoneNumber", ""),
            selected_bank_id=request.data.get("selectedBankId", ""),
            allow_variable_amount=bool(request.data.get("allowVariableAmount", False)),
            variable_amount_min=request.data.get("variableAmountMin"),
            variable_amount_max=request.data.get("variableAmountMax"),
        )

        headers = {
            "Accept": "application/json, application/xml",
            "Content-Type": "application/json",
            "ApiKey": required["OZOW_API_KEY"],
        }

        try:
            resp = requests.post(
                f"{_ozow_base()}/PostPaymentRequest",
                json=payload,
                headers=headers,
                timeout=30,
            )
        except requests.RequestException as exc:
            intent.status = "failed"
            intent.save(update_fields=["status"])
            return Response({"detail": "Failed to reach Ozow", "error": str(exc)}, status=502)

        try:
            data = resp.json()
        except Exception:
            intent.status = "failed"
            intent.save(update_fields=["status"])
            return Response(
                {"detail": "Invalid Ozow response", "status": resp.status_code, "raw": resp.text},
                status=502,
            )

        if resp.status_code >= 400:
            intent.status = "failed"
            intent.save(update_fields=["status"])
            return Response(
                {"detail": "Ozow declined request", "status": resp.status_code, "response": data},
                status=502,
            )

        redirect_url = data.get("url")
        payment_request_id = data.get("paymentRequestId")
        if not redirect_url:
            intent.status = "failed"
            intent.save(update_fields=["status"])
            return Response(
                {"detail": data.get("errorMessage") or "Ozow did not return a URL", "response": data},
                status=502,
            )

        intent.provider_reference = payment_request_id or intent.provider_reference or uuid.uuid4().hex
        intent.status = "pending"
        intent.save(update_fields=["provider_reference", "status"])

        return Response({
            "redirect_url": redirect_url,
            "reference": tx_ref,
            "intent_id": str(intent.id),
            "amount": str(intent.amount),
            "payment_request_id": intent.provider_reference,
        })


# ------------------------ Ozow: webhook ------------------------
@csrf_exempt
@api_view(["POST", "GET"])
@permission_classes([])
def ozow_webhook(request):
    raw = request.body.decode("utf-8") if request.body else ""

    try:
        data = json.loads(raw) if raw else {}
    except Exception:
        data = {}

    if request.method == "POST":
        data.update(request.POST.dict())
    else:
        data.update(request.GET.dict())

    webhook_log = WebhookLog.objects.create(
        provider="ozow",
        event_time=timezone.now(),
        path=request.path,
        payload=data,
        raw_body=raw,
        status_code=200,
    )

    reference = data.get("TransactionReference") or data.get("transactionReference") or ""
    status_text = (data.get("Status") or data.get("status") or "").strip().lower()
    amount_str = data.get("Amount") or data.get("amount") or "0"
    transaction_id = data.get("TransactionId") or data.get("transactionId") or ""

    if not reference:
        webhook_log.notes = "Missing TransactionReference"
        webhook_log.save(update_fields=["notes"])
        return Response({"detail": "Missing reference"}, status=200)

    try:
        intent = PaymentIntent.objects.select_related("user", "wallet").get(id=reference, provider="ozow")
    except (PaymentIntent.DoesNotExist, ValueError):
        webhook_log.notes = f"Intent not found: {reference}"
        webhook_log.save(update_fields=["notes"])
        return Response({"detail": "Unknown reference"}, status=200)

    if intent.status in ["succeeded", "failed", "cancelled"]:
        webhook_log.notes = f"Already processed as {intent.status}"
        webhook_log.save(update_fields=["notes"])
        return Response({"detail": "Already processed"}, status=200)

    private_key = getattr(settings, "OZOW_PRIVATE_KEY", "")
    if private_key and not private_key.startswith("PLACEHOLDER"):
        if not verify_webhook_signature(data, private_key):
            webhook_log.notes = "Invalid signature"
            webhook_log.save(update_fields=["notes"])
            return Response({"detail": "Invalid signature"}, status=400)

    with db_transaction.atomic():
        if status_text == "complete":
            order_id = intent.metadata.get("order_id") if intent.metadata else None

            if order_id:
                from main.models import Order
                try:
                    order = Order.objects.get(id=order_id)
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
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)

        from main.models import VendorProfile
        vendor = VendorProfile.objects.filter(user=request.user).first()

        return Response({
            "wallet_balance": str(wallet.balance),
            "wallet_pending": str(wallet.pending),
            "is_vendor": vendor is not None,
            "vendor_shop_name": vendor.shop_name if vendor else None,
        })