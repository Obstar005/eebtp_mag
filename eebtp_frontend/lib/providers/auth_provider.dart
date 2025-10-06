import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/utilisateur.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  Utilisateur? _user;
  int? _storeId;

  // Getters
  String? get token => _token;
  Utilisateur? get user => _user;
  int? get storeId => _storeId;

  // INIT: charge les données persistées
  Future<void> loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _storeId = prefs.getInt('storeId');
    // Pour _user, tu peux utiliser jsonEncode/decode si besoin
    notifyListeners();
  }

  // setters/updates
  Future<void> setToken(String token) async {
    _token = token;
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

  void setUser(Utilisateur user) {
    _user = user;
    notifyListeners();
  }

  void clear() async {
    _token = null;
    _user = null;
    _storeId = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    notifyListeners();
  }
}
