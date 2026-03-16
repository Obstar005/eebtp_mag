class Demande {
  final int id;
  final String magasinName;
  final String stockItemName;
  final String emisParName;
  final String confirmeParName;
  final String approveParName;
  final String valideParName;
  final String rejeteParName;
  final String number;
  final num quantite;
  final String raison;
  final String statut;
  final DateTime dateCreation;
  final DateTime? dateEmission;
  final DateTime? dateConfirmation;
  final DateTime? dateApprobation;
  final DateTime? dateValidation;
  final String? motifRejet;
  final DateTime? dateRejet;
  final int stockItem;
  final int magasin;
  final int? emisPar;
  final int? confirmePar;
  final int? approvePar;
  final int? validePar;
  final int? rejetePar;

  Demande({
    required this.id,
    required this.magasinName,
    required this.stockItemName,
    required this.emisParName,
    required this.confirmeParName,
    required this.approveParName,
    required this.valideParName,
    required this.rejeteParName,
    required this.number,
    required this.quantite,
    required this.raison,
    required this.statut,
    required this.dateCreation,
    this.dateEmission,
    this.dateConfirmation,
    this.dateApprobation,
    this.dateValidation,
    this.motifRejet,
    this.dateRejet,
    required this.stockItem,
    required this.magasin,
    this.emisPar,
    this.confirmePar,
    this.approvePar,
    this.validePar,
    this.rejetePar,
  });

  factory Demande.fromJson(Map<String, dynamic> json) => Demande(
        id: json['id'] ?? 0,
        magasinName: json['magasin_name'] ?? '',
        stockItemName: json['stock_item_name'] ?? '',
        emisParName: json['emis_par_name'] ?? '',
        confirmeParName: json['confirme_par_name'] ?? '',
        approveParName: json['approve_par_name'] ?? '',
        valideParName: json['valide_par_name'] ?? '',
        rejeteParName: json['rejete_par_name'] ?? '',
        number: json['number'] ?? '',
        
        // 🔥 Correction principale : éviter le crash si quantite = null
        quantite: (json['quantite'] ?? 0) as num,

        raison: json['raison'] ?? '',
        statut: json['statut'] ?? '',
        dateCreation: DateTime.parse(json['date_creation']),
        dateEmission: json['date_emission'] != null ? DateTime.parse(json['date_emission']) : null,
        dateConfirmation: json['date_confirmation'] != null ? DateTime.parse(json['date_confirmation']) : null,
        dateApprobation: json['date_approbation'] != null ? DateTime.parse(json['date_approbation']) : null,
        dateValidation: json['date_validation'] != null ? DateTime.parse(json['date_validation']) : null,
        motifRejet: json['motif_rejet'],
        dateRejet: json['date_rejet'] != null ? DateTime.parse(json['date_rejet']) : null,
        stockItem: json['stock_item'] ?? 0,
        magasin: json['magasin'] ?? 0,
        emisPar: json['emis_par'],
        confirmePar: json['confirme_par'],
        approvePar: json['approve_par'],
        validePar: json['valide_par'],
        rejetePar: json['rejete_par'],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "magasin_name": magasinName,
        "stock_item_name": stockItemName,
        "emis_par_name": emisParName,
        "confirme_par_name": confirmeParName,
        "approve_par_name": approveParName,
        "valide_par_name": valideParName,
        "rejete_par_name": rejeteParName,
        "number": number,
        "quantite": quantite,
        "raison": raison,
        "statut": statut,
        "date_creation": dateCreation.toIso8601String(),
        "date_emission": dateEmission?.toIso8601String(),
        "date_confirmation": dateConfirmation?.toIso8601String(),
        "date_approbation": dateApprobation?.toIso8601String(),
        "date_validation": dateValidation?.toIso8601String(),
        "motif_rejet": motifRejet,
        "date_rejet": dateRejet?.toIso8601String(),
        "stock_item": stockItem,
        "magasin": magasin,
        "emis_par": emisPar,
        "confirme_par": confirmePar,
        "approve_par": approvePar,
        "valide_par": validePar,
        "rejete_par": rejetePar,
      };
}
