from rest_framework import serializers
from django.contrib.auth.models import User

from .models import (
    # Catalog
    ProductCategory,
    VendorProfile,
    Product,
    ProductImage,
    ProductRating,
    # Stateful
    CustomerProfile, CustomerAddress,
    Cart, CartItem, Wishlist,
    Order, OrderItem, Wallet, Transaction, Payout,
    Discount, Coupon,
    Conversation, Message, PaymentMethod,
    # Notifications / Support / Disputes
    Notification, SupportTicket, ResolutionCase,
)

# =========================
# Catalog
# =========================

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ["id", "title", "slug", "detail"]


# ---- USERS (public) ----
class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


# ---- VENDORS ----
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
        read_only_fields = [
            "slug", "rating_avg", "is_active", "owner", "public_url",
            "created_at", "updated_at",
        ]

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
            "id", "title", "slug", "price", "stock", "is_active", "condition",
            "rating_avg", "main_image", "created_at", "category", "vendor",
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
            "id", "category", "vendor", "title", "detail", "price", "stock",
            "is_active", "condition", "main_image",
        ]


# Back-compat alias
class ProductSerializer(ProductDetailSerializer):
    pass


# ---- RATINGS ----
class ProductRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRating
        fields = ["id", "product", "customer", "rating", "review", "created_at"]


# =========================
# Accounts / Wishlist / Cart
# =========================

class CustomerLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ["id", "user", "mobile"]


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = ["id", "label", "address", "is_default", "created_at", "updated_at"]


class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = ["id", "customer", "product", "created_at"]


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=Product.objects.all(), write_only=True, required=True
    )

    class Meta:
        model = CartItem
        fields = ["id", "cart", "product", "product_id", "quantity", "created_at", "updated_at"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "customer", "items", "created_at", "updated_at"]


# =========================
# Orders
# =========================

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
        fields = ["id", "customer", "status", "total_amount", "created_at", "items"]


# =========================
# Wallets / Transactions / Payouts
# =========================

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ["id", "user", "type", "balance", "created_at", "updated_at"]


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "wallet", "kind", "amount", "description", "reference", "created_at"]


class PayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payout
        fields = ["id", "vendor", "amount", "status", "processed_at", "created_at"]


# =========================
# Discounts / Coupons
# =========================

class DiscountSerializer(serializers.ModelSerializer):
    products = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Discount
        fields = ["id", "vendor", "name", "percent", "valid_from", "valid_to", "products", "created_at"]


class DiscountCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ["id", "vendor", "name", "percent", "valid_from", "valid_to", "products"]


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ["id", "code", "discount_value", "is_active", "expiry", "assigned_to", "created_at", "updated_at"]


# =========================
# Messaging
# =========================

class ConversationSerializer(serializers.ModelSerializer):
    """
    Created in the view using buyer=<current customer> and vendor_id from the POST.
    Keep buyer/vendor read-only so the client doesn't need to send them.
    """
    class Meta:
        model = Conversation
        fields = ["id", "buyer", "vendor", "last_message_at", "created_at"]
        read_only_fields = ["buyer", "vendor", "last_message_at", "created_at"]


class MessageSerializer(serializers.ModelSerializer):
    """
    Sender is injected in the view (sender=request.user), so mark it read-only.
    Expose `is_me` for convenient bubble alignment on the frontend.
    """
    is_me = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "text", "is_read", "created_at", "is_me"]
        read_only_fields = ["sender", "is_read", "created_at", "is_me"]

    def get_is_me(self, obj):
        request = self.context.get("request")
        if not request or not hasattr(request, "user"):
            return False
        return obj.sender_id == getattr(request.user, "id", None)


# =========================
# Payment Methods
# =========================

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = [
            "id", "customer", "type", "card_brand", "card_last4",
            "gateway_ref", "bank_name", "account_last4",
            "is_default", "created_at",
        ]


# =========================
# Notifications / Support / Disputes
# =========================

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "user", "message", "type", "is_read", "created_at", "updated_at"]


class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ["id", "user", "subject", "message", "status", "created_at", "updated_at"]


class ResolutionCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResolutionCase
        fields = ["id", "order", "opened_by", "reason", "status", "resolved_at", "created_at", "updated_at"]


# =========================
# Auth
# =========================

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email") or "",
            password=validated_data["password"],
            first_name=validated_data.get("first_name") or "",
            last_name=validated_data.get("last_name") or "",
        )
        CustomerProfile.objects.get_or_create(user=user)
        return user


class MeSerializer(serializers.Serializer):
    user = UserPublicSerializer()
    roles = serializers.ListField(child=serializers.CharField())
    customer_id = serializers.IntegerField(allow_null=True)
    vendor_id = serializers.IntegerField(allow_null=True)
