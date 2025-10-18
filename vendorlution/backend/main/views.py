# main/views.py - COMPLETE with vendor products, checkout, shipments, disputes
from rest_framework import generics, filters, permissions, status, serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Prefetch, Q
from django.contrib.auth.models import User
from django.db import transaction as db_tx
from django.conf import settings
from decimal import Decimal

from wallet.models import Wallet, LedgerEntry, PaymentIntent
from wallet.services import WalletService

from .models import (
    ProductCategory, VendorProfile, Product, ProductRating, ProductImage,
    CustomerProfile, Wishlist, Cart, CartItem,
    Order, OrderItem,
    Wallet as OldWallet, Transaction, Payout,
    Discount, Conversation, Message,
    PaymentMethod, CustomerAddress, Notification, SupportTicket, ResolutionCase,
)
from .models_extended import Shipment, Dispute

from .serializers import (
    ProductCategorySerializer, VendorProfileSerializer, VendorLiteSerializer,
    VendorProfileWriteSerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCreateSerializer, ProductRatingSerializer,
    WishlistSerializer, CartSerializer, CartItemSerializer, OrderSerializer,
    WalletSerializer, TransactionSerializer, PayoutSerializer,
    DiscountSerializer, DiscountCreateSerializer,
    ConversationSerializer, MessageSerializer, PaymentMethodSerializer,
    CustomerAddressSerializer, NotificationSerializer, SupportTicketSerializer,
    ResolutionCaseSerializer, RegisterSerializer, MeSerializer, UserPublicSerializer,
)

# ============================================================
# Public Endpoints – Catalog & Ratings
# ============================================================

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

    def perform_create(self, serializer):
        """Set vendor from authenticated user"""
        vendor = VendorProfile.objects.filter(user=self.request.user).first()
        if not vendor:
            raise serializers.ValidationError("Vendor profile required")
        serializer.save(vendor=vendor)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    lookup_field = "pk"

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_update(self, serializer):
        """Only vendor who owns the product can update"""
        product = self.get_object()
        vendor = VendorProfile.objects.filter(user=self.request.user).first()
        if not vendor or product.vendor != vendor:
            raise permissions.PermissionDenied("Not authorized")
        serializer.save()

    def perform_destroy(self, instance):
        """Soft delete - set is_active=False"""
        vendor = VendorProfile.objects.filter(user=self.request.user).first()
        if not vendor or instance.vendor != vendor:
            raise permissions.PermissionDenied("Not authorized")
        instance.is_active = False
        instance.save()


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


class ProductRatingListCreateView(generics.ListCreateAPIView):
    """GET: list ratings (public), POST: create rating (auth)"""
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
# Auth helpers
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
        """Update basic user fields and customer.mobile"""
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
# Helpers
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


# ============================================================
# Wishlist
# ============================================================

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


# ============================================================
# Cart
# ============================================================

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


# ============================================================
# Orders
# ============================================================

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


# ============================================================
# Wallet & Transactions (old models - keep for backward compat)
# ============================================================

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
        wallet, _ = OldWallet.objects.get_or_create(user=user, type=wtype)
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
        wallet, _ = OldWallet.objects.get_or_create(user=request.user, type=wallet_type)
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
        wallet, _ = OldWallet.objects.get_or_create(user=request.user, type=wallet_type)
        if wallet.balance < amount:
            return Response({"detail": "Insufficient balance"}, status=400)
        wallet.balance -= amount
        wallet.save()
        Transaction.objects.create(wallet=wallet, kind="debit", amount=amount, description="Withdrawal")
        return Response(WalletSerializer(wallet).data, status=201)


# ============================================================
# Payouts
# ============================================================

class MyPayoutsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PayoutSerializer

    def get_queryset(self):
        vendor = _get_vendor(self.request.user)
        if not vendor:
            return Payout.objects.none()
        return Payout.objects.filter(vendor=vendor).order_by("-created_at")


# ============================================================
# Discounts
# ============================================================

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


# ============================================================
# Payment Methods
# ============================================================

class MyPaymentMethodsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentMethodSerializer

    def get_queryset(self):
        customer = _get_customer(self.request.user)
        return PaymentMethod.objects.filter(customer=customer).order_by("-created_at")


# ============================================================
# Conversations & Messages
# ============================================================

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


# ============================================================
# Addresses
# ============================================================

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


# ============================================================
# Notifications
# ============================================================

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


# ============================================================
# Support
# ============================================================

class MySupportTicketsView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        return SupportTicket.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ============================================================
# Resolution Center
# ============================================================

class MyResolutionCasesView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResolutionCaseSerializer

    def get_queryset(self):
        return ResolutionCase.objects.filter(opened_by=self.request.user).select_related("order").order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(opened_by=self.request.user)


# ============================================================
# CHECKOUT WITH OZOW INTEGRATION
# ============================================================

class CheckoutView(APIView):
    """
    POST /api/checkout/
    Body: {
      "delivery_method": "pargo"|"courier"|"postnet"|"pickup",
      "payment_method": "wallet"|"ozow",
      "protection_fee": number,
      "shipping_fee": number,
      "address_snapshot": string
    }
    Returns: For Ozow -> { ozow_redirect_url, order_id }
             For wallet -> { order: {...} }
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

        # Server-side price recalculation (security)
        subtotal = sum((i.product.price * i.quantity) for i in items)
        total_amount = subtotal + protection_fee + shipping_fee

        with db_tx.atomic():
            # Create order
            order = Order.objects.create(
                customer=customer,
                status=Order.Status.PENDING,
                total_amount=total_amount,
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

            # Payment handling
            if payment_method == "ozow":
                # Create payment intent and redirect to Ozow
                wallet, _ = Wallet.objects.get_or_create(user=user)
                intent = PaymentIntent.objects.create(
                    user=user,
                    wallet=wallet,
                    provider="ozow",
                    kind="payment",
                    amount=total_amount,
                    currency="ZAR",
                    status="created",
                    metadata={"order_id": order.id},
                )
                
                # Clear cart
                CartItem.objects.filter(cart=cart).delete()
                
                return Response({
                    "payment_method": "ozow",
                    "order_id": order.id,
                    "intent_id": str(intent.id),
                    "amount": str(total_amount),
                    "next_step": "redirect_to_ozow",
                    "message": "Use /api/wallet/ozow/deposit/start/ with intent_id to get redirect URL"
                }, status=201)
            
            elif payment_method == "wallet":
                # Unified wallet from wallet app
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
                    source="order_payment",
                    status="posted",
                )

                order.status = Order.Status.PAID
                order.save()

                # Clear cart
                CartItem.objects.filter(cart=cart).delete()

                return Response(OrderSerializer(order).data, status=201)
            
            else:
                return Response({"detail": "Invalid payment method"}, status=400)


# ============================================================
# CONFIRM DELIVERY (Release Escrow)
# ============================================================

class ConfirmDeliveryView(APIView):
    """
    Buyer confirms delivery → Release escrow funds to seller + Mark products as SOLD
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
                source="escrow_release",
                status="posted",
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
                idem=f"order-release-{order.id}",
            )
            
            # 4. Update order status
            order.status = Order.Status.DELIVERED
            order.save(update_fields=["status"])
            
            # 5. ⭐ NEW: Mark all products in this order as SOLD
            products_sold = []
            for item in order.items.all():
                product = item.product
                if not getattr(product, "is_sold", False):
                    # Prefer a model method if it exists; otherwise, fall back to setting the flag.
                    try:
                        product.mark_as_sold()
                    except AttributeError:
                        setattr(product, "is_sold", True)
                        product.save(update_fields=["is_sold"])
                    products_sold.append(product.title)
            
            # 6. ⭐ NEW: Notify vendor about sold products
            if products_sold:
                product_list = ", ".join(products_sold)
                Notification.objects.create(
                    user=vendor.user,
                    message=f"🎉 Your product(s) have been sold: {product_list}",
                    type=Notification.Type.ORDER,
                )
        
        return Response({
            "detail": "Delivery confirmed! Funds released to seller.",
            "vendor_amount": str(vendor_amount),
            "platform_fee": str(platform_fee),
            "products_sold": len(products_sold),
        })


# ============================================================
# SHIPMENT MANAGEMENT
# ============================================================

class ShipmentCreateView(APIView):
    """POST /api/orders/<order_id>/shipment/ - Vendor adds shipment info"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, order_id):
        vendor = _get_vendor(request.user)
        if not vendor:
            return Response({"detail": "Vendor profile required"}, status=403)

        try:
            order = Order.objects.prefetch_related("items__product__vendor").get(id=order_id)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found"}, status=404)

        # Verify vendor owns at least one product in order
        vendor_owns = any(item.product.vendor == vendor for item in order.items.all())
        if not vendor_owns:
            return Response({"detail": "Not authorized"}, status=403)

        # Check if shipment already exists
        if hasattr(order, "shipment"):
            return Response({"detail": "Shipment already exists"}, status=400)

        method = request.data.get("method", "courier")
        tracking_number = request.data.get("tracking_number", "")
        carrier_name = request.data.get("carrier_name", "")
        pargo_code = request.data.get("pargo_code", "")
        pickup_point = request.data.get("pickup_point", "")
        proof_of_dropoff = request.FILES.get("proof_of_dropoff")
        notes = request.data.get("notes", "")

        shipment = Shipment.objects.create(
            order=order,
            method=method,
            tracking_number=tracking_number,
            carrier_name=carrier_name,
            pargo_code=pargo_code,
            pickup_point=pickup_point,
            proof_of_dropoff=proof_of_dropoff,
            notes=notes,
        )
        shipment.mark_shipped()

        return Response({
            "id": shipment.id,
            "order_id": order.id,
            "method": shipment.method,
            "status": shipment.status,
            "tracking_number": shipment.tracking_number,
            "shipped_at": shipment.shipped_at,
        }, status=201)


class ShipmentDetailView(APIView):
    """GET /api/shipments/<shipment_id>/ - View shipment details"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, shipment_id):
        try:
            shipment = Shipment.objects.select_related("order__customer__user").get(id=shipment_id)
        except Shipment.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        # Check authorization (buyer or vendor)
        customer = _get_customer(request.user)
        vendor = _get_vendor(request.user)
        
        is_buyer = customer and shipment.order.customer == customer
        is_vendor = vendor and any(item.product.vendor == vendor for item in shipment.order.items.all())
        
        if not (is_buyer or is_vendor):
            return Response({"detail": "Not authorized"}, status=403)

        return Response({
            "id": shipment.id,
            "order_id": shipment.order_id,
            "method": shipment.method,
            "status": shipment.status,
            "tracking_number": shipment.tracking_number,
            "carrier_name": shipment.carrier_name,
            "pargo_code": shipment.pargo_code,
            "pickup_point": shipment.pickup_point,
            "proof_of_dropoff": shipment.proof_of_dropoff.url if shipment.proof_of_dropoff else None,
            "shipped_at": shipment.shipped_at,
            "delivered_at": shipment.delivered_at,
            "expected_delivery": shipment.expected_delivery,
            "notes": shipment.notes,
        })


# ============================================================
# DISPUTE MANAGEMENT
# ============================================================

class DisputeCreateView(APIView):
    """POST /api/orders/<order_id>/dispute/ - Buyer opens dispute"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, order_id):
        customer = _get_customer(request.user)
        
        try:
            order = Order.objects.get(id=order_id, customer=customer)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found"}, status=404)

        # Check if dispute already exists
        if order.disputes.filter(status__in=["open", "under_review"]).exists():
            return Response({"detail": "Active dispute already exists"}, status=400)

        reason = request.data.get("reason", "other")
        description = request.data.get("description", "")
        evidence_notes = request.data.get("evidence_notes", "")

        if not description:
            return Response({"detail": "Description required"}, status=400)

        dispute = Dispute.objects.create(
            order=order,
            opened_by=request.user,
            reason=reason,
            description=description,
            evidence_notes=evidence_notes,
        )

        # Notify vendor
        first_item = order.items.first()
        if first_item and first_item.product.vendor:
            Notification.objects.create(
                user=first_item.product.vendor.user,
                message=f"Dispute opened for Order #{order.id}",
                type=Notification.Type.DISPUTE,
            )

        return Response({
            "id": dispute.id,
            "order_id": order.id,
            "reason": dispute.reason,
            "status": dispute.status,
            "created_at": dispute.created_at,
        }, status=201)


class DisputeListView(generics.ListAPIView):
    """GET /api/disputes/ - List all disputes for current user"""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # FIX: use self.request (request isn't in scope on the class)
        user = self.request.user
        customer = _get_customer(user)
        vendor = _get_vendor(user)

        qs = Dispute.objects.none()
        
        # Buyer's disputes
        if customer:
            qs = Dispute.objects.filter(order__customer=customer)
        
        # Vendor's disputes
        if vendor:
            vendor_disputes = Dispute.objects.filter(
                order__items__product__vendor=vendor
            ).distinct()
            qs = qs | vendor_disputes

        return qs.select_related("order", "opened_by").order_by("-created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = [{
            "id": d.id,
            "order_id": d.order_id,
            "reason": d.reason,
            "description": d.description,
            "status": d.status,
            "opened_by": d.opened_by.username,
            "created_at": d.created_at,
            "resolved_at": d.resolved_at,
        } for d in queryset]
        return Response(data)


class DisputeDetailView(APIView):
    """GET/PATCH /api/disputes/<dispute_id>/ - View or resolve dispute"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, dispute_id):
        try:
            dispute = Dispute.objects.select_related("order__customer__user", "opened_by").get(id=dispute_id)
        except Dispute.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        # Check authorization
        customer = _get_customer(request.user)
        vendor = _get_vendor(request.user)
        
        is_buyer = customer and dispute.order.customer == customer
        is_vendor = vendor and any(item.product.vendor == vendor for item in dispute.order.items.all())
        
        if not (is_buyer or is_vendor or request.user.is_staff):
            return Response({"detail": "Not authorized"}, status=403)

        return Response({
            "id": dispute.id,
            "order_id": dispute.order_id,
            "reason": dispute.reason,
            "description": dispute.description,
            "evidence_notes": dispute.evidence_notes,
            "status": dispute.status,
            "opened_by": dispute.opened_by.username,
            "created_at": dispute.created_at,
            "resolved_at": dispute.resolved_at,
            "resolution_notes": dispute.resolution_notes,
            "refund_amount": str(dispute.refund_amount),
        })

    def patch(self, request, dispute_id):
        """Admin/staff resolves dispute"""
        if not request.user.is_staff:
            return Response({"detail": "Admin only"}, status=403)

        try:
            dispute = Dispute.objects.select_related("order").get(id=dispute_id)
        except Dispute.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        resolution = request.data.get("resolution")  # "refund" or "release"
        notes = request.data.get("notes", "")

        if resolution == "refund":
            refund_amount = Decimal(str(request.data.get("refund_amount", dispute.order.total_amount)))
            
            with db_tx.atomic():
                # Release escrow back to buyer
                buyer_wallet, _ = Wallet.objects.get_or_create(user=dispute.order.customer.user)
                buyer_wallet.pending = (buyer_wallet.pending or Decimal("0")) - dispute.order.total_amount
                buyer_wallet.balance = (buyer_wallet.balance or Decimal("0")) + refund_amount
                buyer_wallet.save(update_fields=["pending", "balance"])

                LedgerEntry.objects.create(
                    wallet=buyer_wallet,
                    type=LedgerEntry.Type.CREDIT,
                    amount=refund_amount,
                    reference=f"DISPUTE-{dispute.id}-REFUND",
                    description=f"Refund for disputed Order #{dispute.order_id}",
                    balance_after=buyer_wallet.balance,
                    source="dispute_refund",
                    status="posted",
                )

                dispute.resolve_refund(amount=refund_amount, notes=notes, resolved_by=request.user)
                dispute.order.status = Order.Status.REFUNDED
                dispute.order.save(update_fields=["status"])

            return Response({"detail": "Dispute resolved with refund", "refund_amount": str(refund_amount)})

        elif resolution == "release":
            # Release funds to seller
            first_item = dispute.order.items.first()
            if first_item and first_item.product.vendor:
                vendor = first_item.product.vendor
                platform_fee = dispute.order.total_amount * Decimal(getattr(settings, "PLATFORM_FEE_PERCENT", "0.05"))
                vendor_amount = dispute.order.total_amount - platform_fee

                with db_tx.atomic():
                    # Release buyer's pending
                    buyer_wallet, _ = Wallet.objects.get_or_create(user=dispute.order.customer.user)
                    buyer_wallet.pending = (buyer_wallet.pending or Decimal("0")) - dispute.order.total_amount
                    buyer_wallet.save(update_fields=["pending"])

                    LedgerEntry.objects.create(
                        wallet=buyer_wallet,
                        type=LedgerEntry.Type.RELEASE,
                        amount=dispute.order.total_amount,
                        reference=f"DISPUTE-{dispute.id}-RELEASE",
                        description=f"Escrow released after dispute resolution",
                        balance_after=buyer_wallet.balance,
                        source="dispute_release",
                        status="posted",
                    )

                    # Credit vendor
                    WalletService.post_credit(
                        user=vendor.user,
                        amount=vendor_amount,
                        source="order_payout",
                        reference=f"ORDER-{dispute.order_id}",
                        description=f"Sale payout for Order #{dispute.order_id} (after dispute)",
                        idem=f"order-release-dispute-{dispute.id}",
                    )

                    dispute.resolve_release(notes=notes, resolved_by=request.user)
                    dispute.order.status = Order.Status.DELIVERED
                    dispute.order.save(update_fields=["status"])

            return Response({"detail": "Dispute resolved, funds released to seller"})

        else:
            return Response({"detail": "Invalid resolution type"}, status=400)


# ============================================================
# VENDOR PRODUCT ENDPOINTS
# ============================================================

class VendorProductListView(generics.ListAPIView):
    """GET /api/vendor/products/ - List vendor's own products"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProductListSerializer

    def get_queryset(self):
        vendor = _get_vendor(self.request.user)
        if not vendor:
            return Product.objects.none()
        return Product.objects.filter(vendor=vendor).order_by("-created_at")


class VendorProductCreateView(generics.CreateAPIView):
    """POST /api/vendor/products/ - Create new product"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProductCreateSerializer
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        vendor = _get_vendor(self.request.user)
        if not vendor:
            raise permissions.PermissionDenied("Vendor profile required")
        serializer.save(vendor=vendor)


class VendorProductUpdateView(generics.UpdateAPIView):
    """PATCH /api/vendor/products/<pk>/ - Update product"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProductCreateSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        vendor = _get_vendor(self.request.user)
        if not vendor:
            return Product.objects.none()
        return Product.objects.filter(vendor=vendor)


class VendorProductDeleteView(generics.DestroyAPIView):
    """DELETE /api/vendor/products/<pk>/ - Soft delete product"""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        vendor = _get_vendor(self.request.user)
        if not vendor:
            return Product.objects.none()
        return Product.objects.filter(vendor=vendor)

    def perform_destroy(self, instance):
        """Soft delete"""
        instance.is_active = False
        instance.save(update_fields=["is_active"])