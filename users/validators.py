import re
from django.core.exceptions import ValidationError

#Fonction de vérification du mot de passe voir si c'est costaud
def validate_password_strength(password, user=None):
    # Vérifier contre les infos personnelles de l'utilisateur
    if user:
        personal_info = [user.email, getattr(user, "first_name", ""), getattr(user, "last_name", ""), getattr(user, "telephone", "")]
        for info in personal_info:
            if info and info.lower() in password.lower():
                raise ValidationError("Le mot de passe ne doit pas contenir vos informations personnelles.")
    # Vérifier longueur minimale
    if len(password) < 8:
        raise ValidationError("Le mot de passe doit contenir au moins 8 caractères.")

    # Vérifier présence d'une majuscule
    if not re.search(r'[A-Z]', password):
        raise ValidationError("Le mot de passe doit contenir au moins une lettre majuscule.")

    # # Vérifier présence d'une lettre
    # if not re.search(r'[a-z]', password):
    #     raise ValidationError("Le mot de passe doit contenir au moins une lettre minuscule.")

    # Vérifier présence d'un chiffre
    if not re.search(r'[0-9]', password):
        raise ValidationError("Le mot de passe doit contenir au moins un chiffre.")