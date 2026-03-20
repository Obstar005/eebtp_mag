from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
from firebase_admin import messaging
from app.models import UserDevice
from .firebase import *
from users.models import CustomUser


def send_notification(user, title, body, type, data=None):

    tokens = list(
        UserDevice.objects.filter(user=user).values_list("token", flat=True)
    )

    print(f"Envoi de notification à l'utilisateur {user.username} avec les tokens: {tokens}")
    # print("TOKENS:", tokens)

    if not tokens:
        print("Aucun token trouvé")
        return

    for token in tokens:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body
            ),
            token=token,
            data=data or {}
        )

        response = messaging.send(message)

        print("RESPONSE:", response)

    Notification.objects.create(
        user=user,
        title=title,
        type=type,
        message=body
    )
# Fonction pour notifier les utilisateurs d'un ou plusieurs concernés devant faire une action sur une demande à chaque étape de son traitement
def notifier_utilisateurs(demande, type_notification):
    projet = demande.magasin.projet

    confirmateurs = CustomUser.objects.filter(profil__code__in=['superadmin', 'admin', 'chef_appro'], is_active=True).distinct()
    #Les approveurs(Qui sont les dt ou les dtx); on doit s'assurer qu'ils sont tous affectés au projet de la demande pour éviter de notifier des chefs de projet qui n'ont rien à voir avec la demande
    approuveurs = CustomUser.objects.filter(profil__code__in=['superadmin', 'admin', 'dtx', 'dt'], projets=projet, is_active=True).distinct()
    validateurs = CustomUser.objects.filter(profil__code__in=['superadmin', 'admin', 'dg', 'dga', 'df'], is_active=True).distinct()
    if type_notification == "emission":
        users = list(confirmateurs) + list(approuveurs) + list(validateurs) #On notifie tous les confirmateurs qui sont des chefs appro et les dt/dtx qui sont les approveurs et les validateurs qui sont des directeurs dans l'entreprise et qui ont accès a tous les projets contrairement aux approuveurs qui sont des chefs de projet et qui n'ont accès qu'aux projets dont ils sont responsables
        title = "Nouvelle Demande Émise dans le système"
        body = f"Une nouvelle a été emise dans le système et est en attente de confirmation !!! \n Veuillez la consulter pour voir les détails."
    elif type_notification == "confirmation":
        users = list(confirmateurs) + list(approuveurs) + list(validateurs) #On notifie tous les confirmateurs qui sont des chefs appro et les dt/dtx qui sont les approveurs et les validateurs qui sont les directeurs dans l'entreprise et qui ont accès a tous les projets contrairement aux approuveurs qui sont des chefs de projet et qui n'ont accès qu'aux projets dont ils sont responsables
        title = "Demande Confirmée"
        body = f"La demande {demande.number} a été confirmée à l'etape de confirmation !!! \n Veuillez la consulter pour voir les détails."
    elif type_notification == "approbation":
        users = [demande.confirme_par] + list(approuveurs) + list(validateurs)
        title = "Demande Approuvée"
        body = f"La demande {demande.number} a été approuvée à l'etape d'approbation !!! \n Veuillez la consulter pour voir les détails."
    elif type_notification == "validation":
        users = list(validateurs)
        title = "EEBTP_MAG"
        body = f"La demande {demande.number} a été validée à l'etape de validation !!! \n Veuillez la consulter pour voir les détails."
    elif type_notification == "rejet_confirmation":
        users = list(confirmateurs) + list(validateurs) #On notifie les confirmateurs qu'ils sachent que la demande a été confirmé et tous les validateurs qui sont des directeurs dans l'entreprise et qui ont accès a tous les projets contrairement aux approuveurs qui sont des chefs de projet et qui n'ont accès qu'aux projets dont ils sont responsables
        title = "Demande Rejetée à l'etape de confirmation"
        body = f"La demande {demande.number} a été rejetée à l'etape de confirmation !!! \n Vous pouvez la consulter pour voir les raisons du rejet si nécessaire."
    elif type_notification == "rejet_approbation":
        users = [demande.confirme_par] + list(validateurs) #On notifie le chef appro en charge de la demande et tous les validateurs qui sont des directeurs dans l'entreprise et qui ont accès a tous les projets contrairement aux approuveurs qui sont des chefs de projet et qui n'ont accès qu'aux projets dont ils sont responsables
        title = "Demande Rejetée à l'etape d'approbation"
        body = f"La demande {demande.number} a été rejetée à l'etape d'approbation !!! \n Vous pouvez la consulter pour voir les raisons du rejet si nécessaire."
    elif type_notification == "rejet_validation":
        users = [demande.confirme_par] + list(approuveurs) +  list(validateurs) #On notifie le chef appro et le dt/dtx en charge de la demande et tous les validateurs qui sont des directeurs dans l'entreprise et qui ont accès a tous les projets contrairement aux approuveurs qui sont des chefs de projet et qui n'ont accès qu'aux projets dont ils sont responsables
        title = "Demande Rejetée à l'etape de validation"
        body = f"La demande {demande.number} a été rejetée à l'etape de validation !!! \n Vous pouvez la consulter pour voir les raisons du rejet si nécessaire."
    else:
        print("Type de notification inconnu")
        return

    for user in users:
        send_notification(user, title, body, 'demande', {"demande_id": str(demande.number)})

#On va creer une fonction pour notifier seulement un magasinier ayant lancée une demande à chqaque etape du traitemment de sa demande.
def notifier_magasinier(demande, type_notification):
    if type_notification == "confirmation":
        user = demande.emis_par
        title = "Demande Confirmée"
        body = f"Votre demande a été confirmée à l'etape de confirmation !!! \n Veuillez la consulter pour voir les détails."
    elif type_notification == "approbation":
        user = demande.emis_par
        title = "Demande Approuvée"
        body = f"Votre demande a été approuvée à l'etape d'approbation !!! \n Veuillez la consulter pour voir les détails."
    elif type_notification == "validation":
        user = demande.emis_par
        title = "Demande Validée"
        body = f"Votre demande a été validée à l'etape de validation !!! \n Veuillez la consulter pour voir les détails."
    elif type_notification == "rejet_confirmation":
        user = demande.emis_par
        title = "Demande Rejetée"
        body = f"Votre demande a été rejetée à l'etape de confirmation !!! \n Veuillez la consulter pour voir les raisons du rejet et la faire rectifier si nécessaire."
    elif type_notification == "rejet_approbation":
        user = demande.emis_par
        title = "Demande Rejetée"
        body = f"Votre demande a été rejetée à l'etape d'approbation !!! \n Veuillez la consulter pour voir les raisons du rejet et la faire rectifier si nécessaire."
    elif type_notification == "rejet_validation":
        user = demande.emis_par
        title = "Demande Rejetée"
        body = f"Votre demande a été rejetée à l'etape de validation !!! \n Veuillez la consulter pour voir les raisons du rejet et la faire rectifier si nécessaire."
    else:
        print("Type de notification inconnu")
        return
    send_notification(user, title, body, "demande", {"demande_id": str(demande.number)})