# serializers.py
from rest_framework import serializers
from .models import CustomUser, Profil
from django_countries.serializer_fields import CountryField
from projets.serializers import ProjetSerializer
from projets.models import Projet

class ProfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profil
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    nationality = CountryField(name_only=True)
    password = serializers.CharField(write_only=True, required=False)
    projets = serializers.PrimaryKeyRelatedField(many=True, queryset=Projet.objects.all(), required=False)
    magasin = serializers.ReadOnlyField(source='magasin.nom')
    class Meta:
        model = CustomUser
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }
        
    def create(self, validated_data):
        # Pour gérer un mot de passe
        password = validated_data.pop("password", None)
        projets_data = validated_data.pop('projets', None)

        user = CustomUser.objects.create(**validated_data)
        if password:
            user.set_password(password)
        if projets_data:
            user.projets.set(projets_data)

        user.save()
        return user

    def update(self, instance, validated_data):
        projets_data = validated_data.pop('projets', None)
        password = validated_data.pop("password", None)

        # Mettre à jour les champs simples
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)

        instance.save()

        # Mettre à jour les ManyToMany
        if projets_data is not None:
            instance.projets.set(projets_data)  # ← la bonne façon

        return instance
