from django.urls import path
from . import views

urlpatterns = [
    path('asset_builder/', views.products, name='products'),
]