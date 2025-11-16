from rest_framework import serializers
from .models import Entree, Sortie
from projets.models import Magasin, StockItem
from projets.serializers import StockItemSerializer, MagasinSerializer
from users.models import CustomUser


class SortieSerializer(serializers.ModelSerializer):
    magasin = serializers.PrimaryKeyRelatedField(queryset=Magasin.objects.all())
    stock_item = serializers.PrimaryKeyRelatedField(queryset=StockItem.objects.all())
    # make_by = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    stock_item_name = serializers.ReadOnlyField(source='stock_item.produit.designation')
    stock_item_type = serializers.ReadOnlyField(source='stock_item.produit.type')

    class Meta:
        model = Sortie
        fields = '__all__'
        read_only_fields = ['date_modif', 'make_by']

class EntreeSerializer(serializers.ModelSerializer):
    magasin = serializers.PrimaryKeyRelatedField(queryset=Magasin.objects.all())
    stock_item = serializers.PrimaryKeyRelatedField(queryset=StockItem.objects.all())
    source = serializers.PrimaryKeyRelatedField(queryset=Sortie.objects.all(), required=False, allow_null=True)
    # make_by = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    stock_item_name = serializers.ReadOnlyField(source='stock_item.produit.designation')
    stock_item_type = serializers.ReadOnlyField(source='stock_item.produit.type')

    class Meta:
        model = Entree
        fields = '__all__'
        read_only_fields = ['date_modif', 'make_by']