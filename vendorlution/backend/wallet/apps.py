from django.apps import AppConfig


class WalletConfig(AppConfig):
    name = "wallet"
    verbose_name = "Wallet"

    def ready(self):
        # Hook signals (auto-create wallet for new users)
        from . import signals  # noqa
