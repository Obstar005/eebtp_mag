# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Projet, Magasin, ProjetPhoto, StockItem
from stocks.models import Produit
from django_countries.serializer_fields import CountryField

User = get_user_model()

class ProjetSerializer(serializers.ModelSerializer):
    creator = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    comptes = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, required=False)
    pays = CountryField(name_only=True)

    class Meta:
        model = Projet
        fields = "__all__"
        read_only_fields = ['creator', 'date_creation', 'date_modification']

class MagasinSerializer(serializers.ModelSerializer):
    creator = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    class Meta:
        model = Magasin
        fields = '__all__'
        read_only_fields = ['creator', 'date_creation', 'date_modification']

class ProjetPhotoSerializer(serializers.ModelSerializer):
    projet = serializers.PrimaryKeyRelatedField(queryset=Projet.objects.all())

    class Meta:
        model = ProjetPhoto
        fields = '__all__'
        read_only_fields = ['date_upload']

class StockItemSerializer(serializers.ModelSerializer):
    produit = serializers.PrimaryKeyRelatedField(queryset=Produit.objects.all())
    magasin = serializers.PrimaryKeyRelatedField(queryset=Magasin.objects.all())
    add_by_user = serializers.ReadOnlyField(source='add_by.username')
    magasin_name = serializers.ReadOnlyField(source='magasin.nom')
    produit_name = serializers.ReadOnlyField(source='produit.designation')

    class Meta:
        model = StockItem
        fields = '__all__'
        read_only_fields = ['date_ajout']
            