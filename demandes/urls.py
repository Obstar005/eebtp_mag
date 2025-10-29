from django.urls import path
from . import views

urlpatterns = [
    path('demande/emettre', views.emettre_demande),
    path('demande/confirmer/<int:id>', views.confirmer_demande),
    path('demande/approuver/<int:id>', views.approuver_demande),
    path('demande/valider/<int:id>', views.valider_demande),
    path('demande/rejeter/<int:id>', views.rejeter_demande),
    path('demandes/emises', views.liste_demandes_emises),
    path('demandes/confirmees', views.liste_demandes_confirmees),
    path('demandes/approuvees', views.liste_demandes_approuvees),
    path('demandes/validees', views.liste_demandes_validees),
    path('demandes/en-attente-validation/<str:periode>', views.liste_demandes_en_attente_validation),
    path('demandes/rejetees', views.liste_demandes_rejetees),
    path('demandes/livrees', views.liste_demandes_livrees),
    path('demandes/toutes/<str:periode>', views.liste_toutes_les_demandes),
    path('demande/detail/<int:id>', views.detail_demande),
    path('demandes/statistiques/<str:periode>', views.statistiques_demandes),
]