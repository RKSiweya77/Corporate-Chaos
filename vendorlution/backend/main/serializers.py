from rest_framework import serializers
from django.contrib.auth.models import User
from decimal import Decimal

from .models import (
    ProductCategory,
    VendorProfile,
    Product,
    ProductImage,
    ProductRating,
    # extra
    CustomerProfile, Cart, CartItem, Wishlist,
    Order, OrderItem, Wallet, Transaction, Payout,
    Discount, Conversation, Message, PaymentMethod,
    CustomerAddress, Notification, SupportTicket, ResolutionCase,
)

# =========================
# Catalog
# =========================

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ["id", "title", "slug", "detail"]


# ---- VENDORS ----
class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class VendorProfileSerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(source="user", read_only=True)
    public_url = serializers.SerializerMethodField()

    class Meta:
        model = VendorProfile
        fields = [
            "id", "shop_name", "slug", "description", "logo", "banner",
            "address", "rating_avg", "is_active", "owner", "public_url",
            "created_at", "updated_at",
        ]
        read_only_fields = ["slug", "rating_avg", "is_active", "owner", "public_url", "created_at", "updated_at"]

    def get_public_url(self, obj):
        return f"/vendor/store/{obj.slug}/{obj.id}"


class VendorLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ["id", "shop_name", "slug"]


class VendorProfileWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ["shop_name", "description", "logo", "banner", "address", "is_active"]


# ---- IMAGES ----
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "is_primary", "created_at"]


# ---- PRODUCTS ----
class ProductListSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(read_only=True)
    vendor = VendorProfileSerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "title", "slug", "price", "stock", "is_active",
            "condition", "rating_avg", "main_image", "created_at",
            "category", "vendor",
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(read_only=True)
    vendor = VendorProfileSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "title", "slug", "detail", "price", "stock", "is_active",
            "condition", "rating_avg", "main_image", "created_at", "updated_at",
            "category", "vendor", "images",
        ]


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id", "category", "vendor", "title", "detail", "price",
            "stock", "is_active", "condition", "main_image",
        ]


class ProductSerializer(ProductDetailSerializer):
    pass


# ---- RATINGS ----
class ProductRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRating
        fields = ["id", "product", "customer", "rating", "review", "created_at"]
        read_only_fields = ["customer"]


# =========================
# Stateful / Accounts / Wallets / Etc.
# =========================

class CustomerLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ["id", "user", "mobile"]


class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = ["id", "customer", "product", "created_at"]
        read_only_fields = ["customer"]


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=Product.objects.all(), write_only=True, required=True
    )

    class Meta:
        model = CartItem
        fields = ["id", "cart", "product", "product_id", "quantity", "created_at", "updated_at"]
        read_only_fields = ["cart"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "customer", "items", "created_at", "updated_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity", "price_snapshot", "created_at"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer = CustomerLiteSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "customer", "status", "total_amount",
            "delivery_method", "shipping_fee", "protection_fee",
            "shipping_address_snapshot", "notes",
            "created_at", "items",
        ]


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ["id", "user", "type", "balance", "created_at", "updated_at"]


class TransactionSerializer(serializers.ModelSerializer):
    # Backward-compat field that mirrors "kind"
    type = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = ["id", "wallet", "kind", "type", "amount", "description", "reference", "created_at"]

    def get_type(self, obj):
        return obj.kind


class PayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payout
        fields = ["id", "vendor", "amount", "status", "processed_at", "created_at"]


class DiscountSerializer(serializers.ModelSerializer):
    products = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Discount
        fields = ["id", "vendor", "name", "percent", "valid_from", "valid_to", "products", "created_at"]


class DiscountCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ["id", "vendor", "name", "percent", "valid_from", "valid_to", "products"]


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ["id", "buyer", "vendor", "last_message_at", "created_at"]
        read_only_fields = ["buyer"]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "text", "is_read", "created_at"]
        read_only_fields = ["sender"]


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = [
            "id", "customer", "type", "card_brand", "card_last4", "gateway_ref",
            "bank_name", "account_last4", "is_default", "created_at",
        ]
        read_only_fields = ["customer"]


# ---- Addresses / Notifications / Support / Disputes ----

class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = ["id", "label", "address", "is_default", "created_at", "updated_at"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message", "type", "is_read", "created_at"]


class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ["id", "subject", "message", "status", "created_at"]


class ResolutionCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResolutionCase
        fields = ["id", "order", "reason", "status", "created_at", "resolved_at"]
