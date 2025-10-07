from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .utils import send_notification

# Create your views here.
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_notification(request):
    send_notification(request.user, "Test depuis Django", "La notification fonctionne 🎉")
    return Response({"status": "Notification envoyée"})