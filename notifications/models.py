from django.db import models
from users.models import CustomUser

class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=50, default='general')  # exemple: 'stock', 'system', etc.

    def __str__(self):
        return f"{self.title} -> {self.user.email}"