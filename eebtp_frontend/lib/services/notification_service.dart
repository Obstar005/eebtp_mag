import 'dart:convert';
import 'package:http/http.dart' as http;

class NotificationService {
  static const String _baseUrl = 'http://38.242.139.218:8000';

  final String token;
  NotificationService({required this.token});

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

  /// GET /Notifications/notifications-by-user
  Future<List<NotificationModel>> getNotificationsByUser() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/Notifications/notifications-by-user'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => NotificationModel.fromJson(json)).toList();
    } else {
      throw Exception('Erreur chargement notifications: ${response.statusCode}');
    }
  }

  /// POST /Notifications/notification-mark-as-read/{id}
  Future<void> markAsRead(int id) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/Notifications/notification-mark-as-read/$id'),
      headers: _headers,
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Erreur mark-as-read: ${response.statusCode}');
    }
  }
}

class NotificationModel {
  final int id;
  final String title;
  final String message;  // ✅ "message" et non "body"
  final bool isRead;
  final String? createdAt;
  final String? type;
  final int? user;
  // ❌ pas de demandeId dans ce modèle

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.isRead,
    this.createdAt,
    this.type,
    this.user,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] ?? 0,
      title: json['title']?.toString() ?? '',
      message: json['message']?.toString() ?? '',  // ✅ "message" pas "body"
      isRead: json['is_read'] ?? false,
      createdAt: json['created_at']?.toString(),
      type: json['type']?.toString(),
      user: json['user'] as int?,
    );
  }
}