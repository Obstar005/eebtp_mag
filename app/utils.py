# app/utils.py
from .models import HistoriqueAction

def enregistrer_action(user, action_type, description, objet=None):
    HistoriqueAction.objects.create(
        user=user,
        action_type=action_type,
        description=description,
        objet_concerne=objet
    )

def has_permission(user, code):
    return user.profil.permissions.filter(code=code).exists()