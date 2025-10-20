# backend/backend_api/settings.py
import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "django-insecure-temp-key")
DEBUG = os.environ.get("DJANGO_DEBUG", "true").lower() == "true"

ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    os.environ.get("NGROK_HOST", "").replace("https://", "").replace("http://", ""),
]

NGROK_HOST = os.environ.get("NGROK_HOST", "").rstrip("/")
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://127.0.0.1:3000")

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
    "wallet",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
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
        "NAME": os.environ.get("POSTGRES_DB", "vendorlution"),
        "USER": os.environ.get("POSTGRES_USER", "postgres"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "Phraser18$"),
        "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
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

# ---------------- CORS / CSRF ----------------
CORS_ALLOWED_ORIGINS = [
    FRONTEND_ORIGIN,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if NGROK_HOST:
    # Allow the exact ngrok origin for CORS/CSRF in dev
    for scheme in ("https://", "http://"):
        CORS_ALLOWED_ORIGINS.append(f"{scheme}{NGROK_HOST.replace('https://','').replace('http://','')}")
    CSRF_TRUSTED_ORIGINS = [
        f"https://{NGROK_HOST.replace('https://','').replace('http://','')}",
        f"http://{NGROK_HOST.replace('https://','').replace('http://','')}",
        FRONTEND_ORIGIN,
    ]
else:
    CSRF_TRUSTED_ORIGINS = [FRONTEND_ORIGIN]

CORS_ALLOW_CREDENTIALS = True

# In dev, you can allow all origins (useful when NGROK rotates)
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

# ---------------- Dev fallback ----------------
DEV_MODE_DEFAULT_VENDOR_ID = int(os.environ.get("DEV_MODE_DEFAULT_VENDOR_ID", "1"))

# ---------------- WALLET / PAYMENTS ----------------
LIVE_MODE = os.environ.get("LIVE_MODE", "false").lower() == "true"

# === Ozow (Instant EFT) ===
OZOW_API_BASE = os.environ.get(
    "OZOW_API_BASE",
    "https://stagingapi.ozow.com" if not LIVE_MODE else "https://api.ozow.com",
)

OZOW_API_KEY = os.environ.get("OZOW_API_KEY", "PLACEHOLDER_REPLACE_ME")
OZOW_SITE_CODE = os.environ.get("OZOW_SITE_CODE", "PLACEHOLDER_REPLACE_ME")
OZOW_PRIVATE_KEY = os.environ.get("OZOW_PRIVATE_KEY", "PLACEHOLDER_REPLACE_ME")

# Public callback URLs (prefer .env overrides; fall back to typical dev defaults)
OZOW_SUCCESS_URL = os.environ.get(
    "OZOW_SUCCESS_URL", f"{FRONTEND_ORIGIN}/wallet/deposit/success"
)
OZOW_CANCEL_URL = os.environ.get(
    "OZOW_CANCEL_URL", f"{FRONTEND_ORIGIN}/wallet/deposit/cancel"
)
OZOW_ERROR_URL = os.environ.get(
    "OZOW_ERROR_URL", f"{FRONTEND_ORIGIN}/wallet/deposit/error"
)
OZOW_NOTIFY_URL = os.environ.get(
    "OZOW_NOTIFY_URL",
    (f"{NGROK_HOST}/api/wallet/webhooks/ozow/" if NGROK_HOST else "http://127.0.0.1:8000/api/wallet/webhooks/ozow/"),
)

# Toggle for staging/live behavior
OZOW_IS_TEST = os.environ.get("OZOW_IS_TEST", "true" if not LIVE_MODE else "false").lower() == "true"

# === Peach Payments (placeholders) ===
PEACH_ENTITY_ID = os.environ.get("PEACH_ENTITY_ID", "8ac7a4cxxxxxxx")
PEACH_API_PASSWORD = os.environ.get("PEACH_API_PASSWORD", "test_peach_pwd")
PEACH_BASE_URL = os.environ.get("PEACH_BASE_URL", "https://eu-test.oppwa.com/v1")
PEACH_NOTIFY_URL = os.environ.get(
    "PEACH_NOTIFY_URL",
    (f"{NGROK_HOST}/api/wallet/webhooks/peach/" if NGROK_HOST else "http://127.0.0.1:8000/api/wallet/webhooks/peach/"),
)

# === Vouchers ===
VOUCHER_LIVE = os.environ.get("VOUCHER_LIVE", "false").lower() == "true"
VOUCHER_ACCEPTED_ISSUERS = ["1VOUCHER", "OTT", "BLU", "KAZANG", "FLASH"]

# === Payouts ===
PAYOUT_LIVE = os.environ.get("PAYOUT_LIVE", "false").lower() == "true"
PAYOUT_MIN_AMOUNT = os.environ.get("PAYOUT_MIN_AMOUNT", "10.00")

# === Platform Fees ===
PLATFORM_FEE_PERCENT = os.environ.get("PLATFORM_FEE_PERCENT", "0.05")

# ---------------- Logging (useful while integrating Ozow) ----------------
LOG_LEVEL = os.environ.get("DJANGO_LOG_LEVEL", "INFO")
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": LOG_LEVEL},
}