import 'package:eebtp_frontend/services/auth.dart';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_svg/svg.dart';

class PasswordCreatedPage extends StatefulWidget {
  final String phone; // ✅ récupéré depuis la page précédente

  const PasswordCreatedPage({super.key, required this.phone});

  @override
  State<PasswordCreatedPage> createState() => _PasswordCreatedPageState();
}

class _PasswordCreatedPageState extends State<PasswordCreatedPage> {
  final _passController = TextEditingController();
  final UserService _userService = UserService();
  bool _obscure = true;
  String? _errorMessage;
  bool _remember = false;

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
                    child: const Icon(
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

              // Illustration
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
                  border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
                ),
                child: TextField(
                  controller: _passController,
                  obscureText: _obscure,
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: "Mot de passe",
                    hintStyle: GoogleFonts.poppins(
                      fontSize: 13.sp,
                      color: Colors.grey,
                    ),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscure ? Icons.visibility_off : Icons.visibility,
                        color: Colors.grey,
                      ),
                      onPressed: () {
                        setState(() => _obscure = !_obscure);
                      },
                    ),
                  ),
                ),
                // Options
              ),

              if (_errorMessage != null) ...[
                SizedBox(height: 1.h),
                Text(
                  _errorMessage!,
                  style: GoogleFonts.poppins(
                    fontSize: 12.sp,
                    color: Colors.red,
                  ),
                ),
              ],
              Row(
                children: [
                  GestureDetector(
                    onTap: () => setState(() => _remember = !_remember),
                    child: Container(
                      width: 4.w,
                      height: 4.w,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: _remember ? Colors.blue : Colors.grey,
                          width: 0.2.w,
                        ),
                        color: _remember ? Colors.blue : Colors.transparent,
                      ),
                      child: _remember
                          ? Icon(Icons.check, size: 2.w, color: Colors.white)
                          : null,
                    ),
                  ),
                  SizedBox(width: 2.w),
                  Text(
                    'Se souvenir de moi',
                    style: GoogleFonts.poppins(fontSize: 14.sp),
                  ),
                ],
              ),

              SizedBox(height: 10.h),

              // Progression
              SizedBox(height: 10.h),

              // Bouton
              CustomElevatedButton(
                text: "Se connecter",
                backgroundColor: const Color(0xFF007AFF),
                textColor: Colors.white,
                onPressed: () async {
                  final password = _passController.text.trim();

                  if (password.isEmpty) {
                    setState(() {
                      _errorMessage = "Veuillez entrer votre mot de passe";
                    });
                    return;
                  }

                  final token = await _userService.loginByPhone(
                    widget.phone,
                    password,
                  );

                  if (token != null) {
                    Navigator.pushNamed(
                      context,
                      '/profile',
                      arguments: token, // ✅ on envoie le token
                    );
                  } else {
                    setState(() {
                      _errorMessage =
                          "Échec de connexion. Vérifiez vos identifiants.";
                    });
                  }
                },

                /*                 onPressed: () {
                  Navigator.pushNamed(context, '/profile');
                }, */
                width: 80.w,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
