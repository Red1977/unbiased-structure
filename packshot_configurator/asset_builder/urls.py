from django.urls import path
from . import views

urlpatterns = [
    path('asset_builder/', views.asset_model, name='asset_model'),
]