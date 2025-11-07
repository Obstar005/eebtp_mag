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
from notifications.utils import notifier_utilisateurs
from mouvements.models import Entree, Sortie

#Détail d'une demande
@swagger_auto_schema(method='get',
                        operation_description="Récupérer les détails d'une demande spécifique",
                        responses={200: DemandeSerializer, 404: 'Not Found'})
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detail_demande(request, id):
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
    if user.profil.libelle != 'magasinier':
        return Response({'error': 'Seul un magasinier peut émettre une demande.'}, status=status.HTTP_403_FORBIDDEN)
    
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
        # destinataires = CustomUser.objects.filter(profil__libelle__in=['chef_appro', 'dtx', 'dt', 'dga', 'dg'])
        # titre = "Nouvelle Demande Émise"
        # message = f"{user.username} a émis une nouvelle demande #{new_demande_number}."
        # notifier_utilisateurs(destinataires, titre, message)

        return Response({'message': 'Demande émise avec succès'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#Vue pour lister les demandes émises par un magasinier
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes émises par le magasinier connecté")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_emises(request):
    user = request.user
    # if user.profil.libelle != 'magasinier':
    #     #Seul le magasinier qui a emis la dem
    #     return Response({'error': 'Seul un magasinier peut voir ses demandes émises.'}, status=status.HTTP_403_FORBIDDEN)

    demandes = Demande.objects.filter(emis_par=user).order_by('-date_creation')

    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Vue pour confirmer une demande par un chef appro ou un supérieur étant autorisé
@swagger_auto_schema(method='post',
                        operation_description="Confirmer une demande (par un chef appro ou un supérieur autorisé)",
                        request_body=DemandeSerializer)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmer_demande(request, id):
    user = request.user
    if user.profil.libelle not in ['chef_appro', 'dga', 'dt']:
        return Response({'error': 'Vous n\'êtes pas autorisé à confirmer cette demande.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        demande = Demande.objects.get(id=id)
    except Demande.DoesNotExist:
        return Response({'error': 'Demande non trouvée.'}, status=status.HTTP_404_NOT_FOUND)

    if demande.statut != 'Emise':
        return Response({'error': 'Seules les demandes émises peuvent être confirmées.'}, status=status.HTTP_400_BAD_REQUEST)

    demande.statut = 'Confirmée'
    demande.confirme_par = user
    demande.date_confirmation = timezone.now()
    demande.save()
    # enregistrer_action(user, 'modification', 'A confirmé une demande', f"Demande #{demande.number}")
    # destinataires = CustomUser.objects.filter(profil__libelle__in=['chef_appro', 'dtx', 'dt', 'dga', 'dg'])
    # titre = "Nouvelle Demande Émise"
    # message = f"La demande #{demande.number}. a ete confirmée."
    # notifier_utilisateurs([destinataires], titre, message)

    return Response({'message': 'Demande confirmée avec succès'}, status=status.HTTP_200_OK)

#Liste des demandes confirmées
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes confirmées")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_confirmees(request):
    demandes = Demande.objects.filter(statut='Confirmée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Vue pour approuver une demande par le directeur technique ou par le directeur des travaux ou un supérieur autorisé
@swagger_auto_schema(method='post',
                        operation_description="Approuver une demande (par les DT, c-a-d directeur technique(dt) ou par le directeur des travaux(dtx) ou un supérieur autorisé)",
                        request_body=DemandeSerializer)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approuver_demande(request, id):
    user = request.user
    if user.profil.libelle not in ['chef_appro','dtx', 'dt']:
        return Response({'error': 'Vous n\'êtes pas autorisé à approuver cette demande.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        demande = Demande.objects.get(pk=id)
    except Demande.DoesNotExist:
        return Response({'error': 'Demande non trouvée'}, status=status.HTTP_404_NOT_FOUND)
    if not demande.statut == 'Confirmée':
        return Response({'error': f'La demande n\'a pas encore été confirmée statut actuel: {demande.statut}.'}, status=status.HTTP_400_BAD_REQUEST)

    demande.statut = 'Approuvée'
    demande.approve_par = user
    demande.date_approbation = timezone.now()
    demande.save()
    enregistrer_action(user, 'modification', 'A approuvé une demande', f"Demande #{demande.number}")
    return Response({'message': 'Demande approuvée avec succès'}, status=status.HTTP_200_OK)

#Liste des demandes approuvées
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes approuvées")
@api_view(['GET'])
@permission_classes([IsAuthenticated])  
def liste_demandes_approuvees(request):
    demandes = Demande.objects.filter(statut='Approuvée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Vue pour valider une demande par le directeur général adjoint ou un supérieur autorisé
@swagger_auto_schema(method='post',
                        operation_description="Valider une demande (par le DGA, ou le Directeur Financier (DF), ou le DG)",
                        request_body=DemandeSerializer)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def valider_demande(request, id):
    user = request.user
    if user.profil.libelle not in ['chef_appro', 'dga', 'df', 'dg']:
        return Response({'error': 'Vous n\'êtes pas autorisé à valider cette demande.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        demande = Demande.objects.get(pk=id)
    except Demande.DoesNotExist:
        return Response({'error': 'Demande non trouvée'}, status=status.HTTP_404_NOT_FOUND)
    if not demande.statut == 'Approuvée':
        return Response({'error': f'La demande n\'a pas encore été approuvée statut actuel: {demande.statut}.'}, status=status.HTTP_400_BAD_REQUEST)

    demande.statut = 'Validée'
    demande.valide_par = user
    demande.date_validation = timezone.now()
    demande.save()
    enregistrer_action(user, 'modification', 'A validé une demande', f"Demande #{demande.number}")
    return Response({'message': 'Demande validée avec succès'}, status=status.HTTP_200_OK)

#Liste des demandes validées
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes validées")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_validees(request):
    demandes = Demande.objects.filter(statut='Validée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste des demandes validées filtrer par periode
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes validées selon une période: jour, semaine, mois, total")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_validees_filtrer(request, periode):
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

#Pour rejeter une demande
@swagger_auto_schema(method='post',
                        operation_description="Rejeter une demande (par le DGA, ou le Directeur Financier (DF), ou le DG)",
                        request_body=DemandeSerializer)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rejeter_demande(request, id):
    user = request.user
    if user.profil.libelle not in ['chef_appro', 'dga', 'df', 'dg']:
        return Response({'error': 'Vous n\'êtes pas abilité à rejeter cette demande.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        demande = Demande.objects.get(pk=id)
    except Demande.DoesNotExist:
        return Response({'error': 'Demande non trouvée'}, status=status.HTTP_404_NOT_FOUND)
    if not demande.statut == 'Validée':
        return Response({'error': f'Seules les demandes validées peuvent être rejetées. Statut actuel: {demande.statut}'}, status=status.HTTP_400_BAD_REQUEST)
    if demande.statut == 'Validée':
        return Response({'error': 'La demande a déjà été validée et ne peut plus être rejetée.'}, status=status.HTTP_400_BAD_REQUEST)

    demande.statut = 'Rejetée'
    demande.rejete_par = user
    demande.date_rejet = timezone.now()
    demande.save()
    enregistrer_action(user, 'modification', 'A rejeté une demande', f"Demande #{demande.number}")
    return Response({'message': 'Demande rejetée avec succès'}, status=status.HTTP_200_OK)

#Liste des demandes rejetées
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes rejetées")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_rejetees(request):
    demandes = Demande.objects.filter(statut='Rejetée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste des demandes rejetées selon une période mois, semaine, jour, total
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes rejetées selon une période: jour, semaine, mois, total")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_rejetees_filtrer(request, periode):
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
    demandes = Demande.objects.all().order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste de toutes les demandes avec filtre par période
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste de toutes les demandes selon une période: jour, semaine, mois, total")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_toutes_les_demandes_filtrer(request, periode):
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
    demandes = Demande.objects.filter(statut='Livrée').order_by('-date_creation')
    serializer = DemandeSerializer(demandes, many=True)
    return Response(serializer.data)

#Liste des demandes livrées avec filtre par période
@swagger_auto_schema(method='get',
                        operation_description="Récupérer la liste des demandes qui ont été livrées")
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_demandes_livrees_filtrer(request, periode):
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

#mobile
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def statistiques_mouv_mobile(request, magasin_id, periode):
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
        filtered_entrees = Entree.objects.filter(magasin_id=magasin_id, date_creation__gte=start_date)
        filtered_sorties = Sortie.objects.filter(magasin_id=magasin_id, date_creation__gte=start_date)
    else:
        filtered_entrees = Entree.objects.filter(magasin_id=magasin_id)
        filtered_sorties = Sortie.objects.filter(magasin_id=magasin_id)
    total_entrees = filtered_entrees.count()
    total_sorties = filtered_sorties.count()
    
    #Ici j'aimerais calculer les pourcentages de chaque type de resultat par rapport à la periode passé, par exemple: pour les demandes totales de la periode jour on calcule pour voir par rapport au total des demandes de 
    # la journée précedente qui est hier pour voir si on a une augmentation ou une diminution en pourcentage donc par exemple 20 de plus que hier ou 10 de moins que hier

    stats = {
        'total_sorties': total_entrees,
        'total_sorties': total_sorties
    }
    return Response(stats)