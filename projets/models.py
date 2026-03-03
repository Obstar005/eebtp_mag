from django.db import models
from django.conf import settings
from django_countries.fields import CountryField
from users.models import CustomUser
from stocks.models import Produit


class Projet(models.Model):
    nom = models.CharField(max_length=255)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, 
                                related_name="createur_projet", null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    date_debut = models.DateField()
    date_fin = models.DateField(blank=True, null=True)
    pays = CountryField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    # Association des utilisateurs
    comptes = models.ManyToManyField(CustomUser, related_name="comptes_associes", blank=True)
    magasinier = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, related_name="magasinier_projet", null=True, blank=True)
    chef_projet = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, related_name="chef_de_projet", null=True, blank=True)
    chef_chantier = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, 
                                      related_name="chef_chantier", null=True, blank=True)
    cout_total_estime = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    cout_total_reel = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return self.nom

# Model to store photos related to a project
class ProjetPhoto(models.Model):
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="projets/photos/")
    date_upload = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Photo de {self.projet.nom}"
    
#Modèle magasain
class Magasin(models.Model):
    nom = models.CharField(max_length=255)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    adresse = models.CharField(max_length=255, blank=True, null=True)
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, 
                               related_name="magasin_associé", blank=True, null=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, 
                                related_name="createur_magasin", null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.nom
    
# Modèle pour les stocks dans un magasin
class StockItem(models.Model):
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name="stocks")
    magasin = models.ForeignKey(Magasin, on_delete=models.CASCADE, related_name="stocks")
    quantite = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    quantite_seuil = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # seuil minimum
    etat = models.CharField(max_length=50, choices=[
        ('neuf', 'Neuf'),
        ('usagé', 'Usagé'),
        ('endommagé', 'Endommagé'),
    ], default='neuf')

    date_ajout = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    add_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, 
                               related_name="ajouteur_stock", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    updated_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, 
                                   related_name="modificateur_stock", null=True, blank=True)

    class Meta:
        unique_together = ('produit', 'magasin')  # Un produit ne peut exister qu'une fois dans un magasin

    def __str__(self):
        return f"{self.produit.designation} - {self.magasin.nom} ({self.quantite} {self.produit.unite})"
