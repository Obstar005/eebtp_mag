# notifications/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

# class NotificationConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.user = self.scope["user"]
#         self.group_name = None  # ✅ Initialisation par défaut

#         if self.user.is_anonymous:
#             await self.close()
#         else:
#             # ✅ On définit le groupe ici
#             self.group_name = f"user_{self.user.id}"
#             await self.channel_layer.group_add(self.group_name, self.channel_name)
#             await self.accept()
#             await self.send(json.dumps({"message": "Connexion OK ✅"}))

#     async def disconnect(self, close_code):
#         # ✅ Vérifie avant de tenter de supprimer du groupe
#         if self.group_name:
#             await self.channel_layer.group_discard(self.group_name, self.channel_name)

#     async def send_notification(self, event):
#         """Reçoit les messages envoyés via group_send"""
#         message = event["message"]
#         await self.send(json.dumps({"message": message}))

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Récupère un identifiant d'utilisateur (si connecté sinon 'guest')
        user = self.scope.get("user")
        user_id = user.id if user and user.is_authenticated else "guest"

        self.group_name = f"user_{user_id}"

        # Rejoint le groupe
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.send(text_data=json.dumps({
            'message': f"Message reçu: {data}"
        }))

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'message': event["message"]
        }))

