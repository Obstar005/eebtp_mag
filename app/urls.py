# app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('historique-user', views.historique_utilisateur, name='historique_utilisateur'),
    path('historique-toutes-actions', views.historique_toutes_actions, name='historique_toutes_actions'),
]