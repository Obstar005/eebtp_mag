import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class OTPConfirmationScreen extends StatefulWidget {
  const OTPConfirmationScreen({super.key});

  @override
  State<OTPConfirmationScreen> createState() => _OTPConfirmationScreenState();
}

class _OTPConfirmationScreenState extends State<OTPConfirmationScreen> {
  @override
  void initState() {
    super.initState();
    // Après 3 secondes, naviguer vers la page de création de mot de passe
    Future.delayed(const Duration(seconds: 3), () {
      Navigator.pushReplacementNamed(context, '/new_password');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(height: 5.h),
            Center(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.green,
                  shape: BoxShape.circle,
                ),
                padding: EdgeInsets.all(4.h),
                child: Icon(
                  Icons.check,
                  size: 10.h,
                  color: Colors.white,
                ),
              ),
            ),
            SizedBox(height: 5.h),
            Text(
              'Vérification réussie!',
              style: GoogleFonts.poppins(
                fontSize: 20.sp,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 2.h),
            Text(
              'Votre code a été vérifié avec succès',
              style: GoogleFonts.poppins(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
            Spacer(),
            Padding(
              padding: EdgeInsets.only(bottom: 5.h),
              child: Text(
                'Patientez...',
                style: GoogleFonts.poppins(
                  fontSize: 12.sp,
                  color: Colors.grey[500],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}