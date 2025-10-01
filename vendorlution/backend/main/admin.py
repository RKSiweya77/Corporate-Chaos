from django.contrib import admin
from .models import ProductCategory, Product, VendorProfile

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

