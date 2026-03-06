from django.db import models
from django.contrib.auth.models import AbstractUser
from django_countries.fields import CountryField
from django.utils import timezone
from datetime import timedelta

class PermissionCustom(models.Model):
    code = models.CharField(max_length=50, unique=True)  
    libelle = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    create_by = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.code

class Profil(models.Model):
    code = models.CharField(max_length=50, unique=True)
    libelle = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modif = models.DateTimeField(auto_now=True)
    permissions = models.ManyToManyField(PermissionCustom, blank=True)

    def __str__(self):
        return self.libelle


class CustomUser(AbstractUser):
    
    birth_date = models.DateField(null=True, blank=True)
    nationality = CountryField(null=True, blank=True)  
    type = models.CharField(max_length=50, choices=[('Interne', 'Interne'), ('Externe', 'Externe')])
    titre = models.CharField(max_length=100, null=True, blank=True)
    poste = models.CharField(max_length=100, null=True, blank=True)
    profil = models.ForeignKey(Profil, on_delete=models.SET_NULL, null=True)
    photo_profil = models.ImageField(upload_to='photos/', null=True, blank=True)
    telephone = models.CharField(max_length=20, unique=True)
    is_active = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modif = models.DateTimeField(auto_now=True)
    first_login = models.BooleanField(default=True)
    projets = models.ManyToManyField('projets.Projet', related_name='users', blank=True)
    is_connected = models.BooleanField(default=False)


    def __str__(self):
        return self.username

# MOdele pour stocker les tokens, invalides
class BlacklistedToken(models.Model):
    token = models.CharField(max_length=500, unique=True)
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.token   

class SMSVerification(models.Model):
    phone_number = models.CharField(max_length=20)
    code = models.CharField(max_length=4)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)
