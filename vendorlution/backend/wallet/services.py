from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError

from .models import Wallet, LedgerEntry, PaymentIntent, WebhookLog, VoucherRedemption, PayoutRequest


class WalletService:
    @staticmethod
    def get_or_create_wallet(user, currency="ZAR"):
        wallet, _ = Wallet.objects.get_or_create(user=user, defaults={"currency": currency})
        return wallet

    @staticmethod
    def _ensure_idempotency(wallet, idempotency_key: str | None):
        if not idempotency_key:
            return None
        return LedgerEntry.objects.filter(wallet=wallet, idempotency_key=idempotency_key).first()

    @staticmethod
    @transaction.atomic
    def post_credit(user, amount: Decimal, source: str, reference: str = "", description: str = "", idem: str | None = None):
        wallet = WalletService.get_or_create_wallet(user)
        if amount <= 0:
            raise ValidationError("Invalid amount.")
        existing = WalletService._ensure_idempotency(wallet, idem)
        if existing:
            return wallet, existing

        wallet.balance = (wallet.balance or Decimal("0")) + amount
        wallet.updated_at = timezone.now()
        wallet.save(update_fields=["balance", "updated_at"])

        entry = LedgerEntry.objects.create(
            wallet=wallet,
            type="credit",
            amount=amount,
            balance_after=wallet.balance,
            source=source,
            reference=reference or "",
            description=description or "",
            status="posted",
            idempotency_key=idem or None,
        )
        return wallet, entry

    @staticmethod
    @transaction.atomic
    def post_debit(user, amount: Decimal, source: str, reference: str = "", description: str = "", idem: str | None = None):
        wallet = WalletService.get_or_create_wallet(user)
        if amount <= 0:
            raise ValidationError("Invalid amount.")
        if wallet.balance < amount:
            raise ValidationError("Insufficient balance.")

        existing = WalletService._ensure_idempotency(wallet, idem)
        if existing:
            return wallet, existing

        wallet.balance = wallet.balance - amount
        wallet.updated_at = timezone.now()
        wallet.save(update_fields=["balance", "updated_at"])

        entry = LedgerEntry.objects.create(
            wallet=wallet,
            type="debit",
            amount=amount,
            balance_after=wallet.balance,
            source=source,
            reference=reference or "",
            description=description or "",
            status="posted",
            idempotency_key=idem or None,
        )
        return wallet, entry


# --------- Payment Intent orchestration ---------
class IntentService:
    @staticmethod
    def create_intent(user, provider: str, amount: Decimal, currency="ZAR", return_url="", cancel_url=""):
        intent = PaymentIntent.objects.create(
            user=user,
            provider=provider,
            amount=amount,
            currency=currency,
            status="created",
            return_url=return_url,
            cancel_url=cancel_url,
        )
        return intent

    @staticmethod
    def mark_paid(intent: PaymentIntent, provider_ref: str, metadata: dict | None = None):
        if intent.status == "paid":
            return intent
        intent.status = "paid"
        intent.provider_ref = provider_ref
        intent.confirmed_at = timezone.now()
        if metadata:
            intent.metadata.update(metadata)
        intent.save(update_fields=["status", "provider_ref", "confirmed_at", "metadata"])
        return intent

    @staticmethod
    def mark_failed(intent: PaymentIntent, note: str = ""):
        intent.status = "failed"
        intent.metadata.update({"note": note})
        intent.save(update_fields=["status", "metadata"])
        return intent

    @staticmethod
    def record_webhook(provider: str, event_id: str, payload: dict, note: str = ""):
        return WebhookLog.objects.create(provider=provider, event_id=event_id, payload=payload, note=note)


# --------- Vouchers (currently manual "approve -> credit") ---------
class VoucherService:
    """
    In live you will hit issuer APIs to verify code & amount.
    For now we capture the code, then admin can approve (or auto-approve in sandbox).
    """
    @staticmethod
    @transaction.atomic
    def submit_code(user, issuer: str, code: str, amount: Decimal):
        v = VoucherRedemption.objects.create(user=user, issuer=issuer, code=code, amount=amount)
        return v

    @staticmethod
    @transaction.atomic
    def approve_and_credit(voucher: VoucherRedemption):
        voucher.approved = True
        voucher.approved_at = timezone.now()
        voucher.save(update_fields=["approved", "approved_at"])

        wallet, entry = WalletService.post_credit(
            user=voucher.user,
            amount=voucher.amount,
            source=f"voucher:{voucher.issuer}",
            reference=voucher.code,
            description="Voucher redemption",
        )
        return wallet, entry


# --------- Payouts (request -> admin approves -> mark paid / or integrate provider) ---------
class PayoutService:
    @staticmethod
    @transaction.atomic
    def request_payout(user, amount, bank_holder, bank_name, account_number, branch_code="", account_type="cheque"):
        pr = PayoutRequest.objects.create(
            user=user,
            amount=amount,
            bank_holder=bank_holder,
            bank_name=bank_name,
            account_number=account_number,
            branch_code=branch_code or "",
            account_type=account_type or "cheque",
        )
        # Optionally freeze funds (move to escrow). For now, debit immediately:
        WalletService.post_debit(user, amount, source="payout", reference=f"PO-{pr.id}", description="Payout request")
        return pr
