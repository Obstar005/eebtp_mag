from django.db import models
from django.conf import settings
from django_countries.fields import CountryField
from users.models import CustomUser


class Projet(models.Model):
    nom = models.CharField(max_length=255)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, 
                                related_name="createur_projet", null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    date_debut = models.DateField()
    date_fin = models.DateField(blank=True, null=True)
    pays = CountryField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    # Association des utilisateurs
    comptes = models.ManyToManyField(CustomUser, related_name="comptes_associes", blank=True)

    def __str__(self):
        return self.nom

# Model to store photos related to a project
class ProjetPhoto(models.Model):
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="projets/photos/")
    date_upload = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Photo de {self.projet.nom}"
    
#Modèle magasain
class Magasin(models.Model):
    nom = models.CharField(max_length=255)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, related_name="magasins_crees")
    adresse = models.CharField(max_length=255, blank=True, null=True)
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, 
                               related_name="magasin_associé", blank=True, null=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, 
                                related_name="createur_magasin", null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.nom