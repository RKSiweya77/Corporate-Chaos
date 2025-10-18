# wallet/providers/ozow.py
import hashlib
import uuid
from decimal import Decimal
from typing import Tuple


def generate_hash_check(
    site_code: str,
    country_code: str,
    currency_code: str,
    amount: str,
    transaction_reference: str,
    bank_reference: str,
    optional1: str,
    optional2: str,
    optional3: str,
    optional4: str,
    optional5: str,
    cancel_url: str,
    error_url: str,
    success_url: str,
    notify_url: str,
    is_test: bool,
    private_key: str,
) -> str:
    """
    Generate Ozow HashCheck signature.
    All params must be lowercase strings; booleans as "true"/"false".
    """
    is_test_str = "true" if is_test else "false"
    
    to_hash = (
        f"{site_code.lower()}"
        f"{country_code.lower()}"
        f"{currency_code.lower()}"
        f"{amount.lower()}"
        f"{transaction_reference.lower()}"
        f"{bank_reference.lower()}"
        f"{optional1.lower()}"
        f"{optional2.lower()}"
        f"{optional3.lower()}"
        f"{optional4.lower()}"
        f"{optional5.lower()}"
        f"{cancel_url.lower()}"
        f"{error_url.lower()}"
        f"{success_url.lower()}"
        f"{notify_url.lower()}"
        f"{is_test_str.lower()}"
        f"{private_key.lower()}"
    )
    
    return hashlib.sha512(to_hash.encode("utf-8")).hexdigest()


def build_hosted_payment_url(
    site_code: str,
    api_key: str,
    private_key: str,
    amount: str,
    transaction_reference: str,
    bank_reference: str,
    success_url: str,
    cancel_url: str,
    error_url: str,
    notify_url: str,
    customer: str | None = None,
    is_test: bool = True,
    country_code: str = "ZA",
    currency_code: str = "ZAR",
    optional1: str = "",
    optional2: str = "",
    optional3: str = "",
    optional4: str = "",
    optional5: str = "",
) -> Tuple[str, str, dict]:
    """
    Build Ozow hosted payment page URL.
    
    Returns:
        (redirect_url, payment_request_id, payload_dict)
    """
    payment_request_id = str(uuid.uuid4())
    
    # Generate hash
    hash_check = generate_hash_check(
        site_code=site_code,
        country_code=country_code,
        currency_code=currency_code,
        amount=amount,
        transaction_reference=transaction_reference,
        bank_reference=bank_reference,
        optional1=optional1 or "",
        optional2=optional2 or "",
        optional3=optional3 or "",
        optional4=optional4 or "",
        optional5=optional5 or "",
        cancel_url=cancel_url,
        error_url=error_url,
        success_url=success_url,
        notify_url=notify_url,
        is_test=is_test,
        private_key=private_key,
    )
    
    # Build query string
    base_url = "https://pay.ozow.com" if not is_test else "https://staging.ozow.com"
    
    payload = {
        "SiteCode": site_code,
        "CountryCode": country_code,
        "CurrencyCode": currency_code,
        "Amount": amount,
        "TransactionReference": transaction_reference,
        "BankReference": bank_reference,
        "CancelUrl": cancel_url,
        "ErrorUrl": error_url,
        "SuccessUrl": success_url,
        "NotifyUrl": notify_url,
        "IsTest": "true" if is_test else "false",
        "HashCheck": hash_check,
        "Optional1": optional1 or "",
        "Optional2": optional2 or "",
        "Optional3": optional3 or "",
        "Optional4": optional4 or "",
        "Optional5": optional5 or "",
    }
    
    if customer:
        payload["Customer"] = customer
    
    # Build URL
    query_parts = [f"{k}={v}" for k, v in payload.items() if v]
    redirect_url = f"{base_url}/?{'&'.join(query_parts)}"
    
    return redirect_url, payment_request_id, payload


def verify_webhook_signature(payload: dict, private_key: str) -> bool:
    """
    Verify Ozow webhook signature.
    
    Expected fields in payload:
    - SiteCode, TransactionId, TransactionReference, Amount, Status, etc.
    - HashCheck (the signature to verify)
    """
    received_hash = payload.get("HashCheck") or payload.get("hashCheck") or ""
    
    site_code = payload.get("SiteCode") or payload.get("siteCode") or ""
    transaction_id = payload.get("TransactionId") or payload.get("transactionId") or ""
    transaction_reference = payload.get("TransactionReference") or payload.get("transactionReference") or ""
    amount = str(payload.get("Amount") or payload.get("amount") or "")
    status = payload.get("Status") or payload.get("status") or ""
    optional1 = payload.get("Optional1") or payload.get("optional1") or ""
    optional2 = payload.get("Optional2") or payload.get("optional2") or ""
    optional3 = payload.get("Optional3") or payload.get("optional3") or ""
    optional4 = payload.get("Optional4") or payload.get("optional4") or ""
    optional5 = payload.get("Optional5") or payload.get("optional5") or ""
    currency_code = payload.get("CurrencyCode") or payload.get("currencyCode") or "ZAR"
    is_test = payload.get("IsTest") or payload.get("isTest") or "false"
    status_message = payload.get("StatusMessage") or payload.get("statusMessage") or ""
    
    # Normalize boolean
    if isinstance(is_test, bool):
        is_test = "true" if is_test else "false"
    is_test = str(is_test).lower()
    
    # Build hash input (lowercase everything)
    to_hash = (
        f"{site_code.lower()}"
        f"{transaction_id.lower()}"
        f"{transaction_reference.lower()}"
        f"{amount.lower()}"
        f"{status.lower()}"
        f"{optional1.lower()}"
        f"{optional2.lower()}"
        f"{optional3.lower()}"
        f"{optional4.lower()}"
        f"{optional5.lower()}"
        f"{currency_code.lower()}"
        f"{is_test.lower()}"
        f"{status_message.lower()}"
        f"{private_key.lower()}"
    )
    
    computed_hash = hashlib.sha512(to_hash.encode("utf-8")).hexdigest()
    
    return computed_hash.lower() == received_hash.lower()