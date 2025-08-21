# serializers.py
from rest_framework import serializers
from .models import CustomUser, Profil
from django_countries.serializer_fields import CountryField

class ProfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profil
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    nationality = CountryField(name_only=True)
    class Meta:
        model = CustomUser
        fields = '__all__'
        read_only_fields = ['id', 'last_login', 'date_joined']
