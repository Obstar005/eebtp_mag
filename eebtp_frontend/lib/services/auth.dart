import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/utilisateur.dart';

class UserService {
  final String baseUrl = 'http://38.242.139.218:8001';

  // 🔐 Authentification
  Future<String?> loginByPhone(String phone, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Users/authentication/login-by-phone-mobile/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'telephone': _formatPhone(phone),
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // On récupère le token et le first_login
      // Tu peux retourner un Map ou une classe dédiée si besoin
      return jsonEncode({
        'access_token': data['access_token'],
        'first_login': data['first_login'],
      });
    } else {
      print("Erreur login: ${response.statusCode} - ${response.body}");
      return null;
    }
  }

  Future<bool> verifySms(String phone, String code) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Users/authentication/verify-sms/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'telephone': phone, 'code': code}),
    );
    return response.statusCode == 200;
  }

  Future<bool> setPassword({
    required String phone,
    required String oldPassword,
    required String newPassword,
  }) async {
    final url = Uri.parse('$baseUrl/Users/authentication/set-password/');

    final Map<String, dynamic> payload = {
      "telephone": _formatPhone(phone),
      "old_password": oldPassword,
      "new_password": newPassword,
    };

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      print("Erreur setPassword: ${response.statusCode} - ${response.body}");
      return false;
    }
  }

  Future<Utilisateur> getUserInfo(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/Users/authentication/user-info/'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    if (response.statusCode == 200) {
      return Utilisateur.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur lors de la récupération des infos utilisateur');
    }
  }

  String _formatPhone(String phone) {
    if (phone.startsWith('+')) {
      return phone.replaceFirst('+', '00');
    }
    return phone;
  }

  Future<bool> checkUserExists(String phone) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Users/authentication/check-user-exists/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'telephone': _formatPhone(phone)}),
    );
    return response.statusCode == 200;
  }

// 👥 Gestion des utilisateurs

Future<List<Utilisateur>> getAllUsers(String token) async {
  final url = Uri.parse('$baseUrl/Users/liste-users');

  try {
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    switch (response.statusCode) {
      case 200:
        try {
          final List<dynamic> data = jsonDecode(response.body);
          return data.map((json) => Utilisateur.fromJson(json)).toList();
        } catch (e) {
          throw FormatException('Erreur de parsing JSON : $e');
        }

      case 401:
        throw Exception('Non autorisé : token manquant ou invalide');

      case 403:
        throw Exception('Accès refusé : permissions insuffisantes');

      case 500:
        throw Exception('Erreur serveur : veuillez réessayer plus tard');

      default:
        throw Exception('Erreur HTTP ${response.statusCode} : ${response.reasonPhrase}');
    }
  } catch (e) {
    throw Exception('Erreur réseau ou inattendue : $e');
  }
}

  Future<Utilisateur> getUserDetail(int id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/Users/user-detail$id/'),
      headers: {'Content-Type': 'application/json'},
    );
    if (response.statusCode == 200) {
      return Utilisateur.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Utilisateur non trouvé');
    }
  }

  Future<bool> createUser(Utilisateur user) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Users/user-create/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(user.toJson()),
    );
    return response.statusCode == 201;
  }

 Future<bool> updateUser(int id, Utilisateur user, String token) async {
  final url = Uri.parse('$baseUrl/Users/user-update/$id');

  try {
    final response = await http.put(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(user.toUpdateJson()),
    );

    if (response.statusCode == 200) {
      return true;
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      throw Exception('Données invalides : ${error['detail'] ?? response.body}');
    } else if (response.statusCode == 401) {
      throw Exception('Non autorisé : token invalide ou expiré');
    } else if (response.statusCode == 403) {
      throw Exception('Accès refusé : permissions insuffisantes');
    } else if (response.statusCode == 404) {
      throw Exception('Utilisateur non trouvé');
    } else if (response.statusCode == 500) {
      throw Exception('Erreur serveur : veuillez réessayer plus tard');
    } else {
      throw Exception('Erreur HTTP ${response.statusCode} : ${response.reasonPhrase}');
    }
  } catch (e) {
    throw Exception('Échec de mise à jour de l’utilisateur : $e');
  }
}


  Future<bool> deleteUser(int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/Users/user-delete/$id/'),
      headers: {'Content-Type': 'application/json'},
    );
    return response.statusCode == 204;
  }

  // 🌍 Pays et Profils
  Future<List<String>> getCountries() async {
    final response = await http.get(
      Uri.parse('$baseUrl/Users/countries/'),
      headers: {'Content-Type': 'application/json'},
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((e) => e.toString()).toList();
    } else {
      throw Exception('Erreur lors du chargement des pays');
    }
  }

  Future<List<Map<String, dynamic>>> getProfils() async {
    final response = await http.get(
      Uri.parse('$baseUrl/Users/liste-profils/'),
      headers: {'Content-Type': 'application/json'},
    );
    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(jsonDecode(response.body));
    } else {
      throw Exception('Erreur lors du chargement des profils');
    }
  }

  Future<Map<String, dynamic>> getProfilDetail(int id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/Users/profil-detail/$id/'),
      headers: {'Content-Type': 'application/json'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Profil non trouvé');
    }
  }

  Future<bool> createProfil(Map<String, dynamic> profil) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Users/profil-create/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(profil),
    );
    return response.statusCode == 201;
  }

  Future<bool> updateProfil(int id, Map<String, dynamic> profil) async {
    final response = await http.put(
      Uri.parse('$baseUrl/Users/profil-update/$id/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(profil),
    );
    return response.statusCode == 200;
  }

  Future<bool> deleteProfil(int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/Users/profil-delete/$id/'),
      headers: {'Content-Type': 'application/json'},
    );
    return response.statusCode == 204;
  }

  Future<bool> updateProfilePicture(String token, int userId, String filePath) async {
  final url = Uri.parse('$baseUrl/Users/user-update-profile/$userId');

  var request = http.MultipartRequest('PUT', url);
  request.headers['Authorization'] = 'Bearer $token';
  request.files.add(
    await http.MultipartFile.fromPath('photo_profil', filePath),
  );

  final response = await request.send();

  if (response.statusCode == 200) {
    return true;
  } else {
    print("Erreur upload photo: ${response.statusCode}");
    return false;
  }
}
}
