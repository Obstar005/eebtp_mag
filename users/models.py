from django.db import models
from django.contrib.auth.models import AbstractUser
from django_countries.fields import CountryField
from django.utils import timezone
from datetime import timedelta


class Profil(models.Model):
    libelle = models.CharField(max_length=100)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modif = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.libelle


class CustomUser(AbstractUser):
    surname = models.CharField(max_length=100)
    birth_date = models.DateField(null=True, blank=True)
    nationality = CountryField(null=True, blank=True)  
    type = models.CharField(max_length=50, choices=[('Interne', 'Interne'), ('Consultant', 'Consultant')])
    titre = models.CharField(max_length=100)
    poste = models.CharField(max_length=100)
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
