from django.db import models
from projets.models import StockItem, Magasin
from users.models import CustomUser
class Demande(models.Model):
    number = models.IntegerField()
    stock_item = models.ForeignKey(StockItem, on_delete=models.CASCADE)
    magasin = models.ForeignKey(Magasin, on_delete=models.CASCADE)
    quantite = models.FloatField()
    statut = models.CharField(max_length=50, choices=[
        ('Emise', 'Émise'),
        ('Confirmée', 'Confirmée'),
        ('Approuvée', 'Approuvée'),
        ('Validée', 'Validée'),
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