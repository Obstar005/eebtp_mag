class ArticleStock {
  final int id;
  final String designation;
  final String type;
  final String unite;
  final DateTime dateCreation;
  final DateTime dateModif;
  final bool isActive;

  ArticleStock({
    required this.id,
    required this.designation,
    required this.type,
    required this.unite,
    required this.dateCreation,
    required this.dateModif,
    required this.isActive,
  });

  factory ArticleStock.fromJson(Map<String, dynamic> json) => ArticleStock(
    id: json['id'],
    designation: json['designation'],
    type: json['type'],
    unite: json['unite'],
    dateCreation: DateTime.parse(json['date_creation']),
    dateModif: DateTime.parse(json['date_modif']),
    isActive: json['is_active'],
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'designation': designation,
    'type': type,
    'unite': unite,
    'date_creation': dateCreation.toIso8601String(),
    'date_modif': dateModif.toIso8601String(),
    'is_active': isActive,
  };
}
