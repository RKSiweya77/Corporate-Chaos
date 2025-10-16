# backend/backend_api/settings.py - COMPLETE COPY-PASTE READY
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-temp-key"
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost", "*.ngrok.io"]  # Added ngrok support

# ---------------- Installed apps ----------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",

    # Local
    "main",
    "wallet",  # Wallet app
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # CORS before CommonMiddleware
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend_api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend_api.wsgi.application"

# ---------------- Database ----------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "vendorlution",
        "USER": "postgres",
        "PASSWORD": "Phraser18$",
        "HOST": "localhost",
        "PORT": "5432",
    }
}

# ---------------- Password validation ----------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ---------------- I18N ----------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ---------------- Static & Media ----------------
STATIC_URL = "static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------- DRF + JWT ----------------
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "main.pagination.CustomPagination",
    "PAGE_SIZE": 10,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "ALGORITHM": "HS256",
}

# ---------------- CORS (React) ----------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Allow credentials for session/cookie auth
CORS_ALLOW_CREDENTIALS = True

# Allow ngrok in development
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True  # Only for dev with ngrok

# Dev fallback vendor (if used by older views)
DEV_MODE_DEFAULT_VENDOR_ID = 1

# ---------------- WALLET / PAYMENTS ----------------
# Global live/sandbox flag
LIVE_MODE = False  # set True in production

# === Ozow (Instant EFT) ===
# ⚠️ REPLACE THESE WITH YOUR ACTUAL SANDBOX CREDENTIALS FROM OZOW
# Get them from: https://ozow.com → Developer Portal
OZOW_API_KEY = "PLACEHOLDER_REPLACE_ME"  # Replace with your sandbox API key
OZOW_SITE_CODE = "PLACEHOLDER_REPLACE_ME"  # Replace with your sandbox site code
OZOW_PRIVATE_KEY = "PLACEHOLDER_REPLACE_ME"  # Replace with your sandbox private key

# Absolute URLs required by Ozow
OZOW_SUCCESS_URL = "http://127.0.0.1:3000/wallet/deposit/success"
OZOW_CANCEL_URL = "http://127.0.0.1:3000/wallet/deposit/cancel"
OZOW_ERROR_URL = "http://127.0.0.1:3000/wallet/deposit/error"

# ⚠️ IMPORTANT: When testing locally with ngrok, update this to your ngrok URL:
# Example: "https://abc123.ngrok.io/api/wallet/webhooks/ozow/"
OZOW_NOTIFY_URL = "http://127.0.0.1:8000/api/wallet/webhooks/ozow/"

# Environment toggle for Ozow
OZOW_IS_TEST = not LIVE_MODE  # True -> staging, False -> live

# === Peach Payments (Cards/EFT Secure) - PLACEHOLDER ===
PEACH_ENTITY_ID = "8ac7a4cxxxxxxx"  # Replace when you get credentials
PEACH_API_PASSWORD = "test_peach_pwd"  # Replace when you get credentials
PEACH_BASE_URL = "https://eu-test.oppwa.com/v1"
PEACH_NOTIFY_URL = "http://127.0.0.1:8000/api/wallet/webhooks/peach/"

# === Vouchers (1Voucher, Kazang, etc.) ===
VOUCHER_LIVE = False
VOUCHER_ACCEPTED_ISSUERS = ["1VOUCHER", "OTT", "BLU", "KAZANG", "FLASH"]

# === Payouts ===
PAYOUT_LIVE = False
PAYOUT_MIN_AMOUNT = "10.00"  # Minimum R 10 withdrawal

# === Platform Fees ===
PLATFORM_FEE_PERCENT = "0.05"  # 5% platform fee on sales