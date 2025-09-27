from django.urls import path, include
from . import views

urlpatterns = [
    #Pour les mouvements de stock, SORTIES~#######
    path('liste-sorties', views.list_sorties, name='list_sorrties'),
    path('sortie-create', views.create_sortie, name='create_sortie'),
    path('sortie-detail/<int:pk>', views.get_sortie, name='get_sortie'),
    path('liste-sortie-magasin/<int:magasin_id>', views.list_sorties_magasin, name='list_sorties_magasin'),

    #Pour les mouvements de stock, ENTREES~#######
    path('liste-entrees', views.list_entrees, name='list_entrees'),
    path('entree-create', views.create_entree, name='create_entree'),
    path('entree-detail/<int:pk>', views.get_entree, name='get_entree'),
    path('liste-entree-magasin/<int:magasin_id>', views.list_entrees_magasin, name='list_entrees_magasin'),
]