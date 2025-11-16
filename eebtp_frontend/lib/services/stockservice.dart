import 'dart:convert';
import 'package:eebtp_frontend/models/article.dart';
import 'package:eebtp_frontend/models/stockitem.dart';
import 'package:http/http.dart' as http;

class StockService {
  final String baseUrl = 'http://38.242.139.218:8001';
  final String? token;

  StockService({this.token});

  // Génère les headers HTTP avec ou sans le token
  Map<String, String> _headers() {
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // 🔍 Liste de tous les articles
  Future<List<ArticleStock>> getAllArticles() async {
    final response = await http.get(
      Uri.parse('$baseUrl/Stocks/liste-articles/'),
      headers: _headers(),
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
      Uri.parse('$baseUrl/Stocks/article-detail/$id'),
      headers: _headers(),
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
      headers: _headers(),
      body: jsonEncode(article.toJson()),
    );
    return response.statusCode == 201;
  }

  // ✏️ Mise à jour d’un article
  Future<bool> updateArticle(int id, ArticleStock article) async {
    final response = await http.put(
      Uri.parse('$baseUrl/Stocks/article-update/$id'),
      headers: _headers(),
      body: jsonEncode(article.toJson()),
    );
    return response.statusCode == 200;
  }

  // ❌ Suppression d’un article
  Future<bool> deleteArticle(int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/Stocks/article-delete/$id'),
      headers: _headers(),
    );
    return response.statusCode == 204;
  }

  // 📦 Liste des stock items pour un magasin donné
Future<List<StockItem>> getStockItemsByMagasin(int magasinId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/Stocks/liste-stock-items/$magasinId'),
    headers: _headers(),
  );
  //print("GET: $baseUrl/Stocks/liste-stock-items/$magasinId");
  //print("HEADERS: ${_headers()}");
  print("STATUS: ${response.statusCode}");
  //print("BODY: ${response.body}");
  if (response.statusCode == 200) {
    final List<dynamic> data = jsonDecode(response.body);
    return data.map((json) => StockItem.fromJson(json)).toList();
  } else {
    throw Exception('Erreur lors du chargement des stock items');
  }
}

  // 🆕 Création d’un stock item
  Future<bool> createStockItem(StockItem item) async {
    final response = await http.post(
      Uri.parse('$baseUrl/Stocks/stock-item-create/'),
      headers: _headers(),
      body: jsonEncode(item.toJson()),
    );
    return response.statusCode == 201;
  }

  // 🧹 Suppression partielle d’un stock item (PATCH)
  Future<bool> deleteStockItem(int stockItemId) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/Stocks/stock-item-delete/$stockItemId'),
      headers: _headers(),
    );
    return response.statusCode == 200;
  }

  // 🔍 Détail d’un stock item → retourne le détail du stock, PAS l'article
  Future<StockItem> getStockItemDetail(int stockItemId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/Stocks/stock-item-detail/$stockItemId'),
      headers: _headers(),
    );
    if (response.statusCode == 200) {
      return StockItem.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Stock item non trouvé');
    }
  }

  // 🔄 Mise à jour d’un stock item par magasin
  Future<bool> updateStockItem(int magasinId, StockItem item) async {
    final response = await http.put(
      Uri.parse('$baseUrl/Stocks/stock-item-update/$magasinId'),
      headers: _headers(),
      body: jsonEncode(item.toJson()),
    );
    return response.statusCode == 200;
  }
}
