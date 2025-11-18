import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:toastification/toastification.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import 'dart:convert';
import '../models/utilisateur.dart';
import '../services/auth.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  Utilisateur? _user;
  int? _storeId;
  DateTime? _expiry;

  // ✅ Clés pour SharedPreferences
  static const String _tokenKey = 'token';
  static const String _storeIdKey = 'storeId';
  static const String _userKey = 'user';
  static const String _isFirstTimeKey = 'is_first_time'; // ✅ Ajouté

  String? get token => _token;
  Utilisateur? get user => _user;
  int? get storeId => _storeId;
  DateTime? get expiry => _expiry;
  bool get isAuthenticated =>
      _token != null && _expiry != null && DateTime.now().isBefore(_expiry!);
  bool get hasUser => _user != null && _user!.id != null;

  Future<void> loadFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString(_tokenKey);
      _storeId = prefs.getInt(_storeIdKey);
      String? userStr = prefs.getString(_userKey);
      
      if (userStr != null) {
        try {
          _user = Utilisateur.fromJson(jsonDecode(userStr));
        } catch (e) {
          print('[ERROR] Erreur de parsing utilisateur: $e');
          _user = null;
        }
      }
      
      // Vérifier si le token est valide
      if (_token != null) {
        try {
          if (JwtDecoder.isExpired(_token!)) {
            print('[WARNING] Token expiré lors du chargement');
            await clear();
          } else {
            _expiry = JwtDecoder.getExpirationDate(_token!);
          }
        } catch (e) {
          print('[ERROR] Erreur de décodage du token: $e');
          await clear();
        }
      }
      
      notifyListeners();
    } catch (e) {
      print('[ERROR] Erreur lors du chargement depuis le storage: $e');
    }
  }

  Future<void> setToken(String token) async {
    _token = token;
    _expiry = JwtDecoder.getExpirationDate(token);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    notifyListeners();
  }

  Future<void> setStoreId(int storeId) async {
    _storeId = storeId;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_storeIdKey, storeId);
    notifyListeners();
  }

  Future<void> setUser(Utilisateur user) async {
    _user = user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
    notifyListeners();
  }

  Future<void> refreshUser(String token) async {
    try {
      final userService = UserService();
      final refreshedUser = await userService.getUserInfo(token);
      await setUser(refreshedUser);
    } catch (e) {
      print('[ERROR] Erreur lors du rafraîchissement de l\'utilisateur: $e');
    }
  }

  Future<void> checkTokenExpiry(BuildContext context) async {
    if (_token != null && JwtDecoder.isExpired(_token!)) {
      await clear();
      
      if (context.mounted) {
        toastification.show(
          context: context,
          type: ToastificationType.error,
          style: ToastificationStyle.flatColored,
          title: Text(
            "Session expirée",
            style: GoogleFonts.poppins(
              fontSize: 13.sp,
              fontWeight: FontWeight.w500,
            ),
          ),
          autoCloseDuration: const Duration(seconds: 3),
          alignment: Alignment.topCenter,
        );
        
        Future.delayed(const Duration(milliseconds: 500), () {
          if (context.mounted) {
            Navigator.of(context).pushReplacementNamed('/login');
          }
        });
      }
    }
  }

  // ✅ NOUVELLE MÉTHODE : Vérifier si c'est la première fois
  Future<bool> isFirstTime() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_isFirstTimeKey) ?? true;
  }

  // ✅ NOUVELLE MÉTHODE : Marquer que l'app a été lancée
  Future<void> setNotFirstTime() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_isFirstTimeKey, false);
  }

  // ✅ MÉTHODE MODIFIÉE : Clear conserve le flag "first time"
  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Sauvegarder le flag first time avant de tout effacer
    final isFirstTimeValue = prefs.getBool(_isFirstTimeKey) ?? true;
    
    _token = null;
    _user = null;
    _storeId = null;
    _expiry = null;
    
    await prefs.clear();
    
    // Restaurer le flag first time
    await prefs.setBool(_isFirstTimeKey, isFirstTimeValue);
    
    notifyListeners();
  }

  // ✅ NOUVELLE MÉTHODE : Réinitialiser complètement l'app (pour debug)
  Future<void> resetApp() async {
    _token = null;
    _user = null;
    _storeId = null;
    _expiry = null;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    
    notifyListeners();
  }
}