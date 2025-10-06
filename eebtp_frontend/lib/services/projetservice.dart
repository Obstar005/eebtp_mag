import 'dart:convert';
import 'package:http/http.dart' as http;

class ProjetService {
  final String baseUrl = 'http://185.197.195.209:8000';

// GET /Projets/liste-magasins-by-projet/{id}
Future<Map<String, dynamic>> getMagasinsByProjet(int id, String token) async {
  final response = await http.get(
    Uri.parse('$baseUrl/Projets/liste-magasins-by-projet/$id'),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token", // 🔑 Envoi du token
      },
  );
  return _handleResponse(response);
}


  // GET /Projets/liste-photos-by-projet/{id}
  Future<List<dynamic>> getPhotosByProjet(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/Projets/liste-photos-by-projet/$id'));
    return _handleResponse(response);
  }

  // GET /Projets/liste-projets-list
  Future<List<dynamic>> getListeProjets() async {
    final response = await http.get(Uri.parse('$baseUrl/Projets/liste-projets-list'));
    return _handleResponse(response);
  }

  // POST /Projets/magasin-create
  Future<dynamic> createMagasin(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Projets/magasin-create'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return _handleResponse(response);
  }

  // DELETE /Projets/magasin-delete/{id}
  Future<void> deleteMagasin(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/Projets/magasin-delete/$id'));
    _handleResponse(response);
  }

  // PUT /Projets/magasin-detail/{id}
  Future<dynamic> updateMagasin(int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/Projets/magasin-detail/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return _handleResponse(response);
  }

  // POST /Projets/projet-create
  Future<dynamic> createProjet(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Projets/projet-create'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return _handleResponse(response);
  }

  // DELETE /Projets/projet-delete/{id}
  Future<void> deleteProjet(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/Projets/projet-delete/$id'));
    _handleResponse(response);
  }

  // GET /Projets/projet-detail/{id}
  Future<dynamic> getProjetDetail(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/Projets/projet-detail/$id'));
    return _handleResponse(response);
  }

  // POST /Projets/projet-photo-create
  Future<dynamic> createProjetPhoto(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Projets/projet-photo-create'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return _handleResponse(response);
  }

  // Helper method to handle responses
  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erreur ${response.statusCode}: ${response.body}');
    }
  }
}
