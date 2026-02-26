class Entree {
  final int id;
  final int magasin;
  final int stockItem;
  final int? source;
  final String? stockItemName;
  final String? stockItemType;
  final String type;
  final String quantiteM;
  final String nomDeposant;
  final String telDeposant;
  final String fonctionDeposant;
  final String? dateCreation;
  final String? dateModif;
  final String societe;
  final String telSociete;
  final String nomLivreur;
  final String telLivreur;
  final String? signatureLivreur;
  final int? demande_source;
  final bool isActive;
  final int? makeBy;

  Entree({
    required this.id,
    required this.magasin,
    required this.stockItem,
    this.source,
    this.stockItemName,
    this.stockItemType,
    required this.type,
    required this.quantiteM,
    required this.nomDeposant,
    required this.telDeposant,
    required this.fonctionDeposant,
    this.dateCreation,
    this.dateModif,
    required this.societe,
    required this.telSociete,
    required this.nomLivreur,
    required this.telLivreur,
    this.signatureLivreur,
    this.demande_source,
    required this.isActive,
    this.makeBy,
  });

  factory Entree.fromJson(Map<String, dynamic> json) {
    return Entree(
      id: json['id'],
      magasin: json['magasin'],
      stockItem: json['stock_item'],
      source: json['source'],
      stockItemName: json['stock_item_name'],
      stockItemType: json['stock_item_type'],
      type: json['type'] ?? '',
      quantiteM: json['quantite_m'] ?? '',
      nomDeposant: json['nom_deposant'] ?? '',
      telDeposant: json['tel_deposant'] ?? '',
      fonctionDeposant: json['fonction_deposant'] ?? '',
      dateCreation: json['date_creation'],
      dateModif: json['date_modif'],
      societe: json['societe'] ?? '',
      telSociete: json['tel_societe'] ?? '',
      nomLivreur: json['nom_livreur'] ?? '',
      telLivreur: json['tel_livreur'] ?? '',
      signatureLivreur: json['signature_livreur'],
      demande_source: json['demande_source'],
      isActive: json['is_active'] ?? true,
      makeBy: json['make_by'],
    );
  }
 
  Map<String, dynamic> toJson() {
    return {
      'magasin': magasin,
      'stock_item': stockItem,
      'source': source,
      'type': type,
      'quantite_m': quantiteM,
      'nom_deposant': nomDeposant,
      'tel_deposant': telDeposant,
      'fonction_deposant': fonctionDeposant,
      'societe': societe,
      'tel_societe': telSociete,
      'nom_livreur': nomLivreur,
      'tel_livreur': telLivreur,
      'demande_source': demande_source,
      'is_active': isActive,
    };
  }
}