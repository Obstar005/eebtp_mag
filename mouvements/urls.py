from django.urls import path, include
from . import views

urlpatterns = [
    #Pour les mouvements de stock, SORTIES~#######
    path('liste-sorties', views.list_sorties, name='list_sorrties'),
    path('sortie-create', views.create_sortie, name='create_sortie'),
    path('sortie-detail/<int:pk>', views.get_sortie, name='get_sortie'),
    path('liste-sortie-magasin/<int:magasin_id>', views.list_sorties_magasin, name='list_sorties_magasin'),
]