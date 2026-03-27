import 'dart:convert';
import 'package:eebtp_frontend/models/demande.dart';
import 'package:http/http.dart' as http;

class DemandeService {
  static const String baseUrl = 'http://38.242.139.218:8000';
Future<List<Demande>> getToutesDemandes(String token) async {
  final url = Uri.parse('$baseUrl/Demandes/demandes/toutes');

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

Future<Demande> updateDemandeRejetee({
  required int id,
  required int quantiteDem,
  required String raison,
  required int stockItem,
  required int magasin,
  String? commentaireConfirmation,
  String? commentaireApprobation,
  String? commentaireValidation,
  required String token,
}) async {
  final url = Uri.parse('$baseUrl/Demandes/demande-update/$id');

  final Map<String, dynamic> payload = {
    "quantite_dem": quantiteDem,
    "raison": raison,
    "stock_item": stockItem,
    "magasin": magasin,
    "commentaire_confirmation": commentaireConfirmation,
    "commentaire_approbation": commentaireApprobation,
    "commentaire_validation": commentaireValidation,
  };

  final encodedBody = jsonEncode(payload);
  print('┌─ PUT $url');
  print('├─ Payload : $encodedBody');

  try {
    final response = await http.put(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: encodedBody,
    );

    print('├─ Status  : ${response.statusCode}');
    print('└─ Body    : ${response.body}');

    if (response.statusCode == 200) {
      final Map<String, dynamic> json =
          Map<String, dynamic>.from(jsonDecode(response.body) as Map);

      // L'API ne change pas le statut en base.
      // On force 'Emise' dans le JSON avant parsing pour que
      // l'UI reflète immédiatement le bon état.
      json['statut'] = 'Emise';

      return Demande.fromJson(json);
    }

    dynamic errorBody;
    try {
      errorBody = response.body.isNotEmpty ? jsonDecode(response.body) : null;
    } catch (_) {
      errorBody = null;
    }

    String extractMessage() {
      if (errorBody == null) return 'Erreur inconnue';
      if (errorBody is Map<String, dynamic>) {
        for (final key in ['detail', 'message', 'error']) {
          if (errorBody.containsKey(key)) return errorBody[key].toString();
        }
        return (errorBody as Map).entries
            .map((e) => '${e.key}: ${e.value}')
            .join(' | ');
      }
      return response.body;
    }

    final message = extractMessage();
    print('⚠️  Erreur API : $message');

    switch (response.statusCode) {
      case 400: throw Exception('Données invalides : $message');
      case 401: throw Exception('Non autorisé : token invalide ou expiré');
      case 403: throw Exception('Accès refusé : permissions insuffisantes');
      case 404: throw Exception('Demande introuvable');
      case 500: throw Exception('Erreur serveur : $message');
      default:  throw Exception('Erreur HTTP ${response.statusCode} : $message');
    }
  } on http.ClientException catch (e) {
    print('❌ ClientException : $e');
    throw Exception('Erreur réseau : vérifiez votre connexion');
  } catch (e) {
    print('❌ Exception : $e');
    rethrow;
  }
}
 
Future<List<Demande>> getToutesDemandesMagasinier(String token) async {
  final url = Uri.parse('$baseUrl/Demandes/demandes-magasignier/toutes');

  try {
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data is List) {
        return data.map((item) => Demande.fromJson(item as Map<String, dynamic>)).toList();
      } else {
        throw FormatException('Réponse inattendue : attendu une liste');
      }
    } else if (response.statusCode == 401) {
      throw Exception('Non autorisé : token invalide ou expiré');
    } else if (response.statusCode == 403) {
      throw Exception('Accès refusé : permissions insuffisantes');
    } else {
      throw Exception('Erreur HTTP ${response.statusCode} : ${response.reasonPhrase}');
    }
  } catch (e) {
    throw Exception('Erreur réseau ou inattendue : $e');
  }
}


Future<List<Demande>> getDemandesValideesMagasinier(String token) async {
  final url = Uri.parse('$baseUrl/Demandes/demandes-validées-magasignier');

  try {
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data is List) {
        return data.map((item) => Demande.fromJson(item as Map<String, dynamic>)).toList();
      } else {
        throw FormatException('Réponse inattendue : attendu une liste');
      }
    } else if (response.statusCode == 401) {
      throw Exception('Non autorisé : token invalide ou expiré');
    } else if (response.statusCode == 403) {
      throw Exception('Accès refusé : permissions insuffisantes');
    } else {
      throw Exception('Erreur HTTP ${response.statusCode} : ${response.reasonPhrase}');
    }
  } catch (e) {
    throw Exception('Erreur réseau ou inattendue : $e');
  }
}


 Future<void> emettreDemande({
    required int quantiteDem,
    required String raison,
    required int stockItem,
    required int magasin,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/Demandes/demande/emettre');
    final body = jsonEncode({
      'quantite_dem': quantiteDem,
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
