from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import Product
from .forms import UploadFileForm
from django.core.files.storage import FileSystemStorage
from django.conf import settings
import datetime
import subprocess
import io
import base64

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
  print("product view called")
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

def render(request,product_name):

  #TODO only render if input has changed - create a new context if it has

  template = loader.get_template("render_result.html")

  horizontal_offset = request.POST.get("horizontal_offset", "0.0")
  vertical_offset = request.POST.get("vertical_offset", "0.0")
  image_height = request.POST.get("image_height", "100.0")
  image_width = request.POST.get("image_width", "100.0")
  scale = request.POST.get("scale", "1.0")
  
  #TODO: error checking and early return to custom error page
  filestr = request.POST.get("texture_input", "")
  file_name = request.POST.get("texture_name", "")
  byte_string = filestr.split(",")[1]
  file = io.BytesIO(base64.urlsafe_b64decode(byte_string))

  fs = FileSystemStorage()
  filename = fs.save(file_name, file)
  file_url = fs.url(filename)

  print("file_url : {}".format(file_url))
  
  print("rendering: {}".format(product_name))

  now = datetime.datetime.now()
  image_suffix = "/renders/render_{}.png".format(str(datetime.datetime.timestamp(now)))
  image_destination = "{}{}".format((settings.MEDIA_ROOT), image_suffix)
  image_suffix_result = "/media/{}".format(image_suffix)
  subprocess.run(["python", "blender_render.py", image_destination, file_url, image_height, image_width, horizontal_offset, vertical_offset, scale])
  
  print("finished rendering")

  context = {
    'product_name': product_name,
    'render_url' : image_suffix_result
  }

  return HttpResponse(template.render(context, request))