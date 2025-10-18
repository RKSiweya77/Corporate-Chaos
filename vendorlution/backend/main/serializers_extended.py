# main/serializers_extended.py - Serializers for Shipment and Dispute
from rest_framework import serializers
from .models_extended import Shipment, Dispute


class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = [
            "id", "order", "method", "tracking_number", "carrier_name",
            "pargo_code", "pickup_point", "proof_of_dropoff", "proof_url",
            "status", "shipped_at", "delivered_at", "expected_delivery",
            "notes", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "shipped_at", "delivered_at", "created_at", "updated_at"]


class DisputeSerializer(serializers.ModelSerializer):
    opened_by_username = serializers.CharField(source="opened_by.username", read_only=True)
    
    class Meta:
        model = Dispute
        fields = [
            "id", "order", "opened_by", "opened_by_username", "reason",
            "description", "evidence_images", "evidence_notes",
            "status", "resolved_by", "resolved_at", "resolution_notes",
            "refund_amount", "created_at", "updated_at"
        ]
        read_only_fields = [
            "id", "opened_by", "opened_by_username", "status",
            "resolved_by", "resolved_at", "resolution_notes",
            "refund_amount", "created_at", "updated_at"
        ]


class DisputeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dispute
        fields = ["order", "reason", "description", "evidence_notes"]