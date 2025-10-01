from rest_framework import serializers
from .models import (
    ProductCategory,
    VendorProfile,
    Product,
    ProductImage,
    ProductRating,
)

# ---------------- Categories ----------------

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ["id", "title", "slug", "detail"]


# ---------------- Vendors ----------------

class VendorProfileSerializer(serializers.ModelSerializer):
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
        ]


# 🔹 NEW: lightweight vendor serializer for dropdowns/plain lists
class VendorLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ["id", "shop_name", "slug"]


# ---------------- Product Images ----------------

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "is_primary", "created_at"]


# ---------------- Products ----------------

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
    Use for POST/PUT from AddProduct form.
    Accepts `category` and `vendor` as ids.
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


# Alias used by older code/imports
class ProductSerializer(ProductDetailSerializer):
    pass


# ---------------- Ratings ----------------

class ProductRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRating
        fields = ["id", "product", "customer", "rating", "review", "created_at"]