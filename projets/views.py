from rest_framework.decorators import api_view
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Projet, Magasin, ProjetPhoto
from .serializers import ProjetSerializer, MagasinSerializer, ProjetPhotoSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


#Vue pour la création d'un projet
@swagger_auto_schema(
    method='post',
    operation_description="Cette API permet de créer un nouveau projet.",
    request_body=ProjetSerializer,  # Le modèle d'entrée
    responses={
        201: openapi.Response("Projet créé avec succès", ProjetSerializer),
        400: "Données invalides"
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_projet(request):
    data = request.data

    #Verifions si le projet existe déjà?
    projet_nom = data.get('nom')
    if Projet.objects.filter(nom=projet_nom).exists():
        return Response(
            {'error': f'Il existe déjà un projet avec le nom <<{projet_nom}>>. Veuillez choisir un nom différent.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    # Projet.creator = request.user  # Assigner l'utilisateur connecté comme créateur du projet
    data['creator'] = request.user.id  # Assigner l'ID de l'utilisateur
    
    serializer = ProjetSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Projet créé avec succès'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Vue pour la liste des projets
@swagger_auto_schema(
    method='get',
    operation_description="Cette API permet de récupérer la liste des projets.",
    responses={
        200: openapi.Response("Liste des projets", ProjetSerializer(many=True)),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_projets(request):
    projets = Projet.objects.filter(is_active=True).order_by('-date_creation')
    serializer = ProjetSerializer(projets, many=True)
    return Response(serializer.data)

#Vue pour la récupération d'un projet
@swagger_auto_schema(
    method='get',
    operation_description="Cette API permet de récupérer les détails d'un projet spécifique.",
    responses={
        200: openapi.Response("Détails du projet", ProjetSerializer),
        404: "Projet non trouvé"
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_projet(request, pk):
    try:
        projet = Projet.objects.get(pk=pk)
    except Projet.DoesNotExist:
        return Response({'error': 'Projet introuvable'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProjetSerializer(projet)
    return Response(serializer.data)

#Vue pour la mise à jour d'un projet
@swagger_auto_schema(
    method='put',
    operation_description="Cette API permet de mettre à jour un projet existant.",
    request_body=ProjetSerializer,
    responses={
        200: openapi.Response("Projet mis à jour avec succès", ProjetSerializer),
        404: "Projet non trouvé",
        400: "Données invalides"
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_projet(request, pk):
    try:
        projet = Projet.objects.get(pk=pk)
    except Projet.DoesNotExist:
        return Response({'error': 'Projet introuvable'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data.copy()
    data['creator'] = projet.creator.id  # Conserver le créateur existant

    serializer = ProjetSerializer(projet, data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Vue pour la suppression d'un projet
@swagger_auto_schema(
    method='delete',
    operation_description="Cette API permet de supprimer un projet.",
    responses={
        204: "Projet supprimé avec succès",
        404: "Projet non trouvé"
    }
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_projet(request, pk):
    try:
        projet = Projet.objects.get(pk=pk)
        projet.is_active = False
        projet.save()
        return Response({'message': 'Projet désactivé avec succès.'}, status=status.HTTP_200_OK)
    except projet.DoesNotExist:
        return Response({'error': 'Projet introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    
# CREATE photo
@swagger_auto_schema(
    method='post',
    operation_description="Cette API permet d'ajouter des photos pour un projet.",
    request_body=ProjetPhotoSerializer,
    responses={
        201: openapi.Response("Photo créée avec succès", ProjetPhotoSerializer),
        400: "Données invalides",
        404: "Projet non trouvé"
    }
)   
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_photo(request, pk):
    try:
        projet = Projet.objects.get(pk=pk)
    except Projet.DoesNotExist:
        return Response({"error": "Projet introuvable"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    data['projet'] = projet.id  # on force l’association au projet

    serializer = ProjetPhotoSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# UPDATE photo
@swagger_auto_schema(
    method='put',
    operation_description="Cette API permet de mettre à jour une photo d'un projet.",
    request_body=ProjetPhotoSerializer,
    responses={
        200: openapi.Response("Photo mise à jour avec succès", ProjetPhotoSerializer),
        404: "Photo non trouvée",
        400: "Données invalides"
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_photo(request, pk):
    try:
        photo = ProjetPhoto.objects.get(pk=pk)
    except ProjetPhoto.DoesNotExist:
        return Response({"error": "Photo introuvable"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProjetPhotoSerializer(photo, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#Vue pour avoir la liste de tous les photos d'un projet
@swagger_auto_schema(
    method='get',
    operation_description="Cette API permet de récupérer toutes les photos d'un projet spécifique.",
    responses={
        200: openapi.Response("Liste des photos du projet", ProjetPhotoSerializer(many=True)),
        404: "Projet non trouvé"
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_photos(request, pk):
    try:
        # Vérifier que le projet existe
        projet = Projet.objects.get(id=pk)

        # Récupérer uniquement les photos lié à ce projet
        photos = ProjetPhoto.objects.filter(projet=projet)

        # Sérialiser les données
        serializer = ProjetPhotoSerializer(photos, many=True)

        return Response({
            'projet': projet.nom,
            'photos': serializer.data
        }, status=status.HTTP_200_OK)

    except Projet.DoesNotExist:
        return Response({'error': 'Magasin introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    
# DELETE photo
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_photo(request, pk):
    try:
        photo = ProjetPhoto.objects.get(pk=pk)
        photo.is_active = False
        photo.save()
        return Response({'message': 'Photo supprimé avec succès.'}, status=status.HTTP_200_OK)
    except photo.DoesNotExist:
        return Response({'error': 'Photo introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    
#MASGASINS
@swagger_auto_schema(
    method='post',
    operation_description="Cette API permet de créer un nouveau magasin.",
    request_body=MagasinSerializer,
    responses={
        201: openapi.Response("Magasin créé avec succès", MagasinSerializer),
        400: "Données invalides"
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_magasin(request):
    data = request.data
   
    projet_id = data.get('projet')  
    # Vérifier si le magasin existe déjà pour ce projet
    if Magasin.objects.filter(projet_id=projet_id).exists():
        return Response(
            {'error': f'Il existe déjà un magasin pour ce projet.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Assigner l'utilisateur connecté comme créateur du magasin
    data['creator'] = request.user.id  

    serializer = MagasinSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Magasin créé avec succès'}, status=status.HTTP_201_CREATED)    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#Vue pour la liste des magasins
@swagger_auto_schema(   
    method='get',
    operation_description="Cette API permet de récupérer la liste des magasins.",
    responses={
        200: openapi.Response("Liste des magasins", MagasinSerializer(many=True)),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_magasins(request):
    magasins = Magasin.objects.filter(is_active=True).order_by('-date_creation')
    serializer = MagasinSerializer(magasins, many=True)
    return Response(serializer.data)

#Vue pour la récupération d'un magasin
@swagger_auto_schema(
    method='get',
    operation_description="Cette API permet de récupérer les détails d'un magasin spécifique.",
    responses={
        200: openapi.Response("Détails du magasin", MagasinSerializer),
        404: "Magasin non trouvé"
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_magasin(request, pk):
    try:
        magasin = Magasin.objects.get(pk=pk)
    except Magasin.DoesNotExist:
        return Response({'error': 'Magasin introuvable'}, status=status.HTTP_404_NOT_FOUND)

    serializer = MagasinSerializer(magasin)
    return Response(serializer.data)

#Vue pour la mise à jour d'un magasin
@swagger_auto_schema(
    method='put',
    operation_description="Cette API permet de mettre à jour un magasin existant.",
    request_body=MagasinSerializer,
    responses={
        200: openapi.Response("Magasin mis à jour avec succès", MagasinSerializer),
        404: "Magasin non trouvé",
        400: "Données invalides"
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_magasin(request, pk):
    try:
        magasin = Magasin.objects.get(pk=pk)
    except Magasin.DoesNotExist:
        return Response({'error': 'Magasin introuvable'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data.copy()
    if magasin.creator:  
        data['creator'] = magasin.creator.id  # garder le créateur existant
    else:
        data['creator'] = request.user.id  # si jamais il était null, on assigne l'user courant

    serializer = MagasinSerializer(magasin, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Vue pour la suppression d'un magasin
@swagger_auto_schema(
    method='delete',
    operation_description="Cette API permet de supprimer un magasin.",
    responses={
        204: "Magasin supprimé avec succès",
        404: "Magasin non trouvé"
    }
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_magasin(request, pk):
    try:
        magasin = Magasin.objects.get(pk=pk)
        magasin.is_active = False
        magasin.save()
        return Response({'message': 'Magasin désactivé avec succès.'}, status=status.HTTP_200_OK)
    except Magasin.DoesNotExist:
        return Response({'error': 'Magasin introuvable.'}, status=status.HTTP_404_NOT_FOUND)