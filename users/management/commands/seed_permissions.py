from django.core.management.base import BaseCommand
from users.models import Acces

class Command(BaseCommand):
    help = "Créer les Permissions initiaux"

    def handle(self, *args, **kwargs):
        permissions = [
            ("user.create", "Créer un utilisateur"),
            ("user.update", "Modifier un utilisateur"),
            ("user.delete", "Supprimer un utilisateur"),
            ("user.view", "Voir les utilisateurs"),
            ("profil.create", "Créer un profil"),
            ("profil.update", "Modifier un profil"),
            ("profil.delete", "Supprimer un profil"),
            ("profil.view", "Voir les profils"),
            ("projet.create", "Créer un projet"),
            ("projet.update", "Modifier un projet"),
            ("projet.delete", "Supprimer un projet"),
            ("projet.view", "Voir les projets"),
            ("magasin.create", "Créer un magasin"),
            ("magasin.update", "Modifier un magasin"),
            ("magasin.delete", "Supprimer un magasin"),
            ("magasin.view", "Voir les magasins"),
            ("article.create", "Créer un article"),
            ("article.update", "Modifier un article"),
            ("article.delete", "Supprimer un article"),
            ("article.view", "Voir les articles"),
            ("stock_item.create", "Créer un stock_item"),
            ("stock_item.update", "Modifier un stock_item"),
            ("stock_item.delete", "Supprimer un stock_item"),
            ("stock_item.view", "Voir les stock_items"),
            ("entree.create", "Créer une entrée"),
            ("entree.update", "Modifier une entrée"),
            ("entree.delete", "Supprimer une entrée"),
            ("entree.view", "Voir les entrées"),
            ("sortie.create", "Créer une sortie"),
            ("sortie.update", "Modifier une sortie"),
            ("sortie.delete", "Supprimer une sortie"),
            ("sortie.view", "Voir les sorties"),
            ("demande.create", "Créer ou émettre une demande"),
            ("demande.confirm", "Confirmer une demande"),
            ("demande.approv", "Approuver une demande"),
            ("demande.valid", "Valider une demande"),
            ("demande.delete", "Supprimer une demande"),
            ("demande.view", "Voir les demandes"),
            ("rapport.create", "Générer un rapport"),
            ("statistique.view", "Voir les statistiques"),
            ("historique.view", "Voir l'historique des actions dans le système"),
        ]

        for code, libelle in permissions:
            Acces.objects.get_or_create(code=code, libelle=libelle)

        self.stdout.write(self.style.SUCCESS("Permissions créées avec succès !"))