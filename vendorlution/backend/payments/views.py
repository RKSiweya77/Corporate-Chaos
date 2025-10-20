# payments/views.py
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from wallet.providers.ozow import create_payment_request, verify_webhook_signature

# Replace these with your actual Order/Cart logic
from orders.models import Order  # adjust import
from cart.utils import get_user_cart  # adjust import

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_ozow_payment(request):
    user = request.user
    cart = get_user_cart(user)  # your util to read current cart
    if not cart or not cart.items.exists():
        return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

    # Create or reuse a pending order
    order = Order.objects.create_from_cart(cart, user=user)  # implement if needed
    amount = float(order.total)
    tx_ref = order.reference  # unique
    bank_ref = order.bank_reference or order.reference

    try:
        result = create_payment_request(
            api_base=settings.OZOW_API_BASE,
            api_key=settings.OZOW_API_KEY,
            site_code=settings.OZOW_SITE_CODE,
            private_key=settings.OZOW_PRIVATE_KEY,
            amount=amount,
            transaction_reference=tx_ref,
            bank_reference=bank_ref,
            success_url=settings.OZOW_SUCCESS_URL,
            cancel_url=settings.OZOW_CANCEL_URL,
            error_url=settings.OZOW_ERROR_URL,
            notify_url=settings.OZOW_NOTIFY_URL,
            is_test=settings.OZOW_IS_TEST,
            country_code="ZA",
            currency_code="ZAR",
            customer=str(user.id),
        )
    except Exception as e:
        return Response({"detail": f"Ozow error: {e}"}, status=status.HTTP_400_BAD_REQUEST)

    order.payment_provider = "ozow"
    order.payment_request_id = result["paymentRequestId"]
    order.status = "awaiting_payment"
    order.save(update_fields=["payment_provider", "payment_request_id", "status"])

    return Response({"redirect_url": result["url"], "payment_request_id": result["paymentRequestId"]})


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def ozow_notify(request):
    data = request.data
    if not verify_webhook_signature(data, settings.OZOW_PRIVATE_KEY):
        return Response({"detail": "invalid signature"}, status=400)

    tx_ref = data.get("TransactionReference") or data.get("transactionReference")
    status_text = (data.get("Status") or data.get("status") or "").lower()
    status_message = data.get("StatusMessage") or data.get("statusMessage") or ""

    try:
        order = Order.objects.get(reference=tx_ref)
    except Order.DoesNotExist:
        return Response({"detail": "order not found"}, status=404)

    if status_text in ("complete", "completed", "success", "paid"):
        order.status = "paid"
        order.mark_paid()  # if you have extra logic; else remove
    elif status_text in ("cancelled", "canceled", "failed", "error"):
        order.status = "payment_failed"
        order.payment_error = status_message[:250]
    else:
        order.status = "payment_pending"

    order.save()
    return Response({"ok": True})


@api_view(["GET"])
@permission_classes([AllowAny])
def ozow_success(request):
    return Response({"status": "success", "message": "We’re confirming your payment."})


@api_view(["GET"])
@permission_classes([AllowAny])
def ozow_cancel(request):
    return Response({"status": "cancel", "message": "Payment cancelled."})


@api_view(["GET"])
@permission_classes([AllowAny])
def ozow_error(request):
    return Response({"status": "error", "message": "Payment error."})