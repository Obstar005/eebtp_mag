from rest_framework.exceptions import AuthenticationFailed
from .models import BlacklistedToken
from django.utils import timezone

class BlacklistTokenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth = request.headers.get("Authorization")
        if auth and auth.startswith("Bearer "):
            token = auth.split(" ")[1]
            if BlacklistedToken.objects.filter(token=token).exists():
                raise AuthenticationFailed("Token invalide ou expiré")
        return self.get_response(request)
    
# Middleware pour mettre à jour la dernière activité de l'utilisateur
class UpdateLastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        response = self.get_response(request)

        if request.user.is_authenticated:
            request.user.last_activity = timezone.now()
            request.user.save(update_fields=['last_activity'])

        return response