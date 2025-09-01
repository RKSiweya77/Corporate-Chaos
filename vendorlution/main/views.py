from rest_framework import generics,permissions
from rest_framework import serializers
from . import serializers
from . import models



class VendorList(generics.ListAPIView):
    queryset = models.Vendor.objects.all()
    serializer_class=serializers.VendorSerializer
    permission_classes = [permissions.IsAuthenticated]

