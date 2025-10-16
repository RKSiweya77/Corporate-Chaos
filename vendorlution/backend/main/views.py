from rest_framework import generics, filters, permissions, status, serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Prefetch, Q
from django.contrib.auth.models import User
from django.db import transaction as db_tx
from decimal import Decimal
from wallet.models import Wallet, LedgerEntry
from wallet.services import WalletService

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
    CustomerAddress, Notification, SupportTicket, ResolutionCase,
)
from .serializers import (
    # Public/catalog
    ProductCategorySerializer,
    VendorProfileSerializer,
    VendorLiteSerializer,
    VendorProfileWriteSerializer,
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

    # Extra stateful
    CustomerAddressSerializer, NotificationSerializer, SupportTicketSerializer, ResolutionCaseSerializer,

    # Auth
    RegisterSerializer, MeSerializer, UserPublicSerializer,
)

# ============================================================
# Public Endpoints — Catalog & Ratings
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


class VendorAllView(generics.ListAPIView):
    queryset = VendorProfile.objects.filter(is_active=True).order_by("shop_name")
    serializer_class = VendorLiteSerializer
    pagination_class = None


class VendorDetailView(generics.RetrieveAPIView):
    queryset = VendorProfile.objects.filter(is_active=True)
    serializer_class = VendorProfileSerializer
    lookup_field = "pk"


class VendorBySlugView(generics.RetrieveAPIView):
    queryset = VendorProfile.objects.filter(is_active=True)
    serializer_class = VendorProfileSerializer
    lookup_field = "slug"


# --------- Ratings ---------
class ProductRatingListCreateView(generics.ListCreateAPIView):
    """
    GET: list ratings (public)
    POST: create rating (auth) — customer is taken from request.user
    """
    queryset = ProductRating.objects.all().order_by("-created_at")
    serializer_class = ProductRatingSerializer

    def get_permissions(self):
        if self.request.method.lower() == "post":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        customer, _ = CustomerProfile.objects.get_or_create(user=self.request.user)
        serializer.save(customer=customer)


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

    def patch(self, request):
        """
        Update basic user fields and customer.mobile
        Body: {first_name?, last_name?, email?, mobile?}
        """
        user = request.user
        customer, _ = CustomerProfile.objects.get_or_create(user=user)
        first = request.data.get("first_name")
        last = request.data.get("last_name")
        email = request.data.get("email")
        mobile = request.data.get("mobile")

        if first is not None:
            user.first_name = first
        if last is not None:
            user.last_name = last
        if email is not None:
            user.email = email
        user.save()

        if mobile is not None:
            customer.mobile = mobile
            customer.save()

        return self.get(request)


class CreateVendorView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        existing = VendorProfile.objects.filter(user=user).first()
        if existing:
            return Response({"detail": "Vendor already exists", "vendor_id": existing.id}, status=200)

        serializer = VendorProfileWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vendor = serializer.save(user=user)
        return Response({"detail": "Vendor created", "vendor": VendorProfileSerializer(vendor).data}, status=201)


# ============================================================
# Stateful helpers
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


class WalletDepositView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = Decimal(str(request.data.get("amount") or "0"))
        if amount <= 0:
            return Response({"detail": "Invalid amount"}, status=400)
        wallet_type = request.data.get("type") or "customer"
        wallet, _ = Wallet.objects.get_or_create(user=request.user, type=wallet_type)
        wallet.balance += amount
        wallet.save()
        Transaction.objects.create(wallet=wallet, kind="credit", amount=amount, description="Deposit")
        return Response(WalletSerializer(wallet).data, status=201)


class WalletWithdrawView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = Decimal(str(request.data.get("amount") or "0"))
        if amount <= 0:
            return Response({"detail": "Invalid amount"}, status=400)
        wallet_type = request.data.get("type") or "customer"
        wallet, _ = Wallet.objects.get_or_create(user=request.user, type=wallet_type)
        if wallet.balance < amount:
            return Response({"detail": "Insufficient balance"}, status=400)
        wallet.balance -= amount
        wallet.save()
        Transaction.objects.create(wallet=wallet, kind="debit", amount=amount, description="Withdrawal")
        return Response(WalletSerializer(wallet).data, status=201)


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
        """
        Reuse an existing conversation for (buyer, vendor) if it exists.
        This avoids IntegrityError on the unique (buyer, vendor) constraint.
        """
        customer = _get_customer(self.request.user)
        vendor_id = self.request.data.get("vendor_id")
        if not (customer and vendor_id):
            raise serializers.ValidationError({"vendor_id": "required"})

        existing = Conversation.objects.filter(buyer=customer, vendor_id=vendor_id).first()
        if existing:
            self.existing_conversation = existing
            return

        serializer.save(buyer=customer, vendor_id=vendor_id)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        if hasattr(self, "existing_conversation"):
            data = ConversationSerializer(self.existing_conversation).data
            return Response(data, status=status.HTTP_200_OK)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


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
            raise serializers.ValidationError({"conversation": "required"})

        try:
            conv = Conversation.objects.select_related("buyer__user", "vendor__user").get(pk=conv_id)
        except Conversation.DoesNotExist:
            raise serializers.ValidationError({"conversation": "not found"})

        user = self.request.user
        buyer_user = getattr(conv.buyer, "user", None)
        vendor_user = getattr(conv.vendor, "user", None)

        if user not in [buyer_user, vendor_user]:
            raise permissions.PermissionDenied("Not a participant")

        msg = serializer.save(sender=user)
        conv.last_message_at = msg.created_at
        conv.save(update_fields=["last_message_at"])


# ---------- Addresses ----------
class MyAddressListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CustomerAddressSerializer

    def get_queryset(self):
        customer = _get_customer(self.request.user)
        return CustomerAddress.objects.filter(customer=customer).order_by("-is_default", "-created_at")

    def perform_create(self, serializer):
        customer = _get_customer(self.request.user)
        obj = serializer.save(customer=customer)
        if obj.is_default:
            CustomerAddress.objects.filter(customer=customer).exclude(pk=obj.pk).update(is_default=False)


class MyAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CustomerAddressSerializer

    def get_queryset(self):
        customer = _get_customer(self.request.user)
        return CustomerAddress.objects.filter(customer=customer)

    def perform_update(self, serializer):
        obj = serializer.save()
        if obj.is_default:
            CustomerAddress.objects.filter(customer=obj.customer).exclude(pk=obj.pk).update(is_default=False)


# ---------- Notifications ----------
class MyNotificationsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        notif.is_read = True
        notif.save()
        return Response({"detail": "ok"})


# ---------- Support ----------
class MySupportTicketsView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        return SupportTicket.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ---------- Resolution Center ----------
class MyResolutionCasesView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResolutionCaseSerializer

    def get_queryset(self):
        return ResolutionCase.objects.filter(opened_by=self.request.user).select_related("order").order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(opened_by=self.request.user)


# ---------- Checkout ----------
class CheckoutView(APIView):
    """
    POST /api/checkout/
    Body:
    {
      "delivery_method": "pargo"|"courier"|"postnet"|"pickup",
      "payment_method": "wallet"|"ozow"|"mobicred",
      "protection_fee": number,
      "shipping_fee": number,
      "address_snapshot": string
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        customer = _get_customer(user)
        cart, _ = Cart.objects.get_or_create(customer=customer)
        items = list(CartItem.objects.select_related("product").filter(cart=cart))
        if not items:
            return Response({"detail": "Cart is empty"}, status=400)

        delivery_method = request.data.get("delivery_method") or "pargo"
        payment_method = request.data.get("payment_method") or "wallet"
        protection_fee = Decimal(str(request.data.get("protection_fee") or "0"))
        shipping_fee = Decimal(str(request.data.get("shipping_fee") or "0"))
        address_snapshot = request.data.get("address_snapshot") or ""

        subtotal = sum((i.product.price * i.quantity) for i in items)
        total_amount = subtotal + protection_fee + shipping_fee

        with db_tx.atomic():
            order = Order.objects.create(
                customer=customer,
                status=Order.Status.PENDING,
                total_amount=total_amount,
                # The following fields assume you will add them in a migration
                # (ok to keep here; they won't execute until you POST /checkout)
                delivery_method=delivery_method,
                shipping_fee=shipping_fee,
                protection_fee=protection_fee,
                shipping_address_snapshot=address_snapshot,
            )
            for i in items:
                OrderItem.objects.create(
                    order=order,
                    product=i.product,
                    quantity=i.quantity,
                    price_snapshot=i.product.price,
                )

            # --- FIXED INDENTATION: move wallet payment block out of the loop ---
            if payment_method == "wallet":
                wallet, _ = Wallet.objects.get_or_create(user=user)
                if wallet.balance < total_amount:
                    raise serializers.ValidationError("Insufficient wallet balance.")

                # Debit balance AND hold in escrow (pending)
                wallet.balance -= total_amount
                wallet.pending = (wallet.pending or Decimal("0")) + total_amount
                wallet.save(update_fields=["balance", "pending"])

                # Log the HOLD (escrow lock)
                LedgerEntry.objects.create(
                    wallet=wallet,
                    type=LedgerEntry.Type.HOLD,
                    amount=total_amount,
                    reference=f"ORDER-{order.id}",
                    description=f"Escrow hold for Order #{order.id}",
                    balance_after=wallet.balance,
                )

                order.status = Order.Status.PAID
                order.save()

            # clear cart
            CartItem.objects.filter(cart=cart).delete()

        return Response(OrderSerializer(order).data, status=201)


class ConfirmDeliveryView(APIView):
    """
    Buyer confirms delivery → Release escrow funds to seller
    POST /api/orders/<order_id>/confirm-delivery/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, order_id):
        customer = _get_customer(request.user)
        
        try:
            order = Order.objects.select_related('customer').prefetch_related('items__product__vendor').get(
                id=order_id, 
                customer=customer
            )
        except Order.DoesNotExist:
            return Response({"detail": "Order not found"}, status=404)
        
        # Only allow confirmation for PAID orders
        if order.status != Order.Status.PAID:
            return Response({
                "detail": f"Order must be in PAID status (currently {order.status})"
            }, status=400)
        
        # Get vendor from first order item
        first_item = order.items.first()
        if not first_item or not first_item.product or not first_item.product.vendor:
            return Response({"detail": "Order has no valid vendor"}, status=400)
        
        vendor = first_item.product.vendor
        
        with db_tx.atomic():
            # 1. Release buyer's pending (escrow hold)
            buyer_wallet, _ = Wallet.objects.get_or_create(user=request.user)
            buyer_wallet.pending = (buyer_wallet.pending or Decimal("0")) - order.total_amount
            buyer_wallet.save(update_fields=["pending"])
            
            LedgerEntry.objects.create(
                wallet=buyer_wallet,
                type=LedgerEntry.Type.RELEASE,
                amount=order.total_amount,
                reference=f"ORDER-{order.id}-RELEASE",
                description=f"Released escrow for Order #{order.id}",
                balance_after=buyer_wallet.balance,
            )
            
            # 2. Calculate platform fee (5%)
            platform_fee = order.total_amount * Decimal(getattr(settings, "PLATFORM_FEE_PERCENT", "0.05"))
            vendor_amount = order.total_amount - platform_fee
            
            # 3. Credit vendor wallet
            WalletService.post_credit(
                user=vendor.user,
                amount=vendor_amount,
                source="order_payout",
                reference=f"ORDER-{order.id}",
                description=f"Sale payout for Order #{order.id} (R{order.total_amount} - R{platform_fee} fee)",
                idem=f"order-release-{order.id}",  # Prevent duplicate releases
            )
            
            # 4. Update order status
            order.status = Order.Status.DELIVERED
            order.save(update_fields=["status"])
        
        return Response({
            "detail": "Delivery confirmed! Funds released to seller.",
            "vendor_amount": str(vendor_amount),
            "platform_fee": str(platform_fee),
        })