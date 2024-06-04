from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def asset_model(request):
    return HttpResponse("A model of a bottle")

