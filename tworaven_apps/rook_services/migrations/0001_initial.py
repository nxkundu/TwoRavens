# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-08-07 15:06
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='TestCallCapture',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('app_name', models.TextField(max_length=255)),
                ('outgoing_url', models.URLField(blank=True)),
                ('request', models.TextField(blank=True)),
                ('response', models.TextField(blank=True)),
                ('status_code', models.CharField(blank=True, max_length=50)),
                ('success', models.BooleanField(default=False)),
            ],
            options={
                'ordering': ('-created',),
            },
        ),
    ]