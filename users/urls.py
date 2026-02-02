from django.urls import path
from . import views

urlpatterns = [
    #Pour les profils
    path('liste-profils', views.list_profils, name='list_profils'),
    path('profil-create', views.create_profil, name='create_profil'),
    path('profil-detail/<int:pk>', views.get_profil, name='get_profil'),
    path('profil-update/<int:pk>', views.update_profil, name='update_profil'),
    path('profil-delete/<int:pk>', views.delete_profil, name='delete_profil'),
    path('profil-supp/<int:pk>', views.supp_profil, name='delete_profil'),

    #Pour les utilisateurs
    path('liste-users', views.list_users, name='list_users'),
    path('user-create', views.create_user, name='create_user'),
    path('user-detail<int:pk>', views.get_user, name='get_user'),   
    path('user-update/<int:pk>', views.update_user, name='update_user'), 
    path('user-update-profile/<int:pk>', views.update_user_photo, name='update_user_profile'),
    path('user-delete/<int:pk>', views.delete_user, name='delete_user'),
    path('countries/', views.get_countries, name='get_countries'),
    path('Profiles-stats', views.get_user_profile_stats, name='supp_user'),

    #Authentification et vérification
    path('authentication/check-user-exists/', views.check_user_by_phone, name='check_user_by_phone'),
    path('authentication/set-password/', views.change_password, name='set_password'),
    path('authentication/reset-password/', views.set_password, name='reset_password'),
    path('authentication/login-by-phone-web/', views.login_by_phone_web, name='login_user_web'),
    path('authentication/login-by-phone-mobile/', views.login_by_phone_mobile, name='login_user_mobile'),
    path('authentication/user-info/', views.user_info, name='user_info'),
    path('authentication/verify-sms', views.send_code_view, name='verify_sms_code'),
    path('authentication/logout/', views.logout_user, name='logout_user'),
]
