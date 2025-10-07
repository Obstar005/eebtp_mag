class StockItem {
  final int id;
  final int produit;
  final int magasin;
  final String? addByUser;
  final String? magasinName;
  final String? produitName;
  final String quantite;
  final String quantiteSeuil;
  final String etat;
  final String? dateAjout;
  final String? dateModification;
  final bool isActive;
  final int? addBy;
  final int? updatedBy;

  StockItem({
    required this.id,
    required this.produit,
    required this.magasin,
    this.addByUser,
    this.magasinName,
    this.produitName,
    required this.quantite,
    required this.quantiteSeuil,
    required this.etat,
    this.dateAjout,
    this.dateModification,
    required this.isActive,
    this.addBy,
    this.updatedBy, 
  });

  factory StockItem.fromJson(Map<String, dynamic> json) {
    return StockItem(
      id: json['id'],
      produit: json['produit'],
      magasin: json['magasin'],
      addByUser: json['add_by_user'],
      magasinName: json['magasin_name'],
      produitName: json['produit_name'],
       quantite: json['quantite']?.toString() ?? '0',
      quantiteSeuil: json['quantite_seuil']?.toString() ?? '0',
      etat: json['etat'],
      dateAjout: json['date_ajout'],
      dateModification: json['date_modification'],
      isActive: json['is_active'],
      addBy: json['add_by'],
      updatedBy: json['updated_by'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'produit': produit,
      'magasin': magasin,
      'quantite': quantite,
      'quantite_seuil': quantiteSeuil,
      'etat': etat,
      'is_active': isActive,
      'add_by': addBy,
      'updated_by': updatedBy,
    };
  }
}
