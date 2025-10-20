import hashlib
import uuid
from typing import Tuple, Dict, Any


def _to_bool_str(value: bool | str) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    return str(value).strip().lower()


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
    customer: str = "",
) -> str:
    """
    SHA512 hash for Ozow hosted/POST payloads.
    All concatenated in lower-case, with private key at the end.
    Some integrations include Customer in the concatenation – we accept it as optional.
    """
    parts = [
        site_code,
        country_code,
        currency_code,
        amount,
        transaction_reference,
        bank_reference,
        optional1,
        optional2,
        optional3,
        optional4,
        optional5,
        cancel_url,
        error_url,
        success_url,
        notify_url,
        _to_bool_str(is_test),
    ]
    # Include customer if present (harmless if empty)
    parts.append(customer or "")
    parts.append(private_key)

    to_hash = "".join((str(p or "")).lower() for p in parts)
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
) -> Tuple[str, str, Dict[str, Any]]:
    """
    Legacy/hosted redirection flow builder.
    Returns (redirect_url, payment_request_id, payload_dict).
    """
    payment_request_id = str(uuid.uuid4())

    hash_check = generate_hash_check(
        site_code=site_code,
        country_code=country_code,
        currency_code=currency_code,
        amount=str(amount),
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
        customer=customer or "",
    )

    base_url = "https://pay.ozow.com" if not is_test else "https://staging.ozow.com"

    payload = {
        "SiteCode": site_code,
        "CountryCode": country_code,
        "CurrencyCode": currency_code,
        "Amount": str(amount),
        "TransactionReference": transaction_reference,
        "BankReference": bank_reference,
        "CancelUrl": cancel_url,
        "ErrorUrl": error_url,
        "SuccessUrl": success_url,
        "NotifyUrl": notify_url,
        "IsTest": _to_bool_str(is_test),
        "HashCheck": hash_check,
        "Optional1": optional1 or "",
        "Optional2": optional2 or "",
        "Optional3": optional3 or "",
        "Optional4": optional4 or "",
        "Optional5": optional5 or "",
    }
    if customer:
        payload["Customer"] = customer

    # Basic query-string build (no urlencoding because Ozow usually expects raw-friendly URLs in dev;
    # feel free to urllib.parse.urlencode if your values contain spaces).
    query = "&".join(f"{k}={v}" for k, v in payload.items() if v != "")
    redirect_url = f"{base_url}/?{query}"

    return redirect_url, payment_request_id, payload


def post_payment_request_payload(
    *,
    site_code: str,
    api_key: str,
    private_key: str,
    amount: str | float,
    transaction_reference: str,
    bank_reference: str,
    cancel_url: str,
    error_url: str,
    success_url: str,
    notify_url: str,
    is_test: bool = True,
    country_code: str = "ZA",
    currency_code: str = "ZAR",
    optional1: str = "",
    optional2: str = "",
    optional3: str = "",
    optional4: str = "",
    optional5: str = "",
    customer: str = "",
    customer_identifier: str = "",
    customer_cellphone_number: str = "",
    selected_bank_id: str = "",
    allow_variable_amount: bool = False,
    variable_amount_min: float | None = None,
    variable_amount_max: float | None = None,
) -> Dict[str, Any]:
    """
    Helper to build the JSON body for POST /PostPaymentRequest (stagingapi/live).
    You still need to send it with header: ApiKey: <key>.
    """
    amt_str = str(amount)
    hash_check = generate_hash_check(
        site_code=site_code,
        country_code=country_code,
        currency_code=currency_code,
        amount=amt_str,
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
        customer=customer or "",
    )

    payload: Dict[str, Any] = {
        "siteCode": site_code,
        "countryCode": country_code,
        "currencyCode": currency_code,
        "amount": float(amt_str),
        "transactionReference": transaction_reference,
        "bankReference": bank_reference,
        "optional1": optional1 or "",
        "optional2": optional2 or "",
        "optional3": optional3 or "",
        "optional4": optional4 or "",
        "optional5": optional5 or "",
        "customer": customer or "",
        "cancelUrl": cancel_url,
        "errorUrl": error_url,
        "successUrl": success_url,
        "notifyUrl": notify_url,
        "isTest": bool(is_test),
        "hashCheck": hash_check,
    }

    if selected_bank_id:
        payload["selectedBankId"] = selected_bank_id
    if customer_identifier:
        payload["customerIdentifier"] = customer_identifier
    if customer_cellphone_number:
        payload["customerCellphoneNumber"] = customer_cellphone_number
    if allow_variable_amount:
        payload["allowVariableAmount"] = True
        if variable_amount_min is not None:
            payload["variableAmountMin"] = float(variable_amount_min)
        if variable_amount_max is not None:
            payload["variableAmountMax"] = float(variable_amount_max)

    return payload


def verify_webhook_signature(payload: dict, private_key: str) -> bool:
    """
    Validate Ozow webhook HashCheck.
    """
    received_hash = (payload.get("HashCheck") or payload.get("hashCheck") or "").strip()

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
    is_test = _to_bool_str(payload.get("IsTest") or payload.get("isTest") or "false")
    status_message = payload.get("StatusMessage") or payload.get("statusMessage") or ""

    to_hash = (
        f"{site_code}".lower()
        + f"{transaction_id}".lower()
        + f"{transaction_reference}".lower()
        + f"{amount}".lower()
        + f"{status}".lower()
        + f"{optional1}".lower()
        + f"{optional2}".lower()
        + f"{optional3}".lower()
        + f"{optional4}".lower()
        + f"{optional5}".lower()
        + f"{currency_code}".lower()
        + f"{is_test}".lower()
        + f"{status_message}".lower()
        + f"{private_key}".lower()
    )
    computed = hashlib.sha512(to_hash.encode("utf-8")).hexdigest()
    return computed.lower() == received_hash.lower()