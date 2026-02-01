import 'dart:convert';
import 'package:http/http.dart' as http;

class MouvementsService {
  final String baseUrl = 'http://38.242.139.218:8000';
  final String token;

  MouvementsService({required this.token});

  Map<String, String> get headers => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };

  // 1. POST /Mouvements/entree-create
  Future<http.Response> createEntree(Map<String, dynamic> data) async {
    final url = Uri.parse('$baseUrl/Mouvements/entree-create');
    final response = await http.post(url, headers: headers, body: jsonEncode(data));
    if (response.statusCode == 201) {
      return response;
    } else {
      print('❌ createEntree error: ${response.statusCode} | ${response.body}');
      throw Exception('createEntree error: status ${response.statusCode} - ${response.body}');
    }
  }
  String _formatPhone(String phone) {
    if (phone.startsWith('+')) {
      return phone.replaceFirst('+', '00');
    }
    return phone;
  }

  // 2. GET /Mouvements/entree-detail/{id}
  Future<http.Response> getEntreeDetail(String id) async {
    final url = Uri.parse('$baseUrl/Mouvements/entree-detail/$id');
    final response = await http.get(url, headers: headers);
    if (response.statusCode == 200) {
      return response;
    } else {
      print('❌ getEntreeDetail error: ${response.statusCode} | ${response.body}');
      throw Exception('getEntreeDetail error: status ${response.statusCode} - ${response.body}');
    }
  }

  // 3. GET /Mouvements/liste-entree-magasin/{magasin_id}
  Future<http.Response> getEntreesByMagasin(dynamic magasinId) async {
    final url = Uri.parse('$baseUrl/Mouvements/liste-entree-magasin/${magasinId.toString()}');
    final response = await http.get(url, headers: headers);
    if (response.statusCode == 200) {
      return response;
    } else {
      print('❌ getEntreesByMagasin error: ${response.statusCode} | ${response.body}');
      throw Exception('getEntreesByMagasin error: status ${response.statusCode} - ${response.body}');
    }
  }

  // 4. GET /Mouvements/liste-entrees-list
  Future<http.Response> getAllEntrees() async {
    final url = Uri.parse('$baseUrl/Mouvements/liste-entrees-list');
    final response = await http.get(url, headers: headers);
    if (response.statusCode == 200) {
      return response;
    } else {
      print('❌ getAllEntrees error: ${response.statusCode} | ${response.body}');
      throw Exception('getAllEntrees error: status ${response.statusCode} - ${response.body}');
    }
  }

  // 5. GET /Mouvements/liste-sortie-magasin/{magasin_id}
  Future<http.Response> getSortiesByMagasin(dynamic magasinId) async {
    final url = Uri.parse('$baseUrl/Mouvements/liste-sortie-magasin/${magasinId.toString()}');
    final response = await http.get(url, headers: headers);
    if (response.statusCode == 200) {
      return response;
    } else {
      print('❌ getSortiesByMagasin error: ${response.statusCode} | ${response.body}');
      throw Exception('getSortiesByMagasin error: status ${response.statusCode} - ${response.body}');
    }
  }

  // 6. POST /Mouvements/sortie-create
  Future<http.Response> createSortie(Map<String, dynamic> data) async {
    final url = Uri.parse('$baseUrl/Mouvements/sortie-create');
    final response = await http.post(url, headers: headers, body: jsonEncode(data));
    if (response.statusCode == 201) {
      return response;
    } else {
      print('❌ createSortie error: ${response.statusCode} | ${response.body}');
      throw Exception('createSortie error: status ${response.statusCode} - ${response.body}');
    }
  }

  // 7. GET /Mouvements/sortie-detail/{id}
  Future<http.Response> getSortieDetail(String id) async {
    final url = Uri.parse('$baseUrl/Mouvements/sortie-detail/$id');
    final response = await http.get(url, headers: headers);
    if (response.statusCode == 200) {
      return response;
    } else {
      print('❌ getSortieDetail error: ${response.statusCode} | ${response.body}');
      throw Exception('getSortieDetail error: status ${response.statusCode} - ${response.body}');
    }
  }
}
