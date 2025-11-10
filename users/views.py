from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Profil, CustomUser, SMSVerification
from .serializers import ProfilSerializer, CustomUserSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django_countries import countries
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password, check_password
from .validators import validate_password_strength
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from .send_sms_service import send_verification_sms
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import parser_classes
from app.utils import enregistrer_action
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from notifications.utils import notifier_utilisateurs

#Fonction pour envoyer les notifications
# def send_notification_user(user_id, message):
#     channel_layer = get_channel_layer()
#     async_to_sync(channel_layer.group_send)(
#         f"user_{user_id}",
#         {"type": "send_notification", "message": message}
#     )

#Pour recup la liste des pays:
@swagger_auto_schema(
    method='get',
    operation_description="Liste de tous les pays qui existent",
    responses={200: openapi.Response(description='Liste des pays', examples={
        'application/json': [{"code": "FR", "name": "France"},
            {"code": "US", "name": "United States"},
            {"code": "CA", "name": "Canada"}]})}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_countries(request):
    data = [{"code": code, "name": name} for code, name in list(countries)]
    return JsonResponse(data, safe=False)


#Profilssss
@swagger_auto_schema(
    method='get',
    operation_description="Liste de tous les profils",
    responses={200: ProfilSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_profils(request):
    profils = Profil.objects.filter(is_active=True).order_by('-date_creation')
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des profils dans le système.', "Liste des profils")
    serializer = ProfilSerializer(profils, many=True)
    return Response(serializer.data)

#CREATION D'UN PROFIL
@swagger_auto_schema(
    method='post',
    operation_description="Créer un nouvel utilisateur",
    request_body=ProfilSerializer,
    responses={201: ProfilSerializer, 400: 'Bad Request'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_profil(request):
    serializer = ProfilSerializer(data=request.data)
    enregistrer_action(request.user, 'creation', 'A crée un profil dans le système.', f"Profil #{request.data.get('libelle')}")
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Récupérer un profil par ID
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer un profil par son ID",
    responses={200: ProfilSerializer, 404: 'Profil introuvable'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profil(request, pk):
    try:
        profil = Profil.objects.get(pk=pk)
    except Profil.DoesNotExist:
        return Response({'error': 'Profil introuvable'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProfilSerializer(profil)
    return Response(serializer.data)

# Mettre à jour un profil
@swagger_auto_schema(
    method='put',
    operation_description="Modifier un profil existant",
    request_body=ProfilSerializer,
    responses={200: ProfilSerializer, 404: 'Profil introuvable', 400: 'Bad Request'}
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profil(request, pk):
    try:
        profil = Profil.objects.get(pk=pk)
    except Profil.DoesNotExist:
        return Response({'error': 'Profil introuvable'}, status=status.HTTP_404_NOT_FOUND)
    enregistrer_action(request.user, 'modification', 'A modifié un profil dans le système.', f"Profil #{profil.id}")

    serializer = ProfilSerializer(profil, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Désactiver un profil (au lieu de le supprimer)
@swagger_auto_schema(
    method='delete',
    operation_description="Supprimer un utilisateur",
    responses={204: 'Supprimé avec succès'}
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profil(request, pk):
    try:
        profil = Profil.objects.get(pk=pk)
        profil.is_active = False
        profil.save()
        enregistrer_action(request.user, 'suppression', 'A désactivé un profil dans le système.', f"Profil #{profil.id}")
        return Response({'message': 'Profil désactivé avec succès.'}, status=status.HTTP_200_OK)
    except Profil.DoesNotExist:
        return Response({'error': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)

# Users
# Fonctionnalités CRUD pour les utilisateurs
#LISTE DES UTILISATEURS
@swagger_auto_schema(
    method='get',
    operation_description="Liste de tous les utilisateurs",
    responses={200: CustomUserSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    users = CustomUser.objects.filter(is_active=True).order_by('-date_creation')
    enregistrer_action(request.user, 'consultation', 'A consulté la liste des utilisateurs dans le système.', "Liste des utilisateurs")
    serializer = CustomUserSerializer(users, many=True)
    return Response(serializer.data)

#Creation d'un utilisateur
@swagger_auto_schema(
    method='post',
    operation_description="Créer un nouvel utilisateur (avec ou sans photo de profil)",
    request_body=CustomUserSerializer,
    responses={201: CustomUserSerializer, 400: 'Bad Request'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):
    serializer = CustomUserSerializer(data=request.data)
    enregistrer_action(request.user, 'creation', 'A crée un utilisateur dans le système.', f"Utilisateur #{request.data.get('username')}")
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Utilisateur crée avec succès'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(
    method='get',
    operation_description="Récupérer un utilisateur par ID",
    responses={200: CustomUserSerializer}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, pk):
    try:
        user = CustomUser.objects.get(pk=pk)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)

    serializer = CustomUserSerializer(user)
    return Response(serializer.data)

@swagger_auto_schema(
    method='put',
    operation_description="Modifier un utilisateur existant",
    request_body=CustomUserSerializer,
    responses={200: CustomUserSerializer}
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, pk):
    try:
        user = CustomUser.objects.get(pk=pk)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)
    enregistrer_action(request.user, 'modification', 'A modifié un utilisateur dans le système.', f"Utilisateur #{user.id}")

    serializer = CustomUserSerializer(user, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Mettre à jour la photo de profil d'un user
@swagger_auto_schema(
    method='put',
    operation_description="Mettre à jour la photo de profil d'un utilisateur",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['photo_profil'],
        properties={
            'photo_profil': openapi.Schema(type=openapi.TYPE_FILE, description='Fichier image de la photo de profil')
        }
    ),
    responses={200: CustomUserSerializer, 400: 'Bad Request', 404: 'Utilisateur introuvable'}
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated]) 
def update_user_photo(request, pk):
    try:
        user = CustomUser.objects.get(pk=pk)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)

    if 'photo_profil' not in request.FILES:
        return Response({'error': 'Aucune photo fournie'}, status=status.HTTP_400_BAD_REQUEST)

    user.photo_profil = request.FILES['photo_profil']
    user.save()
    enregistrer_action(request.user, 'modification', 'A mis à jour la photo de profil d\'un utilisateur dans le système.', f"Utilisateur #{user.id}")
    serializer = CustomUserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@swagger_auto_schema(
    method='delete',
    operation_description="Supprimer un utilisateur",
    responses={204: 'Supprimé avec succès'}
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, pk):
    try:
        user = CustomUser.objects.get(pk=pk)
        user.is_active = False
        user.save()
        enregistrer_action(request.user, 'suppression', 'A désactivé un utilisateur dans le système.', f"Utilisateur #{user.id}")
        return Response({'message': 'Utilisateur désactivé avec succès.'}, status=status.HTTP_200_OK)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

#FONCTION POUR VERIFIER SI UN UTILISATEUR EXISTE DANS LE SYSTEME AVEC SON TELEPHONE
phone_param = openapi.Parameter('telephone', openapi.IN_BODY, description="Numéro de téléphone", type=openapi.TYPE_STRING)
@swagger_auto_schema(
    method='post',
    operation_description="Vérifie si un utilisateur existe avec ce numéro de téléphone ",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['telephone'],
        properties={'telephone': openapi.Schema(type=openapi.TYPE_STRING, description='Numéro de téléphone de l\'utilisateur')},
        example={'telephone': '0022890099009'}
    ),
    responses={200: openapi.Response(description='Résultat')}
)
@api_view(['POST'])
@permission_classes([AllowAny])
def check_user_by_phone(request):
    phone = request.data.get('telephone')
    if not phone:
        return Response({'error': 'Numéro de téléphone requis.'}, status=status.HTTP_400_BAD_REQUEST)

    try: 
        user = CustomUser.objects.get(telephone=phone)
        return Response({'Verifié': True, 'user_id': user.id}, status=status.HTTP_200_OK)
    except CustomUser.DoesNotExist:
        return Response({'L\'utilisateur n\'existe pas dans le système': False}, status=status.HTTP_404_NOT_FOUND)
    
#Fonction pour définir le mot de passe d'un utilisateur
@swagger_auto_schema(
    method='post',  
    operation_description="Pour modifier le mot de passe d'un utilisateur que ce soit lors de la première connexion ou indéfiniement", 
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['telephone', 'old_password', 'new_password'],
        properties={
            'telephone': openapi.Schema(type=openapi.TYPE_STRING, description='Numéro de téléphone de l\'utilisateur', example='0022890099009'),
            'old_password': openapi.Schema(type=openapi.TYPE_STRING, description='Ancien mot de passe de l\'utilisateur'),
            'new_password': openapi.Schema(type=openapi.TYPE_STRING, description='Nouveau mot de passe de l\'utilisateur')
        }
    ),
    responses={200: openapi.Response(description='Mot de passe modifié avec succès'), 400: 'Bad Request', 404: 'Utilisateur introuvable', 403: 'Accès refusé'}
)
@api_view(['POST'])
@permission_classes([AllowAny])
def change_password(request):
    # user = request.user
    phone = request.data.get('telephone')
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    try:
        user = CustomUser.objects.get(telephone=phone)
    except CustomUser.DoesNotExist:
        return Response({"error": "Utilisateur introuvable."}, status=status.HTTP_404_NOT_FOUND)

    # Vérifier l'ancien mot de passe
    if not user.check_password(old_password):
        return Response({"error": "Ancien mot de passe incorrect"}, status=status.HTTP_400_BAD_REQUEST)

    # Définir le nouveau mot de passe
    try:
        validate_password_strength(new_password, user=user)
        user.set_password(new_password)
        user.first_login = False  # Marquer comme plus première connexion
        user.save()

    except ValidationError as e:
        return Response({"error": str(e)}, status=400)
    enregistrer_action(user, 'modification', 'A modifié son mot de passe dans le système.', f"Utilisateur #{user.id}")

    return Response({"message": "Mot de passe modifié avec succès"}, status=status.HTTP_200_OK)

#Documentation Swagger pour la création du mot de passe
@swagger_auto_schema(
    method='post',
    operation_description="Créer un mot de passe pour un nouveau utilisateur",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['telephone', 'password'],
        properties={
            'telephone': openapi.Schema(type=openapi.TYPE_STRING, description='Numéro de téléphone de l\'utilisateur'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description='Mot de passe à définir')
        }
    ),
    responses={200: openapi.Response(description='Mot de passe créé avec succès'), 400: 'Bad Request', 404: 'Utilisateur introuvable'}
)
@api_view(['POST'])
@permission_classes([AllowAny])
def set_password(request):
    phone = request.data.get('telephone')
    password = request.data.get('password')

    if not phone or not password:
        return Response(
            {"error": "Téléphone et mot de passe sont requis."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = CustomUser.objects.get(telephone=phone)
    except CustomUser.DoesNotExist:
        return Response(
            {"error": "Utilisateur introuvable."}, status=status.HTTP_404_NOT_FOUND
        )

    user.password = make_password(password)
    user.save()
    enregistrer_action(user, 'modification', 'A créé son mot de passe dans le système.', f"Utilisateur #{user.id}")

    return Response(
        {"message": "Mot de passe créé avec succès."}, status=status.HTTP_200_OK
    )

# Fonction pour authentifier un utilisateur par son numero de telephone sur le web
@swagger_auto_schema(
    method='post',
    operation_description="Authentifier un utilisateur par téléphone et mot de passe sur le web",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['telephone', 'password'],
        properties={
            'telephone': openapi.Schema(type=openapi.TYPE_STRING, description='Numéro de téléphone de l\'utilisateur', example='0022890099009'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description='Mot de passe de l\'utilisateur')
        }
    ),
    responses={200: openapi.Response(description='Connexion réussie'), 400: 'Bad Request', 401: 'Mot de passe incorrect', 404: 'Utilisateur introuvable', 403: 'Utilisateur désactivé ou accès refusé' }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_by_phone_web(request):
    phone = request.data.get('telephone')
    password = request.data.get('password')

    if not phone or not password:
        return Response(
            {"error": "Téléphone et mot de passe sont requis."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = CustomUser.objects.get(telephone=phone)
    except CustomUser.DoesNotExist:
        return Response(
            {"error": "Utilisateur introuvable."}, status=status.HTTP_404_NOT_FOUND
        )
    # Vérifier si l'utilisateur est actif et est autorisé à se connecter
    if not user.is_active: 
        return Response(
            {"error": "Votre compte a été désactivé. Veuillez contacter votre supérieur."}, status=status.HTTP_403_FORBIDDEN
        )
    #Ici verifions si l'utilisateur n'est pas un magasinier
    
    if user.profil.libelle == "magasinier": 
        return Response(
            {"error": "Accès refusé! Vous n'êtes pas autorisé à vous connecter à cette plateforme."},status=status.HTTP_403_FORBIDDEN
        )

    if not check_password(password, user.password):
        return Response(
            {"error": "Mot de passe incorrect."},status=status.HTTP_401_UNAUTHORIZED
        )
    #Verifions si l'utilisateur s'est connecté pour la première fois
    # if user.first_login:
    #     return Response(
    #         {"error": "Vous devez changer votre mot de passe car c'est votre première connexion."}, status=status.HTTP_200_OK
    #     )
    first = user.first_login
    # Générer un token JWT
    refresh = RefreshToken.for_user(user)
    user.is_connected = True
    user.save()
    enregistrer_action(user,  'connexion', 'S\'est connecté au système(Web)', f"Utilisateur #{user.id}, à la date {user.last_login}")
    # notifier_utilisateurs([user], "Connexion Réussie", "Vous vous êtes connecté avec succès au système.")

    return Response(
        {"message": "Connexion réussie.", 'access_token': str(refresh.access_token), "first_login": first, "refresh_token": str(refresh)}, status=status.HTTP_200_OK)

#Vue pour authentifier un utilisateur par son numero de telephone sur mobile
@swagger_auto_schema(
    method='post',
    operation_description="Authentifier un utilisateur par téléphone et mot de passe pour mobile",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['telephone', 'password'],
        properties={
            'telephone': openapi.Schema(type=openapi.TYPE_STRING, description='Numéro de téléphone de l\'utilisateur', example='0022890099009'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description='Mot de passe de l\'utilisateur')
        }
    ),
    responses={200: openapi.Response(description='Connexion réussie'), 400: 'Bad Request', 401: 'Mot de passe incorrect', 404: 'Utilisateur introuvable', 403: 'Utilisateur désactivé ou accès refusé' }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_by_phone_mobile(request):
    phone = request.data.get('telephone')
    password = request.data.get('password')

    if not phone or not password:
        return Response(
            {"error": "Téléphone et mot de passe sont requis."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = CustomUser.objects.get(telephone=phone)
    except CustomUser.DoesNotExist:
        return Response(
            {"error": "Utilisateur introuvable."}, status=status.HTTP_404_NOT_FOUND
        )
    # Vérifier si l'utilisateur est actif et est autorisé à se connecter
    if not user.is_active: 
        return Response(
            {"error": "Votre compte a été désactivé. Veuillez contacter votre supérieur."}, status=status.HTTP_403_FORBIDDEN
        )

    if not check_password(password, user.password):
        return Response(
            {"error": "Mot de passe incorrect."},status=status.HTTP_401_UNAUTHORIZED
        )
    #Verifions si l'utilisateur s'est connecté pour la première fois
    # if user.first_login:
    #     return Response(
    #         {"error": "Vous devez changer votre mot de passe car c'est votre première connexion."}, status=status.HTTP_200_OK
    #     )
    first = user.first_login
    # Générer un token JWT
    refresh = RefreshToken.for_user(user)
    user.is_connected = True
    user.save()
    enregistrer_action(user, 'connexion', 'S\'est connecté au système(mobile)', f"Utilisateur #{user.id}, à la date {user.last_login}")

    return Response(
        {"message": "Connexion réussie.", 'access_token': str(refresh.access_token), "first_login": first, "refresh_token": str(refresh)}, status=status.HTTP_200_OK)


#^pour récuperer les informations de l'utilisateur connecté
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer les informations de l'utilisateur connecté, tu m'envoies un token JWT dans \
        l'en-tête Authorization et je te renvoie les infos de l'utilisateur",
    responses={200: CustomUserSerializer}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user  # Django gère l'utilisateur connecté grâce au JWT

    serializer= CustomUserSerializer(user)

    return Response(serializer.data, status=status.HTTP_200_OK)

#Vue pour déconnecter un utilisateur
@swagger_auto_schema(
    method='post',
    operation_description="Déconnecter un utilisateur en invalidant son token JWT",
    responses={200: openapi.Response(description='Déconnexion réussie'), 400: 'Bad Request'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        refresh_token = request.data.get("refresh_token")
        token = RefreshToken(refresh_token)
        token.blacklist()

        # Marquer l'utilisateur comme déconnecté
        user = request.user
        user.is_connected = False
        user.save()
        enregistrer_action(user, 'deconnexion', 'S\'est déconnecté du système', f"Utilisateur #{user.id}, à la date {user.last_login}")

        return Response({"message": "Déconnexion réussie"}, status=status.HTTP_205_RESET_CONTENT)
    

    except TokenError:
        return Response({"error": "Token invalide ou déjà blacklisté"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
# Fonction pour envoyer un SMS de vérification
import random
#Fonction generactrice du code de vérification
def generate_verification_code():
    return str(random.randint(1000, 9999))

# @swagger_auto_schema(
#     method='post',
#     operation_description="Envoyer un SMS de vérification",
#     request_body=openapi.Schema(
#         type=openapi.TYPE_OBJECT,
#         required=['phone_number'],
#         properties={
#             'phone_number': openapi.Schema(type=openapi.TYPE_STRING, description='Numéro de téléphone de l\'utilisateur', example='0022890099009')
#         }
#     ),
#     responses={200: openapi.Response(description='SMS envoyé avec succès'), 400: 'Bad Request'}
# )
@api_view(['POST'])
@permission_classes([AllowAny])
def send_code_view(request):
    phone = request.data.get('phone')
    code = generate_verification_code()

    if not phone:
        return JsonResponse({'error': 'Le numéro de téléphone est requis.'}, status=400)

    # Envoi SMS
    status, response = send_verification_sms(phone, code)

    # Stockage du code
    SMSVerification.objects.create(phone_number=phone, code=code)

    return JsonResponse({'status': status, 'response': response})

#Verifier le code de vérification
@swagger_auto_schema(
    method='post',
    operation_description="Vérifier le code de vérification envoyé par SMS",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['phone_number', 'code'],
        properties={
            'phone_number': openapi.Schema(type=openapi.TYPE_STRING, description='Numéro de téléphone de l\'utilisateur', example='0022890099009'),
            'code': openapi.Schema(type=openapi.TYPE_STRING, description='Code de vérification reçu par SMS')
        }
    ),
    responses={200: openapi.Response(description='Code vérifié avec succès'), 400: 'Bad Request', 404: 'Code expiré ou incorrect'}
)
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_code(request):
    phone = request.GET.get('phone')
    code = request.GET.get('code')

    try:
        sms = SMSVerification.objects.filter(phone_number=phone).latest('created_at')
        if sms.code == code and not sms.is_expired():
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': 'Code invalide ou expiré'})
    except SMSVerification.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Aucun code trouvé'})

#Vues pour renvoyer le nombres total d'utilisateurs, le nombre d'utilisateurs connéctés et le nombre de profils
@swagger_auto_schema(
    method='get',
    operation_description="Récupérer les statistiques des utilisateurs et profils",
    responses={200: openapi.Response(description='Statistiques récupérées avec succès')}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile_stats(request):
    total_users = CustomUser.objects.filter(is_active=True).count()
    connected_users = CustomUser.objects.filter(is_connected=True, is_active=True).count()
    total_profiles = Profil.objects.filter(is_active=True).count()

    data = {
        'total_users': total_users,
        'connected_users': connected_users,
        'total_profiles': total_profiles
    }
    return Response(data, status=status.HTTP_200_OK)