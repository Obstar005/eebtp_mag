import 'dart:convert';
import 'package:eebtp_frontend/services/auth.dart';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_svg/svg.dart';
import 'package:toastification/toastification.dart';

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

  return Scaffold(
    backgroundColor: Colors.white,
    resizeToAvoidBottomInset: true,
    body: SafeArea(
      child: LayoutBuilder(
        builder: (context, constraints) {
          final availableHeight = constraints.maxHeight;
          final illustrationHeight = (availableHeight * 0.18).clamp(90.0, 140.0);
          final titleSize = (availableHeight * 0.028).clamp(15.0, 20.0);
          final subtitleSize = (availableHeight * 0.02).clamp(11.0, 15.0);
          final fieldFont = (availableHeight * 0.02).clamp(11.0, 15.0);
          final infoBoxFont = (availableHeight * 0.016).clamp(9.0, 13.0);
          final errorIconSize = (availableHeight * 0.022).clamp(14.0, 18.0);

          return SingleChildScrollView(
            physics: const ClampingScrollPhysics(),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
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
                        padding: EdgeInsets.all(8),
                        child: Icon(
                          Icons.arrow_back_ios_new,
                          color: Colors.white,
                          size: 16,
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
                      height: illustrationHeight,
                    ),
                  ),
                  SizedBox(height: availableHeight * 0.01),

                  Text(
                    "Bienvenue",
                    style: GoogleFonts.poppins(
                      fontSize: titleSize,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(height: availableHeight * 0.006),

                  Text(
                    "Connectez-vous à votre compte",
                    style: GoogleFonts.poppins(
                      fontSize: subtitleSize,
                      color: Colors.black54,
                    ),
                  ),
                  SizedBox(height: availableHeight * 0.015),

                  Container(
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
                        fontSize: infoBoxFont,
                        color: Colors.black87,
                        height: 1.4,
                      ),
                    ),
                  ),
                  SizedBox(height: availableHeight * 0.015),

                  // Champ mot de passe
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.5.h),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(
                        color: _errorMessage != null
                            ? Colors.red
                            : const Color(0xFFE2E8F0),
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
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 3.w,
                          vertical: 1.2.h,
                        ),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscure ? Icons.visibility_off : Icons.visibility,
                            color: Colors.grey,
                          ),
                          onPressed: () => setState(() => _obscure = !_obscure),
                        ),
                      ),
                    ),
                  ),

                  if (_errorMessage != null) ...[
                    SizedBox(height: availableHeight * 0.008),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.error_outline, color: Colors.red, size: errorIconSize),
                        SizedBox(width: 2.w),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: GoogleFonts.poppins(
                              fontSize: fieldFont * 0.9,
                              color: Colors.red,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],

                  SizedBox(height: availableHeight * 0.015),

                  // Checkbox
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => setState(() => _remember = !_remember),
                        child: Container(
                          width: 18,
                          height: 18,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: _remember ? Colors.blue : Colors.grey,
                              width: 2,
                            ),
                            color: _remember ? Colors.blue : Colors.transparent,
                          ),
                          child: _remember
                              ? Icon(Icons.check, size: 12, color: Colors.white)
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

                  SizedBox(height: 12.h),

                  // Bouton
                  Column(
                    children: [
                      CustomElevatedButton(
                        text: 'Se connecter',
                        backgroundColor: const Color(0xFF007AFF),
                        textColor: Colors.white,
                        width: 70.w,
                        onPressed: () async {
                          final password = _passController.text.trim();
                          if (password.isEmpty) {
                            setState(() {
                              _errorMessage = "Veuillez entrer votre mot de passe";
                            });
                            return;
                          }

                          final result = await _userService.loginByPhone(phone, password);

                          if (result != null) {
                            final data = jsonDecode(result);
                            final String token = data['access_token'];

                            _showToast(
                              message: "Connexion réussie !",
                              type: ToastificationType.success,
                            );

                            _clearController();
                            await Future.delayed(const Duration(milliseconds: 700));

                            if (mounted) {
                              Navigator.pushNamedAndRemoveUntil(
                                context,
                                '/store_selection',
                                (route) => false,
                                arguments: token,
                              );
                            }
                          } else {
                            setState(() {
                              _errorMessage = "Échec de connexion. Vérifiez votre mot de passe.";
                            });
                          }
                        },
                      ),
                    ],
                  ),

                  SizedBox(height: 2.h),
                ],
              ),
            ),
          );
        },
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