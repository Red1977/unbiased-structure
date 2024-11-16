from django.db import models

# Create your models here.

class Product(models.Model):
    product_name = models.CharField(max_length=255)
    glb_filename = models.CharField(max_length=255)
    blender_scene_path = models.CharField(max_length=255)
    size_ml = models.PositiveIntegerField()
    thumbnail_path = models.CharField(max_length=255, null=True)
    background_image = models.CharField(max_length=255, null=True)
    num_labels = models.PositiveBigIntegerField(default=1)


