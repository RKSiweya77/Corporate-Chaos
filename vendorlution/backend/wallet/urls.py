from django.urls import path

from .views import (
    MeWalletView,
    TransactionsView,
    OzowDepositStartView,
    ozow_webhook,
    WithdrawRequestView,
)

urlpatterns = [
    # Wallet basics
    path("me/", MeWalletView.as_view(), name="wallet-me"),
    path("transactions/", TransactionsView.as_view(), name="wallet-transactions"),

    # Ozow – deposit
    path("ozow/deposit/start/", OzowDepositStartView.as_view(), name="wallet-ozow-start"),
    path("webhooks/ozow/", ozow_webhook, name="wallet-ozow-webhook"),

    # Withdraw
    path("withdraw/", WithdrawRequestView.as_view(), name="wallet-withdraw"),
]
