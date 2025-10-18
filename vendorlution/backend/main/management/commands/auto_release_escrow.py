# main/management/commands/auto_release_escrow.py
"""
Auto-release escrow funds after N days of delivery (if no dispute)
Run this command daily via cron: python manage.py auto_release_escrow
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.conf import settings
from datetime import timedelta
from decimal import Decimal

from main.models import Order
from main.models_extended import Shipment
from wallet.models import Wallet, LedgerEntry
from wallet.services import WalletService


class Command(BaseCommand):
    help = "Auto-release escrow funds for delivered orders after grace period"

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days after delivery to auto-release (default: 7)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be released without actually releasing'
        )

    def handle(self, *args, **options):
        grace_days = options['days']
        dry_run = options['dry_run']
        cutoff_date = timezone.now() - timedelta(days=grace_days)

        # Find orders that are:
        # 1. Status = PAID (funds in escrow)
        # 2. Shipment delivered > N days ago
        # 3. No active disputes
        eligible_orders = Order.objects.filter(
            status=Order.Status.PAID,
            shipment__status=Shipment.Status.DELIVERED,
            shipment__delivered_at__lt=cutoff_date,
        ).select_related('customer__user', 'shipment').prefetch_related('items__product__vendor', 'disputes')

        count = 0
        for order in eligible_orders:
            # Check for active disputes
            has_active_dispute = order.disputes.filter(
                status__in=['open', 'under_review']
            ).exists()

            if has_active_dispute:
                self.stdout.write(
                    self.style.WARNING(f"Order #{order.id}: Skipping due to active dispute")
                )
                continue

            # Get vendor
            first_item = order.items.first()
            if not first_item or not first_item.product.vendor:
                self.stdout.write(
                    self.style.WARNING(f"Order #{order.id}: No vendor found")
                )
                continue

            vendor = first_item.product.vendor

            if dry_run:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"[DRY RUN] Would release R{order.total_amount} for Order #{order.id} to {vendor.shop_name}"
                    )
                )
                count += 1
                continue

            # Release funds
            try:
                with transaction.atomic():
                    # 1. Release buyer's pending
                    buyer_wallet, _ = Wallet.objects.get_or_create(user=order.customer.user)
                    buyer_wallet.pending = (buyer_wallet.pending or Decimal("0")) - order.total_amount
                    buyer_wallet.save(update_fields=["pending"])

                    LedgerEntry.objects.create(
                        wallet=buyer_wallet,
                        type=LedgerEntry.Type.RELEASE,
                        amount=order.total_amount,
                        reference=f"ORDER-{order.id}-AUTO-RELEASE",
                        description=f"Auto-released escrow for Order #{order.id}",
                        balance_after=buyer_wallet.balance,
                        source="auto_release",
                        status="posted",
                    )

                    # 2. Calculate platform fee
                    platform_fee = order.total_amount * Decimal(
                        getattr(settings, "PLATFORM_FEE_PERCENT", "0.05")
                    )
                    vendor_amount = order.total_amount - platform_fee

                    # 3. Credit vendor
                    WalletService.post_credit(
                        user=vendor.user,
                        amount=vendor_amount,
                        source="order_payout",
                        reference=f"ORDER-{order.id}",
                        description=f"Auto-release payout for Order #{order.id}",
                        idem=f"auto-release-{order.id}",
                    )

                    # 4. Update order status
                    order.status = Order.Status.DELIVERED
                    order.save(update_fields=["status"])

                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Released R{vendor_amount} for Order #{order.id} to {vendor.shop_name}"
                        )
                    )
                    count += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Order #{order.id}: Failed - {str(e)}")
                )

        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(f"\n[DRY RUN] Would auto-release {count} orders")
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f"\nAuto-released {count} orders")
            )