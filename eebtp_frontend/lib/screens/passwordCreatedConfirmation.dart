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

  void _clearControllers() {
    oldPassController.clear();
    newPassController.clear();
    confirmPassController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final args =
        ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final String phone = args['phone'];

    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: false, // Important
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final fieldFont = constraints.maxHeight < 700 ? 11.sp : 14.sp;
            final titleFont = constraints.maxHeight < 700 ? 16.sp : 18.sp;
            final smallPad = constraints.maxHeight < 700 ? 6.0 : 12.0;
            return Padding(
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
                        padding: const EdgeInsets.all(8),
                        child: Icon(
                          Icons.arrow_back_ios_new,
                          color: Colors.white,
                          size: fieldFont,
                        ),
                      ),
                      onPressed: () {
                        _clearControllers();
                        Navigator.pop(context);
                      },
                    ),
                  ),
                  Center(child: SvgPicture.asset('assets/Floor.svg', height: 25.h)), // illustration
                  SizedBox(height: 2.h),
                  Text(
                    "Modifier votre mot de passe",
                    style: GoogleFonts.poppins(
                      fontSize: titleFont,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(height: 1.h),
                  Text(
                    "Saisissez votre nouveau mot de passe",
                    style: GoogleFonts.poppins(
                      fontSize: fieldFont,
                      color: Colors.black54,
                    ),
                  ),
                  SizedBox(height: 2.h),
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
                        fontSize: fieldFont * .85,
                        color: Colors.black87,
                        height: 1.6,
                      ),
                    ),
                  ),
                  SizedBox(height: 3.h),
                  CustomInputField(
                    controller: oldPassController,
                    hintText: "Ancien mot de passe",
                    obscureText: _obscurePass,
                    fontSize: fieldFont,
                    onToggleVisibility: () {
                      setState(() => _obscurePass = !_obscurePass);
                    },
                  ),
                  SizedBox(height: 2.h),
                  CustomInputField(
                    controller: newPassController,
                    hintText: "Nouveau mot de passe",
                    obscureText: _obscurePass,
                    fontSize: fieldFont,
                    onToggleVisibility: () {
                      setState(() => _obscurePass = !_obscurePass);
                    },
                  ),
                  SizedBox(height: 2.h),
                  CustomInputField(
                    controller: confirmPassController,
                    hintText: "Confirmer le mot de passe",
                    obscureText: _obscurePass,
                    fontSize: fieldFont,
                    onToggleVisibility: () {
                      setState(() => _obscurePass = !_obscurePass);
                    },
                  ),
                  if (_errorMessage != null) ...[
                    SizedBox(height: 1.h),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.error_outline, color: Colors.red, size: fieldFont * 1.1),
                        SizedBox(width: 1.w),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: GoogleFonts.poppins(
                              fontSize: fieldFont * .98,
                              color: Colors.red,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                  Spacer(),
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
                            _errorMessage = "Les mots de passe ne correspondent pas";
                          });
                          return;
                        }
                        final success = await _userService.setPassword(
                          phone: phone,
                          oldPassword: oldPass,
                          newPassword: newPass,
                        );
                        if (success) {
                          _clearControllers();
                          showDialog(
                            context: context,
                            barrierDismissible: false,
                            builder: (BuildContext context) {
                              return PasswordVerifiedModal(phone: phone);
                            },
                          );
                        } else {
                          setState(() {
                            _errorMessage = "Échec de la mise à jour du mot de passe";
                          });
                        }
                      },
                      width: 70.w,
                    ),
                  ),
                  SizedBox(height: 2.h),
                ],
              ),
            );
          },
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
