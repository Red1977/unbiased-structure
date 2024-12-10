from django.db import models
from django.contrib.auth.models import AbstractBaseUser

# Create your models here.

class Person(AbstractBaseUser):
    """
        Person configuring products & settings to produce scenes
    """
    name = models.CharField(max_length=255)
    email_address = models.CharField(max_length=255, unique=True)
    USERNAME_FIELD = "email_address"

#--- Things which live in a scene (the catalogue )

class Tag(models.Model):
    """
        Means of searching catalogues and galleries
    """
    name = models.CharField(max_length=255)

class Product(models.Model):
    """
    e.g. serum bottle, box, pouch
    """
    product_name = models.CharField(max_length=255)
    glb_filename = models.CharField(max_length=255)
    blender_scene_path = models.CharField(max_length=255)
    thumbnail_path = models.CharField(max_length=255, null=True)
    background_image = models.CharField(max_length=255, null=True)
    num_labels = models.PositiveBigIntegerField(default=1)

class Prop(models.Model):
    """
    e.g. flowers, fruit, food
    """

class Setting(models.Model):
    """
    e.g. kitchen worktop, garden party table
    """

#--- The people/ entities producing things which go into a scene

class Artist(models.Model):
    """
        Blender Person
    """

class Studio(models.Model):
    """
        Multiple or single artist
    """

class Portfolio(models.Model):
    """
        which props, settings and products the studio has produced
    """

#--- The people/ entities configuring and using the scenes
class Agency(models.Model):
    """
        Entity containing people & owners of eventual output
    """
    name  = models.CharField(max_length=255)


class Brand(models.Model):
    """
        Grouping of products (but not necessarily scenes - they can contain multiple brand products)
    """
    name = models.CharField(max_length=255)
    people = models.ManyToManyField(Person)

class ProductConfiguration(models.Model):
    """
        Product with labels and settings saved
    """
    name = models.CharField(max_length=255)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True)
    creator = models.ForeignKey(Person, on_delete=models.SET_NULL, null=True)
    tags = models.ManyToManyField(Tag)

class SceneConfiguration(models.Model):
    """
        Setting with configured products and props arranged
    """

#TODO: This might not be a model in itself - rather a view on rendered 
#scene configurations
class Gallery(models.Model):
    """
        Belongs to agency
    """




