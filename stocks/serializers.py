from rest_framework import serializers
from .models import Produit

class ProduitSerializer(serializers.ModelSerializer):
    nom_magasin = serializers.StringRelatedField()#Pour Affichage lisible du magasin

    class Meta: 
        model = Produit
        fields = '__all__'