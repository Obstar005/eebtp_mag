class Statistiques {
  final int livraisons;
  final int sorties;
  final int retours;
  final Map<String, dynamic> tauxVariation;

  Statistiques({
    required this.livraisons,
    required this.sorties,
    required this.retours,
    required this.tauxVariation,
  });

  factory Statistiques.fromJson(Map<String, dynamic> json) {
    return Statistiques(
      livraisons: json['livraisons'] ?? 0,
      sorties: json['sorties'] ?? 0,
      retours: json['retours'] ?? 0,
      tauxVariation: json['taux_variation'] ?? {},
    );
  }
}
class StockStats {
  final int totalArticles;

  StockStats({required this.totalArticles});

  factory StockStats.fromJson(Map<String, dynamic> json) {
    return StockStats(
      totalArticles: json['total_articles'] is int
          ? json['total_articles']
          : int.tryParse(json['total_articles'].toString()) ?? 0,
    );
  }
}
