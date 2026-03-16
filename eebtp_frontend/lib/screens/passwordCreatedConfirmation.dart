import 'package:eebtp_frontend/screens/modal_success.dart';
import 'package:eebtp_frontend/widgets/button.dart';
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

    final availableHeight = MediaQuery.of(context).size.height -
        MediaQuery.of(context).padding.top;

    final fieldFont = (availableHeight * 0.02).clamp(11.0, 15.0);
    final titleFont = (availableHeight * 0.028).clamp(15.0, 20.0);
    final errorIconSize = (availableHeight * 0.022).clamp(14.0, 18.0);
    final imageSize = availableHeight < 600 ? 12.h : (availableHeight * 0.2).clamp(100.0, 160.0);
    final double topPad = availableHeight < 600 ? 1.h : 2.h;
    final double smallGap = availableHeight < 600 ? 0.8.h : 1.2.h;
    final double largeGap = availableHeight < 600 ? 1.5.h : 2.5.h;

    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: 6.w,
                vertical: 1.5.h,
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight - 3.h,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: topPad),

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
                          _clearControllers();
                          Navigator.pop(context);
                        },
                      ),
                    ),

                    // Image SVG
                    Center(
                      child: SvgPicture.asset(
                        'assets/Floor.svg',
                        height: imageSize,
                        fit: BoxFit.contain,
                      ),
                    ),
                    SizedBox(height: smallGap),

                    // Titre
                    Text(
                      "Modifier votre mot de passe",
                      style: GoogleFonts.poppins(
                        fontSize: titleFont,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                    SizedBox(height: 0.8.h),

                    // Sous-titre
                    Text(
                      "Saisissez votre nouveau mot de passe",
                      style: GoogleFonts.poppins(
                        fontSize: fieldFont * 0.93,
                        color: Colors.black54,
                      ),
                    ),
                    SizedBox(height: smallGap),

                    // Encadré d'instructions
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
                          fontSize: fieldFont * .85,
                          color: Colors.black87,
                          height: 1.5,
                        ),
                      ),
                    ),
                    SizedBox(height: largeGap),

                    // Ancien mot de passe
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.5.h),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
                      ),
                      child: TextField(
                        controller: oldPassController,
                        obscureText: _obscurePass,
                        style: GoogleFonts.poppins(fontSize: fieldFont),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: "Ancien mot de passe",
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
                              _obscurePass ? Icons.visibility_off : Icons.visibility,
                              color: Colors.grey,
                            ),
                            onPressed: () => setState(() => _obscurePass = !_obscurePass),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: smallGap),

                    // Nouveau mot de passe
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.5.h),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
                      ),
                      child: TextField(
                        controller: newPassController,
                        obscureText: _obscurePass,
                        style: GoogleFonts.poppins(fontSize: fieldFont),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: "Nouveau mot de passe",
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
                              _obscurePass ? Icons.visibility_off : Icons.visibility,
                              color: Colors.grey,
                            ),
                            onPressed: () => setState(() => _obscurePass = !_obscurePass),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: smallGap),

                    // Confirmer mot de passe
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.5.h),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
                      ),
                      child: TextField(
                        controller: confirmPassController,
                        obscureText: _obscurePass,
                        style: GoogleFonts.poppins(fontSize: fieldFont),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: "Confirmer le mot de passe",
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
                              _obscurePass ? Icons.visibility_off : Icons.visibility,
                              color: Colors.grey,
                            ),
                            onPressed: () => setState(() => _obscurePass = !_obscurePass),
                          ),
                        ),
                      ),
                    ),

                    // Message d'erreur
                    if (_errorMessage != null) ...[
                      SizedBox(height: 1.h),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.error_outline, color: Colors.red, size: errorIconSize),
                          SizedBox(width: 2.w),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: GoogleFonts.poppins(
                                fontSize: fieldFont * .98,
                                color: Colors.red,
                              ),
                              softWrap: true,
                            ),
                          ),
                        ],
                      ),
                    ],
                    SizedBox(height: largeGap),

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
                            if (mounted) {
                              showDialog(
                                context: context,
                                barrierDismissible: false,
                                builder: (BuildContext context) {
                                  return PasswordVerifiedModal(phone: phone);
                                },
                              );
                            }
                          } else {
                            setState(() {
                              _errorMessage = "Échec de la mise à jour du mot de passe";
                            });
                          }
                        },
                        width: 72.w,
                      ),
                    ),

                    SizedBox(height: MediaQuery.of(context).viewInsets.bottom > 0
                        ? 2.h
                        : 4.h),
                  ],
                ),
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