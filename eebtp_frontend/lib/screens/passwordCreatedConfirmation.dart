import 'package:eebtp_frontend/screens/modal_success.dart';
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

    // Responsive sizing based on Sizer
    double topPad = 2.h;
    double fieldFont = 12.sp;
    double titleFont = 17.sp;
    double errorIcon = 16.sp;
    double smallGap = 1.2.h;
    double largeGap = 2.5.h;
    double imageSize = 22.h;

    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 1.5.h),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: 50.h,
                maxWidth: 90.w,
              ),
              child: IntrinsicHeight(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: topPad),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: IconButton(
                        icon: Container(
                          decoration: const BoxDecoration(
                            color: Color(0xFF007AFF),
                            shape: BoxShape.circle,
                          ),
                          padding: EdgeInsets.all(2.w),
                          child: Icon(
                            Icons.arrow_back_ios_new,
                            color: Colors.white,
                            size: 16.sp,
                          ),
                        ),
                        onPressed: () {
                          _clearControllers();
                          Navigator.pop(context);
                        },
                      ),
                    ),
                    Center(
                      child: SvgPicture.asset(
                        'assets/Floor.svg',
                        height: imageSize,
                        fit: BoxFit.contain,
                      ),
                    ),
                    SizedBox(height: smallGap),
                    Text(
                      "Modifier votre mot de passe",
                      style: GoogleFonts.poppins(
                        fontSize: titleFont,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                    SizedBox(height: 0.8.h),
                    Text(
                      "Saisissez votre nouveau mot de passe",
                      style: GoogleFonts.poppins(
                        fontSize: fieldFont * 0.93,
                        color: Colors.black54,
                      ),
                    ),
                    SizedBox(height: smallGap),
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
                          height: 1.5,
                        ),
                      ),
                    ),
                    SizedBox(height: largeGap),
                    CustomInputField(
                      controller: oldPassController,
                      hintText: "Ancien mot de passe",
                      obscureText: _obscurePass,
                      fontSize: fieldFont,
                      onToggleVisibility: () {
                        setState(() => _obscurePass = !_obscurePass);
                      },
                    ),
                    SizedBox(height: smallGap),
                    CustomInputField(
                      controller: newPassController,
                      hintText: "Nouveau mot de passe",
                      obscureText: _obscurePass,
                      fontSize: fieldFont,
                      onToggleVisibility: () {
                        setState(() => _obscurePass = !_obscurePass);
                      },
                    ),
                    SizedBox(height: smallGap),
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
                          Icon(Icons.error_outline, color: Colors.red, size: errorIcon),
                          SizedBox(width: 2.w),
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
                    SizedBox(height: largeGap),
                    CustomElevatedButton(
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
                      width: 72.w,
                    ),
                    SizedBox(height: 2.h),
                  ],
                ),
              ),
            ),
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
