from django.db import models
from projets.models import StockItem, Magasin
from users.models import CustomUser


class Demande(models.Model):
    number = models.CharField(max_length=255, unique=True, editable= False)
    stock_item = models.ForeignKey(StockItem, on_delete=models.CASCADE)
    magasin = models.ForeignKey(Magasin, on_delete=models.CASCADE)
    quantite_dem = models.FloatField()
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
    confirme_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_confirmées', verbose_name='Confirmé ou non par')#Faut juste noter que ce champ contiendra l'id de celui qui a intervenu pour confirmation de la demande, il peut confimer ou rejeter, meme chose pour les autres champs
    date_confirmation = models.DateTimeField(null=True)
    commentaire_confirmation = models.TextField(null=True, blank=True)
    approve_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_approuvées', verbose_name='Approuvé ou non par')
    date_approbation = models.DateTimeField(null=True)
    commentaire_approbation = models.TextField(null=True, blank=True)
    is_quantity_reduced_by_approb = models.BooleanField(default=False)  # Indique si la quantité a été réduite lors de l'approbation
    quantite_approuv = models.FloatField(null=True, blank=True)
    valide_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_validées', verbose_name='Validé ou non par')
    date_validation = models.DateTimeField(null=True)
    commentaire_validation = models.TextField(null=True, blank=True)
    is_quantity_reduced_by_valid = models.BooleanField(default=False)  # Indique si la quantité a été réduite lors de la validation
    quantite_valid = models.FloatField(null=True, blank=True)
    cout_total_approx = models.FloatField(null=True, blank=True, verbose_name='Coût total approximatif de la demande après approbation')  # Coût total approximatif basé sur la quantité validée et le prix unitaire du produit
    is_valide = models.BooleanField(default=True)
    duree_traitement = models.DurationField(null=True, blank=True, verbose_name='Durée de traitement de la demande')  # Durée entre l'émission et la validation ou le rejet de la demande