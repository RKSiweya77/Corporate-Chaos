# wallet/models.py
import uuid
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.utils import timezone


class Wallet(models.Model):
    """
    One wallet per user (buyer & vendor use the same wallet).
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    pending = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))  # holds / pending payouts
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Wallet<{self.user_id}> balance={self.balance}"

    def credit(self, amount: Decimal, reason: str = "", reference: str = ""):
        self.balance = (self.balance or Decimal("0.00")) + Decimal(amount)
        self.save(update_fields=["balance"])
        LedgerEntry.objects.create(
            wallet=self,
            type=LedgerEntry.Type.CREDIT,
            amount=Decimal(amount),
            reference=reference,
            description=reason,
            balance_after=self.balance,
        )

    def debit(self, amount: Decimal, reason: str = "", reference: str = ""):
        self.balance = (self.balance or Decimal("0.00")) - Decimal(amount)
        self.save(update_fields=["balance"])
        LedgerEntry.objects.create(
            wallet=self,
            type=LedgerEntry.Type.DEBIT,
            amount=Decimal(amount),
            reference=reference,
            description=reason,
            balance_after=self.balance,
        )


class LedgerEntry(models.Model):
    class Type(models.TextChoices):
        CREDIT = "CREDIT", "Credit"
        DEBIT = "DEBIT", "Debit"
        HOLD = "HOLD", "Hold"
        RELEASE = "RELEASE", "Release"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="entries")
    type = models.CharField(max_length=16, choices=Type.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=64, blank=True, default="")
    description = models.CharField(max_length=255, blank=True, default="")
    balance_after = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class PaymentIntent(models.Model):
    """
    Tracks deposit/withdraw/payment attempts with external providers (Ozow, Peach, etc.).
    Now includes a FK to Wallet (this fixes the error you saw).
    """
    class Provider(models.TextChoices):
        OZOW = "ozow", "Ozow"
        PEACH = "peach", "Peach"
        VOUCHER = "voucher", "Voucher"

    class Status(models.TextChoices):
        CREATED = "created", "Created"
        PENDING = "pending", "Pending"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    class Kind(models.TextChoices):
        DEPOSIT = "deposit", "Deposit"
        WITHDRAW = "withdraw", "Withdraw"
        PAYMENT = "payment", "Payment"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payment_intents")
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="payment_intents")  # ← NEW
    provider = models.CharField(max_length=16, choices=Provider.choices)
    kind = models.CharField(max_length=16, choices=Kind.choices, default=Kind.DEPOSIT)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.CREATED)

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default="ZAR")

    # provider data
    provider_reference = models.CharField(max_length=128, blank=True, default="")
    return_url = models.URLField(blank=True, default="")
    notify_url = models.URLField(blank=True, default="")
    checksum = models.CharField(max_length=128, blank=True, default="")

    description = models.CharField(max_length=255, blank=True, default="")
    meta = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    raw_request = models.JSONField(blank=True, null=True)
    raw_response = models.JSONField(blank=True, null=True)

    def mark_pending(self):
        self.status = self.Status.PENDING
        self.save(update_fields=["status", "updated_at"])

    def mark_succeeded(self, reference: str = ""):
        self.status = self.Status.SUCCEEDED
        if reference:
            self.provider_reference = reference
        self.save(update_fields=["status", "provider_reference", "updated_at"])

    def mark_failed(self):
        self.status = self.Status.FAILED
        self.save(update_fields=["status", "updated_at"])

    def __str__(self) -> str:
        return f"Intent<{self.id}> {self.provider} {self.kind} {self.status}"


class PayoutRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="payout_requests")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payout_requests")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    bank_account_last4 = models.CharField(max_length=8, blank=True, default="")
    status = models.CharField(max_length=16, default="pending")  # pending/processing/paid/failed
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Payout<{self.id}> {self.status}"


class VoucherRedemption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="voucher_redemptions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="voucher_redemptions")
    issuer = models.CharField(max_length=32)
    code = models.CharField(max_length=64)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=16, default="pending")  # pending/succeeded/failed
    created_at = models.DateTimeField(auto_now_add=True)


class WebhookLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.CharField(max_length=16)
    event_time = models.DateTimeField(default=timezone.now)
    path = models.CharField(max_length=255, blank=True, default="")
    payload = models.JSONField(null=True, blank=True)
    status_code = models.IntegerField(default=0)
    notes = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
