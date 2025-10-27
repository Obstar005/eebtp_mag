# urls.py
from django.urls import path, include
from . import views



urlpatterns = [
    # Pour les projets
    path('liste-projets', views.list_projets, name='list_projets'),
    path('projet-create', views.create_projet, name='create_projet'),
    path('projet-detail/<int:pk>', views.get_projet, name='get_projet'),
    path('projet-update/<int:pk>', views.update_projet, name='update_projet'),
    path('projet-delete/<int:pk>', views.delete_projet, name='delete_projet'),

    # Pour les photos de projets
    path('projet-photo-create/<int:pk>', views.create_photo, name='create_projet_photo'),
    path('projet-photo-update/<int:pk>', views.edit_photo, name='update_projet_photo'),
    path('projet-photo-delete/<int:pk>', views.delete_photo, name='delete_projet_photo'),
    path('liste-photos-by-projet/<int:pk>', views.list_photos, name='list_photos'),

    # Pour les magasins
    path('liste-magasins', views.list_magasins, name='list_magasins'),
    # path('magasin-create', views.create_magasin, name='create_magasin'),    
    path('magasin-detail/<int:pk>', views.get_magasin, name='get_magasin'),
    path('magasin-update/<int:pk>', views.update_magasin, name='update_magasin'),
    path('magasin-delete/<int:pk>', views.delete_magasin, name='delete_magasin'),
    path('liste-magasins-by-projet/<int:pk>', views.list_magasins_by_projet, name='list_magasins_by_projet'),
]