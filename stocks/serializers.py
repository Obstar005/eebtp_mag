from rest_framework import serializers
from .models import Produit

class ProduitSerializer(serializers.ModelSerializer):
    nom_magasin = serializers.StringRelatedField()#Pour Affichage lisible du magasin
    is_active = serializers.BooleanField(default=True, required=False)

    class Meta: 
        model = Produit
        fields = '__all__'
        read_only_fields = ['id', 'date_creation', 'date_modif', 'is_active']