# demandes/serializers.py
from rest_framework import serializers
from .models import Demande

class DemandeSerializer(serializers.ModelSerializer):
    magasin_name = serializers.ReadOnlyField(source='magasin.nom')
    stock_item_name = serializers.ReadOnlyField(source='stock_item.produit.designation')
    stock_item_unite = serializers.ReadOnlyField(source='stock_item.produit.unite')
    emis_par_name = serializers.ReadOnlyField(source='emis_par.username')
    confirme_par_name = serializers.ReadOnlyField(source='confirme_par.username')
    approve_par_name = serializers.ReadOnlyField(source='approve_par.username')
    valide_par_name = serializers.ReadOnlyField(source='valide_par.username')
    rejete_par_name = serializers.ReadOnlyField(source='rejete_par.username')
    is_active = serializers.BooleanField(default=True, required=False)

    class Meta:
        model = Demande
        fields = '__all__'
        read_only_fields = [
            'number', 'date_creation',
            'statut',
            'emis_par', 'date_emission',
            'confirme_par', 'date_confirmation',
            'approve_par', 'date_approbation',
            'valide_par', 'date_validation',
            'rejete_par', 'date_rejet', 'motif_rejet',
            'cout_total_approx', 'duree_traitement'
        ]
