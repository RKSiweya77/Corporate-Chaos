from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("categories/all/", views.CategoryAllView.as_view(), name="category-all"),

    # Products
    path("products/", views.ProductListCreateView.as_view(), name="product-list-create"),
    path("products/<int:pk>/", views.ProductDetailView.as_view(), name="product-detail"),
    path("products/new/", views.ProductNewListView.as_view(), name="product-new"),
    path("products/popular/", views.ProductPopularListView.as_view(), name="product-popular"),

    # Vendors
    path("vendors/", views.VendorListView.as_view(), name="vendor-list"),
    path("vendors/featured/", views.VendorFeaturedListView.as_view(), name="vendor-featured"),
    # 🔹 NEW: plain vendors list (for dropdowns)
    path("vendors/all/", views.VendorAllView.as_view(), name="vendor-all"),

    # Ratings
    path("ratings/", views.ProductRatingListCreateView.as_view(), name="rating-list-create"),
]