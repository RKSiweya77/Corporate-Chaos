# backend/wallet/migrations/0002_add_wallet_fields.py
# COMPLETE COPY-PASTE READY

from django.db import migrations, models
from decimal import Decimal


class Migration(migrations.Migration):

    dependencies = [
        ('wallet', '0001_initial'),
    ]

    operations = [
        # Add pending field (for escrow holds)
        migrations.AddField(
            model_name='wallet',
            name='pending',
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal('0.00'),
                max_digits=12,
                help_text='Funds held in escrow'
            ),
        ),
        
        # Add currency field (future-proofing for multi-currency)
        migrations.AddField(
            model_name='wallet',
            name='currency',
            field=models.CharField(default='ZAR', max_length=3),
        ),
        
        # Add updated_at field
        migrations.AddField(
            model_name='wallet',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        
        # Add idempotency_key to LedgerEntry (prevent duplicate transactions)
        migrations.AddField(
            model_name='ledgerentry',
            name='idempotency_key',
            field=models.CharField(
                max_length=64, 
                blank=True, 
                null=True, 
                db_index=True,
                help_text='Unique key to prevent duplicate entries'
            ),
        ),
        
        # Add missing fields to PayoutRequest
        migrations.AddField(
            model_name='payoutrequest',
            name='bank_holder',
            field=models.CharField(max_length=128, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='payoutrequest',
            name='bank_name',
            field=models.CharField(max_length=64, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='payoutrequest',
            name='account_number',
            field=models.CharField(max_length=32, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='payoutrequest',
            name='branch_code',
            field=models.CharField(max_length=32, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='payoutrequest',
            name='account_type',
            field=models.CharField(max_length=16, blank=True, default='cheque'),
        ),
        migrations.AddField(
            model_name='payoutrequest',
            name='reference',
            field=models.CharField(max_length=64, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='payoutrequest',
            name='notes',
            field=models.CharField(max_length=255, blank=True, default=''),
        ),
        
        # Add raw_body to WebhookLog (for debugging)
        migrations.AddField(
            model_name='webhooklog',
            name='raw_body',
            field=models.TextField(blank=True, default=''),
        ),
    ]