from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from main.tokens import FlexibleTokenObtainPairView
from main.views import RegisterView, MeView, CreateVendorView

urlpatterns = [
    path("admin/", admin.site.urls),

    # App routes
    path("api/", include("main.urls")),
    path("api/wallet/", include("wallet.urls")),  # ✅ wallet app

    # Auth / JWT
    path("api/auth/token/", FlexibleTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    # Convenience
    path("api/auth/register/", RegisterView.as_view(), name="auth-register"),
    path("api/auth/me/", MeView.as_view(), name="auth-me"),
    path("api/auth/create-vendor/", CreateVendorView.as_view(), name="auth-create-vendor"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
