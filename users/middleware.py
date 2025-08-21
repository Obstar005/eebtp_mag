from rest_framework.exceptions import AuthenticationFailed
from .models import BlacklistedToken

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
