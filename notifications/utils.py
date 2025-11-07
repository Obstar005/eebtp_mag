from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification

# def send_notification(user, title, message):
#     notification = Notification.objects.create(
#         user=user, title=title, message=message
#     )
#     channel_layer = get_channel_layer()
#     async_to_sync(channel_layer.group_send)(
#         f"user_{user.id}",
#         {
#             "type": "send_notification",
#             "content": {
#                 "title": title,
#                 "message": message,
#                 "created_at": str(notification.created_at),
#             },
#         }
#     )
#     return notification

def notifier_utilisateurs(users, titre, message):
    """Envoie une notification à une liste d'utilisateurs."""
    channel_layer = get_channel_layer()

    for user in users:
        # 1️⃣ Créer la notification en base
        Notification.objects.create(
            user=user,
            title=titre,
            message=message
        )

        # 2️⃣ Envoyer la notification en temps réel
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}",
            {
                "type": "send_notification",
                "message": f"{titre}: {message}"
            }
        )

    return True