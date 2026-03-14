# app/models.py
from django.db import models
from django.utils import timezone
from users.models import CustomUser  # ou adapte selon ton arborescence

class HistoriqueAction(models.Model):
    ACTION_CHOICES = [
        ('creation', 'Création'),
        ('modification', 'Modification'),
        
        ('suppression', 'Suppression'),
        ('validation', 'Validation'),
        ('connexion', 'Connexion'),
        ('autre', 'Autre'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    action_type = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField()
    date_action = models.DateTimeField(default=timezone.now)
    objet_concerne = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.user} - {self.action_type} - {self.date_action.strftime('%d/%m/%Y %H:%M')}"
    
class UserDevice(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    token = models.CharField(max_length=500)
    device_type = models.CharField(max_length=20) # web, android, ios
    created_at = models.DateTimeField(auto_now_add=True)

