# Generated by Django 5.0.6 on 2024-06-12 08:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asset_builder', '0003_rename_thumbnai_path_product_thumbnail_path'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='product_name',
            field=models.CharField(default=' ', max_length=255),
            preserve_default=False,
        ),
    ]
