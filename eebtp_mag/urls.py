from django.conf.urls.static import static
from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
   openapi.Info(
      title="EEBTP_MAG API",
      default_version='v3.7',
      description="This API is used to manage our projet eebtp_mag. It's contains all informations and details about the API and fonctions about this application",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="obstar300@gmail.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
        #Swagger
    path('swagger.<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    path('Stocks/', include('stocks.urls')),
    path('Users/', include('users.urls')),
    path('Projets/', include('projets.urls')),

]

if settings.DEBUG:
    # urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
