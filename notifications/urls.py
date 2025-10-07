from django.urls import path, include
from . import views

urlpatterns = [
    path("notifications/test/", views.test_notification, name="test_notification"),
]