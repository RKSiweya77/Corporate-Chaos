# main/models_extended.py - NEW models for Shipments and Disputes
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
from django.core.validators import MinValueValidator

from .models import Order, TimeStampedModel


class Shipment(TimeStampedModel):
    """Shipping & proof of delivery tracking"""
    class Method(models.TextChoices):
        PARGO = "pargo", "Pargo"
        COURIER = "courier", "Courier"
        POSTNET = "postnet", "PostNet"
        PICKUP = "pickup", "Pickup"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_TRANSIT = "in_transit", "In Transit"
        DELIVERED = "delivered", "Delivered"
        FAILED = "failed", "Failed"

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="shipment")
    method = models.CharField(max_length=20, choices=Method.choices)
    
    # Tracking info
    tracking_number = models.CharField(max_length=100, blank=True)
    carrier_name = models.CharField(max_length=100, blank=True)
    
    # Pargo-specific
    pargo_code = models.CharField(max_length=50, blank=True)
    pickup_point = models.CharField(max_length=200, blank=True)
    
    # Proof uploads
    proof_of_dropoff = models.ImageField(upload_to="shipments/proof/", blank=True, null=True)
    proof_url = models.URLField(blank=True)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    shipped_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    expected_delivery = models.DateField(blank=True, null=True)
    
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Shipment for Order #{self.order_id} - {self.method} ({self.status})"

    def mark_shipped(self):
        """Mark as shipped and set timestamp"""
        if not self.shipped_at:
            self.shipped_at = timezone.now()
            self.status = self.Status.IN_TRANSIT
            self.save(update_fields=["shipped_at", "status"])

    def mark_delivered(self):
        """Mark as delivered"""
        if not self.delivered_at:
            self.delivered_at = timezone.now()
            self.status = self.Status.DELIVERED
            self.save(update_fields=["delivered_at", "status"])


class Dispute(TimeStampedModel):
    """Dispute/resolution cases for orders"""
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        UNDER_REVIEW = "under_review", "Under Review"
        RESOLVED_REFUND = "resolved_refund", "Resolved - Refund"
        RESOLVED_RELEASE = "resolved_release", "Resolved - Release"
        CLOSED = "closed", "Closed"

    class Reason(models.TextChoices):
        NOT_RECEIVED = "not_received", "Item Not Received"
        NOT_AS_DESCRIBED = "not_as_described", "Not As Described"
        DAMAGED = "damaged", "Damaged"
        WRONG_ITEM = "wrong_item", "Wrong Item"
        OTHER = "other", "Other"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="disputes")
    opened_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="disputes_opened")
    
    reason = models.CharField(max_length=20, choices=Reason.choices)
    description = models.TextField()
    
    # Evidence
    evidence_images = models.JSONField(default=list, blank=True)  # URLs to uploaded images
    evidence_notes = models.TextField(blank=True)
    
    # Resolution
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    resolved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="disputes_resolved"
    )
    resolved_at = models.DateTimeField(blank=True, null=True)
    resolution_notes = models.TextField(blank=True)
    refund_amount = models.DecimalField(
        max_digits=12, decimal_places=2, 
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))]
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Dispute #{self.pk} - Order #{self.order_id} ({self.status})"

    def resolve_refund(self, amount: Decimal, notes: str = "", resolved_by: User = None):
        """Resolve with refund to buyer"""
        self.status = self.Status.RESOLVED_REFUND
        self.refund_amount = amount
        self.resolution_notes = notes
        self.resolved_by = resolved_by
        self.resolved_at = timezone.now()
        self.save(update_fields=["status", "refund_amount", "resolution_notes", "resolved_by", "resolved_at"])

    def resolve_release(self, notes: str = "", resolved_by: User = None):
        """Resolve with funds release to seller"""
        self.status = self.Status.RESOLVED_RELEASE
        self.resolution_notes = notes
        self.resolved_by = resolved_by
        self.resolved_at = timezone.now()
        self.save(update_fields=["status", "resolution_notes", "resolved_by", "resolved_at"])