# users/signals.py
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from app.utils import enregistrer_action

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    enregistrer_action(user, 'connexion', f"{user.username} s'est connecté")
