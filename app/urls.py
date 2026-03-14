# app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('historique-user/<str:periode>', views.historique_utilisateur, name='historique_utilisateur'),
    path('historique-toutes-actions', views.historique_toutes_actions, name='historique_toutes_actions'),
    path('Generer-rapport-stocks-pdf/<int:projet_id>', views.generer_rapport_stocks_pdf, name='generer_rapport_stocks_pdf'),
    path('devices/register', views.register_device, name='register_device'),
]