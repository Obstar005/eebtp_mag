import 'dart:convert';
import 'package:eebtp_frontend/services/auth.dart';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_svg/svg.dart';
import 'package:toastification/toastification.dart'; // Assure-toi d'avoir ce package dans ton pubspec

class PasswordLoginPage extends StatefulWidget {
  const PasswordLoginPage({super.key});

  @override
  State<PasswordLoginPage> createState() => _PasswordLoginPageState();
}

class _PasswordLoginPageState extends State<PasswordLoginPage> {
  final _passController = TextEditingController();
  final UserService _userService = UserService();
  bool _obscure = true;
  String? _errorMessage;
  bool _remember = false;

  void _clearController() => _passController.clear();

  void _showToast({
    required String message,
    required ToastificationType type,
  }) {
    toastification.show(
      context: context,
      type: type,
      style: ToastificationStyle.flatColored,
      title: Text(
        message,
        style: GoogleFonts.poppins(
          fontSize: 12.5.sp,
          fontWeight: FontWeight.w500,
        ),
      ),
      autoCloseDuration: const Duration(seconds: 2),
      alignment: Alignment.topCenter,
      pauseOnHover: true,
      dragToClose: true,
      borderRadius: BorderRadius.circular(11),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.07),
          blurRadius: 12,
          offset: const Offset(0, 8),
        )
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final String phone = ModalRoute.of(context)!.settings.arguments as String;

    // Tailles et polices responsives
    double fieldFont = 13.sp;
    double mainFont = 18.sp;
    double errorIcon = 15.sp;
    double cardPad = 3.w;
    double imageSize = 22.h;

    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: 7.w, vertical: 3.5.h),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: 48.h,
                maxWidth: 90.w,
              ),
              child: IntrinsicHeight(
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
                          padding: EdgeInsets.all(2.3.w),
                          child: Icon(
                            Icons.arrow_back_ios_new,
                            color: Colors.white,
                            size: fieldFont * 1.12,
                          ),
                        ),
                        onPressed: () {
                          _clearController();
                          Navigator.pop(context);
                        },
                      ),
                    ),
                    Center(
                      child: SvgPicture.asset(
                        'assets/illustration.svg',
                        height: imageSize,
                        fit: BoxFit.contain,
                      ),
                    ),
                    SizedBox(height: 2.h),
                    Text(
                      "Bienvenue",
                      style: GoogleFonts.poppins(
                        fontSize: mainFont,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                    SizedBox(height: .9.h),
                    Text(
                      "Connectez-vous avec votre nouveau mot de passe",
                      style: GoogleFonts.poppins(
                        fontSize: fieldFont,
                        color: Colors.black54,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 2.h),
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(cardPad),
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
                          fontSize: fieldFont * .9,
                          color: Colors.black87,
                          height: 1.58,
                        ),
                      ),
                    ),
                    SizedBox(height: 3.h),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 3.w),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(
                          color: _errorMessage != null ? Colors.red : const Color(0xFFE2E8F0),
                          width: 1,
                        ),
                      ),
                      child: TextField(
                        controller: _passController,
                        obscureText: _obscure,
                        style: GoogleFonts.poppins(fontSize: fieldFont),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: "Mot de passe",
                          hintStyle: GoogleFonts.poppins(
                            fontSize: fieldFont,
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
                    ),
                    if (_errorMessage != null) ...[
                      SizedBox(height: 1.h),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.error_outline, color: Colors.red, size: errorIcon),
                          SizedBox(width: 2.w),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: GoogleFonts.poppins(
                                fontSize: fieldFont * 0.96,
                                color: Colors.red,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                    SizedBox(height: 2.h),
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () => setState(() => _remember = !_remember),
                          child: Container(
                            width: 4.2.w,
                            height: 4.2.w,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: _remember ? Colors.blue : Colors.grey,
                                width: 0.32.w,
                              ),
                              color: _remember ? Colors.blue : Colors.transparent,
                            ),
                            child: _remember
                                ? Icon(Icons.check, size: 2.2.w, color: Colors.white)
                                : null,
                          ),
                        ),
                        SizedBox(width: 2.w),
                        Text(
                          'Se souvenir de moi',
                          style: GoogleFonts.poppins(fontSize: fieldFont),
                        ),
                      ],
                    ),
                    const Spacer(),
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
                        final result = await _userService.loginByPhone(
                          phone,
                          password,
                        );
                        if (result != null) {
                          final data = jsonDecode(result);
                          final String token = data['access_token'];
                          _showToast(
                            message: "Connexion réussie !",
                            type: ToastificationType.success,
                          );
                          _clearController();
                          await Future.delayed(const Duration(milliseconds: 700));
                          Navigator.pushNamedAndRemoveUntil(
                            context,
                            '/store_selection',
                            (route) => false,
                            arguments: token,
                          );
                        } else {
                          setState(() {
                            _errorMessage = "Échec de connexion. Vérifiez votre mot de passe.";
                          });
                        }
                      },
                      width: 80.w,
                    ),
                    SizedBox(height: 2.5.h),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _passController.dispose();
    super.dispose();
  }
}
