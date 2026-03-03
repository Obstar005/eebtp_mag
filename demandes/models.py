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
    # rejet_conf_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_rejetées_confirmation')
    # date_rejet_conf = models.DateTimeField(null=True)
    approve_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_approuvées', verbose_name='Approuvé ou non par')
    date_approbation = models.DateTimeField(null=True)
    commentaire_approbation = models.TextField(null=True, blank=True)
    quantite_approuv = models.FloatField(null=True, blank=True)
    # rejet_approuv_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_rejetées_approbation')
    # date_rejet_approuv = models.DateTimeField(null=True)
    valide_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_validées', verbose_name='Validé ou non par')
    date_validation = models.DateTimeField(null=True)
    commentaire_validation = models.TextField(null=True, blank=True)
    quantite_valid = models.FloatField(null=True, blank=True)
    cout_total_approx = models.FloatField(null=True, blank=True)
    # rejet_valid_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='demandes_rejetées_validation')
    # date_rejet_valid = models.DateTimeField(null=True)
    is_valide = models.BooleanField(default=True)