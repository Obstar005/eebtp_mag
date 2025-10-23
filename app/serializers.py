# app/serializers.py
from rest_framework import serializers
from .models import HistoriqueAction

class HistoriqueActionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Pour afficher le nom d’utilisateur

    class Meta:
        model = HistoriqueAction
        fields = '__all__'