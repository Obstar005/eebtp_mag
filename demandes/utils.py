#demandes/utils.py

#On va ecire une fonction pour calculer le cout total d'une demande en fonction de la quantité demandée et du prix unitaire de l'article demandé.
def calculer_cout_total(demande):
    cout_total = demande.quantite_approuv * float(demande.stock_item.produit.unit_price)
    return cout_total

#On va ecrire une fonctioon pour calculer la durée de traitement d'une demande en fonction de la date d'emission et de la date de validation ou de rejet de la demande.
def calculer_duree_traitement(demande):
    if demande.statut == 'Validée' or demande.statut == 'Rejetée':
        duree = demande.date_validation - demande.date_emission
        return duree
    else:
        return None