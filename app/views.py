# app/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import HistoriqueAction
from .serializers import HistoriqueActionSerializer
from drf_yasg.utils import swagger_auto_schema

@swagger_auto_schema(
    method='get',
    operation_description="Récupérer l'historique des actions de l'utilisateur connecté, en passant le token de l'utilisateur dans les en-têtes.",
    responses={200: HistoriqueActionSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historique_utilisateur(request):
    user = request.user
    user_id = user.id

    historiques = HistoriqueAction.objects.filter(user_id=user_id).order_by('-date_action')
    serializer = HistoriqueActionSerializer(historiques, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@swagger_auto_schema(
    method='get',
    operation_description="Récupérer l'historique des actions de tous les utilisateurs dans le système.",
    responses={200: HistoriqueActionSerializer(many=True), 404: 'Not Found'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historique_toutes_actions(request):
    historiques = HistoriqueAction.objects.all().order_by('-date_action')
    serializer = HistoriqueActionSerializer(historiques, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)