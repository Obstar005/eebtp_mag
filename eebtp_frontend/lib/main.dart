import 'package:eebtp_frontend/screens/returnScreen.dart';
import 'package:eebtp_frontend/services/fcm_service.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'package:provider/provider.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';

// Models
import 'package:eebtp_frontend/models/utilisateur.dart';
import 'package:eebtp_frontend/models/stockitem.dart';
import 'package:eebtp_frontend/models/entry_item.dart';
import 'package:eebtp_frontend/models/exit_item.dart';

// Screens
import 'package:eebtp_frontend/screens/demande.dart';
import 'package:eebtp_frontend/screens/edit_profile.dart';
import 'package:eebtp_frontend/screens/entryDetail.dart';
import 'package:eebtp_frontend/screens/entry_screen.dart';
import 'package:eebtp_frontend/screens/exitDetail.dart';
import 'package:eebtp_frontend/screens/exit_screen.dart';
import 'package:eebtp_frontend/screens/forgotPassword_screen.dart';
import 'package:eebtp_frontend/screens/getStarted_screen.dart';
import 'package:eebtp_frontend/screens/home_page.dart';
import 'package:eebtp_frontend/screens/logintwosteps_screen.dart';
import 'package:eebtp_frontend/screens/modal_success.dart';
import 'package:eebtp_frontend/screens/new_password_screen.dart';
import 'package:eebtp_frontend/screens/notificationScreen.dart';
import 'package:eebtp_frontend/screens/otp_confirmation_screen.dart';
import 'package:eebtp_frontend/screens/passwordCreatedConfirmation.dart';
import 'package:eebtp_frontend/screens/passwordLoginPage.dart';
import 'package:eebtp_frontend/screens/productDetail.dart';
import 'package:eebtp_frontend/screens/profileScreen.dart';
import 'package:eebtp_frontend/screens/request_choice.dart';
import 'package:eebtp_frontend/screens/resquestTracking.dart';
import 'package:eebtp_frontend/screens/splash_screen.dart';
import 'package:eebtp_frontend/screens/stockScreen.dart';
import 'package:eebtp_frontend/screens/storeSelectionPage.dart';

//  Handler background — doit être top-level
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print("Background message reçu: ${message.messageId}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ✅ Firebase init
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  final authProvider = AuthProvider();
  await authProvider.loadFromStorage();

  // ✅ Si l'utilisateur est déjà connecté (token en storage), enregistrer le device
  if (authProvider.token != null) {
    await FcmService().initialize(authProvider.token!);
  }

  runApp(
    ChangeNotifierProvider.value(
      value: authProvider,
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Sizer(
      builder: (context, orientation, deviceType) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            visualDensity: VisualDensity.adaptivePlatformDensity,
            primarySwatch: Colors.blue,
            scaffoldBackgroundColor: Colors.white,
          ),
          initialRoute: '/',
          onGenerateRoute: (settings) {
            switch (settings.name) {
              case '/profile':
                return MaterialPageRoute(
                  builder: (context) => ProfilePage(),
                );
              case '/edit_profile':
                final args = settings.arguments as Map<String, dynamic>;
                final user = args['user'] as Utilisateur;
                return MaterialPageRoute(
                  builder: (_) => EditProfilePage(user: user),
                );
              case '/product-detail':
                final stockItem = settings.arguments as StockItem;
                return MaterialPageRoute(
                  builder: (_) => ProductDetailPage(stockItem: stockItem),
                );
              case '/entry-detail':
                final entry = settings.arguments as Entree;
                return MaterialPageRoute(
                  builder: (_) => EntryDetailPage(entry: entry),
                );
              case '/exit-detail':
                final sortie = settings.arguments as Sortie;
                return MaterialPageRoute(
                  builder: (_) => ExitDetailPage(sortie: sortie),
                );
              case '/modal_success':
                final phone = settings.arguments as String;
                return MaterialPageRoute(
                  builder: (_) => PasswordVerifiedModal(phone: phone),
                );
              case '/mdp_page':
                return MaterialPageRoute(
                  builder: (_) => ChangePasswordPage(),
                );
              default:
                return null;
            }
          },
          routes: {
            '/': (context) => const SplashScreen(),
            '/getStarted': (context) => const GetStartedScreen(),
            '/login': (context) => LoginTwoStepScreen(),
            '/forgot_password': (context) => ForgotPasswordScreen(),
            '/new_password': (context) => NewPasswordScreen(),
            '/otp_confirmation': (context) => const OTPConfirmationScreen(),
            '/password_login': (context) => const PasswordLoginPage(),
            '/change_password': (context) => const ChangePasswordPage(),
            '/home': (context) => HomePage(),
            '/stock': (context) => StockPage(),
            '/demande_form': (context) => const SupplyRequestScreen(),
            '/demande': (context) => const SupplyRequestHomeScreen(),
            '/suivi_demande': (context) => RequestsTrackingScreen(),
            '/entry': (context) => const StockEntryScreen(),
            '/exit': (context) => const StockExitScreen(),
            '/refresh': (context) => const StockReturnScreen(),
            '/store_selection': (context) => StoreSelectionPage(),
            '/notifications': (context) => const NotificationScreen(),
          },
        );
      },
    );
  }
}