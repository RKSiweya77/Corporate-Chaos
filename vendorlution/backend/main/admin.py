# main/admin.py
from django.contrib import admin
from .models import ProductCategory, Product, VendorProfile
from .models_extended import Shipment, Dispute


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "slug", "created_at")
    search_fields = ("title",)
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "vendor", "price", "stock", "is_active")
    list_filter = ("category", "vendor", "is_active")
    search_fields = ("title", "detail")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "shop_name", "user", "is_active", "rating_avg")
    search_fields = ("shop_name", "description")
    prepopulated_fields = {"slug": ("shop_name",)}


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "method", "status", "tracking_number", "shipped_at", "delivered_at")
    list_filter = ("method", "status")
    search_fields = ("tracking_number", "pargo_code", "carrier_name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "opened_by", "reason", "status", "created_at", "resolved_at")
    list_filter = ("status", "reason")
    search_fields = ("description", "resolution_notes")
    readonly_fields = ("created_at", "updated_at")
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of disputes for audit trail
        return False