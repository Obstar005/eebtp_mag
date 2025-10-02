import 'package:eebtp_frontend/screens/passwordCreatedConfirmation.dart';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:eebtp_frontend/widgets/input.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class NewPasswordScreen extends StatefulWidget {
  const NewPasswordScreen({super.key});
  @override
  State<NewPasswordScreen> createState() => _NewPasswordScreenState();
}

class _NewPasswordScreenState extends State<NewPasswordScreen> {
  final _newPassController = TextEditingController();
  final _confirmPassController = TextEditingController();
  bool _obscureNewPass = true;
  bool _obscureConfirmPass = true;

  String? _errorMessage;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: IconButton(
                icon: Container(
                  decoration: const BoxDecoration(
                    color: Color(0xFF007AFF),
                    shape: BoxShape.circle,
                  ),
                  padding: const EdgeInsets.all(6),
                  child: Icon(
                    Icons.arrow_back_ios_new,
                    color: Colors.white,
                    size: 14.sp,
                  ),
                ),
                onPressed: () => Navigator.pop(context),
              ),
            ),

            Center(child: SvgPicture.asset('assets/Floor.svg', height: 25.h)),
            SizedBox(height: 2.h),

            Text(
              'Créer un nouveau mot de passe',
              style: GoogleFonts.poppins(
                fontSize: 18.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              'Saisissez votre nouveau mot de passe',
              style: GoogleFonts.poppins(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 5.h),
            Text(
              'Le mot de passe doit contenir au minimum 8 caractères, incluant des lettres et des chiffres',
              style: GoogleFonts.poppins(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 2.h),

            /// --- Input Nouveau mot de passe
            CustomInputField(
              controller: _newPassController,
              hintText: "Nouveau mot de passe",
              obscureText: _obscureNewPass,
              onToggleVisibility: () {
                setState(() => _obscureNewPass = !_obscureNewPass);
              },
              hasError: _errorMessage != null,
            ),

            SizedBox(height: 5.h),

            /// --- Input Confirmation mot de passe
            CustomInputField(
              controller: _confirmPassController,
              hintText: "Confirmer le mot de passe",
              obscureText: _obscureConfirmPass,
              onToggleVisibility: () {
                setState(() => _obscureConfirmPass = !_obscureConfirmPass);
              },
              hasError: _errorMessage != null,
              errorText: _errorMessage,
            ),

            SizedBox(height: 16.h),

            SizedBox(
              width: double.infinity,
              child: CustomElevatedButton(
                text: 'Créer',
                backgroundColor: const Color(0xFF007AFF),
                textColor: Colors.white,
                onPressed: () {
                  if (_validatePasswords()) {
                    _saveNewPassword();
                    /*          showDialog(
                      context: context,
                      barrierDismissible: false,
                      builder: (context) => PasswordCreatedModal(),
                    ); */
                  }
                },
                width: 80.w, // Largeur augmentée (80% de l'écran)
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool _validatePasswords() {
    setState(() => _errorMessage = null);

    if (_newPassController.text.isEmpty ||
        _confirmPassController.text.isEmpty) {
      setState(() => _errorMessage = "Veuillez remplir tous les champs");
      return false;
    }

    if (_newPassController.text != _confirmPassController.text) {
      setState(() => _errorMessage = "Les mots de passe ne correspondent pas");
      return false;
    }

    if (_newPassController.text.length < 8) {
      setState(
        () => _errorMessage =
            "Le mot de passe doit contenir au moins 8 caractères",
      );
      return false;
    }

    return true;
  }

  void _saveNewPassword() {
    Navigator.pushNamedAndRemoveUntil(context, '/profile', (route) => false);
  }
}
