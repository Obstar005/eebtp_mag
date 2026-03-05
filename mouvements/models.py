from django.db import models
from projets.models import Magasin
from users.models import CustomUser
from projets.models import StockItem
from demandes.models import Demande

class Sortie(models.Model):
    magasin = models.ForeignKey(Magasin, on_delete=models.CASCADE)
    stock_item = models.ForeignKey(StockItem, on_delete=models.CASCADE)
    quantite_m = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date_creation = models.DateTimeField(auto_now_add=True)#
    date_modif = models.DateTimeField(auto_now=True)
    make_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, 
                               related_name="declareur_entree", null=True, blank=True)
    objet = models.TextField()
    nom_receveur = models.CharField(max_length=100)
    tel_receveur = models.CharField(max_length=20)
    fonction_receveur = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    def __str__(self):
        return f"Sortie de {self.quantite_m} de {self.stock_item.produit.designation} du magasin {self.magasin.nom}"
    
class Entree(models.Model):
    magasin = models.ForeignKey(Magasin, on_delete=models.CASCADE)
    type = models.CharField(max_length=50, choices=[('Livraison', 'Livraison'), ('Retour', 'Retour')])
    stock_item = models.ForeignKey(StockItem, on_delete=models.CASCADE)
    quantite_m = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    source = models.ForeignKey(Sortie, on_delete=models.SET_NULL, null=True, blank=True)
    nom_deposant = models.CharField(max_length=100, null=True, blank=True)
    tel_deposant = models.CharField(max_length=20, null=True, blank=True)
    fonction_deposant = models.CharField(max_length=100, null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)#
    date_modif = models.DateTimeField(auto_now=True)
    make_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, 
                               related_name="declareur_sortie", null=True, blank=True)
    societe = models.CharField(max_length=100, null=True, blank=True)
    tel_societe = models.CharField(max_length=20, null=True, blank=True)
    nom_livreur = models.CharField(max_length=100, null=True, blank=True)
    tel_livreur = models.CharField(max_length=20, null=True, blank=True)
    signature_livreur = models.ImageField(upload_to='signatures/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    demande_source = models.ForeignKey(Demande, on_delete=models.SET_NULL, null=True, blank=True) 
    

