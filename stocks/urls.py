from django.urls import path
from . import views

urlpatterns = [ 
    path('liste-articles', views.list_articles, name='list_articles'),
    path('article-create', views.create_article, name='create_article'),
    path('article-detail/<int:pk>', views.get_article, name='get_article'),
    path('article-update/<int:pk>', views.update_article, name='update_article'),
    path('article-delete/<int:pk>', views.delete_article, name='delete_article'),

    ######Pour les articles en stock dans les magasins######
    path('stock-item-create', views.add_stock_item, name='create_stock_item'),
    path('liste-stock-items/<int:magasin_id>', views.list_stock_items, name='list_stock_items'),
    path('stock-item-update/<int:magasin_id>', views.update_stock_item, name='update_stock_item'),
    path('stock-item-detail/<int:stock_item_id>', views.get_stock_item, name='get_stock_item'),
    path('stock-item-delete/<int:stock_item_id>', views.delete_stock_item, name='delete_stock_item'),
    path('stats/<int:magasin_id>/<str:unite>', views.stock_statistics, name='stats'),
]