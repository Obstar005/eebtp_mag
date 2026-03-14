from django.urls import path, include
from . import views

urlpatterns = [
    path("notifications/test", views.test_notification, name="test_notification"),
    path("notifications-by-user", views.list_notifications_by_user, name="list_notifications_by_user"),
    path("notification-mark-as-read/<int:pk>", views.mark_notification_as_read, name="mark_notification_as_read"),
    path("notification-detail/<int:pk>", views.notification_detail, name="notification_detail"),
]