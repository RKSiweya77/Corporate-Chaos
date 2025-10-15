# wallet/providers/peach.py
from __future__ import annotations
import uuid
import requests
from decimal import Decimal
from django.conf import settings

PEACH_BASE_URL = getattr(settings, "PEACH_BASE_URL", "https://eu-test.oppwa.com/v1")
PEACH_ENTITY_ID = getattr(settings, "PEACH_ENTITY_ID", "")
PEACH_API_PASSWORD = getattr(settings, "PEACH_API_PASSWORD", "")
PEACH_NOTIFY_URL = getattr(settings, "PEACH_NOTIFY_URL", "")

class PeachError(Exception):
    pass

class PeachPayment:
    """
    Minimal Peach Payments (oppwa) integration for sandbox:
      - Register a checkout (cards / EFT Secure) and return redirect URL.
      - Verify result by calling the payment status API when webhook hits us.
    """

    @staticmethod
    def create_checkout(amount: Decimal, currency: str, reference: str, customer_email: str | None = None):
        """
        Create a checkout registration and return the redirect URL and the Peach checkout id.
        Docs: https://oppwa.com (registration -> /v1/checkouts)
        """
        url = f"{PEACH_BASE_URL}/checkouts"
        payload = {
            "entityId": PEACH_ENTITY_ID,
            "amount": f"{Decimal(amount):.2f}",
            "currency": currency,
            "paymentType": "DB",  # debit (immediate charge)
            "merchantTransactionId": reference,
            "notificationUrl": PEACH_NOTIFY_URL,
        }
        if customer_email:
            payload["customer.email"] = customer_email

        try:
            r = requests.post(url, data=payload, auth=("user", PEACH_API_PASSWORD), timeout=30)
        except requests.RequestException as e:
            raise PeachError(f"Network error contacting Peach: {e}")

        if r.status_code >= 400:
            raise PeachError(f"Peach returned HTTP {r.status_code}: {r.text}")

        data = r.json()
        checkout_id = data.get("id")
        if not checkout_id:
            raise PeachError(f"Peach response missing checkout id: {data}")

        # Hosted payment page URL format (sandbox)
        redirect_url = f"{PEACH_BASE_URL}/paymentWidgets.js?checkoutId={checkout_id}"
        # For redirect-based HPP you may also use: {PEACH_BASE_URL}/checkouts/{checkout_id}/payment
        return checkout_id, redirect_url

    @staticmethod
    def fetch_payment_status(resource_path: str):
        """
        Called from webhook: Peach posts resourcePath; we must GET it with entityId & auth to know result.
        Example resource_path: /v1/checkouts/<id>/payment
        """
        params = {
            "entityId": PEACH_ENTITY_ID,
        }
        url = f"{PEACH_BASE_URL}{resource_path}"
        try:
            r = requests.get(url, params=params, auth=("user", PEACH_API_PASSWORD), timeout=30)
        except requests.RequestException as e:
            raise PeachError(f"Network error contacting Peach: {e}")

        if r.status_code >= 400:
            raise PeachError(f"Peach status HTTP {r.status_code}: {r.text}")

        return r.json()

    @staticmethod
    def is_success(status_json: dict) -> bool:
        """
        Interpret resultCode according to Peach docs.
        000.000.* and 000.100.* ranges are successful; for sandbox, treat '000.000.000' as success.
        """
        result = status_json.get("result", {}) or {}
        code = result.get("code", "")
        return code.startswith("000.000.") or code.startswith("000.100.")
