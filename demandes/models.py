from django.db import models
from projets.models import StockItem, Magasin
from users.models import CustomUser


class Demande(models.Model):
    number = models.CharField(max_length=255, unique=True, editable= False)
    stock_item = models.ForeignKey(StockItem, on_delete=models.CASCADE)
    magasin = models.ForeignKey(Magasin, on_delete=models.CASCADE)
    quantite = models.FloatField()
    raison = models.TextField()
    statut = models.CharField(max_length=50, choices=[
        ('Emise', 'Émise'),
        ('Confirmée', 'Confirmée'),
        ('Approuvée', 'Approuvée'),
        ('Validée', 'Validée'),
        ('Rejetée', 'Rejetée'),
        ('Livrée', 'Livrée')
    ])
    date_creation = models.DateTimeField(auto_now_add=True)
    emis_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_emises')
    date_emission = models.DateTimeField(null=True)
    confirme_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_confirmées')
    date_confirmation = models.DateTimeField(null=True)
    approve_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_approuvées')
    date_approbation = models.DateTimeField(null=True)
    valide_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_validées')
    date_validation = models.DateTimeField(null=True)
    motif_rejet = models.TextField(null=True, blank=True)
    rejete_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_rejetées')
    date_rejet = models.DateTimeField(null=True)