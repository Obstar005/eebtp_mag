from rest_framework.decorators import api_view
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from projets.models import Projet, Magasin
from stocks.models import Produit
from .serializers import ProduitSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from projets.models import Magasin, StockItem
from projets.serializers import MagasinSerializer, StockItemSerializer
from app.utils import enregistrer_action
from django.db.models import F

#Creation d'un produit dans le système
@swagger_auto_schema(
    method='post',
    operation_description="Créer un nouveau produit",
    request_body=ProduitSerializer,
    responses={201: ProduitSerializer, 400: 'Bad Request'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_article(request):
    serializer = ProduitSerializer(data=request.data)
    enregistrer_action(request.user, 'creation', 'A crée un article dans le système.', f"Article #{request.data.get('designation')}")

    if serializer.is_valid():
        article = serializer.save()
        return Response({'message': 'Article crée avec succès'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Récupérer la liste des produits
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer la liste des articles de stocks dans le magasin",
    responses={200: ProduitSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_articles(request):
    articles = Produit.objects.filter(is_active=True).order_by('-date_creation')
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des articles dans le système.', "Liste des articles")
    serializer = ProduitSerializer(articles, many=True)
    return Response(serializer.data)

#Récupérer un article dans le système par son ID
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer un article par son ID",
    responses={200: ProduitSerializer, 404: 'Not Found'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_article(request, pk):
    try:
        article = Produit.objects.get(pk=pk)
    except Produit.DoesNotExist:
        return Response({'error': 'Article introuvable'}, status=status.HTTP_404_NOT_FOUND)
    # enregistrer_action(request.user, 'consultation', 'A consulté l.', "Liste des projets")
    
    #Verifier si le produit n'est pas désactivé
    if not article.is_active:
        return Response({'error': 'Article désactivé'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProduitSerializer(article)
    return Response(serializer.data)

#Mettre à jour un article dans le système par son ID
@swagger_auto_schema(   
    method='put',
    operation_description="Mettre à jour un article par son ID",
    request_body=ProduitSerializer,
    responses={200: ProduitSerializer, 400: 'Bad Request', 404: 'Not Found'}
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_article(request, pk):
    try:
        article = Produit.objects.get(pk=pk)
    except Produit.DoesNotExist:
        return Response({'error': 'Article introuvable'}, status=status.HTTP_404_NOT_FOUND)
    enregistrer_action(request.user, 'modification', 'A modifié un article dans le système.', f"Article #{article.id}")

    serializer = ProduitSerializer(article, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Article mis à jour avec succès'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Supprimer un article dans le système par son ID
@swagger_auto_schema(
    method='delete',
    operation_description="Supprimer un article par son ID",
    responses={204: 'No Content', 404: 'Not Found'}
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_article(request, pk):
    try:
        article = Produit.objects.get(pk=pk)
        article.is_active = False
        article.save()
        enregistrer_action(request.user, 'suppression', 'A supprimé un article dans le système.', f"Article #{article.id}")
        return Response({'message': 'Article désactivé avec succès.'}, status=status.HTTP_200_OK)
    except Produit.DoesNotExist:
        return Response({'error': 'Article introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    
#######Gestion des articles dans un magasin#######
@swagger_auto_schema(
    method='post',
    operation_description="Ajouter un article au stock d'un magasin",
    request_body=StockItemSerializer,
    responses={201: 'Created', 400: 'Bad Request'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_stock_item(request):
    user = request.user
    serializer = StockItemSerializer(data=request.data)
    enregistrer_action(request.user, 'creation', 'A ajouté un article au stock d\'un magasin.', f"Article dans le magasin #{request.data.get('magasin')}")
    if serializer.is_valid():
        serializer.save(add_by=user)
        return Response({'message': 'Article ajouté au stock du magasin avec succès.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Liste des articles dans un magasin
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer la liste des articles dans un magasin",
    responses={200: StockItemSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_stock_items(request, magasin_id):
    try:
        magasin = Magasin.objects.get(pk=magasin_id)
    except Magasin.DoesNotExist:
        return Response({'error': 'Magasin introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des articles dans un magasin.', f"Liste des articles du magasin #{magasin.id}")

    stock_items = StockItem.objects.filter(magasin=magasin, is_active=True).order_by('-date_ajout')
    serializer = StockItemSerializer(stock_items, many=True)
    return Response(serializer.data)

#Mettre à jour un article dans le stock d'un magasin
@swagger_auto_schema(
    method='put',
    operation_description='Mettre à jour les données sur un article dans un magasin',
    request_body=StockItemSerializer,
    responses={200: 'OK', 400:'Bad Request', 404: 'Item Not Found'}
    )
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_stock_item(request, magasin_id):
    try:
        stock_item = StockItem.objects.get(pk=magasin_id)
    except StockItem.DoesNotExist:
        return Response({'error': 'Article introuvable'}, status=status.HTTP_404_NOT_FOUND)
    
    stock_item.updated_by = request.user
    enregistrer_action(request.user, 'modification', 'A modifié un article dans le stock d\'un magasin.', f"Article #{stock_item.id} dans le magasin #{stock_item.magasin.id}")

    serializer = StockItemSerializer(stock_item, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Recupérer les détails d'un article dans un magasin
@swagger_auto_schema(
    method='get',
    operation_description='Récupérer les détails d\'un article dans un magasin',
    responses={200: StockItemSerializer, 404: 'Item Not Found'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stock_item(request, stock_item_id):
    try:
        stock_item = StockItem.objects.get(pk=stock_item_id)
    except StockItem.DoesNotExist:
        return Response({'error': 'Article introuvable'}, status=status.HTTP_404_NOT_FOUND)

    if not stock_item.is_active:
        return Response({'error': 'Cet article a été désactivé'}, status=status.HTTP_404_NOT_FOUND)
    serializer = StockItemSerializer(stock_item)
    return Response(serializer.data)

#Supprimer(Desactiver) un article dans le stock d'un magasin 
@swagger_auto_schema(
    method='patch',
    operation_description="Supprimer un article dans le stock d'un magasin (désactiver)",
    responses={204: 'Supprimé avec succès', 404: 'Not Found'}
)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def delete_stock_item(request, stock_item_id):
    try:
        stock_item = StockItem.objects.get(pk=stock_item_id)
        stock_item.is_active = False
        stock_item.save()
        enregistrer_action(request.user, 'suppression', 'A supprimé un article dans le stock d\'un magasin.', f"Article #{stock_item.id} dans le magasin #{stock_item.magasin.id}")
        return Response({'message': 'Article supprimé avec succès dans le magasin.'}, status=status.HTTP_200_OK)
    except StockItem.DoesNotExist:
        return Response({'error': 'Article introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    
#Stattisques pour le mobile, pour un magasin, le nombres d'articles par unité de mesure, le nombres d'entrées, sorties, selon les periodes jour, semaine, mois et depuis le début(total)
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer les statistiques des articles dans un magasin. Valeurs pour le champ unite: litre, kg, m3, unite, m, autre",
    responses={200: 'OK', 404: 'Not Found'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_statistics(request, magasin_id, unite):
    try:
        magasin = Magasin.objects.get(pk=magasin_id)
    except Magasin.DoesNotExist:
        return Response({'error': 'Magasin introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    
    # Exemple de statistiques: nombre total d'articles actifs dans le magasin pour une unité donnée
    total_articles = StockItem.objects.filter(magasin_id=magasin, produit__unite=unite, is_active=True).count()

    # Vous pouvez ajouter d'autres statistiques selon vos besoins

    statistics = {
        'total_articles': total_articles,
        # Ajouter d'autres statistiques ici
    }

    return Response(statistics, status=status.HTTP_200_OK)

#Pour avoir les etats de stocks de chaque article dans un magasin
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_quantite_stocks(request, projet_id, produit_id):
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

    
        # Récupérer toutes les entrées du projet (tous les magasins du projet)
    articles = StockItem.objects.filter(
        magasin_id=magasin_id,
        is_active=True,
    )

    # Annoter les données
    stats = (
        articles
        .values('stock_item__produit__designation', 'date_group')
        # .annotate(total_quantite=Sum('quantite_m'))
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
        # 'periode': periode,
        'article': stock_item.produit.designation,
        'unite': stock_item.produit.unite,
        'donnees': data
    }

    return Response(response_data, status=status.HTTP_200_OK)

#Vue pour les articles en dessous du niveau seuil dans un magasin à travers le projet
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def articles_below_threshold(request, projet_id):
    try:
        projet = Projet.objects.get(pk=projet_id)
    except Projet.DoesNotExist:
        return Response({'error': 'Projet introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    
    # Récupérer les magasins du projet
    magasins = Magasin.objects.filter(projet=projet)

    # Récupérer les articles en dessous du seuil pour ces magasins
    articles_below_threshold = StockItem.objects.filter(
        magasin__in=magasins,
        quantite__lt=F('quantite_seuil'),
        is_active=True
    ).select_related('produit', 'magasin')

    serializer = StockItemSerializer(articles_below_threshold, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)