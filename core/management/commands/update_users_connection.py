from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from users.models import CustomUser


class Command(BaseCommand):
    help = "Met à jour les utilisateurs offline"

    def handle(self, *args, **kwargs):

        limit = timezone.now() - timedelta(minutes=30)

        users = CustomUser.objects.filter(
            last_activity__lt=limit,
            is_connected=True
        )

        count = users.update(is_connected=False)

        print(f"{count} utilisateurs mis offline")