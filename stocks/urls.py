from django.urls import path
from . import views

urlpatterns = [ 
    path('liste-articles', views.list_articles, name='list_articles'),
    path('article-create', views.create_article, name='create_article'),
    path('article-detail/<int:pk>', views.get_article, name='get_article'),
    path('article-update/<int:pk>', views.update_article, name='update_article'),
    path('article-delete/<int:pk>', views.delete_article, name='delete_article'),
]