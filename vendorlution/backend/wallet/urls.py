# wallet/urls.py - Complete
from django.urls import path
from .views import (
    MeWalletView,
    TransactionsView,
    OzowDepositStartView,
    ozow_webhook,
    WithdrawRequestView,
    MeVendorProfileView,
)

urlpatterns = [
    # Wallet basics
    path("", MeWalletView.as_view(), name="wallet-me"),
    path("me/", MeWalletView.as_view(), name="wallet-me-alt"),
    path("transactions/", TransactionsView.as_view(), name="wallet-transactions"),
    
    # Vendor profile for wallet
    path("me/vendor/profile/", MeVendorProfileView.as_view(), name="wallet-vendor-profile"),

    # Ozow deposit
    path("ozow/deposit/start/", OzowDepositStartView.as_view(), name="wallet-ozow-start"),
    path("webhooks/ozow/", ozow_webhook, name="wallet-ozow-webhook"),

    # Payouts
    path("payouts/request/", WithdrawRequestView.as_view(), name="wallet-payout-request"),
    path("withdraw/", WithdrawRequestView.as_view(), name="wallet-withdraw"),  # alias
]