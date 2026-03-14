from django.urls import path
from . import views

urlpatterns = [
    path('demande/emettre', views.emettre_demande),
    path('demande/confirmer/<int:id>', views.confirmer_demande),
    path('demande/rejeter-confirmation/<int:id>', views.rejeter_demande_confirmation),

    path('demande/approuver/<int:id>', views.approuver_demande),
    path('demande/rejeter-approbation/<int:id>', views.rejeter_demande_approbation),

    path('demande/valider/<int:id>', views.valider_demande),
    path('demande/rejeter-validation/<int:id>', views.rejeter_demande_validation),

    path('demandes/emises', views.liste_demandes_emises),
    path('demandes/confirmees', views.liste_demandes_confirmees),
    path('demandes/approuvees', views.liste_demandes_approuvees),
    path('demandes/validees', views.liste_demandes_validees),
    path('demandes/validees/<str:periode>', views.liste_demandes_validees_filtrer),
    path('demandes/en-attente-validation', views.liste_demandes_en_attente_validation),
    path('demandes/en-attente-validation/<str:periode>', views.liste_demandes_en_attente_validation_filtrer),
    path('demandes/rejetees', views.liste_demandes_rejetees),
    path('demandes/rejetees/<str:periode>', views.liste_demandes_rejetees_filtrer),
    path('demandes/livrees', views.liste_demandes_livrees),
    path('demandes/livrees/<str:periode>', views.liste_demandes_livrees_filtrer),
    path('demandes/toutes', views.liste_toutes_les_demandes),
    path('demandes/toutes/<str:periode>', views.liste_toutes_les_demandes_filtrer),
    path('demande/detail/<int:id>', views.detail_demande),
    path('demandes/statistiques/<str:periode>', views.statistiques_demandes),
    # path('stats-mouv/<int:magasin_id>/<str:periode>', views.statistiques_mouv_mobile),
]