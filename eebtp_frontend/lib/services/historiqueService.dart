import 'dart:convert';
import 'package:eebtp_frontend/models/history.dart';
import 'package:http/http.dart' as http;

class HistoryService {
  final String baseUrl = 'http://38.242.139.218:8001';

  /// 🔹 Récupérer l'historique des actions de l'utilisateur connecté, filtré par période
  Future<List<HistoriqueAction>> getHistoriqueUser(String token, String periode) async {
    final url = Uri.parse('$baseUrl/App/historique-user/$periode');

    try {
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        try {
          final data = jsonDecode(response.body);
          if (data is List) {
            return data
                .map((item) => HistoriqueAction.fromJson(item as Map<String, dynamic>))
                .toList();
          } else {
            throw FormatException('Réponse inattendue : attendu une liste');
          }
        } catch (e) {
          throw FormatException('Erreur de parsing JSON : $e');
        }
      } else if (response.statusCode == 401) {
        throw Exception('Non autorisé : token invalide ou expiré');
      } else if (response.statusCode == 403) {
        throw Exception('Accès refusé : permissions insuffisantes');
      } else if (response.statusCode == 500) {
        throw Exception('Erreur serveur : veuillez réessayer plus tard');
      } else {
        throw Exception('Erreur HTTP ${response.statusCode} : ${response.reasonPhrase}');
      }
    } catch (e) {
      throw Exception('Erreur réseau ou inattendue : $e');
    }
  }
}
