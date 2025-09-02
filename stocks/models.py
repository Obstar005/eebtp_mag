from django.db import models

class Produit(models.Model):
    designation = models.CharField(max_length=200, unique=True)
    type = models.CharField(max_length=100, choices=[('materiel', 'Matériel'), ('materiau', 'Matériau')])
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modif = models.DateTimeField(auto_now=True)
    unite = models.CharField(max_length=50, choices=[
        ('litre', 'Litre'),
        ('kg', 'Kilogramme'),
        ('m3', 'Mètre cube'),
        ('unite', 'Unité'),
        ('m', 'Mètre'),
        ('autre', 'Autre')
    ])
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.designation} ({self.unite})"