# wallet/serializers.py
from __future__ import annotations
from decimal import Decimal, InvalidOperation
from rest_framework import serializers

class DepositCreateSerializer(serializers.Serializer):
    amount = serializers.CharField()
    provider = serializers.ChoiceField(choices=["ozow", "peach"])
    # You can override return URLs per request; otherwise we’ll use settings defaults.
    success_url = serializers.URLField(required=False, allow_blank=True)
    cancel_url = serializers.URLField(required=False, allow_blank=True)

    def validate_amount(self, value):
        try:
            amt = Decimal(value)
        except (InvalidOperation, TypeError):
            raise serializers.ValidationError("Invalid amount")
        if amt <= 0:
            raise serializers.ValidationError("Amount must be > 0")
        # hard floor to avoid test spam/micropennies
        if amt < Decimal("1.00"):
            raise serializers.ValidationError("Minimum is 1.00")
        return f"{amt:.2f}"
