from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import Product

# Create your views here.

#Product thumbnail list
def products( request ):
  products = Product.objects.all().values()
  template = loader.get_template('all_products.html')
  context = {
    'products': products,
  }
  return HttpResponse(template.render(context, request))

