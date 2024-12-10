from django.contrib import admin
from .models import Product
from .models import Person

# Register your models here.
admin.site.register(Product)
admin.site.register(Person)
