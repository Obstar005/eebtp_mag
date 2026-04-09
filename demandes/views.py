from datetime import datetime
from django.shortcuts import render
# demandes/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Demande
from .serializers import DemandeSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db import models
from django.db.models import Max
from app.utils import enregistrer_action
from django.utils import timezone
from datetime import timedelta
from users.models import CustomUser
from notifications.utils import send_notification, notifier_magasinier, notifier_utilisateurs
from mouvements.models import Entree, Sortie
from app.utils import has_permission
from demandes.utils import calculer_duree_traitement, calculer_cout_total

#Détail d'une demande
@swagger_auto_schema(method='get',
                        operation_description="Récupérer les détails d'une demande spécifique",
                        responses={200: DemandeSerializer, 404: 'Not Found'})
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detail_demande(request, id):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)

    try:
        demande = Demande.objects.get(pk=id)
    except Demande.DoesNotExist:
        return Response({'error': 'Demande non trouvée'}, status=status.HTTP_404_NOT_FOUND)

    serializer = DemandeSerializer(demande)
    return Response(serializer.data)

#Vue pour émettre une demande par un magasinier
@swagger_auto_schema(method='post',
                        operation_description="Émettre une nouvelle demande de stock (par un magasinier) sur le mobile",
                        request_body=DemandeSerializer)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def emettre_demande(request):
    user = request.user
    if not has_permission(user, 'demande.create'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    #Générer le numéro de la demande
    today = datetime.now().strftime("%y%m-%d")  # Format YYMMDD
    last_demande = Demande.objects.filter(number__startswith=today).aggregate(Max('number'))
    last_demande_num = last_demande['number__max']

    if last_demande_num:
        last_number = int(last_demande_num.split('-')[-1])  # Récupère le dernier numéro du jour
        new_demande_number = f"{today}-{last_number + 1:04d}"  # Incrémente
    else:
        new_demande_number = f"{today}-0001"  # Première demande du jour


    serializer = DemandeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(
            number=new_demande_number,
            statut='Emise',
            emis_par=user,
            date_emission=timezone.now()
        )
        enregistrer_action(user, 'creation', 'A créé une nouvelle demande', f"Demande #{new_demande_number}")
        #Envoyer une notif aux utilisateurs en charge des traitements sur les demandes de cette demande
        new_demande = serializer.instance
        notifier_utilisateurs(new_demande, "emission")

        return Response({'message': 'Demande émise avec succès'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#Vue pour lister les demandes émises par un magasinier
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes émises par le magasinier connecté")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_emises(request):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
   
    demandes = Demande.objects.filter(statut='Emise').order_by('-date_creation')

    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Vue pour confirmer une demande par un chef appro ou un supérieur étant autorisé et een mettant le commentaire dans le body de la requete, le commentaire est facultatif et peut être laissé vide, mais il est recommandé d'ajouter un commentaire pour expliquer la raison de la confirmation ou du rejet de la demande.
@swagger_auto_schema(method='post',
                        operation_description="Confirmer une demande (par les chefs appro ou un supérieur autorisé) en ajoutant un commentaire facultatif pour expliquer la raison de la confirmation",
                        request_body=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'commentaire_confirmation': openapi.Schema(type=openapi.TYPE_STRING, description='Commentaire de confirmation (facultatif)')
                            }
                        ))
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmer_demande(request, id):
    user = request.user
    commentaire_confirmation = request.data.get('commentaire_confirmation', '')

    if not has_permission(user, 'demande.confirm'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)

    try:
        demande = Demande.objects.get(id=id)
    except Demande.DoesNotExist:
        return Response({'error': 'Demande non trouvée.'}, status=status.HTTP_404_NOT_FOUND)

    if demande.statut != 'Emise' and demande.statut != 'Rejetée':
        return Response({'error': 'Seules les demandes émises peuvent être confirmées.'}, status=status.HTTP_400_BAD_REQUEST)

    demande.statut = 'Confirmée'
    demande.confirme_par = user
    demande.commentaire_confirmation = commentaire_confirmation
    demande.date_confirmation = timezone.now()
    demande.save()
    #Enregistrer l'action de confirmation dans l'historique des actions de l'utilisateur
    enregistrer_action(user, 'modification', 'A confirmé une demande', f"Demande #{demande.number}")
    #Envoyer une notif aux utilisateurs en charge des traitements sur les demandes de ce Demande
    notifier_utilisateurs(demande, "confirmation")
    #Envoyer une notif au magasinier qui a émis la demande pour lui notifier que sa demande a été confirmée
    notifier_magasinier(demande, "confirmation")
    return Response({'message': 'Demande confirmée avec succès'}, status=status.HTTP_200_OK)

#Rejeter une demande de confirmation:
@swagger_auto_schema(method='post',
                        operation_description="Rejeter une demande de confirmation (par le chef approvisionnement ou un supérieur autorisé)",
                        request_body=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'commentaire_confirmation': openapi.Schema(type=openapi.TYPE_STRING, description='Commentaire de rejet de confirmation (facultatif)')
                            }
                        ))
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rejeter_demande_confirmation(request, id):
    user = request.user
    commentaire_confirmation = request.data.get('commentaire_confirmation', '')
    #COntreole d'accès
    if not has_permission(user, 'demande.rejet'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    #Verifier champ commentaire de rejet de confirmation
    if not commentaire_confirmation:
        return Response({'error': 'Le motif du rejet est requis pour rejeter une demande de confirmation.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        demande = Demande.objects.get(pk=id)
    except Demande.DoesNotExist:
        return Response({'error': 'Demande non trouvée'}, status=status.HTTP_404_NOT_FOUND)
    #Controles statuts
    # if demande.statut == 'Emise':
    #     return Response({'error': f'Seules les demandes émises peuvent être rejetées à ce niveau. Statut actuel: {demande.statut}'}, status=status.HTTP_400_BAD_REQUEST)
    if demande.statut == 'Approuvée':
        return Response({'error': f'La demande a déjà été approuvée et ne peut plus être rejetée à ce niveau. Statut actuel: {demande.statut}'}, status=status.HTTP_400_BAD_REQUEST)    
    if demande.statut == 'Validée':
        return Response({'error': 'La demande a déjà été validée et ne peut plus être rejetée.'}, status=status.HTTP_400_BAD_REQUEST)
    if demande.statut == 'Rejetée':
        return Response({'error': 'La demande a déjà été rejetée.'}, status=status.HTTP_400_BAD_REQUEST)

    demande.statut = 'Rejetée'
    demande.confirme_par = user
    demande.commentaire_confirmation = commentaire_confirmation
    demande.date_confirmation = timezone.now()
    demande.save()
    enregistrer_action(user, 'modification', 'A rejeté une demande de confirmation', f"Demande #{demande.number}")
    #Envoyer une notif aux utilisateurs en charge des traitements sur les demandes de ce Demande
    notifier_utilisateurs(demande, "rejet_confirmation")
    #ENvoyer une notif au magasinier qui a émis la demande pour lui notifier que sa demande a été rejetée et lui donner la raison du rejet si le commentaire de rejet est fourni
    notifier_magasinier(demande, "rejet_confirmation")
    return Response({'message': 'Demande rejetée avec succès'}, status=status.HTTP_200_OK)

#Vue pour la mise à jour d'une demande apres rejet
@swagger_auto_schema(
    method='put',
    operation_description="Cette API permet de corriger une demande après rejet.",
    request_body=DemandeSerializer,
    responses={
        200: openapi.Response("Demande modifiée avec succès", DemandeSerializer),
        404: "Demande non trouvée",
        400: "Données invalides"
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_demande(request, pk):
    try:
        demande = Demande.objects.get(pk=pk)
    except Demande.DoesNotExist:
        return Response({'error': 'Demande introuvable'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data.copy()

    serializer = DemandeSerializer(demande, data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)    
    enregistrer_action(request.user, 'modification', 'A modifié un demande.', f"Demande #{demande.id}")

    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Liste des demandes confirmées
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes confirmées")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_confirmees(request):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    demandes = Demande.objects.filter(statut='Confirmée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Vue pour approuver une demande par le directeur technique ou par le directeur des travaux ou un supérieur autorisé
@swagger_auto_schema(method='post',
                        operation_description="Approuver une demande (par les DT, c-a-d directeur technique(dt) ou par le directeur des travaux(dtx) ou un supérieur autorisé)",
                        request_body=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'commentaire_approbation': openapi.Schema(type=openapi.TYPE_STRING, description='Commentaire d\'approbation (facultatif)'),
                                'is_quantity_reduced_by_approb': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Indique si la quantité a été réduite lors de l\'approbation (facultatif, par défaut false)'),
                                'quantite_approv': openapi.Schema(type=openapi.TYPE_INTEGER, description='Quantité approuvée (facultatif, si différente de la quantité demandée)'),
                            }
                        ))
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approuver_demande(request, id):
    user = request.user
    commentaire_approbation = request.data.get('commentaire_approbation', '')
    quantite_approv = request.data.get('quantite_approv', None)
    is_quantity_reduced_by_approb = request.data.get('is_quantity_reduced_by_approb', False)  # Un champ pour indiquer si la quantité a été réduite lors de l'approbation

    if not has_permission(user, 'demande.approv'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        demande = Demande.objects.get(pk=id)
    except Demande.DoesNotExist:
        return Response({'error': 'Demande non trouvée'}, status=status.HTTP_404_NOT_FOUND)
    #Controles de statuts mais une demande rejete peut etre corriger et relancer':
    if not demande.statut == 'Confirmée' and not demande.statut == 'Rejetée':
        return Response({'error': f'La demande n\'a pas encore été confirmée statut actuel: {demande.statut}.'}, status=status.HTTP_400_BAD_REQUEST)
    if is_quantity_reduced_by_approb == False:  # Par défaut, on considère que la quantité n'a pas été réduite si le champ n'est pas fourni
        quantite_approv = None  # Si la quantité approuvée n'est pas fournie, on la considérera comme égale à la quantité demandée
    #S'assurer que la quantité approuvée ne dépasse pas la quantité demandée
    if quantite_approv is not None and quantite_approv > demande.quantite_dem:
        return Response({'error': 'La quantité approuvée ne peut pas être supérieure à la quantité demandée.'}, status=status.HTTP_400_BAD_REQUEST)
    demande.statut = 'Approuvée'
    demande.approve_par = user
    demande.commentaire_approbation = commentaire_approbation
    demande.is_quantity_reduced_by_approb = is_quantity_reduced_by_approb  # Enregistrer si la quantité a été réduite lors de l'approbation
    demande.quantite_approuv = quantite_approv if quantite_approv is not None else demande.quantite_dem  # Si la quantité approuvée est fournie, l'utiliser, sinon garder la quantité initiale
    demande.date_approbation = timezone.now()
    demande.save()
    enregistrer_action(user, 'modification', 'A approuvé une demande', f"Demande #{demande.number}")
    #Envoyer une notif aux confirmateurs
    notifier_utilisateurs(demande, "approbation")
    #Envoyer une notif au magasinier qui a émis la demande pour lui notifier que sa demande a été approuvée
    notifier_magasinier(demande, "approbation")
    

    return Response({'message': 'Demande approuvée avec succès'}, status=status.HTTP_200_OK)

#Rejeter une demande d'approbation:
@swagger_auto_schema(method='post',
                        operation_description="Rejeter une demande d'approbation (par les DT, c-a-d directeur technique(dt) ou par le directeur des travaux(dtx) ou un supérieur autorisé)",
                        request_body=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'commentaire_approbation': openapi.Schema(type=openapi.TYPE_STRING, description='Commentaire de rejet d\'approbation (facultatif)')
                            }
                        ))
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rejeter_demande_approbation(request, id):
    user = request.user
    commentaire_approbation = request.data.get('commentaire_approbation', '')
    #Controle d'accès
    if not has_permission(user, 'demande.rejet'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    if not commentaire_approbation:
        return Response({'error': 'Le motif du rejet est requis pour rejeter une demande d\'approbation.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        demande = Demande.objects.get(pk=id)
    except Demande.DoesNotExist:
        return Response({'error': 'Demande non trouvée'}, status=status.HTTP_404_NOT_FOUND)
    if demande.statut == 'Emise':
        return Response({'error': f'Vous ne pouvez pas rejeter cette demande, elle n\'a pas encore été confirmée. Statut actuel: {demande.statut}'}, status=status.HTTP_400_BAD_REQUEST)
    if demande.statut == 'Approuvée':
        return Response({'error': f'La demande a déjà été approuvée et ne peut plus être rejetée a votre niveau. Statut actuel: {demande.statut}'}, status=status.HTTP_400_BAD_REQUEST)
    if demande.statut == 'Validée':
        return Response({'error': 'La demande a déjà été validée et ne peut plus être rejetée.'}, status=status.HTTP_400_BAD_REQUEST)

    demande.statut = 'Rejetée'
    demande.confirme_par = user
    demande.commentaire_confirmation = commentaire_approbation
    demande.date_confirmation = timezone.now()
    demande.save()
    enregistrer_action(user, 'modification', 'A rejeté une demande d\'approbation', f"Demande #{demande.number}")
    #ENvoyer une notif au magasinier qui a émis la demande pour lui notifier que sa demande a été rejetée et lui donner la raison du rejet si le commentaire de rejet est fourni
    notifier_magasinier(demande, "rejet_approbation")
    notifier_utilisateurs(demande, "rejet_approbation")
    return Response({'message': 'Demande d\'approbation rejetée avec succès'}, status=status.HTTP_200_OK)


#Liste des demandes approuvées
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes approuvées")
@api_view(['GET'])
@permission_classes([IsAuthenticated])  
def liste_demandes_approuvees(request):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    demandes = Demande.objects.filter(statut='Approuvée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Vue pour valider une demande par le directeur général adjoint ou un supérieur autorisé
@swagger_auto_schema(method='post',
                        operation_description="Valider une demande qui se fait par le DG ou le DGA, ou le Directeur Financier (DF))",
                        request_body=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'commentaire_validation': openapi.Schema(type=openapi.TYPE_STRING, description='Commentaire de validation (facultatif)'),
                                'is_quantity_reduced_by_validation': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Indique si la quantité a été réduite lors de la validation (facultatif, par défaut false)'),
                                'quantity_valid': openapi.Schema(type=openapi.TYPE_INTEGER, description='Quantité validée (facultatif, si différente de la quantité demandée)'),
                            }
                        ))
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def valider_demande(request, id):
    user = request.user
    commentaire_validation = request.data.get('commentaire_validation', '')
    quantity_valid = request.data.get('quantity_valid', None)
    is_quantity_reduced_by_validation = request.data.get('is_quantity_reduced_by_validation', False)  # Un champ pour indiquer si la quantité a été réduite lors de la validation

    if not has_permission(user, 'demande.valid'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    if is_quantity_reduced_by_validation == False:
        quantity_valid = None  # Si la quantité validée n'est pas fournie, on la considérera comme égale à la quantité approuvée ou à la quantité demandée si elle n'a pas été réduite lors de l'approbation
    if quantity_valid is not None and quantity_valid > Demande.objects.get(pk=id).quantite_dem:
        return Response({'error': 'La quantité validée ne peut pas être supérieure à la quantité demandée.'}, status=status.HTTP_400_BAD_REQUEST)
    if quantity_valid is not None and quantity_valid > Demande.objects.get(pk=id).quantite_approuv:
        return Response({'error': 'La quantité validée ne peut pas être supérieure à la quantité approuvée.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        demande = Demande.objects.get(pk=id)
    except Demande.DoesNotExist:
        return Response({'error': 'Demande non trouvée'}, status=status.HTTP_404_NOT_FOUND)
    #Controles statuts mais une demande rejetée peut etre validée après correction
    if not demande.statut == 'Approuvée' and not demande.statut == 'Rejetée':
        return Response({'error': f'La demande n\'a pas encore ou a deja été approuvée statut actuel: {demande.statut}.'}, status=status.HTTP_400_BAD_REQUEST)

    demande.statut = 'Validée'
    demande.valide_par = user
    demande.is_quantity_reduced_by_valid = is_quantity_reduced_by_validation  # Enregistrer si la quantité a été réduite lors de la validation
    demande.quantite_valid = quantity_valid if quantity_valid is not None else (demande.quantite_approuv if demande.is_quantity_reduced_by_approb else demande.quantite_dem)  # Si la quantité validée est fournie, l'utiliser, sinon utiliser la quantité approuvée si elle a été réduite, sinon garder la quantité initiale
    demande.commentaire_validation = commentaire_validation
    demande.date_validation = timezone.now()
    cout_total = calculer_cout_total(demande)
    demande.cout_total_approx = cout_total
    duree_total = calculer_duree_traitement(demande)
    demande.duree_traitement = duree_total
    demande.save()
    enregistrer_action(user, 'modification', 'A validé une demande', f"Demande #{demande.number}")
    #Envoyer une notif aux confirmateurs et aux approuveurs
    notifier_utilisateurs(demande, "validation")
    #Envoyer une notif au magasinier qui a émis la demande pour lui notifier que sa demande a été validée
    notifier_magasinier(demande, "validation")

    return Response({'message': 'Demande validée avec succès'}, status=status.HTTP_200_OK)

#Pour rejeter une demande validation
@swagger_auto_schema(method='post',
                        operation_description="Rejeter une demande de validation (par les DG et DGA et DF, un supérieur autorisé)",
                        request_body=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'commentaire_validation': openapi.Schema(type=openapi.TYPE_STRING, description='Commentaire de rejet de validation (facultatif)')
                            }
                        ))
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rejeter_demande_validation(request, id):
    user = request.user
    commentaire_validation = request.data.get('commentaire_validation', '')
    #Controle d'accès
    if not has_permission(user, 'demande.rejet'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    #Verifier champ commentaire de rejet de validation
    if not commentaire_validation:
        return Response({'error': 'Le motif du rejet est requis pour rejeter une demande de validation.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        demande = Demande.objects.get(pk=id)
    except Demande.DoesNotExist:
        return Response({'error': 'Demande non trouvée'}, status=status.HTTP_404_NOT_FOUND)
    if not demande.statut == 'Approuvée':
        return Response({'error': f'Seules les demandes approuvées peuvent être rejetées à ce niveau. Statut actuel: {demande.statut}'}, status=status.HTTP_400_BAD_REQUEST)
    if demande.statut == 'Rejetée':
        return Response({'error': 'La demande a déjà été rejetée.'}, status=status.HTTP_400_BAD_REQUEST)

    demande.statut = 'Rejetée'
    demande.valide_par = user
    demande.commentaire_validation = commentaire_validation
    demande.date_validation = timezone.now()
    demande.save()
    enregistrer_action(user, 'modification', 'A rejeté une demande de validation', f"Demande #{demande.number}")
    #ENvoyer une notif au magasinier qui a émis la demande pour lui notifier que sa demande a été rejetée et lui donner la raison du rejet si le commentaire de rejet est fourni
    notifier_magasinier(demande, "rejet_validation")
    #Envoyer une notif aux confirmateurs et aux approuveurs pour les informer que la demande a été rejetée à l'étape de validation
    notifier_utilisateurs(demande, "rejet_validation")
    
    return Response({'message': 'Demande de validation rejetée avec succès'}, status=status.HTTP_200_OK)

#Liste des demandes validées
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes validées")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_validees(request):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    demandes = Demande.objects.filter(statut='Validée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste des demandes validées par un magasinier
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes validées pour un magasinier précisement")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_validees_magasinier(request):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    demandes = Demande.objects.filter(statut='Validée', emis_par=user).order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste des demandes validées filtrer par periode
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes validées selon une période: jour, semaine, mois, total")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_validees_filtrer(request, periode):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    now = timezone.now()
    if periode == 'jour':
        start_date = now - timedelta(days=1)
        demandes = Demande.objects.filter(date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
        demandes = Demande.objects.filter(date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
        demandes = Demande.objects.filter(date_creation__gte=start_date).order_by('-date_creation')
    else:
        demandes = Demande.objects.filter(statut='Validée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)


#Liste des demandes rejetées
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes rejetées")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_rejetees(request):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    demandes = Demande.objects.filter(statut='Rejetée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste des demandes rejetées selon une période mois, semaine, jour, total
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes rejetées selon une période: jour, semaine, mois, total")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_rejetees_filtrer(request, periode):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    now = timezone.now()
    if periode == 'jour':
        start_date = now - timedelta(days=1)
        demandes = Demande.objects.filter(date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
        demandes = Demande.objects.filter(date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
        demandes = Demande.objects.filter(date_creation__gte=start_date).order_by('-date_creation')
    else:
        demandes = Demande.objects.filter(statut='Rejetée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste de toutes les demandes
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste de toutes les demandes")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_toutes_les_demandes(request):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    demandes = Demande.objects.all().order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste de toutes les demandes
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste de toutes les demandes faites par un magasinier")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_toutes_les_demandes_magasinier(request):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    demandes = Demande.objects.filter(emis_par=user).order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste de toutes les demandes avec filtre par période
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste de toutes les demandes selon une période: jour, semaine, mois, total")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_toutes_les_demandes_filtrer(request, periode):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    now = timezone.now()
    if periode == 'jour':
        start_date = now - timedelta(days=1)
        demandes = Demande.objects.filter(date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
        demandes = Demande.objects.filter(date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
        demandes = Demande.objects.filter(date_creation__gte=start_date).order_by('-date_creation')
    else:
        demandes = Demande.objects.all().order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste des demandes livrées
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes qui ont été livrées")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_livrees(request):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    demandes = Demande.objects.filter(statut='Livrée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste des demandes livrées avec filtre par période
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes qui ont été livrées")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_livrees_filtrer(request, periode):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    now = timezone.now()
    if periode == 'jour':
        start_date = now - timedelta(days=1)
        demandes = Demande.objects.filter(date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
        demandes = Demande.objects.filter(date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
        demandes = Demande.objects.filter(date_creation__gte=start_date).order_by('-date_creation')
    else:
        demandes = Demande.objects.filter(statut='Livrée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste des demandes en attente de validation (c-a-d soit approuvées, soit confirmées, soit émises)
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes en attente de validation "
                        "(c-a-d soit soit émises, approuvées, soit confirmées)")
@api_view(['GET'])  
@permission_classes([IsAuthenticated])
def liste_demandes_en_attente_validation(request):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    demandes = Demande.objects.filter(statut__in=['Emise', 'Confirmée', 'Approuvée']).order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste des demandes en attente de validation (c-a-d soit approuvées, soit confirmées, soit émises) avec filtre par période
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes en attente de validation "
                        "(c-a-d soit soit émises, approuvées, soit confirmées) selon une période: jour, semaine, mois, total")
@api_view(['GET'])  
@permission_classes([IsAuthenticated])
def liste_demandes_en_attente_validation_filtrer(request, periode):
    user = request.user
    if not has_permission(user, 'demande.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    now = timezone.now()
    if periode == 'jour':
        start_date = now - timedelta(days=1)
        demandes = Demande.objects.filter(statut__in=['Emise', 'Confirmée', 'Approuvée'], date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
        demandes = Demande.objects.filter(statut__in=['Emise', 'Confirmée', 'Approuvée'], date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
        demandes = Demande.objects.filter(statut__in=['Emise', 'Confirmée', 'Approuvée'], date_creation__gte=start_date).order_by('-date_creation')
    else:
        demandes = Demande.objects.filter(statut__in=['Emise', 'Confirmée', 'Approuvée']).order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Quelques statistiques sur les demandes
@swagger_auto_schema(method='get',
                        operation_description="Récupérer quelques statistiques sur les demandes, Nombre total de demandes(total_demandes), " \
                        "Nombre de demandes par statut(demandes_par_statut), nombre de demandes en attente de validation(demandes_en_attente_validation)"
                        "et les demandes traitéées (validées et rejetées) et (demandes_traitées) selon une période: jour, semaine, mois, total",
                        manual_parameters=[
                            openapi.Parameter('periode', openapi.IN_PATH, description="Période pour les statistiques: jour, semaine, mois, total", type=openapi.TYPE_STRING)
                        ])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def statistiques_demandes(request, periode):
    user = request.user
    if not has_permission(user, 'statistique.view'):
        return Response({'error': 'Accès refusé, vous ne disposez pas des permissions nécessaires'}, status=status.HTTP_403_FORBIDDEN)
    
    now = timezone.now()
    if periode == 'jour':
        start_date = now - timedelta(days=1)
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
    else:
        start_date = None  # Pour 'total', on ne filtre pas par date
    if start_date:
        filtered_demandes = Demande.objects.filter(date_creation__gte=start_date)
    else:
        filtered_demandes = Demande.objects.all()
    total_demandes = filtered_demandes.count()
    demandes_par_statut = filtered_demandes.values('statut').annotate(count=models.Count('statut'))
    demandes_en_attente_validation = filtered_demandes.filter(statut__in=['Emise', 'Confirmée', 'Approuvée']).count()
    demandes_traitées = filtered_demandes.filter(statut__in=['Validée', 'Rejetée']).count()
    #Ici j'aimerais calculer les pourcentages de chaque type de resultat par rapport à la periode passé, par exemple: pour les demandes totales de la periode jour on calcule pour voir par rapport au total des demandes de 
    # la journée précedente qui est hier pour voir si on a une augmentation ou une diminution en pourcentage donc par exemple 20 de plus que hier ou 10 de moins que hier
    taux_variation = {}
    if periode != 'total':
        if periode == 'jour':
            previous_start_date = now - timedelta(days=2)
            previous_end_date = now - timedelta(days=1)
        elif periode == 'semaine':
            previous_start_date = now - timedelta(weeks=2)
            previous_end_date = now - timedelta(weeks=1)
        elif periode == 'mois':
            previous_start_date = now - timedelta(days=60)
            previous_end_date = now - timedelta(days=30)
         
         
        previous_demandes = Demande.objects.filter(date_creation__gte=previous_start_date, date_creation__lt=previous_end_date)
        previous_total = previous_demandes.count()
        
        if previous_total > 0:
            variation = total_demandes - previous_total
            taux_variation['total_demandes_variation'] = (variation / previous_total) 
        else:
            taux_variation['total_demandes_variation'] = None  # Pas de données précédentes pour comparaison
    

    stats = {
        'total_demandes': total_demandes,
        'demandes_par_statut': demandes_par_statut,
        'demandes_en_attente_validation': demandes_en_attente_validation,
        'demandes_traitées': demandes_traitées,
        'taux_variation': taux_variation
    }
    return Response(stats)