from django.db.models.signals import post_save
from django.contrib.auth import get_user_model
from django.dispatch import receiver
from .models import Wallet

User = get_user_model()


@receiver(post_save, sender=User)
def create_wallet_on_signup(sender, instance, created, **kwargs):
    """
    Ensure every user has exactly one wallet.
    """
    if created:
        Wallet.objects.get_or_create(user=instance)
