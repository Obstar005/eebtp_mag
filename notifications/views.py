from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from notifications.models import Notification
from .utils import notifier_utilisateurs, send_notification
from .serializers import NotificationSerializer
from drf_yasg.utils import swagger_auto_schema

# Create your views here.
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def test_notification(request):

    user = request.user

    send_notification(
        user,
        "Test système",
        "Le système de notification fonctionne"
    )

    return Response({"message": "notification envoyée"})

#Liste des notifications pour un utilisateur donné
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications_by_user(request):
    user = request.user
    notifications = Notification.objects.filter(user=user).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

#Rendre une notification comme lue
@swagger_auto_schema(
    method='post',
    operation_description="Marquer une notification comme lue pour l'utilisateur connecté.",
    responses={
        200: "Notification marquée comme lue",
        404: "Notification non trouvée ou n'appartenant pas à l'utilisateur."
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, pk):
    user = request.user
    try:
        notification = Notification.objects.get(pk=pk, user=user)
    except Notification.DoesNotExist:
        return Response({"error": "Notification non trouvée"}, status=404)

    notification.is_read = True
    notification.save()

    return Response({"message": "Notification marquée comme lue"})

#Détail d'une notificaiton
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer les détails d'une notification spécifique pour l'utilisateur connecté.",
    responses={
        200: NotificationSerializer(),
        404: "Notification non trouvée ou n'appartenant pas à l'utilisateur."
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_detail(request, pk):
    user = request.user
    try:
        notification = Notification.objects.get(pk=pk, user=user)
    except Notification.DoesNotExist:
        return Response({"error": "Notification non trouvée"}, status=404)

    serializer = NotificationSerializer(notification)
    return Response(serializer.data)