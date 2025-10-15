# wallet/providers/ozow.py
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from decimal import Decimal
from typing import Any, Dict, Tuple

import requests


@dataclass(frozen=True)
class OzowEnv:
    """Holds env & credentials for requests to Ozow."""
    site_code: str
    api_key: str
    private_key: str
    is_test: bool  # True -> staging, False -> live


def _as_two_dp(amount: Decimal | str | float) -> str:
    """
    Ozow accepts decimal string; always send two decimals.
    """
    if isinstance(amount, Decimal):
        return f"{amount.quantize(Decimal('0.01'))}"
    return f"{Decimal(str(amount)).quantize(Decimal('0.01'))}"


def _hash_check(private_key: str, payload: Dict[str, Any]) -> str:
    """
    Build SHA512 in the *exact* order specified by Ozow.

    Order (exclude HashCheck itself):
    SiteCode, CountryCode, CurrencyCode, Amount, TransactionReference,
    BankReference, CancelUrl, ErrorUrl, SuccessUrl, NotifyUrl, IsTest, [PrivateKey]
    """
    parts = [
        payload.get("siteCode", ""),
        payload.get("countryCode", ""),
        payload.get("currencyCode", ""),
        str(payload.get("amount", "")),
        payload.get("transactionReference", ""),
        payload.get("bankReference", ""),
        payload.get("cancelUrl", ""),
        payload.get("errorUrl", ""),
        payload.get("successUrl", ""),
        payload.get("notifyUrl", ""),
        # booleans must be rendered literally "true"/"false" per docs examples
        "true" if payload.get("isTest", False) else "false",
        private_key,
    ]
    to_hash = "".join(parts).lower().encode("utf-8")
    return hashlib.sha512(to_hash).hexdigest()


def _endpoint(is_test: bool) -> str:
    # Docs: PostPaymentRequest (staging vs live)
    return "https://stagingapi.ozow.com/PostPaymentRequest" if is_test else "https://api.ozow.com/PostPaymentRequest"


def build_hosted_payment_url(
    *,
    site_code: str,
    api_key: str,
    private_key: str,
    amount: Decimal | str | float,
    transaction_reference: str,
    bank_reference: str,
    success_url: str,
    cancel_url: str,
    error_url: str,
    notify_url: str,
    customer: str | None = None,
    is_test: bool = True,
    selected_bank_id: str | None = None,
    allow_variable_amount: bool | None = None,
    variable_amount_min: Decimal | None = None,
    variable_amount_max: Decimal | None = None,
) -> Tuple[str, str, Dict[str, Any]]:
    """
    Calls Ozow PostPaymentRequest and returns:
    (redirect_url, paymentRequestId, request_payload_dict)

    Raises requests.HTTPError (with response text) if Ozow rejects the request,
    or ValueError for a logical error in the response.
    """
    payload: Dict[str, Any] = {
        "siteCode": site_code,
        "countryCode": "ZA",
        "currencyCode": "ZAR",
        "amount": _as_two_dp(amount),
        "transactionReference": transaction_reference,
        "bankReference": bank_reference,
        "cancelUrl": cancel_url,
        "errorUrl": error_url,
        "successUrl": success_url,
        "notifyUrl": notify_url,
        "isTest": bool(is_test),
    }

    if customer:
        payload["customer"] = customer

    # Optional fields (kept consistent with docs)
    if selected_bank_id:
        payload["selectedBankId"] = selected_bank_id
    if allow_variable_amount:
        payload["allowVariableAmount"] = True
        if variable_amount_min is not None:
            payload["variableAmountMin"] = float(variable_amount_min)
        if variable_amount_max is not None:
            payload["variableAmountMax"] = float(variable_amount_max)

    payload["hashCheck"] = _hash_check(private_key, payload)

    url = _endpoint(is_test)
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "ApiKey": api_key,
    }

    resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=25)
    if resp.status_code >= 400:
        # surface the exact response for debugging
        try:
            details = resp.json()
        except Exception:
            details = {"raw": resp.text}
        err = requests.HTTPError(f"Ozow returned HTTP {resp.status_code}", response=resp)
        err.args = (*err.args, details)  # attach parsed payload if present
        raise err

    data = resp.json()
    redirect = data.get("url")
    payment_request_id = data.get("paymentRequestId")
    error_msg = data.get("errorMessage")

    if not redirect or error_msg:
        raise ValueError(f"Ozow error: {error_msg or 'Missing redirect url'}")

    return redirect, payment_request_id, payload
