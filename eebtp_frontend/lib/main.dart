import 'package:eebtp_frontend/screens/demande.dart';
import 'package:eebtp_frontend/screens/edit_profile.dart';
import 'package:eebtp_frontend/screens/entryDetail.dart';
import 'package:eebtp_frontend/screens/entry_screen.dart';
import 'package:eebtp_frontend/screens/exit_screen.dart';
import 'package:eebtp_frontend/screens/forgotPassword_screen.dart';
import 'package:eebtp_frontend/screens/getStarted_screen.dart';
import 'package:eebtp_frontend/screens/home_page.dart';
import 'package:eebtp_frontend/screens/logintwosteps_screen.dart';
import 'package:eebtp_frontend/screens/new_password_screen.dart';
import 'package:eebtp_frontend/screens/notificationScreen.dart';
import 'package:eebtp_frontend/screens/otp_confirmation_screen.dart';
import 'package:eebtp_frontend/screens/outputDetail.dart';
import 'package:eebtp_frontend/screens/productDetail.dart';
import 'package:eebtp_frontend/screens/profileScreen.dart';
import 'package:eebtp_frontend/screens/request_choice.dart';
import 'package:eebtp_frontend/screens/resquestTracking.dart';
import 'package:eebtp_frontend/screens/returnDetail.dart';
import 'package:eebtp_frontend/screens/returnScreen.dart';
import 'package:eebtp_frontend/screens/splash_screen.dart';
import 'package:eebtp_frontend/screens/stockScreen.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

// ✅ Import des modèles uniques
import 'package:eebtp_frontend/models/product.dart';
import 'package:eebtp_frontend/models/entry_item.dart';
import 'package:eebtp_frontend/models/return_item.dart';
import 'package:eebtp_frontend/models/exit_item.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Sizer(
      builder: (context, orientation, deviceType) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          initialRoute: '/',
          onGenerateRoute: (settings) {
            switch (settings.name) {
              case '/product-detail':
                final product = settings.arguments as Product;
                return MaterialPageRoute(
                  builder: (_) => ProductDetailPage(product: product),
                );

              case '/entry-detail':
                final entry = settings.arguments as EntryItem;
                return MaterialPageRoute(
                  builder: (_) => EntryDetailPage(entry: entry),
                );

              case '/return-detail':
                final ret = settings.arguments as ReturnItem;
                return MaterialPageRoute(
                  builder: (_) => ReturnDetailPage(returnItem: ret),
                );

              case '/exit-detail':
                final exit = settings.arguments as ExitItem;
                return MaterialPageRoute(
                  builder: (_) => ExitDetailPage(exit: exit),
                );

              default:
                return null; 
            }
          },
          routes: {
            // Routes d'authentification
            '/': (context) => const SplashScreen(),
            '/getStarted': (context) => const GetStartedScreen(),
            '/login': (context) => LoginTwoStepScreen(),
            '/forgot_password': (context) => ForgotPasswordScreen(),
            '/new_password': (context) => NewPasswordScreen(),
            '/otp_confirmation': (context) => const OTPConfirmationScreen(),

            // Routes principales de navigation
            '/home': (context) => HomePage(),
            '/stock': (context) => StockPage(),
            '/demande_form': (context) => const SupplyRequestScreen(),
            '/demande': (context) => const SupplyRequestHomeScreen(),
            '/suivi_demande': (context) => RequestsTrackingScreen(),
            '/profile': (context) => ProfilePage(),

            // Routes de gestion de stock
            '/entry': (context) => const StockEntryScreen(),
            '/exit': (context) => const StockExitScreen(),
            '/refresh': (context) => const StockReturnScreen(),

            // Routes de profil
            '/edit_profile': (context) => const EditProfilePage(),
            '/notifications': (context) => const NotificationScreen(),
          },
        );
      },
    );
  }
}
