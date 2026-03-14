from django.core.management.base import BaseCommand
from users.models import PermissionCustom


class Command(BaseCommand):
    help = "Créer ou mettre à jour les permissions initiales"

    def handle(self, *args, **kwargs):

        permissions = [
            ("user.create", "Créer un utilisateur"),
            ("user.update", "Modifier un utilisateur"),
            ("user.delete", "Supprimer un utilisateur"),
            ("user.view", "Voir le détail d'un utilisateur"),
            ("users.view", "Voir la liste des utilisateurs"), #Permission pour voir la liste des utilisateurs dans le menu de navigation et dans la page de gestion des utilisateurs

            ("profil.create", "Créer un profil"),
            ("profil.update", "Modifier un profil"),
            ("profil.delete", "Supprimer un profil"),
            ("profil.view", "Voir les details d'un profil"),
            ("profils.view", "Voir la liste des profils"), #Permission pour voir la liste des profils dans le menu de navigation et dans la page de gestion des profils

            ("projet.create", "Créer un projet"),
            ("projet.update", "Modifier un projet"),
            ("projet.delete", "Supprimer un projet"),
            ("projet.view", "Voir les détails d'un projet"),
            ("projets.view", "Voir la liste des projets"), #Permission pour voir la liste des projets dans le menu de navigation et dans la page de gestion des projets

            ("magasin.create", "Créer un magasin"),
            ("magasin.update", "Modifier un magasin"),
            ("magasin.delete", "Supprimer un magasin"),
            ("magasin.view", "Voir les détails d'un magasin"),
            ("magasins.view", "Voir la liste des magasins"), #Permission pour voir la liste des magasins dans le menu de navigation et dans la page de gestion des magasins

            ("article.create", "Créer un article"),
            ("article.update", "Modifier un article"),
            ("article.delete", "Supprimer un article"),
            ("article.view", "Voir les détails d'un article"),
            ("articles.view", "Voir la liste des articles"), #Permission pour voir la liste des articles dans le menu de navigation et dans la page de gestion des articles

            ("stock_item.create", "Créer un stock_item"),
            ("stock_item.update", "Modifier un stock_item"),
            ("stock_item.delete", "Supprimer un stock_item"),
            ("stock_item.view", "Voir les détails d'un stock_item"),
            ("stock_items.view", "Voir la liste des stock_items"), #Permission pour voir la liste des stock_items dans le menu de navigation et dans la page de gestion des stock_items

            ("entree.create", "Créer une entrée"),
            ("entree.update", "Modifier une entrée"),
            ("entree.delete", "Supprimer une entrée"),
            ("entree.view", "Voir les détails d'une entrée"),
            ("entrees.view", "Voir la liste des entrées"), #Permission pour voir la liste des entrées dans le menu de navigation et dans la page de gestion des entrées

            ("sortie.create", "Créer une sortie"),
            ("sortie.update", "Modifier une sortie"),
            ("sortie.delete", "Supprimer une sortie"),
            ("sortie.view", "Voir les détails d'une sortie"),
            ("sorties.view", "Voir la liste des sorties"), #Permission pour voir la liste des sorties dans le menu de navigation et dans la page de gestion des sorties

            ("demande.create", "Créer ou émettre une demande"),
            ("demande.confirm", "Confirmer une demande"),
            ("demande.approv", "Approuver une demande"),
            ("demande.valid", "Valider une demande"),
            ("demande.rejet", "Rejeter une demande"),
            ("demande.delete", "Supprimer une demande"),
            ("demande.view", "Voir les détails d'une demande"),
            ("demandes.view", "Voir la liste des demandes"), #Permission pour voir la liste des demandes dans le menu de navigation et dans la page de gestion des demandes

            ("rapport.create", "Générer un rapport"),
            ("statistique.view", "Voir les statistiques"),
            ("historique.view", "Voir l'historique des actions dans le système"),
        ]

        codes_permissions = []

        for code, libelle in permissions:
            perm, created = PermissionCustom.objects.update_or_create(
                code=code,
                defaults={
                    "libelle": libelle
                }
            )

            codes_permissions.append(code)

            if created:
                self.stdout.write(self.style.SUCCESS(f"Permission créée : {code}"))
            else:
                self.stdout.write(self.style.WARNING(f"Permission mise à jour : {code}"))

        # Supprimer les permissions qui ne sont plus dans le code
        PermissionCustom.objects.exclude(code__in=codes_permissions).delete()

        self.stdout.write(self.style.SUCCESS("Seed des permissions terminé avec succès !"))