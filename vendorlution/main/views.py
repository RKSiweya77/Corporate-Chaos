from rest_framework import generics,permissions
from rest_framework import serializers
from . import serializers
from . import models

class VendorList(generics.ListCreateAPIView):
    queryset = models.Vendor.objects.all()
    serializer_class=serializers.VendorSerializer

class VendorDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Vendor.objects.all()
    serializer_class=serializers.VendorDetailSerializer

class ProductList(generics.ListCreateAPIView):
    queryset = models.Product.objects.all()
    serializer_class=serializers.ProductListSerializer

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Product.objects.all()
    serializer_class=serializers.ProductDetailSerializer

#Customers
class CustomerList(generics.ListCreateAPIView):
    queryset = models.Customer.objects.all()
    serializer_class=serializers.CustomerSerializer

class CustomerDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Customer.objects.all()
    serializer_class=serializers.CustomerDetailSerializer

#Orders
class OrderList(generics.ListCreateAPIView):
    queryset = models.Order.objects.all()
    serializer_class=serializers.OrderSerializer

class OrderDetail(generics.ListAPIView):
    queryset = models.OrderItems.objects.all()
    serializer_class=serializers.OrderDetailSerializer