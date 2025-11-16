import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:eebtp_frontend/models/statistiques.dart';

class StatsService {
  final String baseUrl = 'http://38.242.139.218:8001';
  final String? token;

  StatsService({this.token});

  Map<String, String> _headers() {
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // 📊 Statistiques des mouvements (livraisons, sorties, retours)
  Future<Statistiques> getMouvementsStats(int magasinId, String periode) async {
    final response = await http.get(
      Uri.parse('$baseUrl/Mouvements/stats/$magasinId/$periode'),
      headers: _headers(),
    );

    if (response.statusCode == 200) {
      return Statistiques.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur lors du chargement des statistiques mouvements');
    }
  }

  // 📦 Statistiques des stocks
  Future<StockStats> getStocksStats(int magasinId, String unite) async {
    final response = await http.get(
      Uri.parse('$baseUrl/Stocks/stats/$magasinId/$unite'),
      headers: _headers(),
    );

    if (response.statusCode == 200) {
      return StockStats.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur lors du chargement des statistiques stocks');
    }
  }
}
