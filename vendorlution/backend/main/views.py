from rest_framework import generics, filters
from rest_framework.parsers import MultiPartParser, FormParser
from .models import (
    ProductCategory,
    VendorProfile,
    Product,
    ProductRating,
)
from .serializers import (
    ProductCategorySerializer,
    VendorProfileSerializer,
    VendorLiteSerializer,       # 🔹 NEW import
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer,
    ProductRatingSerializer,
)

# --------- Categories ---------

class CategoryListView(generics.ListAPIView):
    """
    Paginated list (used by admin/long lists).
    """
    queryset = ProductCategory.objects.all().order_by("title")
    serializer_class = ProductCategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "detail"]
    ordering_fields = ["title", "created_at"]


class CategoryAllView(generics.ListAPIView):
    """
    Plain array list (no pagination) for dropdowns.
    """
    queryset = ProductCategory.objects.all().order_by("title")
    serializer_class = ProductCategorySerializer
    pagination_class = None


# --------- Products ---------

class ProductListCreateView(generics.ListCreateAPIView):
    """
    GET: paginated list of active products
    POST: create product (accepts multipart form)
    """
    queryset = Product.objects.filter(is_active=True).order_by("-created_at")
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "detail", "category__title", "vendor__shop_name"]
    ordering_fields = ["created_at", "rating_avg", "price"]

    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request and self.request.method == "POST":
            return ProductCreateSerializer
        return ProductListSerializer


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    lookup_field = "pk"


class ProductNewListView(generics.ListAPIView):
    """
    Latest arrivals (top N by created_at desc)
    """
    serializer_class = ProductListSerializer
    pagination_class = None

    def get_queryset(self):
        limit = int(self.request.query_params.get("limit", 12))
        return Product.objects.filter(is_active=True).order_by("-created_at")[:limit]


class ProductPopularListView(generics.ListAPIView):
    """
    Popular products (by rating_avg desc)
    """
    serializer_class = ProductListSerializer
    pagination_class = None

    def get_queryset(self):
        limit = int(self.request.query_params.get("limit", 12))
        return Product.objects.filter(is_active=True).order_by("-rating_avg", "-created_at")[:limit]


# --------- Vendors ---------

class VendorFeaturedListView(generics.ListAPIView):
    """
    Featured vendors (best rating)
    """
    serializer_class = VendorProfileSerializer
    pagination_class = None

    def get_queryset(self):
        limit = int(self.request.query_params.get("limit", 8))
        return VendorProfile.objects.filter(is_active=True).order_by("-rating_avg", "shop_name")[:limit]


class VendorListView(generics.ListAPIView):
    queryset = VendorProfile.objects.filter(is_active=True).order_by("shop_name")
    serializer_class = VendorProfileSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["shop_name", "description", "address"]
    ordering_fields = ["shop_name", "rating_avg", "created_at"]


# 🔹 NEW: plain vendors list for dropdowns (no pagination)
class VendorAllView(generics.ListAPIView):
    queryset = VendorProfile.objects.filter(is_active=True).order_by("shop_name")
    serializer_class = VendorLiteSerializer
    pagination_class = None


# --------- Ratings ---------

class ProductRatingListCreateView(generics.ListCreateAPIView):
    queryset = ProductRating.objects.all().order_by("-created_at")
    serializer_class = ProductRatingSerializer