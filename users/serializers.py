# serializers.py
from rest_framework import serializers
from .models import CustomUser, Profil, PermissionCustom
from django_countries.serializer_fields import CountryField
from projets.serializers import ProjetSerializer
from projets.models import Projet

class PermissionCustomSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermissionCustom
        fields = ['id', 'code', 'libelle', 'create_by']
#         # read_only_fields = ['id', 'date_creation', 'create_by']

class ProfilSerializer(serializers.ModelSerializer):
    # 👉 pour écrire (POST / PUT)
    # permissions = serializers.PrimaryKeyRelatedField(
    #     many=True,
    #     queryset=Acces.objects.all(),
    #     write_only=True
    # )

    # 👉 pour lire (GET)
    permissions_details = PermissionCustomSerializer(
        source='permissions',
        many=True,
        read_only=True
    )

    class Meta:
        model = Profil
        fields = ['id', 'libelle', 'description', 'permissions', 'permissions_details']


class CustomUserSerializer(serializers.ModelSerializer):
    nationality = CountryField(name_only=True)
    password = serializers.CharField(write_only=True, required=False)
    projets = serializers.PrimaryKeyRelatedField(many=True, queryset=Projet.objects.all(), required=False)
    magasin = serializers.ReadOnlyField(source='magasin.nom')
    profil_name = serializers.ReadOnlyField(source='profil.libelle')
    class Meta:
        model = CustomUser
        # fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }
        exclude = ['groups', 'user_permissions']
        
    def create(self, validated_data):
        # Pour gérer un mot de passe
        password = validated_data.pop("password", None)
        projets_data = validated_data.pop('projets', None)
        groups_data = validated_data.pop('groups', None)

        user = CustomUser.objects.create(**validated_data)
        if password:
            user.set_password(password)
        if projets_data:
            user.projets.set(projets_data)
        if groups_data:
            user.groups.set(groups_data)  # 👈 CORRECTION

        user.save()
        return user

    def update(self, instance, validated_data):
        projets_data = validated_data.pop('projets', None)
        password = validated_data.pop("password", None)
        groups_data = validated_data.pop('groups', None)

        # Mettre à jour les champs simples
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)

        # Mettre à jour les ManyToMany
        if projets_data is not None:
            instance.projets.set(projets_data)  # Remplace les projets existants par les nouveaux
        if groups_data is not None:
            instance.groups.set(groups_data)

        instance.save()
        return instance
