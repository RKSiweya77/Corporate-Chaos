# backend_api/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from main.tokens import FlexibleTokenObtainPairView
from main.views import RegisterView, MeView, CreateVendorView

# Import wallet views for payments/webhooks
from wallet import views as wallet_views

urlpatterns = [
    path("admin/", admin.site.urls),

    # App routes
    path("api/", include("main.urls")),
    path("api/wallet/", include("wallet.urls")),

    # Auth / JWT
    path("api/auth/token/", FlexibleTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    # Convenience
    path("api/auth/register/", RegisterView.as_view(), name="auth-register"),
    path("api/auth/me/", MeView.as_view(), name="auth-me"),
    path("api/auth/create-vendor/", CreateVendorView.as_view(), name="auth-create-vendor"),

    # Payments (Ozow)
    # Start a deposit/payment (Create Payment Request)
    path("api/payments/ozow/start/", wallet_views.OzowDepositStartView.as_view(), name="ozow_start"),

    # Ozow webhook/notification endpoint (set this URL in settings.OZOW_NOTIFY_URL)
    path("api/wallet/webhooks/ozow/", wallet_views.ozow_webhook, name="ozow_webhook"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)