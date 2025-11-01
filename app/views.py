# app/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import HistoriqueAction
from .serializers import HistoriqueActionSerializer
from drf_yasg.utils import swagger_auto_schema
from app.utils import enregistrer_action
from django.utils import timezone
from datetime import timedelta


@swagger_auto_schema(
    method='get',
    operation_description="Récupérer l'historique des actions de l'utilisateur connecté, en passant le token de l'utilisateur dans les en-têtes." \
    " Optionnellement, filtrer par période ('jour', 'semaine', 'mois', 'total').",
    responses={200: HistoriqueActionSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historique_utilisateur(request, periode=None):
    user = request.user
    user_id = user.id
    now = timezone.now()
    if periode == 'jour':
        start_date = now - timedelta(days=1)
        historiques = HistoriqueAction.objects.filter(user_id=user_id, date_action__gte=start_date).order_by('-date_action')
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
        historiques = HistoriqueAction.objects.filter(user_id=user_id, date_action__gte=start_date).order_by('-date_action')
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
        historiques = HistoriqueAction.objects.filter(user_id=user_id, date_action__gte=start_date).order_by('-date_action')
    else:
        historiques = HistoriqueAction.objects.filter(user_id=user_id).order_by('-date_action')

    # enregistrer_action(user, 'consultation', 'A consulter son historique', f"Liste des historiques.")
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
    # enregistrer_action(request.user, 'consultation', 'A consulté la liste de tous les historiques', f"Liste de tous les historiques.")
    serializer = HistoriqueActionSerializer(historiques, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)