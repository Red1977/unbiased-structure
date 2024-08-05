from django.urls import path
from . import views

urlpatterns = [
    path('asset_builder/', views.products, name='products'),
    path('asset_builder/individual_product/<int:id>', views.product, name='product'),
    path('asset_builder/individual_product/render_result/<str:product_name>', views.render, name='render_result')
]