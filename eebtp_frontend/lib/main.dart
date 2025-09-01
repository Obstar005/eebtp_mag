import 'package:eebtp_frontend/screens/demande.dart';
import 'package:eebtp_frontend/screens/edit_profile.dart';
import 'package:eebtp_frontend/screens/entry_screen.dart';
import 'package:eebtp_frontend/screens/exit_screen.dart';
import 'package:eebtp_frontend/screens/forgotPassword_screen.dart';
import 'package:eebtp_frontend/screens/getStarted_screen.dart';
import 'package:eebtp_frontend/screens/home_page.dart';
import 'package:eebtp_frontend/screens/logintwosteps_screen.dart';
import 'package:eebtp_frontend/screens/new_password_screen.dart';
import 'package:eebtp_frontend/screens/otp_confirmation_screen.dart';
import 'package:eebtp_frontend/screens/profileScreen.dart';
import 'package:eebtp_frontend/screens/splash_screen.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart'; 

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
          
            routes: {
  // Routes d'authentification
  '/': (context) => const SplashScreen(),
  '/getStarted': (context) => const GetStartedScreen(),
  '/login': (context) => LoginTwoStepScreen(),
  '/forgot_password': (context) => ForgotPasswordScreen(),
  '/new_password': (context) => NewPasswordScreen(),
  '/otp_confirmation': (context) => const OTPConfirmationScreen(),

  // Routes principales de navigation
  '/home': (context) =>  HomePage(),
//  '/stock': (context) => const StockScreen(),
 '/demande': (context) => const SupplyRequestScreen(),
  '/profile': (context) => ProfilePage(),

  // Routes de gestion de stock
  '/entry': (context) => const StockEntryScreen(),
  '/exit': (context) => const StockExitScreen(),
  // Routes de profil 
 
'/edit_profile': (context) => const EditProfilePage(),
  //'/notifications': (context) => const NotificationsScreen(),
},
        ); 
      },
    );
  }
}
