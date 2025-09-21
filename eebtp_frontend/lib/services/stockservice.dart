import 'dart:convert';
import 'package:eebtp_frontend/models/article.dart';
import 'package:http/http.dart' as http;


class StockService {
  final String baseUrl = 'http://185.197.195.209:8000';

  // 🔍 Liste de tous les articles
  Future<List<ArticleStock>> getAllArticles() async {
    final response = await http.get(
      Uri.parse('$baseUrl/Stocks/liste-articles/'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => ArticleStock.fromJson(json)).toList();
    } else {
      throw Exception('Erreur lors du chargement des articles');
    }
  }

  // 📄 Détail d’un article par ID
  Future<ArticleStock> getArticleDetail(int id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/Stocks/article-detail/$id/'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      return ArticleStock.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Article non trouvé');
    }
  }

  // ➕ Création d’un article
  Future<bool> createArticle(ArticleStock article) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Stocks/article-create/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(article.toJson()),
    );

    return response.statusCode == 201;
  }

  // ✏️ Mise à jour d’un article
  Future<bool> updateArticle(int id, ArticleStock article) async {
    final response = await http.put(
      Uri.parse('$baseUrl/Stocks/article-update/$id/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(article.toJson()),
    );

    return response.statusCode == 200;
  }

  // ❌ Suppression d’un article
  Future<bool> deleteArticle(int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/Stocks/article-delete/$id/'),
      headers: {'Content-Type': 'application/json'},
    );

    return response.statusCode == 204;
  }
}
