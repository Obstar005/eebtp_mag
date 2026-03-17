class Sortie {
  final int id;
  final int magasin;
  final int stockItem;
  final String? stockItemName;
  final String? stockItemType;
  final String? stockItemUnite;
  final String quantiteM;
  final String? dateCreation;
  final String? dateModif;
  final String objet;
  final String nomReceveur;
  final String telReceveur;
  final String fonctionReceveur;
  final bool isActive;
  final int? makeBy;

  Sortie({
    required this.id,
    required this.magasin,
    required this.stockItem,
    this.stockItemName,
    this.stockItemType,
    this.stockItemUnite,
    required this.quantiteM,
    this.dateCreation,
    this.dateModif,
    required this.objet,
    required this.nomReceveur,
    required this.telReceveur,
    required this.fonctionReceveur,
    required this.isActive,
    this.makeBy,
  });

  factory Sortie.fromJson(Map<String, dynamic> json) {
    return Sortie(
      id: json['id'],
      magasin: json['magasin'],
      stockItem: json['stock_item'],
      stockItemName: json['stock_item_name'],
      stockItemType: json['stock_item_type'],
      stockItemUnite: json['stock_item_unite'], 
      quantiteM: json['quantite_m'],
      dateCreation: json['date_creation'],
      dateModif: json['date_modif'],
      objet: json['objet'],
      nomReceveur: json['nom_receveur'],
      telReceveur: json['tel_receveur'],
      fonctionReceveur: json['fonction_receveur'],
      isActive: json['is_active'],
      makeBy: json['make_by'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'magasin': magasin,
      'stock_item': stockItem,
      'quantite_m': quantiteM,
      'objet': objet,
      'nom_receveur': nomReceveur,
      'tel_receveur': telReceveur,
      'fonction_receveur': fonctionReceveur,
      'is_active': isActive,
    };
  }
}
