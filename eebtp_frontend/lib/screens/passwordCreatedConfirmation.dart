import 'package:eebtp_frontend/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_svg/svg.dart';
class PasswordCreatedPage extends StatelessWidget {
  const PasswordCreatedPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 4.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Bouton retour
              Align(
                alignment: Alignment.centerLeft,
                child: IconButton(
                  icon: Container(
                    decoration: const BoxDecoration(
                      color: Color(0xFF007AFF),
                      shape: BoxShape.circle,
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Icon(
                      Icons.arrow_back_ios_new,
                      color: Colors.white,
                      size: 15,
                    ),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
              ),
                 Center(
                   child: SvgPicture.asset(
                             'assets/illustration.svg',
                             height: 23.h,
                           ),
                 ),

              SizedBox(height: 2.h),

              // Titre
              Text(
                "Bienvenue",
                style: GoogleFonts.poppins(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),

              SizedBox(height: 1.h),

              // Sous-titre
              Text(
                "Connectez vous à votre compte",
                style: GoogleFonts.poppins(
                  fontSize: 13.sp,
                  color: Colors.black54,
                ),
              ),

              SizedBox(height: 2.h),

              // Bloc règles de mot de passe
              Container(
                width: double.infinity,
                padding: EdgeInsets.all(3.w),
                decoration: BoxDecoration(
                  color: const Color(0xFFEAF2FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  "Le mot de passe doit comporter un minimum de huit caractères sans espaces avec :\n\n"
                  "• Au moins une lettre majuscule\n"
                  "• Au moins une lettre minuscule\n"
                  "• Au moins un chiffre",
                  style: GoogleFonts.poppins(
                    fontSize: 12.sp,
                    color: Colors.black87,
                    height: 1.6,
                  ),
                ),
              ),

              SizedBox(height: 3.h),

              // Champ mot de passe
              Container(
                padding: EdgeInsets.symmetric(horizontal: 3.w),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(
                    color: const Color(0xFFE2E8F0),
                    width: 1,
                  ),
                ),
                child: TextField(
                  obscureText: true,
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: "Mot de passe",
                    hintStyle: GoogleFonts.poppins(
                      fontSize: 13.sp,
                      color: Colors.grey,
                    ),
                    suffixIcon: const Icon(Icons.visibility_off,
                        color: Colors.grey),
                  ),
                ),
              ),

              SizedBox(height: 2.h),

              // Options
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.check_circle,
                          color: const Color(0xFF007AFF), size: 16.sp),
                      SizedBox(width: 2.w),
                      Text(
                        "Se souvenir de moi",
                        style: GoogleFonts.poppins(
                          fontSize: 12.sp,
                          color: Colors.black54,
                        ),
                      ),
                    ],
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.pushNamed(context, '/forgot_password');
                    },
                    child: Text(
                      "Mots de pass oublié?",
                      style: GoogleFonts.poppins(
                        fontSize: 12.sp,
                        color: const Color(0xFF007AFF),
                      ),
                    ),
                  ),
                ],
              ),

              SizedBox(height: 10.h),

              // Progression
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8.w,
                    height: 0.8.h,
                    decoration: BoxDecoration(
                      color: const Color(0xFF007AFF),
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  SizedBox(width: 2.w),
                  Container(
                    width: 3.w,
                    height: 0.8.h,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ],
              ),

              SizedBox(height: 5.h),

              // Bouton
              CustomElevatedButton(
                text: "Se connecter",
                backgroundColor: const Color(0xFF007AFF),
                textColor: Colors.white,
                onPressed: () {
                  Navigator.pushNamed(context, '/profile');
                },
                width: 80.w,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
