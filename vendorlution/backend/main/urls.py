# main/urls.py - COMPLETE URL configuration
from django.urls import path
from . import views

urlpatterns = [
    # ======================
    # Public (no auth)
    # ======================

    # Categories
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("categories/all/", views.CategoryAllView.as_view(), name="category-all"),

    # Products
    path("products/", views.ProductListCreateView.as_view(), name="product-list-create"),
    path("products/<int:pk>/", views.ProductDetailView.as_view(), name="product-detail"),
    path("products/new/", views.ProductNewListView.as_view(), name="product-new"),
    path("products/popular/", views.ProductPopularListView.as_view(), name="product-popular"),

    # Vendors
    path("vendors/", views.VendorListView.as_view(), name="vendor-list"),
    path("vendors/featured/", views.VendorFeaturedListView.as_view(), name="vendor-featured"),
    path("vendors/all/", views.VendorAllView.as_view(), name="vendor-all"),
    path("vendors/<int:pk>/", views.VendorDetailView.as_view(), name="vendor-detail"),
    path("vendors/slug/<slug:slug>/", views.VendorBySlugView.as_view(), name="vendor-by-slug"),

    # Ratings (public list; POST requires auth and auto-sets customer)
    path("ratings/", views.ProductRatingListCreateView.as_view(), name="rating-list-create"),

    # ======================
    # Auth (register/me/create-vendor)
    # ======================
    path("auth/register/", views.RegisterView.as_view(), name="auth-register"),
    path("auth/me/", views.MeView.as_view(), name="auth-me"),
    path("auth/create-vendor/", views.CreateVendorView.as_view(), name="auth-create-vendor"),

    # ======================
    # Authenticated (JWT)
    # ======================

    # Wishlist (buyer)
    path("me/wishlist/", views.WishlistListCreateView.as_view(), name="me-wishlist"),
    path("me/wishlist/<int:pk>/", views.WishlistDetailView.as_view(), name="me-wishlist-delete"),

    # Cart (buyer)
    path("me/cart/", views.CartDetailView.as_view(), name="me-cart"),
    path("me/cart/items/", views.CartItemAddView.as_view(), name="me-cart-item-add"),
    path("me/cart/items/<int:pk>/", views.CartItemUpdateDeleteView.as_view(), name="me-cart-item-update-delete"),

    # Orders
    path("me/orders/", views.MyOrdersView.as_view(), name="me-orders"),
    path("me/vendor/orders/", views.VendorOrdersView.as_view(), name="me-vendor-orders"),
    path("orders/", views.MyOrdersView.as_view(), name="orders-alias"),

    # Wallet & transactions (old)
    path("me/wallet/", views.MyWalletView.as_view(), name="me-wallet"),
    path("me/wallet/deposit/", views.WalletDepositView.as_view(), name="me-wallet-deposit"),
    path("me/wallet/withdraw/", views.WalletWithdrawView.as_view(), name="me-wallet-withdraw"),
    path("me/transactions/", views.MyTransactionsView.as_view(), name="me-transactions"),

    # Payouts (vendor)
    path("me/payouts/", views.MyPayoutsView.as_view(), name="me-payouts"),

    # Discounts (vendor)
    path("me/discounts/", views.MyDiscountsView.as_view(), name="me-discounts"),

    # Payment methods (buyer)
    path("me/payment-methods/", views.MyPaymentMethodsView.as_view(), name="me-payment-methods"),

    # Conversations & messages (buyer/vendor)
    path("me/conversations/", views.MyConversationsView.as_view(), name="me-conversations"),
    path("me/messages/", views.ConversationMessagesView.as_view(), name="me-messages"),
    path("conversations/", views.MyConversationsView.as_view(), name="conversations-alias"),
    path("messages/", views.ConversationMessagesView.as_view(), name="messages-alias"),

    # Addresses
    path("me/addresses/", views.MyAddressListCreateView.as_view(), name="me-addresses"),
    path("me/addresses/<int:pk>/", views.MyAddressDetailView.as_view(), name="me-address-detail"),

    # Notifications
    path("me/notifications/", views.MyNotificationsView.as_view(), name="me-notifications"),
    path("me/notifications/<int:pk>/read/", views.NotificationMarkReadView.as_view(), name="me-notifications-read"),

    # Support
    path("me/support/", views.MySupportTicketsView.as_view(), name="me-support"),

    # Resolution center
    path("me/resolutions/", views.MyResolutionCasesView.as_view(), name="me-resolutions"),

    # ======================
    # CHECKOUT & ORDER FLOW
    # ======================
    path("checkout/", views.CheckoutView.as_view(), name="checkout"),
    path("orders/<int:order_id>/confirm-delivery/", views.ConfirmDeliveryView.as_view(), name="confirm-delivery"),

    # ======================
    # SHIPMENTS
    # ======================
    path("orders/<int:order_id>/shipment/", views.ShipmentCreateView.as_view(), name="shipment-create"),
    path("shipments/<int:shipment_id>/", views.ShipmentDetailView.as_view(), name="shipment-detail"),

    # ======================
    # DISPUTES
    # ======================
    path("orders/<int:order_id>/dispute/", views.DisputeCreateView.as_view(), name="dispute-create"),
    path("disputes/", views.DisputeListView.as_view(), name="dispute-list"),
    path("disputes/<int:dispute_id>/", views.DisputeDetailView.as_view(), name="dispute-detail"),

    # ======================
    # VENDOR PRODUCT MANAGEMENT
    # ======================
    path("vendor/products/", views.VendorProductListView.as_view(), name="vendor-product-list"),
    path("vendor/products/create/", views.VendorProductCreateView.as_view(), name="vendor-product-create"),
    path("vendor/products/<int:pk>/", views.VendorProductUpdateView.as_view(), name="vendor-product-update"),
    path("vendor/products/<int:pk>/delete/", views.VendorProductDeleteView.as_view(), name="vendor-product-delete"),
]