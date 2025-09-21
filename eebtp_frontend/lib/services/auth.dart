import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/utilisateur.dart';

class UserService {
  final String baseUrl = 'http://185.197.195.209:8000';

  // 🔐 Authentification
  Future<bool> loginByPhone(String phone) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Users/authentication/login-by-phone/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'telephone': phone}),
    );
    return response.statusCode == 200;
  }

  Future<bool> verifySms(String phone, String code) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Users/authentication/verify-sms/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'telephone': phone, 'code': code}),
    );
    return response.statusCode == 200;
  }

  Future<bool> setPassword(String phone, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Users/authentication/set-password/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'telephone': phone, 'password': password}),
    );
    return response.statusCode == 200;
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

  Future<bool> checkUserExists(String phone) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Users/authentication/check-user-exists/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'telephone': phone}),
    );
    return response.statusCode == 200;
  }

  // 👥 Gestion des utilisateurs
  Future<List<Utilisateur>> getAllUsers() async {
    final response = await http.get(
      Uri.parse('$baseUrl/Users/liste-users/'),
      headers: {'Content-Type': 'application/json'},
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Utilisateur.fromJson(json)).toList();
    } else {
      throw Exception('Erreur lors du chargement des utilisateurs');
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

  Future<bool> updateUser(int id, Utilisateur user) async {
    final response = await http.put(
      Uri.parse('$baseUrl/Users/user-update/$id/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(user.toJson()),
    );
    return response.statusCode == 200;
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
}
