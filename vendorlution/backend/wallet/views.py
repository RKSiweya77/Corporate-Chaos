# wallet/views.py
from __future__ import annotations

import json
import re
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Wallet, LedgerEntry, PaymentIntent, PayoutRequest, WebhookLog
from .providers.ozow import build_hosted_payment_url


# ------------------------ helpers ------------------------
def _to_two_dp(value: Decimal) -> str:
    return f"{value.quantize(Decimal('0.01'))}"


def _safe_bank_ref(seed: str) -> str:
    """
    Ozow requires <=20 chars; alnum, spaces and dashes allowed.
    We generate a compact 'VDL-XXXXXXXXXX' style and strip other chars.
    """
    base = ("VDL-" + re.sub(r"[^A-Za-z0-9]", "", seed))[:20]
    return base or "VDL-REF-1"


def _credit_wallet(wallet: Wallet, amount: Decimal, *, ref: str, meta: dict | None = None):
    wallet.balance = (wallet.balance or Decimal("0")) + amount
    wallet.save(update_fields=["balance"])
    LedgerEntry.objects.create(
        wallet=wallet,
        type="credit",
        amount=amount,
        currency="ZAR",
        description="Deposit (Ozow)",
        reference=ref,
        metadata=meta or {},
    )


def _debit_wallet(wallet: Wallet, amount: Decimal, *, ref: str, meta: dict | None = None):
    wallet.balance = (wallet.balance or Decimal("0")) - amount
    wallet.save(update_fields=["balance"])
    LedgerEntry.objects.create(
        wallet=wallet,
        type="debit",
        amount=amount,
        currency="ZAR",
        description="Withdrawal",
        reference=ref,
        metadata=meta or {},
    )


# ------------------------ me/transactions ------------------------
class MeWalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        last5 = LedgerEntry.objects.filter(wallet=wallet).order_by("-created_at")[:5]
        return Response({
            "id": wallet.id,
            "balance": str(wallet.balance or Decimal("0")),
            "currency": wallet.currency,
            "updated_at": wallet.updated_at,
            "recent": [
                {
                    "id": e.id,
                    "type": e.type,
                    "amount": str(e.amount),
                    "description": e.description,
                    "reference": e.reference,
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
            "id": e.id,
            "type": e.type,
            "amount": str(e.amount),
            "currency": e.currency,
            "description": e.description,
            "reference": e.reference,
            "created_at": e.created_at,
        } for e in qs]
        return Response(data)


# ------------------------ Ozow: start deposit ------------------------
class OzowDepositStartView(APIView):
    """
    POST { amount: "50.00" }  ->  { redirect_url, reference }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Validate amount
        raw_amount = str(request.data.get("amount", "")).strip()
        if not raw_amount:
            return Response({"detail": "Amount is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            amount = Decimal(raw_amount)
        except InvalidOperation:
            return Response({"detail": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)
        if amount <= 0:
            return Response({"detail": "Amount must be greater than 0."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate required settings (per Ozow docs)
        required_settings = {
            "OZOW_SITE_CODE": getattr(settings, "OZOW_SITE_CODE", None),
            "OZOW_API_KEY": getattr(settings, "OZOW_API_KEY", None),
            "OZOW_PRIVATE_KEY": getattr(settings, "OZOW_PRIVATE_KEY", None),
            "OZOW_SUCCESS_URL": getattr(settings, "OZOW_SUCCESS_URL", None),
            "OZOW_CANCEL_URL": getattr(settings, "OZOW_CANCEL_URL", None),
            "OZOW_ERROR_URL": getattr(settings, "OZOW_ERROR_URL", None),
            "OZOW_NOTIFY_URL": getattr(settings, "OZOW_NOTIFY_URL", None),
        }
        missing = [k for k, v in required_settings.items() if not v]
        if missing:
            return Response(
                {"detail": f"Server misconfiguration; missing {', '.join(missing)}."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Ensure wallet & intent
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        intent = PaymentIntent.objects.create(
            user=request.user,
            wallet=wallet,
            provider="ozow",
            amount=amount,
            currency="ZAR",
            status="created",
            # many codebases have an auto `reference`; if not, str(id) will be used below
        )

        # Choose transaction reference & bank reference
        tx_ref = getattr(intent, "reference", None) or str(intent.id)
        bank_ref = _safe_bank_ref(tx_ref)

        # Determine environment
        is_test = bool(getattr(settings, "OZOW_IS_TEST", True))
        # If you prefer LIVE_MODE flag, uncomment:
        # is_test = not bool(getattr(settings, "LIVE_MODE", False))

        try:
            redirect_url, payment_request_id, payload = build_hosted_payment_url(
                site_code=required_settings["OZOW_SITE_CODE"],
                api_key=required_settings["OZOW_API_KEY"],
                private_key=required_settings["OZOW_PRIVATE_KEY"],
                amount=_to_two_dp(amount),
                transaction_reference=tx_ref,
                bank_reference=bank_ref,
                success_url=required_settings["OZOW_SUCCESS_URL"],
                cancel_url=required_settings["OZOW_CANCEL_URL"],
                error_url=required_settings["OZOW_ERROR_URL"],
                notify_url=required_settings["OZOW_NOTIFY_URL"],
                customer=(request.user.email or None),
                is_test=is_test,
            )
        except Exception as e:
            # Persist some context on the intent for troubleshooting
            try:
                if hasattr(intent, "provider_payload"):
                    intent.provider_payload = {"error": str(e)}
                    intent.save(update_fields=["provider_payload"])
                else:
                    intent.error = str(e)  # if a generic text field exists
                    intent.save(update_fields=["error"])
            except Exception:
                pass
            return Response(
                {"detail": f"Ozow start failed: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Save success context (non-fatal if fields don't exist)
        try:
            to_set = []
            if hasattr(intent, "provider_payload"):
                intent.provider_payload = {
                    "paymentRequestId": payment_request_id,
                    "request": payload,
                    "redirect_url": redirect_url,
                }
                to_set.append("provider_payload")
            if hasattr(intent, "status"):
                intent.status = "pending"
                to_set.append("status")
            if to_set:
                intent.save(update_fields=to_set + ["updated_at"] if hasattr(intent, "updated_at") else to_set)
        except Exception:
            pass

        return Response(
            {"redirect_url": redirect_url, "reference": tx_ref},
            status=status.HTTP_200_OK,
        )


# ------------------------ Ozow: webhook (credit wallet) ------------------------
@csrf_exempt
@api_view(["POST"])
@permission_classes([])  # Ozow calls this
def ozow_webhook(request):
    """
    Handles TransactionNotificationResponse from Ozow and credits wallet on Complete.
    We don't hard-fail on duplicates.
    """
    raw = request.body.decode("utf-8") or ""
    try:
        data = json.loads(raw)
    except Exception:
        # Ozow sends x-www-form-urlencoded by default – support both.
        data = request.POST.dict()

    WebhookLog.objects.create(provider="ozow", raw_body=json.dumps(data))

    # Normalized keys according to docs
    reference = data.get("TransactionReference") or data.get("transactionReference")
    status_text = (data.get("Status") or data.get("status") or "").strip().lower()

    if not reference:
        return Response({"detail": "Missing TransactionReference."}, status=status.HTTP_200_OK)

    intent = PaymentIntent.objects.filter(reference=reference, provider="ozow").first()
    if not intent:
        # Also try by id string (if your model doesn't have 'reference')
        intent = PaymentIntent.objects.filter(id=reference, provider="ozow").first()

    if not intent:
        return Response({"detail": "Unknown reference."}, status=status.HTTP_200_OK)

    # Idempotency
    if getattr(intent, "status", "") in {"succeeded", "failed", "cancelled"}:
        return Response({"detail": "Already processed."}, status=status.HTTP_200_OK)

    if status_text == "complete":
        _credit_wallet(intent.wallet, intent.amount, ref=getattr(intent, "reference", str(intent.id)), meta=data)
        try:
            intent.status = "succeeded"
            intent.completed_at = timezone.now()
            intent.save(update_fields=["status", "completed_at"])
        except Exception:
            pass
    elif status_text in {"cancelled", "error", "abandoned"}:
        try:
            intent.status = "failed"
            intent.completed_at = timezone.now()
            intent.save(update_fields=["status", "completed_at"])
        except Exception:
            pass

    return Response({"ok": True})


# ------------------------ Withdraw ------------------------
class WithdrawRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount_raw = str(request.data.get("amount", "")).strip()
        bank_name = request.data.get("bank_name", "")
        acc_no = request.data.get("account_number", "")
        acc_holder = request.data.get("account_holder", "")
        branch_code = request.data.get("branch_code", "")

        if not amount_raw:
            return Response({"detail": "Amount is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            amount = Decimal(amount_raw)
        except InvalidOperation:
            return Response({"detail": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)
        if amount <= 0:
            return Response({"detail": "Amount must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)

        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        if (wallet.balance or Decimal("0")) < amount:
            return Response({"detail": "Insufficient balance."}, status=status.HTTP_400_BAD_REQUEST)

        payout = PayoutRequest.objects.create(
            user=request.user,
            wallet=wallet,
            amount=amount,
            currency="ZAR",
            bank_name=bank_name,
            account_number=acc_no,
            account_holder=acc_holder,
            branch_code=branch_code,
            status="requested",
        )

        _debit_wallet(wallet, amount, ref=payout.reference, meta={"payout_id": payout.id})
        return Response({
            "reference": payout.reference,
            "status": payout.status,
            "amount": str(amount),
        }, status=status.HTTP_201_CREATED)
