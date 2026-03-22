import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class FcmService {
  static final FcmService _instance = FcmService._internal();
  factory FcmService() => _instance;
  FcmService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static const String _baseUrl = 'http://38.242.139.218:8000';

  /// Demande la permission et enregistre le device sur le backend
  Future<void> initialize(String authToken) async {
    // 1. Demander la permission (iOS + Android 13+)
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      print("Permission FCM refusée");
      return;
    }

    // 2. Récupérer le FCM token
    final fcmToken = await _messaging.getToken();
    if (fcmToken == null) return;
    print("FCM Token: $fcmToken");

    // 3. Enregistrer sur le backend
    await _registerDevice(fcmToken: fcmToken, authToken: authToken);

    // 4. Écouter le refresh du token
    _messaging.onTokenRefresh.listen((newToken) {
      _registerDevice(fcmToken: newToken, authToken: authToken);
    });
  }

  Future<void> _registerDevice({
    required String fcmToken,
    required String authToken,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/App/devices/register'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: jsonEncode({
          'token': fcmToken,
          'device_type': Platform.isIOS ? 'ios' : 'android',
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        print("Device enregistré avec succès");
      } else {
        print("Erreur enregistrement device: ${response.statusCode} ${response.body}");
      }
    } catch (e) {
      print("Erreur _registerDevice: $e");
    }
  }

  /// À appeler depuis le widget racine pour gérer les notifications reçues
  void setupForegroundHandler({
    required Function(RemoteMessage) onMessage,
  }) {
    // Notification reçue quand l'app est en foreground
    FirebaseMessaging.onMessage.listen(onMessage);

    // Notification tapée depuis background
    FirebaseMessaging.onMessageOpenedApp.listen(onMessage);
  }

  /// Vérifie si l'app a été ouverte via une notification (app terminée)
  Future<RemoteMessage?> getInitialMessage() async {
    return await _messaging.getInitialMessage();
  }
}