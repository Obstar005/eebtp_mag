from rest_framework.decorators import api_view
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Projet, Magasin, ProjetPhoto
from .serializers import ProjetSerializer, MagasinSerializer, ProjetPhotoSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import parser_classes
from app.utils import enregistrer_action
from django.contrib.auth import get_user_model
from users.models import CustomUser

#Vue pour la création d'un projet
@swagger_auto_schema(
    method='post',
    operation_description="Cette API permet de créer un nouveau projet ainsi que son magasin associé. (nom_magasin et adresse_magasin sont les noms des" \
    "champs du magasin).",
    request_body=ProjetSerializer,  # Le modèle d'entrée
    responses={
        201: openapi.Response("Projet créé avec succès", ProjetSerializer),
        400: "Données invalides"
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_projet(request):
    data = request.data.copy()

    # 1️ Vérifions si le projet existe déjà
    projet_nom = data.get('nom')
    if Projet.objects.filter(nom=projet_nom).exists():
        return Response(
            {'error': f'Il existe déjà un projet avec le nom <<{projet_nom}>>.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    #  Ajout du créateur
    data['creator'] = request.user.id

    # 3️ On commence par créer le projet
    projet_serializer = ProjetSerializer(data=data)
    if not projet_serializer.is_valid():
        return Response(projet_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    projet = projet_serializer.save()
    enregistrer_action(request.user, 'creation', 'A créé un nouveau projet', f"Projet #{projet.nom}")

    # 4️ Ensuite, on crée le magasin associé
    magasin_nom = data.get('nom_magasin')
    magasin_adresse = data.get('adresse_magasin')

    if magasin_nom:  # si le nom du magasin est fourni
        magasin = Magasin.objects.create(
            nom=magasin_nom,
            adresse=magasin_adresse,
            creator=request.user,
            projet=projet  # ici on associe le projet qu’on vient de créer
        )

        enregistrer_action(
            request.user,
            'creation',
            'A créé un nouveau magasin',
            f"Magasin #{magasin.nom} pour le projet #{projet.nom}"
        )

    # 5️ Réponse finale
    return Response(
        {
            'message': 'Projet et magasin créés avec succès',
            'projet': ProjetSerializer(projet).data
        },
        status=status.HTTP_201_CREATED
    )


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
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des projets du système.', "Liste des projets")
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
# @permission_classes([IsAuthenticated]) 
def get_projet(request, pk):
    try:
        projet = Projet.objects.get(pk=pk)
    except Projet.DoesNotExist:
        return Response({'error': 'Projet introuvable'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProjetSerializer(projet)
    enregistrer_action(request.user, 'consultation', 'A consulté les détails d\'un projet.', f"Projet #{projet.id}")
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
    enregistrer_action(request.user, 'modification', 'A modifié un projet.', f"Projet #{projet.id}")

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
        enregistrer_action(request.user, 'suppression', 'A supprimé un projet', f"Projet #{projet.id}")
        return Response({'message': 'Projet désactivé avec succès.'}, status=status.HTTP_200_OK)
    except projet.DoesNotExist:
        return Response({'error': 'Projet introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    
# CREATE photo
@swagger_auto_schema(
    method='post',
    operation_description="Cette API permet d'ajouter des photos pour un projet.",
    manual_parameters=[
        openapi.Parameter(
            name="image",
            in_=openapi.IN_FORM,
            type=openapi.TYPE_FILE,
            description="Image de la photo du projet"
        ),
    ],
    request_body=ProjetPhotoSerializer,
    responses={
        201: openapi.Response("Photo créée avec succès", ProjetPhotoSerializer),
        400: "Données invalides",
        404: "Projet non trouvé"
    }
)   
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
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
    manual_parameters=[
        openapi.Parameter(
            name="photo_profil",
            in_=openapi.IN_FORM,
            type=openapi.TYPE_FILE,
            description="Image de profil"
        ),
    ],
    request_body=ProjetPhotoSerializer,
    responses={
        200: openapi.Response("Photo mise à jour avec succès", ProjetPhotoSerializer),
        404: "Photo non trouvée",
        400: "Données invalides"
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
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
# @swagger_auto_schema(
#     method='post',
#     operation_description="Cette API permet de créer un nouveau magasin.",
#     request_body=MagasinSerializer,
#     responses={
#         201: openapi.Response("Magasin créé avec succès", MagasinSerializer),
#         400: "Données invalides"
#     }
# )
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_magasin(request):
#     data = request.data
   
#     projet_id = data.get('projet')  
#     # Vérifier si le magasin existe déjà pour ce projet
#     if Magasin.objects.filter(projet_id=projet_id).exists():
#         return Response(
#             {'error': f'Il existe déjà un magasin pour ce projet.'},
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     # Assigner l'utilisateur connecté comme créateur du magasin
#     data['creator'] = request.user.id  
#     # enregistrer_action(request.user, 'creation', 'A crée un magasin.', f"Magasin #{pro.id}")

#     serializer = MagasinSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response({'message': 'Magasin créé avec succès'}, status=status.HTTP_201_CREATED)    
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des magasins du système.', "Liste des Magasins")
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
    enregistrer_action(request.user, 'consultation', 'A consulté les détails d\'un magasin.', f"Magasin #{magasin.id}")

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
    enregistrer_action(request.user, 'modification', 'A modifié un magasin.', f"Magasin #{magasin.id}")

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
        enregistrer_action(request.user, 'suppression', 'A supprimé un magasin', f"Magasin #{magasin.id}")
        return Response({'message': 'Magasin désactivé avec succès.'}, status=status.HTTP_200_OK)
    except Magasin.DoesNotExist:
        return Response({'error': 'Magasin introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    

#Vue pour avoir la liste de tous les magasins d'un projet
@swagger_auto_schema(
    method='get',
    operation_description="Cette API permet de récupérer tous les magasins d'un projet spécifique.",
    responses={
        200: openapi.Response("Liste des magasins du projet", MagasinSerializer(many=True)),
        404: "Projet non trouvé"
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_magasins_by_projet(request, pk):
    try:
        # Vérifier que le projet existe
        projet = Projet.objects.get(id=pk)

        # Récupérer uniquement les magasins lié à ce projet
        magasins = Magasin.objects.filter(projet=projet)
        enregistrer_action(request.user, 'consultation', 'A consulté la liste des magasins d\'un projet.', f"Liste des magasins du projet #{projet.id}")

        # Sérialiser les données
        serializer = MagasinSerializer(magasins, many=True)

        return Response({
            'projet': projet.nom,
            'magasins': serializer.data
        }, status=status.HTTP_200_OK)

    except Projet.DoesNotExist:
        return Response({'error': 'Magasin introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    
#Un endpoint pour renvoyé la liste des projets et magasins associés à un utilisateur
@swagger_auto_schema(
    method='get',
    operation_description="Cette API permet de récupérer la liste des projets et magasins associés à l'utilisateur connecté.",
    responses={
        200: openapi.Response("Liste des projets et magasins de l'utilisateur", ProjetSerializer(many=True)),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_projets_magasins(request):
    print(request.user, request.user.id, request.user.is_authenticated)

    # user = request.user
    try:
        user = request.user
    except CustomUser.DoesNotExist:
        return Response({'error': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    projets = Projet.objects.filter(comptes=user, is_active=True).order_by('-date_creation')
    serializer = ProjetSerializer(projets, many=True)
    enregistrer_action(request.user, 'consultation', 'A consulté la liste de ses projets et magasins associés.', "Liste des projets et magasins de l'utilisateur")
    return Response(serializer.data)