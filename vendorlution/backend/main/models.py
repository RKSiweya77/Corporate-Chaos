from __future__ import annotations

from decimal import Decimal
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator


# -------------------- Upload helpers --------------------

def upload_vendor_logo(instance, filename):
    return f"vendors/{instance.user_id}/logos/{filename}"

def upload_vendor_banner(instance, filename):
    return f"vendors/{instance.user_id}/banners/{filename}"

def upload_product_main_image(instance, filename):
    # instance is Product
    return f"products/{instance.id or 'new'}/main/{filename}"

def upload_product_image(instance, filename):
    # instance is ProductImage
    pid = instance.product_id or "new"
    return f"products/{pid}/gallery/{filename}"

def upload_site_banner(instance, filename):
    return f"site/banners/{filename}"


# -------------------- Base --------------------

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# -------------------- Accounts --------------------

class CustomerProfile(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="customer_profile")
    mobile = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"CustomerProfile({self.user.username})"


class VendorProfile(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="vendor_profile")
    shop_name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=170, unique=True, blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to=upload_vendor_logo, blank=True, null=True)
    banner = models.ImageField(upload_to=upload_vendor_banner, blank=True, null=True)
    address = models.TextField(blank=True)
    rating_avg = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.shop_name)[:170]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Vendor({self.shop_name})"


# -------------------- Catalog --------------------

class ProductCategory(TimeStampedModel):
    title = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    detail = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:220]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Product(TimeStampedModel):
    class Condition(models.TextChoices):
        NEW = "new", "New"
        LIKE_NEW = "like_new", "Like New"
        VERY_GOOD = "very_good", "Very Good"
        GOOD = "good", "Good"
        FAIR = "fair", "Fair"
        POOR = "poor", "Poor"

    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, related_name="products")
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name="products", null=True, blank=True)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=230, unique=True, blank=True)
    detail = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_sold = models.BooleanField(default=False)  # ⭐ NEW FIELD
    sold_at = models.DateTimeField(blank=True, null=True)  # ⭐ NEW FIELD - Track when item was sold
    condition = models.CharField(max_length=20, choices=Condition.choices, default=Condition.NEW)
    main_image = models.ImageField(upload_to=upload_product_main_image, blank=True, null=True)
    rating_avg = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])

    class Meta:
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["-rating_avg"]),
            models.Index(fields=["is_sold"]),  # ⭐ NEW INDEX for faster queries
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or "product"
            # timestamp to avoid collisions
            self.slug = f"{base}-{int(timezone.now().timestamp())}"
        super().save(*args, **kwargs)

    def mark_as_sold(self):
        """Mark product as sold and set timestamp"""
        self.is_sold = True
        self.stock = 0
        self.sold_at = timezone.now()
        self.save(update_fields=["is_sold", "stock", "sold_at"])

    def __str__(self):
        return self.title


class ProductImage(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to=upload_product_image)
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"Image({self.product_id})"


class ProductRating(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="ratings")
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name="product_ratings")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(blank=True)

    class Meta:
        unique_together = ("product", "customer")
        indexes = [models.Index(fields=["-created_at"])]

    def __str__(self):
        return f"{self.rating}★ by {self.customer.user.username} on {self.product.title}"


# -------------------- Wishlist & Cart --------------------

class Wishlist(TimeStampedModel):
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name="wishlist_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="wishlisted_by")

    class Meta:
        unique_together = ("customer", "product")

    def __str__(self):
        return f"{self.customer.user.username} ♥ {self.product.title}"


class Cart(TimeStampedModel):
    customer = models.OneToOneField(CustomerProfile, on_delete=models.CASCADE, related_name="cart")

    def __str__(self):
        return f"Cart({self.customer.user.username})"


class CartItem(TimeStampedModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        unique_together = ("cart", "product")

    def __str__(self):
        return f"{self.quantity} x {self.product.title}"


# -------------------- Orders --------------------

class CustomerAddress(TimeStampedModel):
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField(max_length=100, blank=True)
    address = models.TextField()
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.customer.user.username} - {self.label or 'Address'}"


class Order(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"

    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name="orders")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    # new fields so we can snapshot checkout choices
    delivery_method = models.CharField(max_length=32, blank=True, default="")
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    protection_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    shipping_address_snapshot = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk} - {self.customer.user.username}"


class OrderItem(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="order_items")
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    price_snapshot = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])

    def line_total(self) -> Decimal:
        return self.price_snapshot * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.product.title} @ {self.price_snapshot}"


# -------------------- Payments / Wallets --------------------

class Wallet(TimeStampedModel):
    class Type(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        VENDOR = "vendor", "Vendor"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wallets")
    type = models.CharField(max_length=20, choices=Type.choices)
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        unique_together = ("user", "type")

    def __str__(self):
        return f"{self.user.username} {self.type} wallet: {self.balance}"


class Transaction(TimeStampedModel):
    class Kind(models.TextChoices):
        CREDIT = "credit", "Credit"
        DEBIT = "debit", "Debit"

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    kind = models.CharField(max_length=10, choices=Kind.choices)
    amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    description = models.CharField(max_length=255, blank=True)
    reference = models.CharField(max_length=64, blank=True, db_index=True)

    def __str__(self):
        sign = "+" if self.kind == self.Kind.CREDIT else "-"
        return f"{sign}{self.amount} ({self.description})"


class Payout(TimeStampedModel):
    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name="payouts")
    amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REQUESTED)
    processed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Payout {self.amount} to {self.vendor.shop_name} ({self.status})"


class PaymentMethod(TimeStampedModel):
    class Type(models.TextChoices):
        CARD = "card", "Card"
        EFT = "eft", "Bank Transfer"

    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name="payment_methods")
    type = models.CharField(max_length=10, choices=Type.choices)
    card_brand = models.CharField(max_length=20, blank=True)
    card_last4 = models.CharField(max_length=4, blank=True)
    gateway_ref = models.CharField(max_length=100, blank=True)
    bank_name = models.CharField(max_length=80, blank=True)
    account_last4 = models.CharField(max_length=4, blank=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        label = self.card_last4 or self.account_last4 or "-"
        return f"{self.customer.user.username} {self.type} ••••{label}"


# -------------------- Discounts & Coupons --------------------

class Discount(TimeStampedModel):
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name="discounts")
    name = models.CharField(max_length=120)
    percent = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00")), MaxValueValidator(Decimal("100.00"))],
        help_text="Percentage discount, e.g. 10.00 = 10%"
    )
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    products = models.ManyToManyField(Product, related_name="discounts", blank=True)

    def __str__(self):
        return f"{self.name} ({self.percent}%)"


class Coupon(TimeStampedModel):
    code = models.CharField(max_length=40, unique=True)
    discount_value = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    is_active = models.BooleanField(default=True)
    expiry = models.DateTimeField(blank=True, null=True)
    assigned_to = models.ForeignKey(CustomerProfile, on_delete=models.SET_NULL, related_name="coupons", blank=True, null=True)

    def __str__(self):
        target = self.assigned_to.user.username if self.assigned_to else "ANY"
        return f"Coupon {self.code} -> {target}"


# -------------------- Notifications & Support --------------------

class Notification(TimeStampedModel):
    class Type(models.TextChoices):
        ORDER = "order", "Order"
        PROMO = "promo", "Promotion"
        DISPUTE = "dispute", "Dispute"
        SYSTEM = "system", "System"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.SYSTEM)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notif({self.user.username}, {self.type}, read={self.is_read})"


class SupportTicket(TimeStampedModel):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In Progress"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="support_tickets")
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)

    def __str__(self):
        return f"Ticket #{self.pk} - {self.subject}"


class ResolutionCase(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="resolution_cases")
    opened_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="opened_disputes")
    reason = models.TextField()
    status = models.CharField(max_length=20, default="open")
    resolved_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Dispute for Order #{self.order_id} ({self.status})"


# -------------------- Messaging --------------------

class Conversation(TimeStampedModel):
    buyer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name="conversations")
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name="conversations")
    last_message_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ("buyer", "vendor")

    def __str__(self):
        return f"Conv({self.buyer.user.username} ↔ {self.vendor.shop_name})"


class Message(TimeStampedModel):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    text = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Msg#{self.pk} by {self.sender.username}"


# -------------------- Site --------------------

class SiteSettings(TimeStampedModel):
    key = models.CharField(max_length=50, unique=True)
    value = models.TextField(blank=True)

    def __str__(self):
        return f"{self.key}"


class Banner(TimeStampedModel):
    image = models.ImageField(upload_to=upload_site_banner)
    title = models.CharField(max_length=200, blank=True)
    link = models.URLField(blank=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"Banner({self.title or self.pk})"