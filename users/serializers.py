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
    # password = serializers.CharField(write_only=True, required=True)
    class Meta:
        model = CustomUser
        fields = '__all__'
    def create(self, validated_data):
        # Pour gérer un mot de passe
        password = validated_data.pop("password", None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
        # read_only_fields = ['id', 'last_login', 'date_joined']
