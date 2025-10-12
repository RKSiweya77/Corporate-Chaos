from rest_framework import generics, filters, permissions, status, serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Prefetch
from django.contrib.auth.models import User

from .models import (
    ProductCategory,
    VendorProfile,
    Product,
    ProductRating,
    CustomerProfile,
    Wishlist, Cart, CartItem,
    Order, OrderItem,
    Wallet, Transaction, Payout,
    Discount,
    Conversation, Message,
    PaymentMethod,
)
from .serializers import (
    # Public/catalog
    ProductCategorySerializer,
    VendorProfileSerializer,
    VendorLiteSerializer,
    VendorProfileWriteSerializer,  # accepts multipart for create/edit
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer,
    ProductRatingSerializer,

    # Stateful
    WishlistSerializer, CartSerializer, CartItemSerializer,
    OrderSerializer,
    WalletSerializer, TransactionSerializer, PayoutSerializer,
    DiscountSerializer, DiscountCreateSerializer,
    ConversationSerializer, MessageSerializer, PaymentMethodSerializer,

    # Auth
    RegisterSerializer, MeSerializer, UserPublicSerializer,
)

# ============================================================
# Public Endpoints (No auth required) — Catalog & Ratings
# ============================================================

# --------- Categories ---------
class CategoryListView(generics.ListAPIView):
    queryset = ProductCategory.objects.all().order_by("title")
    serializer_class = ProductCategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "detail"]
    ordering_fields = ["title", "created_at"]


class CategoryAllView(generics.ListAPIView):
    queryset = ProductCategory.objects.all().order_by("title")
    serializer_class = ProductCategorySerializer
    pagination_class = None


# --------- Products ---------
class ProductListCreateView(generics.ListCreateAPIView):
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
    serializer_class = ProductListSerializer
    pagination_class = None

    def get_queryset(self):
        limit = int(self.request.query_params.get("limit", 12))
        return Product.objects.filter(is_active=True).order_by("-created_at")[:limit]


class ProductPopularListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    pagination_class = None

    def get_queryset(self):
        limit = int(self.request.query_params.get("limit", 12))
        return Product.objects.filter(is_active=True).order_by("-rating_avg", "-created_at")[:limit]


# --------- Vendors ---------
class VendorFeaturedListView(generics.ListAPIView):
    """
    Featured vendors (best rating). Public list -> only active vendors.
    """
    serializer_class = VendorProfileSerializer
    pagination_class = None

    def get_queryset(self):
        limit = int(self.request.query_params.get("limit", 8))
        return VendorProfile.objects.filter(is_active=True).order_by("-rating_avg", "shop_name")[:limit]


class VendorListView(generics.ListAPIView):
    """
    Public list of vendors -> only active vendors.
    """
    queryset = VendorProfile.objects.filter(is_active=True).order_by("shop_name")
    serializer_class = VendorProfileSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["shop_name", "description", "address"]
    ordering_fields = ["shop_name", "rating_avg", "created_at"]


class VendorAllView(generics.ListAPIView):
    """
    Plain vendors list (no pagination) for dropdowns -> only active vendors.
    """
    queryset = VendorProfile.objects.filter(is_active=True).order_by("shop_name")
    serializer_class = VendorLiteSerializer
    pagination_class = None


class VendorDetailView(generics.RetrieveAPIView):
    """
    GET /api/vendors/<pk>/
    Allow fetching ANY vendor by id (active or not) so owners can load their
    dashboard even if the shop is temporarily inactive.
    Public listing endpoints above still filter by is_active=True.
    """
    queryset = VendorProfile.objects.all()
    serializer_class = VendorProfileSerializer
    lookup_field = "pk"


# --------- Ratings ---------
class ProductRatingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = ProductRating.objects.all().order_by("-created_at")
    serializer_class = ProductRatingSerializer


# ============================================================
# Auth helpers (register/me/create-vendor)
# ============================================================

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        customer, _ = CustomerProfile.objects.get_or_create(user=user)
        vendor = VendorProfile.objects.filter(user=user).first()

        roles = ["buyer"]
        if vendor:
            roles.append("vendor")

        data = {
            "user": UserPublicSerializer(user).data,
            "roles": roles,
            "customer_id": customer.id if customer else None,
            "vendor_id": vendor.id if vendor else None,
        }
        return Response(data)


class CreateVendorView(APIView):
    """
    POST /api/auth/create-vendor/
    Creates a VendorProfile for the logged-in user.
    Accepts multipart (shop_name, description, logo, banner, address).
    New shops are created as is_active=True so they appear immediately.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        existing = VendorProfile.objects.filter(user=user).first()
        if existing:
            return Response({"detail": "Vendor already exists", "vendor_id": existing.id}, status=200)

        serializer = VendorProfileWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Force is_active=True on creation so the shop shows up and loads.
        vendor = serializer.save(user=user, is_active=True)
        return Response(
            {"detail": "Vendor created", "vendor": VendorProfileSerializer(vendor).data},
            status=201
        )


# ============================================================
# Stateful Endpoints (JWT required)
# ============================================================

def _get_customer(user):
    if not user.is_authenticated:
        return None
    customer, _ = CustomerProfile.objects.get_or_create(user=user)
    return customer

def _get_vendor(user):
    if not user.is_authenticated:
        return None
    return VendorProfile.objects.filter(user=user).first()


# ---------- Wishlist ----------
class WishlistListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WishlistSerializer

    def get_queryset(self):
        customer = _get_customer(self.request.user)
        return Wishlist.objects.filter(customer=customer).select_related("product").order_by("-created_at")

    def perform_create(self, serializer):
        customer = _get_customer(self.request.user)
        serializer.save(customer=customer)


class WishlistDetailView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WishlistSerializer

    def get_queryset(self):
        customer = _get_customer(self.request.user)
        return Wishlist.objects.filter(customer=customer)


# ---------- Cart ----------
class CartDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        customer = _get_customer(request.user)
        cart, _ = Cart.objects.get_or_create(customer=customer)
        return Response(CartSerializer(cart).data)


class CartItemAddView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        customer = _get_customer(self.request.user)
        cart, _ = Cart.objects.get_or_create(customer=customer)
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity") or 1)
        if not product_id:
            return Response({"detail": "product_id required"}, status=400)

        item, created = CartItem.objects.get_or_create(
            cart=cart, product_id=product_id, defaults={"quantity": quantity}
        )
        if not created:
            item.quantity = max(1, item.quantity + quantity)
            item.save()

        return Response(CartSerializer(cart).data, status=201)


class CartItemUpdateDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        customer = _get_customer(self.request.user)
        try:
            item = CartItem.objects.select_related("cart").get(pk=pk, cart__customer=customer)
        except CartItem.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        qty = int(request.data.get("quantity") or item.quantity)
        item.quantity = max(1, qty)
        item.save()
        return Response(CartSerializer(item.cart).data)

    def delete(self, request, pk, *args, **kwargs):
        customer = _get_customer(self.request.user)
        try:
            item = CartItem.objects.select_related("cart").get(pk=pk, cart__customer=customer)
        except CartItem.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        cart = item.cart
        item.delete()
        return Response(CartSerializer(cart).data)


# ---------- Orders ----------
class MyOrdersView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        customer = _get_customer(self.request.user)
        return (
            Order.objects.filter(customer=customer)
            .select_related("customer__user")
            .prefetch_related(Prefetch("items", queryset=OrderItem.objects.select_related("product__vendor")))
            .order_by("-created_at")
        )


class VendorOrdersView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        vendor = _get_vendor(self.request.user)
        if not vendor:
            return Order.objects.none()
        return (
            Order.objects.filter(items__product__vendor=vendor)
            .distinct()
            .select_related("customer__user")
            .prefetch_related(Prefetch("items", queryset=OrderItem.objects.select_related("product__vendor")))
            .order_by("-created_at")
        )


# ---------- Wallet & Transactions ----------
class MyWalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        wallet_type = request.query_params.get("type") or "customer"
        user = request.user
        if wallet_type == "vendor":
            vendor = _get_vendor(user)
            if not vendor:
                return Response({"detail": "Vendor profile not found"}, status=404)
            wtype = "vendor"
        else:
            wtype = "customer"
        wallet, _ = Wallet.objects.get_or_create(user=user, type=wtype)
        return Response(WalletSerializer(wallet).data)


class MyTransactionsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        wallet_id = self.request.query_params.get("wallet_id")
        if not wallet_id:
            return Transaction.objects.none()
        return Transaction.objects.filter(wallet_id=wallet_id).select_related("wallet").order_by("-created_at")


# ---------- Payouts ----------
class MyPayoutsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PayoutSerializer

    def get_queryset(self):
        vendor = _get_vendor(self.request.user)
        if not vendor:
            return Payout.objects.none()
        return Payout.objects.filter(vendor=vendor).order_by("-created_at")


# ---------- Discounts ----------
class MyDiscountsView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return DiscountCreateSerializer if self.request.method.lower() == "post" else DiscountSerializer

    def get_queryset(self):
        vendor = _get_vendor(self.request.user)
        if not vendor:
            return Discount.objects.none()
        return Discount.objects.filter(vendor=vendor).order_by("-created_at")

    def perform_create(self, serializer):
        vendor = _get_vendor(self.request.user)
        if not vendor:
            raise permissions.PermissionDenied("Vendor profile required")
        serializer.save(vendor=vendor)


# ---------- Payment Methods ----------
class MyPaymentMethodsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentMethodSerializer

    def get_queryset(self):
        customer = _get_customer(self.request.user)
        return PaymentMethod.objects.filter(customer=customer).order_by("-created_at")


# ---------- Conversations & Messages ----------
class MyConversationsView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        customer = _get_customer(self.request.user)
        vendor = _get_vendor(self.request.user)
        qs = Conversation.objects.none()
        if customer:
            qs = Conversation.objects.filter(buyer=customer)
        if vendor:
            qs = qs | Conversation.objects.filter(vendor=vendor)
        return qs.select_related("buyer__user", "vendor__user").order_by("-last_message_at", "-created_at").distinct()

    def perform_create(self, serializer):
        customer = _get_customer(self.request.user)
        vendor_id = self.request.data.get("vendor_id")
        if not (customer and vendor_id):
            raise ValueError("vendor_id required")
        serializer.save(buyer=customer, vendor_id=vendor_id)


class ConversationMessagesView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        conv_id = self.request.query_params.get("conversation_id")
        if not conv_id:
            return Message.objects.none()
        return Message.objects.filter(conversation_id=conv_id).select_related("conversation", "sender").order_by("created_at")

    def perform_create(self, serializer):
        conv_id = self.request.data.get("conversation")
        if not conv_id:
            raise ValueError("conversation required")
        conv = Conversation.objects.select_related("buyer__user", "vendor__user").get(pk=conv_id)
        user = self.request.user
        if user != conv.buyer.user and user != conv.vendor.user:
            raise permissions.PermissionDenied("Not a participant")
        msg = serializer.save(sender=user)
        Conversation.objects.filter(pk=msg.conversation_id).update(last_message_at=msg.created_at)
