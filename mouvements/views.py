from rest_framework.decorators import api_view
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from projets.models import Projet, Magasin, StockItem
from .models import Sortie, Entree
from .serializers import SortieSerializer, EntreeSerializer
from demandes.models import Demande
from app.utils import enregistrer_action
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, TruncHour
from datetime import datetime, timedelta
from stocks.models import Produit



#Créer une sortie de stock
@swagger_auto_schema(
    method='post',
    operation_description="Créer une nouvelle sortie de stock",
    request_body=SortieSerializer,
    responses={201: SortieSerializer, 400: 'Bad Request'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_sortie(request):
    user = request.user
    data = request.data.copy()
    quantity = data.get('quantite_m', 0)
    try:
        stock_item = StockItem.objects.get(pk=data.get('stock_item'))
    except StockItem.DoesNotExist:
        return Response({'error': 'Article introuvable'}, status=status.HTTP_404_NOT_FOUND)
    if stock_item.quantite < int(quantity):
        return Response({'error': f'Quantité insuffisante en stock pour l\'article {stock_item}'}, status=status.HTTP_400_BAD_REQUEST)
    
    stock_item.quantite -= int(quantity)
    stock_item.save()
    enregistrer_action(user, 'creation', 'A crée une sortie de stock dans le système.', f"Sortie de {quantity} de l'article #{stock_item.id} du magasin #{data.get('magasin')}")

    serializer = SortieSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(make_by=user)
        return Response({'message': 'Sortie créée avec succès'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Liste toutes les sorties
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer la liste des sorties de stock",
    responses={200: SortieSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sorties(request):
    sorties = Sortie.objects.filter(is_active=True).order_by('-date_creation')
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des sorties de stock dans le système.', "Liste des sorties de stock")
    serializer = SortieSerializer(sorties, many=True)
    return Response(serializer.data)

#Lister les sorties de stock dans le système selon les périodes: jour, semaine, mois, total
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer la liste des sorties de stock selon les périodes: jour, semaine, mois, total",
    responses={200: SortieSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sorties_filtrer(request, periode):
    now = timezone.now()
    if periode == 'jour':
        start_date = now - timedelta(days=1)
        sorties = Sortie.objects.filter(is_active=True, date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
        sorties = Sortie.objects.filter(is_active=True, date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
        sorties = Sortie.objects.filter(is_active=True, date_creation__gte=start_date).order_by('-date_creation')
    else:
        sorties = Sortie.objects.filter(is_active=True).order_by('-date_creation')
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des sorties de stock dans le système.', "Liste des sorties de stock")
    serializer = SortieSerializer(sorties, many=True)
    return Response(serializer.data)

#Récupérer la liste des sorties de stock pour un magasin 
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer la liste des sorties de stock pour un magasin spécifique",
    responses={200: SortieSerializer, 404: 'Not Found'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sorties_magasin(request, magasin_id):
    try:
        magasin = Magasin.objects.get(pk=magasin_id)
    except Magasin.DoesNotExist:
        return Response({'error': 'Magasin introuvable'}, status=status.HTTP_404_NOT_FOUND)
    sorties = Sortie.objects.filter(magasin=magasin, is_active=True).order_by('-date_creation')
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des sorties de stock dans un magasin.', f"Liste des sorties du magasin #{magasin.id}")
    
    serializer = SortieSerializer(sorties, many=True)
    return Response(serializer.data)

#Récupérer la liste des sorties de stock pour un magasin selon les périodes: jour, semaine, mois, total
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer la liste des sorties de stock pour un magasin spécifique selon les périodes: jour, semaine, mois, total",
    responses={200: SortieSerializer, 404: 'Not Found'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sorties_magasin_filtrer(request, magasin_id, periode):
    try:
        magasin = Magasin.objects.get(pk=magasin_id)
    except Magasin.DoesNotExist:
        return Response({'error': 'Magasin introuvable'}, status=status.HTTP_404_NOT_FOUND)
    now = timezone.now()
    if periode == 'jour':
        start_date = now - timedelta(days=1)
        sorties = Sortie.objects.filter(magasin=magasin, is_active=True, date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
        sorties = Sortie.objects.filter(magasin=magasin, is_active=True, date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
        sorties = Sortie.objects.filter(magasin=magasin, is_active=True, date_creation__gte=start_date).order_by('-date_creation')
    else:
        sorties = Sortie.objects.filter(magasin=magasin, is_active=True).order_by('-date_creation')
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des sorties de stock dans un magasin.', f"Liste des sorties du magasin #{magasin.id}")
    
    serializer = SortieSerializer(sorties, many=True)
    return Response(serializer.data)

#Récupérer une sortie de stock par son ID
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer une sortie de stock par son ID",
    responses={200: SortieSerializer, 404: 'Not Found'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sortie(request, pk):
    try:
        sortie = Sortie.objects.get(pk=pk)
    except Sortie.DoesNotExist:
        return Response({'error': 'Sortie introuvable'}, status=status.HTTP_404_NOT_FOUND)
    
    if not sortie.is_active:
        return Response({'error': 'Cette sortie a été désactivée'}, status=status.HTTP_404_NOT_FOUND)

    serializer = SortieSerializer(sortie)
    return Response(serializer.data)


#############ENTREES DE STOCK#############
#Créer une entrée de stock
@swagger_auto_schema(
    method='post',
    operation_description="Créer une nouvelle entrée de stock",
    request_body=EntreeSerializer,
    responses={201: EntreeSerializer, 400: 'Bad Request'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_entree(request):
    user = request.user
    data = request.data.copy()
    quantity = data.get('quantite_m', 0)
    type = data.get('type', '')
    demande_source_id = data.get('demande_source', None)

    try:
        stock_item = StockItem.objects.get(pk=data.get('stock_item'))
    except StockItem.DoesNotExist:
        return Response({'error': 'Article introuvable'}, status=status.HTTP_404_NOT_FOUND)

    if type == 'Retour' and not data.get('source') and not data.get('fonction_deposant') and not data.get('tel_deposant') and not data.get('nom_deposant'):
        return Response({'error': 'Ces champs sont obligatoires pour déclarer un retour de stock'}, status=status.HTTP_400_BAD_REQUEST)
    if type == 'Retour':
        try:
            sortie = Sortie.objects.get(pk=data.get('source'))
        except Sortie.DoesNotExist:
            return Response({'error': 'Sortie source introuvable'}, status=status.HTTP_404_NOT_FOUND)
        #Verifions si le produit de la sortie source correspond à celui de l'entrée
        if sortie.stock_item != stock_item:
            return Response({'error': 'L\'article de la sortie source ne correspond pas à celui de l\'entrée'}, status=status.HTTP_400_BAD_REQUEST) 
        if sortie.quantite_m < int(quantity):
            return Response({'error': f'Quantité de retour dépasse la quantité de la sortie source pour l\'article {sortie.stock_item}'}, status=status.HTTP_400_BAD_REQUEST)
        
    if type  == 'Livraison' and not data.get('societe') and not data.get('tel_societe') and not data.get('nom_livreur') and not data.get('tel_livreur') and not demande_source_id:
        return Response({'error': 'Champ manquant pour déclarer une livraison de stock'}, status=status.HTTP_400_BAD_REQUEST)
        #on va verifier si l'article de la demande_source correspond à celui de l'entrée
    if demande_source_id:
        try:
            demande = Demande.objects.get(pk=demande_source_id)
        except Demande.DoesNotExist:
            return Response({'error': 'Demande source introuvable'}, status=status.HTTP_404_NOT_FOUND)
        if demande.stock_item != stock_item:
            return Response({'error': 'L\'article de la demande concernée ne correspond pas à celui de l\'entrée que vous voulez déclarer'}, status=status.HTTP_400_BAD_REQUEST)
        if demande.statut == 'Rejetée':
            return Response({'error': 'La demande concernée a été rejetée, vous ne pouvez pas déclarer cette entrée de stock'}, status=status.HTTP_400_BAD_REQUEST)
        if not demande.statut == 'Validée':
            return Response({'error': f'La demande concernée n\'a pas encore été validée veuillez contacter votre supérieur. Statut actuel: {demande.statut}'}, status=status.HTTP_400_BAD_REQUEST)
    #Changer le statut de la demande
        demande.statut = 'Livrée'
        demande.save()
    stock_item.quantite += int(quantity)
    stock_item.save()
    enregistrer_action(user, 'creation', 'A crée une entrée de stock dans le système.', f"Entrée de {quantity} de l'article #{stock_item.id} du magasin #{data.get('magasin')}")

    serializer = EntreeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(make_by=user)
        return Response({'message': 'Entrée créée avec succès'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Details d'une entrée de stock par son ID
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer une entrée de stock par son ID",
    responses={200: EntreeSerializer, 404: 'Not Found'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_entree(request, pk):
    try:
        entree = Entree.objects.get(pk=pk)
    except Entree.DoesNotExist:
        return Response({'error': 'Entrée introuvable'}, status=status.HTTP_404_NOT_FOUND)
   
    serializer = EntreeSerializer(entree)
    return Response(serializer.data)

#Lister les entrées de stock dans le système
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer la liste des entrées de stock",
    responses={200: EntreeSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_entrees(request):
    entrees = Entree.objects.filter(is_active=True).order_by('-date_creation')
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des entrées de stock dans le système.', "Liste des entrées de stock")
    serializer = EntreeSerializer(entrees, many=True)
    return Response(serializer.data)

#Lister les entrées de stock dans le système, on va filtrer selon les perdiodes: jour, semaine, mois, total
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer la liste des entrées de stock selon les périodes: jour, semaine, mois, total",
    responses={200: EntreeSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_entrees_filtrer(request, periode=None):
    from django.utils import timezone
    from datetime import timedelta
    now = timezone.now()
    if periode == 'jour':
        start_date = now - timedelta(days=1)
        entrees = Entree.objects.filter(is_active=True, date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
        entrees = Entree.objects.filter(is_active=True, date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
        entrees = Entree.objects.filter(is_active=True, date_creation__gte=start_date).order_by('-date_creation')
    else:
        entrees = Entree.objects.filter(is_active=True).order_by('-date_creation')
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des entrées de stock dans le système.', "Liste des entrées de stock")
    serializer = EntreeSerializer(entrees, many=True)
    return Response(serializer.data)

#Lister les entrées de stock pour un magasin
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer la liste des entrées de stock pour un magasin spécifique",
    responses={200: EntreeSerializer, 404: 'Not Found'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_entrees_magasin(request, magasin_id):
    try:
        magasin = Magasin.objects.get(pk=magasin_id)
    except Magasin.DoesNotExist:
        return Response({'error': 'Magasin introuvable'}, status=status.HTTP_404_NOT_FOUND)
    
    entrees = Entree.objects.filter(magasin=magasin, is_active=True).order_by('-date_creation')
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des entrées de stock dans un magasin.', f"Liste des entrées du magasin #{magasin.id}")
    
    serializer = EntreeSerializer(entrees, many=True)
    return Response(serializer.data)

#Lister les entrées de stock pour un magasin avec filtre par période: jour, semaine, mois, total
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer la liste des entrées de stock pour un magasin spécifique selon les périodes: jour, semaine, mois, total",
    responses={200: EntreeSerializer, 404: 'Not Found'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_entrees_magasin_filtrer(request, magasin_id, periode=None):
    try:
        magasin = Magasin.objects.get(pk=magasin_id)
    except Magasin.DoesNotExist:
        return Response({'error': 'Magasin introuvable'}, status=status.HTTP_404_NOT_FOUND)
    now = timezone.now()
    if periode == 'jour':
        start_date = now - timedelta(days=1)
        entrees = Entree.objects.filter(magasin=magasin, is_active=True, date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
        entrees = Entree.objects.filter(magasin=magasin, is_active=True, date_creation__gte=start_date).order_by('-date_creation')
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
        entrees = Entree.objects.filter(magasin=magasin, is_active=True, date_creation__gte=start_date).order_by('-date_creation')
    else:
        entrees = Entree.objects.filter(magasin=magasin, is_active=True).order_by('-date_creation')
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des entrées de stock dans un magasin.', f"Liste des entrées du magasin #{magasin.id}")
    
    serializer = EntreeSerializer(entrees, many=True)
    return Response(serializer.data)

#Vues pour quelques stats: nombre de livraisons, sorties et de retours dans un magasin pendant la journée, une semaine, un mois et aussi depuis le début des opérations. On doit passer le magasin_id en paramètre et la periode dans l'url qui peut prendre les valeurs 'jour', 'semaine', 'mois', 'total'
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer les statistiques des mouvements de stock dans un magasin pour une période donnée",
    responses={200: openapi.Response('Statistiques des mouvements de stock', schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'livraisons': openapi.Schema(type=openapi.TYPE_INTEGER),
            'sorties': openapi.Schema(type=openapi.TYPE_INTEGER),
            'retours': openapi.Schema(type=openapi.TYPE_INTEGER),
        }
    )), 404: 'Not Found'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_mouvements_magasin(request, magasin_id, periode): #Web
    try:
        magasin = Magasin.objects.get(pk=magasin_id)
    except Magasin.DoesNotExist:
        return Response({'error': 'Magasin introuvable'}, status=status.HTTP_404_NOT_FOUND)

    now = timezone.now()

    if periode == 'jour':
        start_date = now - timedelta(days=1)
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
    elif periode == 'total':
        start_date = None
    else:
        return Response({'error': 'Période invalide. Utilisez "jour", "semaine", "mois" ou "total".'}, status=status.HTTP_400_BAD_REQUEST)

    filter_params = {'magasin': magasin, 'is_active': True}
    if start_date:
        filter_params['date_creation__gte'] = start_date

    livraisons = Entree.objects.filter(type='Livraison', **filter_params).count()
    retours = Entree.objects.filter(type='Retour', **filter_params).count()
    sorties = Sortie.objects.filter(**filter_params).count()

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
        
        previous_livraisons = Entree.objects.filter(type='Livraison', date_creation__gte=previous_start_date, date_creation__lt=previous_end_date)
        previous_livraisons_total = previous_livraisons.count()
        if previous_livraisons_total > 0:
            variation = livraisons - previous_livraisons_total
            taux_variation['livraisons_variation'] = (variation / previous_livraisons_total) 
        else:
            taux_variation['livraisons_variation'] = None
        
        previous_sorties = Sortie.objects.filter(date_creation__gte=previous_start_date, date_creation__lt=previous_end_date)
        previous_sorties_total = previous_sorties.count()
        if previous_sorties_total > 0:
            variation = sorties - previous_sorties_total
            taux_variation['sorties_variation'] = (variation / previous_sorties_total) 
        else:
            taux_variation['sorties_variation'] = None

        previous_retours = Entree.objects.filter(type='Retour', date_creation__gte=previous_start_date, date_creation__lt=previous_end_date)
        previous_retours_total = previous_retours.count()
        
        if previous_retours_total > 0:
            variation = retours - previous_retours_total
            taux_variation['retours_variation'] = (variation / previous_retours_total) 
        else:
            taux_variation['retours_variation'] = None

    stats = {
        'livraisons': livraisons,
        'taux_variation': taux_variation,
        'sorties': sorties,

        'retours': retours,
    }

    return Response(stats)

#Pour le graphe d'entrees de stock
# @swagger_auto_schema(method='get',
#                         operation_description="Récupérer quelques statistiques sur les demandes, Nombre total de demandes(total_demandes), " \
#                         "Nombre de demandes par statut(demandes_par_statut), nombre de demandes en attente de validation(demandes_en_attente_validation)"
#                         "et les demandes traitéées (validées et rejetées) et (demandes_traitées) selon une période: jour, semaine, mois, total",
#                         manual_parameters=[
#                             openapi.Parameter('projet_id', 'type_entree', 'periode', 'produit_id', openapi.IN_PATH, description="Id du projet, Type d'entrée:(Livraison, Retour), Période pour les statistiques: (jour, semaine, mois, projet), L'id du projet", type='Int et String',)
#                         ])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_fluctuations_entrees(request, projet_id, type_entree, periode, produit_id):
    try:
        projet = Projet.objects.get(pk=projet_id)
    except Projet.DoesNotExist:
        return Response({'error': 'Projet introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        magasin_id = Magasin.objects.get(projet=projet)
    except Magasin.DoesNotExist:
        return Response({'error': 'Magasin introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    
    # magasin_id = Magasin.objects.filter(projet=projet)
    #On voit si l'article existe et s'il est dans ce magasin
    try:
        stock_item = StockItem.objects.select_related('produit', 'magasin').get(pk=produit_id)
    except StockItem.DoesNotExist:
        return Response({'error': 'Article introuvable dans le stock.'}, status=status.HTTP_404_NOT_FOUND)

    # Vérifier que le StockItem appartient bien à un magasin de ce projet
    if stock_item.magasin.projet_id != projet.id:
        return Response(
            {'error': "Cet article n'appartient pas à un magasin de ce projet."},
            status=status.HTTP_400_BAD_REQUEST
        )


    now = timezone.now()
    # Choisir la fonction de regroupement selon la période
    if periode == 'jour':
        start_date = now - timedelta(days=1)
        trunc = TruncDay('date_creation')
    elif periode == 'semaine':
        trunc = TruncDay('date_creation')
        start_date = now - timedelta(days=7)
    elif periode == 'mois':
        trunc = TruncDay('date_creation')
        start_date = now - timedelta(days=31)
    elif periode == 'projet':
        trunc = TruncMonth('date_creation')  # tout le projet → regrouper par mois
        start_date = projet.date_creation
    else:
        return Response({'error': 'Période invalide.'}, status=status.HTTP_400_BAD_REQUEST)
    
        # Récupérer toutes les entrées du projet (tous les magasins du projet)
    entrees = Entree.objects.filter(
        magasin_id=magasin_id,
        type=type_entree,
        is_active=True,
        date_creation__gte=start_date,
        stock_item=stock_item
    )

    # Annoter les données
    stats = (
        entrees.annotate(date_group=trunc)
        .values('stock_item__produit__designation', 'date_group')
        .annotate(total_quantite=Sum('quantite_m'))
        .order_by('stock_item__produit__designation', 'date_group')
    )

    # Structurer la réponse
    data = []
    for s in stats:
        data.append({
            'date': s['date_group'].strftime('%Y-%m-%d'),
            'quantite_totale': float(s['total_quantite'] or 0)
        })

    response_data = {
        'periode': periode,
        'type': type_entree,
        'article': stock_item.produit.designation,
        'unite': stock_item.produit.unite,
        'donnees': data
    }

    return Response(response_data, status=status.HTTP_200_OK)