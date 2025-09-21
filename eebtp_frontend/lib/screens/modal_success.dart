import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:sizer/sizer.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:eebtp_frontend/widgets/button.dart';

class PasswordVerifiedModal extends StatelessWidget {
  const PasswordVerifiedModal({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          //  Fond flouté et sombre
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
              child: Container(
                color: Colors.black.withOpacity(0.4),
              ),
            ),
          ),

          //  Modal qui slide du bas
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              width: double.infinity,
              height: 55.h,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(8.w),
                  topRight: Radius.circular(8.w),
                ),
              ),
              child: Column(
                children: [
                  // ✅ petit handle gris
                  Container(
                    width: 10.w,
                    height: 0.7.h,
                    margin: EdgeInsets.symmetric(vertical: 2.h),
                    decoration: BoxDecoration(
                      color: Colors.grey[400],
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),

                  SizedBox(height: 1.h),

                  // ✅ Lottie success
                  Lottie.asset(
                    "assets/success.json",
                    height: 23.5.h,
                  ),

                  SizedBox(height: 2.h),

                  // ✅ Titre
                  Text(
                    "Mot de passe vérifié",
                    style: GoogleFonts.poppins(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),

                  SizedBox(height: 1.h),

                  // ✅ Description
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8.w),
                    child: Text(
                      "Le mot de passe a été créé avec succès, vous pouvez vous connecter à nouveau avec le mot de passe créé.",
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: 14.sp,
                        color: Colors.grey[600],
                        height: 1.5,
                      ),
                    ),
                  ),

                  const Spacer(),

                  // ✅ Bouton
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 6.w, vertical: 3.h),
                    child: CustomElevatedButton(
                      text: "Connectez-vous",
                      backgroundColor: const Color(0xFF007AFF),
                      textColor: Colors.white,
                      width: double.infinity,
                      height: 7.h,
                      onPressed: () {
                        Navigator.pushReplacementNamed(context, "/mdp_page");
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
