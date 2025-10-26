import 'dart:convert';
import 'package:eebtp_frontend/models/demande.dart';
import 'package:http/http.dart' as http;

class DemandeService {
  static const String baseUrl = 'http://185.197.195.209:8000';

  /// 🔹 Récupérer la liste des demandes émises par le magasinier connecté
Future<List<Demande>> getDemandesEmises(String token) async {
  final url = Uri.parse('$baseUrl/Demandes/demandes/emises');

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
          // CORRECTION : Convertir explicitement en List<Demande>
          return data.map((item) => Demande.fromJson(item as Map<String, dynamic>)).toList();
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
  /// 🔹 Récupérer les détails d'une demande spécifique
  Future<Map<String, dynamic>> getDemandeDetail(String id) async {
    final url = Uri.parse('$baseUrl/Demandes/demande/detail/$id');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } else {
      throw Exception('Erreur lors de la récupération des détails de la demande');
    }
  }
  /// 🔹 Récupérer la liste des demandes validées
  Future<List<Demande>> getDemandesValidees(String token) async {
    final url = Uri.parse('$baseUrl/Demandes/demandes/validees');

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
            return data.map((item) => Demande.fromJson(item as Map<String, dynamic>)).toList();
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

  /// 🔹 Émettre une nouvelle demande de stock
 Future<void> emettreDemande({
    required int quantite,
    required String raison,
    required int stockItem,
    required int magasin,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/Demandes/demande/emettre');
    final body = jsonEncode({
      'quantite': quantite,
      'raison': raison,
      'stock_item': stockItem,
      'magasin': magasin,
    });

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: body,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return;
      } else if (response.statusCode == 400) {
        final error = jsonDecode(response.body);
        throw Exception('Données invalides : ${error['detail'] ?? response.body}');
      } else if (response.statusCode == 401) {
        throw Exception('Non autorisé : token invalide ou expiré');
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
