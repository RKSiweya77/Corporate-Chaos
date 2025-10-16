# backend/wallet/models.py - COMPLETE COPY-PASTE READY
import uuid
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.utils import timezone


class Wallet(models.Model):
    """One wallet per user (unified for buyer & vendor)"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    pending = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))  # Escrow holds
    currency = models.CharField(max_length=3, default="ZAR")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wallet<{self.user.username}> R{self.balance}"

    def credit(self, amount: Decimal, reason: str = "", reference: str = ""):
        """Add funds to wallet"""
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
        """Remove funds from wallet"""
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
    """Transaction history for audit trail"""
    class Type(models.TextChoices):
        CREDIT = "CREDIT", "Credit"
        DEBIT = "DEBIT", "Debit"
        HOLD = "HOLD", "Hold (Escrow)"
        RELEASE = "RELEASE", "Release (Escrow)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="entries")
    type = models.CharField(max_length=16, choices=Type.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    reference = models.CharField(max_length=64, blank=True, default="")
    description = models.CharField(max_length=255, blank=True, default="")
    idempotency_key = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["-created_at"])]

    def __str__(self):
        return f"{self.type} R{self.amount} - {self.reference}"


class PaymentIntent(models.Model):
    """Tracks deposit/payment attempts with external providers"""
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
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="payment_intents")
    provider = models.CharField(max_length=16, choices=Provider.choices)
    kind = models.CharField(max_length=16, choices=Kind.choices, default=Kind.DEPOSIT)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.CREATED)

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default="ZAR")

    # Provider data
    provider_reference = models.CharField(max_length=128, blank=True, default="")
    return_url = models.URLField(blank=True, default="")
    notify_url = models.URLField(blank=True, default="")
    checksum = models.CharField(max_length=128, blank=True, default="")

    description = models.CharField(max_length=255, blank=True, default="")
    metadata = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.provider} {self.kind} R{self.amount} - {self.status}"


class PayoutRequest(models.Model):
    """Withdrawal requests to bank accounts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="payout_requests")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payout_requests")
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="ZAR")
    
    # Bank details
    bank_holder = models.CharField(max_length=128, blank=True, default="")
    bank_name = models.CharField(max_length=64, blank=True, default="")
    account_number = models.CharField(max_length=32, blank=True, default="")
    branch_code = models.CharField(max_length=32, blank=True, default="")
    account_type = models.CharField(max_length=16, blank=True, default="cheque")
    bank_account_last4 = models.CharField(max_length=8, blank=True, default="")
    
    status = models.CharField(max_length=16, default="pending")  # pending/processing/paid/failed
    reference = models.CharField(max_length=64, blank=True, default="")
    notes = models.CharField(max_length=255, blank=True, default="")
    
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = f"PO-{str(self.id)[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payout R{self.amount} - {self.status}"


class VoucherRedemption(models.Model):
    """Voucher redemption tracking"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="voucher_redemptions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="voucher_redemptions")
    
    issuer = models.CharField(max_length=32)  # 1VOUCHER, OTT, etc.
    code = models.CharField(max_length=64)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=16, default="pending")  # pending/succeeded/failed
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.issuer} R{self.amount} - {self.status}"


class WebhookLog(models.Model):
    """Logs all webhook notifications from payment providers"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.CharField(max_length=16)
    event_time = models.DateTimeField(default=timezone.now)
    path = models.CharField(max_length=255, blank=True, default="")
    payload = models.JSONField(null=True, blank=True)
    raw_body = models.TextField(blank=True, default="")
    status_code = models.IntegerField(default=0)
    notes = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.provider} webhook - {self.created_at}"