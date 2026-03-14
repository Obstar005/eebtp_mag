# app/serializers.py
from rest_framework import serializers
from .models import HistoriqueAction, UserDevice

class HistoriqueActionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Pour afficher le nom d’utilisateur

    class Meta:
        model = HistoriqueAction
        fields = '__all__'

class UserDeviceSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Pour afficher le nom d’utilisateur

    class Meta:
        model = UserDevice
        fields = '__all__'
        read_only_fields = ['user', 'created_at']  # Le user est défini à partir de la requête et created_at est auto_now_add