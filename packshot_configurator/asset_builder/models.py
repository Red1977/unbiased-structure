from django.db import models

# Create your models here.

class Product(models.Model):
    product_name = models.CharField(max_length=255)
    glb_filename = models.CharField(max_length=255)
    blender_scene_path = models.CharField(max_length=255)
    size_ml = models.PositiveIntegerField()
    thumbnail_path = models.CharField(max_length=255, null=True)
    background_image = models.CharField(max_length=255, null=True)


"""
"https://red1977.github.io/urban-octo-robot/"

server+"/assets/", "pump_bottle_for_babylon_rear_proj_v03.glb"

docs/assets/pump_bottle_render_layers_beauty.png
"""