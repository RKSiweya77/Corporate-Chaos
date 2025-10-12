from rest_framework import serializers
from django.contrib.auth.models import User

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
    """
    Read serializer for vendor profiles that exposes public_url and owner info.
    """
    owner = UserPublicSerializer(source="user", read_only=True)
    public_url = serializers.SerializerMethodField()

    class Meta:
        model = VendorProfile
        fields = [
            "id",
            "shop_name",
            "slug",
            "description",
            "logo",
            "banner",
            "address",
            "rating_avg",
            "is_active",
            "owner",
            "public_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["slug", "rating_avg", "is_active", "owner", "public_url", "created_at", "updated_at"]

    def get_public_url(self, obj):
        # frontend route for a vendor's public storefront
        return f"/vendor/store/{obj.slug}/{obj.id}"


class VendorLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ["id", "shop_name", "slug"]


class VendorProfileWriteSerializer(serializers.ModelSerializer):
    """
    Write serializer (for Create/Update by the owner).
    'user' is set in the view, not exposed to clients.
    """
    class Meta:
        model = VendorProfile
        fields = [
            "shop_name",
            "description",
            "logo",
            "banner",
            "address",
            "is_active",
        ]


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
            "id",
            "title",
            "slug",
            "price",
            "stock",
            "is_active",
            "condition",
            "rating_avg",
            "main_image",
            "created_at",
            "category",
            "vendor",
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(read_only=True)
    vendor = VendorProfileSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "slug",
            "detail",
            "price",
            "stock",
            "is_active",
            "condition",
            "rating_avg",
            "main_image",
            "created_at",
            "updated_at",
            "category",
            "vendor",
            "images",
        ]


class ProductCreateSerializer(serializers.ModelSerializer):
    """
    Used for POST/PUT from AddProduct form.
    Accepts `category` and `vendor` as ids (vendor can be auto-set by view).
    """
    class Meta:
        model = Product
        fields = [
            "id",
            "category",
            "vendor",
            "title",
            "detail",
            "price",
            "stock",
            "is_active",
            "condition",
            "main_image",
        ]


# Alias kept for older imports
class ProductSerializer(ProductDetailSerializer):
    pass


# ---- RATINGS ----
class ProductRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRating
        fields = ["id", "product", "customer", "rating", "review", "created_at"]


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


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "text", "is_read", "created_at"]


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ["id", "customer", "type", "card_brand", "card_last4", "gateway_ref", "bank_name", "account_last4", "is_default", "created_at"]


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
        # Buyer by default
        CustomerProfile.objects.get_or_create(user=user)
        return user


class MeSerializer(serializers.Serializer):
    user = UserPublicSerializer()
    roles = serializers.ListField(child=serializers.CharField())
    customer_id = serializers.IntegerField(allow_null=True)
    vendor_id = serializers.IntegerField(allow_null=True)