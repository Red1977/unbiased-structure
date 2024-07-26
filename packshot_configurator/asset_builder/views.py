from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import Product
from .forms import UploadFileForm
from django.core.files.storage import FileSystemStorage

# Create your views here.

#Product thumbnail list
def products( request ):
  products = Product.objects.all().values()
  template = loader.get_template('all_products.html')
  context = {
    'products': products,
  }
  return HttpResponse(template.render(context, request))

def product( request, id):
  product = Product.objects.get(id=id)
  template = loader.get_template("individual_product.html")

  context = {}

  if request.method == 'POST':
    form = UploadFileForm(request.POST, request.FILES)
    if form.is_valid():
      file = request.FILES['file']
      fs = FileSystemStorage()
      filename = fs.save(file.name, file)
      file_url = fs.url(filename)
      context = {
        'product': product,
        'form': form,
        'file_url': file_url
      }
      
  else:
    form = UploadFileForm()

    context = {
      'product': product,
      'form': form
    }

  return HttpResponse(template.render(context, request))