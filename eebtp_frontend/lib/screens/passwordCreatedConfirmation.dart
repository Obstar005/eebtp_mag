import 'package:eebtp_frontend/screens/modal_success.dart';
import 'package:eebtp_frontend/screens/passwordCreatedConfirmation.dart';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:eebtp_frontend/widgets/input.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import 'package:eebtp_frontend/services/auth.dart';

class ChangePasswordPage extends StatefulWidget {
  const ChangePasswordPage({super.key});

  @override
  State<ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<ChangePasswordPage> {
  final oldPassController = TextEditingController();
  final newPassController = TextEditingController();
  final confirmPassController = TextEditingController();
  bool _obscurePass = true;
  String? _errorMessage;
  final UserService _userService = UserService();

  @override
  Widget build(BuildContext context) {
    // Récupérer les arguments passés depuis la page précédente
    final args =
        ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final String phone = args['phone'];
    final String token = args['token'];

    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
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
                    padding: const EdgeInsets.all(8),
                    child: Icon(
                      Icons.arrow_back_ios_new,
                      color: Colors.white,
                      size: 15.sp,
                    ),
                  ),
                  onPressed: () => Navigator.pop(context),
                ),
              ),

              // Illustration
              Center(child: SvgPicture.asset('assets/Floor.svg', height: 25.h)),
              SizedBox(height: 2.h),

              // Titre
              Text(
                "Modifier votre mot de passe",
                style: GoogleFonts.poppins(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              SizedBox(height: 1.h),

              // Sous-titre
              Text(
                "Saisissez votre nouveau mot de passe",
                style: GoogleFonts.poppins(
                  fontSize: 14.sp,
                  color: Colors.black54,
                ),
              ),
              SizedBox(height: 2.h),

              // Bloc consignes
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
                    fontSize: 12.sp,
                    color: Colors.black87,
                    height: 1.6,
                  ),
                ),
              ),
              SizedBox(height: 3.h),

              // Champ ancien mot de passe
              CustomInputField(
                controller: oldPassController,
                hintText: "Ancien mot de passe",
                obscureText: _obscurePass,
                onToggleVisibility: () {
                  setState(() => _obscurePass = !_obscurePass);
                },
              ),
              SizedBox(height: 2.h),

              // Champ nouveau mot de passe
              CustomInputField(
                controller: newPassController,
                hintText: "Nouveau mot de passe",
                obscureText: _obscurePass,
                onToggleVisibility: () {
                  setState(() => _obscurePass = !_obscurePass);
                },
              ),
              SizedBox(height: 2.h),

              // Champ confirmation
              CustomInputField(
                controller: confirmPassController,
                hintText: "Confirmer le mot de passe",
                obscureText: _obscurePass,
                onToggleVisibility: () {
                  setState(() => _obscurePass = !_obscurePass);
                },
              ),

              if (_errorMessage != null) ...[
                SizedBox(height: 1.h),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.error_outline, color: Colors.red, size: 4.w),
                    SizedBox(width: 1.w),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: GoogleFonts.poppins(
                          fontSize: 12.sp,
                          color: Colors.red,
                        ),
                      ),
                    ),
                  ],
                ),
              ],

              SizedBox(height: 8.h),

              // Bouton
              Center(
                child: CustomElevatedButton(
                  text: 'Suivant',
                  backgroundColor: const Color(0xFF007AFF),
                  textColor: Colors.white,
                  onPressed: () async {
                    final oldPass = oldPassController.text.trim();
                    final newPass = newPassController.text.trim();
                    final confirmPass = confirmPassController.text.trim();

                    if (!_validatePassword(newPass)) return;

                    if (newPass != confirmPass) {
                      setState(() {
                        _errorMessage =
                            "Les mots de passe ne correspondent pas";
                      });
                      return;
                    }

                    final success = await _userService.setPassword(
                      phone: phone,
                      oldPassword: oldPass,
                      newPassword: newPass,
                    );

                    if (success) {
                      showDialog(
                        context: context,
                        barrierDismissible:
                            false, // Empêche la fermeture en cliquant en dehors
                        builder: (BuildContext context) {
                          return PasswordVerifiedModal(phone: phone);
                        },
                      );
                    } else {
                      setState(() {
                        _errorMessage =
                            "Échec de la mise à jour du mot de passe";
                      });
                    }
                  },
                  width: 70.w,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  bool _validatePassword(String password) {
    setState(() => _errorMessage = null);

    if (password.isEmpty) {
      setState(() => _errorMessage = "Veuillez saisir un mot de passe");
      return false;
    }
    if (password.length < 8) {
      setState(() => _errorMessage = "Au moins 8 caractères requis");
      return false;
    }
    if (!RegExp(r'[A-Z]').hasMatch(password)) {
      setState(() => _errorMessage = "Au moins une majuscule requise");
      return false;
    }
    if (!RegExp(r'[a-z]').hasMatch(password)) {
      setState(() => _errorMessage = "Au moins une minuscule requise");
      return false;
    }
    if (!RegExp(r'[0-9]').hasMatch(password)) {
      setState(() => _errorMessage = "Au moins un chiffre requis");
      return false;
    }

    return true;
  }

  @override
  void dispose() {
    oldPassController.dispose();
    newPassController.dispose();
    confirmPassController.dispose();
    super.dispose();
  }
}
