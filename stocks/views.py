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
        return Response({'message': 'Article désactivé avec succès.'}, status=status.HTTP_200_OK)
    except Produit.DoesNotExist:
        return Response({'error': 'Article introuvable.'}, status=status.HTTP_404_NOT_FOUND)