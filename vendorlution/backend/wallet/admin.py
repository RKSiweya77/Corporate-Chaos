# wallet/admin.py
from django.contrib import admin
from .models import Wallet, LedgerEntry, PaymentIntent, PayoutRequest, VoucherRedemption, WebhookLog


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "balance", "pending", "created_at")
    search_fields = ("user__email", "user__username")


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ("id", "wallet", "type", "amount", "reference", "created_at")
    list_filter = ("type",)
    search_fields = ("reference", "wallet__user__email")


@admin.register(PaymentIntent)
class PaymentIntentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "wallet", "provider", "kind", "status", "amount", "created_at")
    list_filter = ("provider", "kind", "status")
    search_fields = ("id", "provider_reference", "user__email")


@admin.register(PayoutRequest)
class PayoutRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "wallet", "user", "amount", "status", "created_at")


@admin.register(VoucherRedemption)
class VoucherRedemptionAdmin(admin.ModelAdmin):
    list_display = ("id", "wallet", "user", "issuer", "code", "amount", "status", "created_at")


@admin.register(WebhookLog)
class WebhookLogAdmin(admin.ModelAdmin):
    list_display = ("id", "provider", "status_code", "event_time", "created_at")
