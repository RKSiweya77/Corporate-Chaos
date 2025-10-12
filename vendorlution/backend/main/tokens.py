# main/tokens.py
from django.contrib.auth.models import User
from django.db.models import Q

from rest_framework import permissions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class FlexibleTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Accepts either username OR email in the incoming "username" field.
    We normalize the identifier to the actual username before handing off
    to the base SimpleJWT validator.
    """
    def validate(self, attrs):
        identifier = (attrs.get("username") or "").strip()
        if identifier:
            # Try resolve by username or email (case-insensitive)
            user = (
                User.objects
                .filter(Q(username__iexact=identifier) | Q(email__iexact=identifier))
                .only("username")
                .first()
            )
            if user:
                attrs["username"] = user.username
        return super().validate(attrs)


class FlexibleTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = FlexibleTokenObtainPairSerializer