class Demande {
  final int id;

  // Read-only names
  final String magasinName;
  final String stockItemName;
  final String stockItemUnite;
  final String emisParName;
  final String confirmeParName;
  final String approveParName;
  final String valideParName;
  final String rejeteParName;

  final String number; // readOnly
  final num quantiteDem; // quantite_dem*
  final String raison; // required

  final String statut; // readOnly enum

  final DateTime dateCreation; // readOnly
  final DateTime? dateEmission;
  final DateTime? dateConfirmation;
  final DateTime? dateApprobation;
  final DateTime? dateValidation;
  final DateTime? dateRejet;

  final String? commentaireConfirmation;
  final String? commentaireApprobation;
  final String? commentaireValidation;

  final num? quantiteApprouv;
  final num? quantiteValid;

  final num? coutTotalApprox; // readOnly

  final bool isValide;

  // Foreign keys
  final int stockItem;
  final int magasin;
  final int? emisPar;
  final int? confirmePar;
  final int? approvePar;
  final int? validePar;

  Demande({
    required this.id,
    required this.magasinName,
    required this.stockItemName,
    required this.stockItemUnite,
    required this.emisParName,
    required this.confirmeParName,
    required this.approveParName,
    required this.valideParName,
    required this.rejeteParName,
    required this.number,
    required this.quantiteDem,
    required this.raison,
    required this.statut,
    required this.dateCreation,
    this.dateEmission,
    this.dateConfirmation,
    this.dateApprobation,
    this.dateValidation,
    this.dateRejet,
    this.commentaireConfirmation,
    this.commentaireApprobation,
    this.commentaireValidation,
    this.quantiteApprouv,
    this.quantiteValid,
    this.coutTotalApprox,
    required this.isValide,
    required this.stockItem,
    required this.magasin,
    this.emisPar,
    this.confirmePar,
    this.approvePar,
    this.validePar,
  });

  factory Demande.fromJson(Map<String, dynamic> json) {
    return Demande(
      id: json['id'] ?? 0,

      magasinName: json['magasin_name'] ?? '',
      stockItemName: json['stock_item_name'] ?? '',
      stockItemUnite: json['stock_item_unite'] ?? '',
      emisParName: json['emis_par_name'] ?? '',
      confirmeParName: json['confirme_par_name'] ?? '',
      approveParName: json['approve_par_name'] ?? '',
      valideParName: json['valide_par_name'] ?? '',
      rejeteParName: json['rejete_par_name'] ?? '',

      number: json['number'] ?? '',
      quantiteDem: (json['quantite_dem'] ?? 0) as num,
      raison: json['raison'] ?? '',
      statut: json['statut'] ?? '',

      dateCreation: DateTime.parse(json['date_creation']),
      dateEmission: json['date_emission'] != null ? DateTime.parse(json['date_emission']) : null,
      dateConfirmation: json['date_confirmation'] != null ? DateTime.parse(json['date_confirmation']) : null,
      dateApprobation: json['date_approbation'] != null ? DateTime.parse(json['date_approbation']) : null,
      dateValidation: json['date_validation'] != null ? DateTime.parse(json['date_validation']) : null,
      dateRejet: json['date_rejet'] != null ? DateTime.parse(json['date_rejet']) : null,

      commentaireConfirmation: json['commentaire_confirmation'],
      commentaireApprobation: json['commentaire_approbation'],
      commentaireValidation: json['commentaire_validation'],

      quantiteApprouv: json['quantite_approuv'],
      quantiteValid: json['quantite_valid'],

      coutTotalApprox: json['cout_total_approx'],

      isValide: json['is_valide'] ?? false,

      stockItem: json['stock_item'] ?? 0,
      magasin: json['magasin'] ?? 0,
      emisPar: json['emis_par'],
      confirmePar: json['confirme_par'],
      approvePar: json['approve_par'],
      validePar: json['valide_par'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "magasin_name": magasinName,
      "stock_item_name": stockItemName,
      "stock_item_unite": stockItemUnite,
      "emis_par_name": emisParName,
      "confirme_par_name": confirmeParName,
      "approve_par_name": approveParName,
      "valide_par_name": valideParName,
      "rejete_par_name": rejeteParName,
      "number": number,
      "quantite_dem": quantiteDem,
      "raison": raison,
      "statut": statut,
      "date_creation": dateCreation.toIso8601String(),
      "date_emission": dateEmission?.toIso8601String(),
      "date_confirmation": dateConfirmation?.toIso8601String(),
      "date_approbation": dateApprobation?.toIso8601String(),
      "date_validation": dateValidation?.toIso8601String(),
      "date_rejet": dateRejet?.toIso8601String(),
      "commentaire_confirmation": commentaireConfirmation,
      "commentaire_approbation": commentaireApprobation,
      "commentaire_validation": commentaireValidation,
      "quantite_approuv": quantiteApprouv,
      "quantite_valid": quantiteValid,
      "cout_total_approx": coutTotalApprox,
      "is_valide": isValide,
      "stock_item": stockItem,
      "magasin": magasin,
      "emis_par": emisPar,
      "confirme_par": confirmePar,
      "approve_par": approvePar,
      "valide_par": validePar,
    };
  }
}
