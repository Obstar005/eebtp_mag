import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class LocalNotificationService {
  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'high_importance_channel',
    'Notifications importantes',
    importance: Importance.high,
  );

  static Future<void> initialize() async {
    // ✅ Créer le canal Android
    final androidImpl = _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    await androidImpl?.createNotificationChannel(_channel);

    // ✅ Paramètre nommé "settings" obligatoire
    await _plugin.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(),
      ),
    );
  }

static void show(RemoteMessage message) {
  final notification = message.notification;
  if (notification == null) return;

  _plugin.show(
    id: notification.hashCode,  //  paramètre nommé
    title: notification.title,
    body: notification.body,
    notificationDetails: const NotificationDetails(
      android: AndroidNotificationDetails(
        'high_importance_channel',
        'Notifications importantes',
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
      ),
    ),
  );
}
}