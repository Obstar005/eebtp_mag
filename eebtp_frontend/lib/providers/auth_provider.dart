import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'dart:convert';
import '../models/utilisateur.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  Utilisateur? _user;
  int? _storeId;
  DateTime? _expiry;

  String? get token => _token;
  Utilisateur? get user => _user;
  int? get storeId => _storeId;
  DateTime? get expiry => _expiry;
  bool get isAuthenticated =>
      _token != null && _expiry != null && DateTime.now().isBefore(_expiry!);

  Future<void> loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _storeId = prefs.getInt('storeId');
    String? userStr = prefs.getString('user');
    if (userStr != null) {
      _user = Utilisateur.fromJson(jsonDecode(userStr));
    }
    // Extraire l’expiry DU TOKEN si présent
    if (_token != null) {
      _expiry = JwtDecoder.getExpirationDate(_token!);
    }
    notifyListeners();
  }

  Future<void> setToken(String token) async {
    _token = token;
    _expiry = JwtDecoder.getExpirationDate(token);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    notifyListeners();
  }

  Future<void> setStoreId(int storeId) async {
    _storeId = storeId;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('storeId', storeId);
    notifyListeners();
  }

  Future<void> setUser(Utilisateur user) async {
    _user = user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(user.toJson()));
    notifyListeners();
  }

  Future<void> checkTokenExpiry(BuildContext context) async {
    // Appel recommandé avant chaque action importante, ou via un timer global
    if (_token != null && JwtDecoder.isExpired(_token!)) {
      await clear();
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          title: Text('Votre session a expiré'),
          content: Text('Reconnectez-vous pour continuer.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                Navigator.of(context).pushReplacementNamed('/login');
              },
              child: Text('OK'),
            ),
          ],
        ),
      );
    }
  }

  Future<void> clear() async {
    _token = null;
    _user = null;
    _storeId = null;
    _expiry = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    notifyListeners();
  }
}
