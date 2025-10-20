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

    serializer = SortieSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(make_by=user)
        return Response({'message': 'Sortie créée avec succès'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Lister les sorties de stock dans le système
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer la liste des sorties de stock",
    responses={200: SortieSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sorties(request):
    sorties = Sortie.objects.filter(is_active=True).order_by('-date_creation')
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
    #Cha

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
    serializer = EntreeSerializer(entrees, many=True)
    return Response(serializer.data)
