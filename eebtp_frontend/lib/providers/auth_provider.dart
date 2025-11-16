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
      _token = prefs.getString('token');
      _storeId = prefs.getInt('storeId');
      String? userStr = prefs.getString('user');
      
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