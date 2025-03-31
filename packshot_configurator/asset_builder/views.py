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
import json

# Create your views here.

#Product thumbnail list
def products( request ):
  """
    Retrieve list of available products to configure
  """
  products = Product.objects.all().values()
  template = loader.get_template('all_products.html')
  context = {
    'products': products,
  }
  return HttpResponse(template.render(context, request))

def product( request, id):
  """
    Retrieve selected product for configuration
  """
  print("product view called")
  product = Product.objects.get(id=id)
  template = loader.get_template("individual_product.html")

  context = {
    'product': product,
    'num_labels' : range(product.num_labels)
  }

  return HttpResponse(template.render(context, request))

def render(request,product_name):
  """
    Pass through scene and configuration information to perform a Blender render on the server side
  """

  #TODO only render if input has changed - create a new context if it has

  print(">>>>>>>>>>>>>> POST ")
  print(request.POST.keys())
  print("-----------------------")
  
  template = loader.get_template("render_result.html")

  #TODO:
  # - retrieve num_labels from request
  num_labels = request.POST.get("num_labels", "0")

  # - create list of dictionaries with label info
  labels = []
  print(num_labels)

  for i in range(int(num_labels)):
    #basic info
    label_info = {
      "horizontal_offset" : request.POST.get("horizontal_offset{}".format(i), "0.0"),
      "vertical_offset" : request.POST.get("vertical_offset{}".format(i), "0.0"),
      "image_height" : request.POST.get("image_height{}".format(i), "100.0"),
      "image_width" : request.POST.get("image_width{}".format(i), "100.0"),
      "scale" : request.POST.get("scale{}".format(i), "1.0")
    }
    #Texture upload
    # get the bytestring representation of the image 
    filestr = request.POST.get("texture_input{}".format(i), "")
    file_name = request.POST.get("texture_name{}".format(i), "")

    if "," in filestr:  
      byte_string = filestr.split(",")[1]
      file = io.BytesIO(base64.urlsafe_b64decode(byte_string))
      # upload the image, storing the resulting URL to pass through
      # to the render
      fs = FileSystemStorage()
      label_info["filename"] = fs.save(file_name, file)
      label_info["file_url"] = fs.url(label_info["filename"])

    labels.append(label_info)

  # - pass through to render
  #TODO: error checking (e.g. missing info) and early return to custom error page
  #-------
  print("rendering: {}".format(product_name))
  print("JSON info going to render: {}".format(json.dumps(labels)))

  now = datetime.datetime.now()
  image_suffix = "/renders/render_{}.png".format(str(datetime.datetime.timestamp(now)))
  image_destination = "{}{}".format((settings.MEDIA_ROOT), image_suffix)
  image_suffix_result = "/media/{}".format(image_suffix)

  #TODO: replace with celery task to avoid blocking the web app
  subprocess.run(["python", "blender_render.py", image_destination, json.dumps(labels)])
  
  print("finished rendering")

  context = {
    'product_name': product_name,
    'render_url' : image_suffix_result
  }

  return HttpResponse(template.render(context, request))