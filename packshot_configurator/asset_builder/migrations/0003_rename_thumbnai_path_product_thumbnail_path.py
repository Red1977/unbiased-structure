# Generated by Django 5.0.6 on 2024-06-09 11:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('asset_builder', '0002_product_thumbnai_path'),
    ]

    operations = [
        migrations.RenameField(
            model_name='product',
            old_name='thumbnai_path',
            new_name='thumbnail_path',
        ),
    ]
