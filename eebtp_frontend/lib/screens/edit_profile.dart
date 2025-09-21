import 'dart:ui';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:eebtp_frontend/widgets/input.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  _EditProfilePageState createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage>
    with TickerProviderStateMixin {
  int _currentIndex = 3; // Onglet profil sélectionné
  bool _isFabExpanded = false;
  bool _isPasswordVisible = false;
  late AnimationController _animationController;
  late Animation<double> _animation;

  // Controllers pour les champs de saisie
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  // Variables pour le téléphone international
  String _phone = '';
  PhoneNumber _initialPhone = PhoneNumber(isoCode: 'TG');

  // Variables pour la gestion des erreurs
  bool _phoneHasError = false;
  bool _passwordHasError = false;
  String? _phoneErrorText;
  String? _passwordErrorText;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 300));
    _animation =
        CurvedAnimation(parent: _animationController, curve: Curves.easeInOut);
    
    // Initialiser le numéro de téléphone existant
    _phone = '+22890909090';
    _initialPhone = PhoneNumber(isoCode: 'TG', phoneNumber: '+22890909090');
  }

  @override
  void dispose() {
    _animationController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _toggleFab() {
    setState(() {
      _isFabExpanded = !_isFabExpanded;
      if (_isFabExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  void _handleSecondaryFabPressed(String type) {
    switch (type) {
      case 'entry':
        _toggleFab();
        Navigator.pushNamed(context, '/entry');
        break;
      case 'exit':
        _toggleFab();
        Navigator.pushNamed(context, '/exit');
        break;
      case 'refresh':
        _toggleFab();
        Navigator.pushNamed(context, '/refresh');
        break;
    }
  }

  void _handleNavigation(int index) {
    setState(() => _currentIndex = index);
    _navigateToPage(index);
  }

  void _navigateToPage(int index) {
    switch (index) {
      case 0:
        Navigator.pushReplacementNamed(context, '/home');
        break;
      case 1:
        Navigator.pushReplacementNamed(context, '/stock');
        break;
      case 2:
        Navigator.pushReplacementNamed(context, '/demande');
        break;
      case 3:
        Navigator.pushReplacementNamed(context, '/profile');
        break;
    }
  }

  void _togglePasswordVisibility() {
    setState(() {
      _isPasswordVisible = !_isPasswordVisible;
    });
  }

  void _validateAndSave() {
    setState(() {
      _phoneHasError = false;
      _passwordHasError = false;
      _phoneErrorText = null;
      _passwordErrorText = null;
    });

    bool hasErrors = false;

    // Validation du numéro de téléphone
    if (_phone.isEmpty) {
      setState(() {
        _phoneHasError = true;
        _phoneErrorText = "Le numéro de téléphone est requis";
      });
      hasErrors = true;
    } else if (_phone.length < 8) {
      setState(() {
        _phoneHasError = true;
        _phoneErrorText = "Numéro de téléphone invalide";
      });
      hasErrors = true;
    }

    // Validation du mot de passe
    if (_passwordController.text.isEmpty) {
      setState(() {
        _passwordHasError = true;
        _passwordErrorText = "Le mot de passe est requis";
      });
      hasErrors = true;
    } else if (_passwordController.text.length < 6) {
      setState(() {
        _passwordHasError = true;
        _passwordErrorText = "Le mot de passe doit contenir au moins 6 caractères";
      });
      hasErrors = true;
    }

    if (!hasErrors) {
      _showSuccessDialog();
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.5),
      builder: (context) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 3.0, sigmaY: 3.0),
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4.w)),
          title: Center(
            child: Column(
              children: [
                Icon(Icons.check_circle, 
                     color: Colors.green, size: 15.w),
                SizedBox(height: 2.h),
                Text("Succès",
                    style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w700,
                        fontFamily: "Montserrat")),
              ],
            ),
          ),
          content: Text("Votre profil a été mis à jour avec succès !",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14.sp, fontFamily: "Montserrat")),
          actions: [
            Center(
              child: CustomElevatedButton(
                text: "OK",
                backgroundColor: const Color(0xFF007AFF),
                textColor: Colors.white,
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context); // Retour à la page profil
                },
                width: 60.w,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return NavContainer(
     
      body: Stack(
        children: [
          // ----------- Background bleu + blanc ----------
          SizedBox(
            height: 100.h,
            width: 100.w,
            child: Stack(
              children: [
                ClipPath(
                  clipper: ProfileTopClipper(),
                  child: Container(
                    height: 40.h,
                    width: 100.w,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF007AFF), Color(0xFF0056CC)],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  child: Container(
                    height: 60.h,
                    width: 100.w,
                    color: const Color(0xFFF8F9FA),
                  ),
                ),
              ],
            ),
          ),

          // ----------- Contenu principal ----------
          SafeArea(
            child: Column(
              children: [
                // Header avec bouton retour
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                  child: Row(
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          padding: EdgeInsets.all(2.w),
                          decoration: const BoxDecoration(
                              color: Colors.white, shape: BoxShape.circle),
                          child: Icon(Icons.arrow_back_ios,
                              size: 6.w, color: Color(0xFF007AFF)),
                        ),
                      ),
                      SizedBox(width: 6.w),
                      Text("Modification",
                          style: GoogleFonts.montserrat(
                              fontSize: 18.sp,
                              fontWeight: FontWeight.w700,
                              color: Colors.white)),
                    ],
                  ),
                ),

                SizedBox(height: 10.h),

                // Photo profil + bouton édit (positionnée dans le creux)
                Transform.translate(
                  offset: Offset(0, 4.h), // Descendre la photo dans le creux
                  child: Stack(
                    children: [
                      Container(
                        width: 35.w,
                        height: 35.w,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: const Color(0xFF007AFF), width: 3),
                          boxShadow: [
                            BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 10,
                                offset: const Offset(0, 5))
                          ],
                        ),
                        child: ClipOval(
                          child:    Image.asset("assets/profile.png",
                              height: 25.h, fit: BoxFit.cover),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: GestureDetector(
                          onTap: () => _showImagePickerOptions(context),
                          child: Container(
                            padding: EdgeInsets.all(3.w),
                            decoration: BoxDecoration(
                                color: const Color(0xFF007AFF),
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2)),
                            child: Icon(Icons.edit, size: 5.w, color: Colors.white),
                          ),
                        ),
                      )
                    ],
                  ),
                ),

                SizedBox(height: 4.h),

                Text("John Doe",
                    style: TextStyle(
                        fontSize: 22.sp,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF007AFF),
                        fontFamily: 'Montserrat')),
                Text("Magasinier",
                    style: TextStyle(
                        fontSize: 16.sp,
                        color: Color(0xFF8E8E93),
                        fontWeight: FontWeight.w500,
                        fontFamily: 'Montserrat')),

                SizedBox(height: 6.h),

                // Formulaire de modification
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 6.w),
                    child: Column(
                      children: [
                        // Champ téléphone international
                        Container(
                          height: 7.h,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF5F5F5),
                            borderRadius: BorderRadius.circular(25),
                            border: Border.all(
                              color: _phoneHasError ? Colors.red : Colors.transparent,
                            ),
                          ),
                          child: InternationalPhoneNumberInput(
                            onInputChanged: (PhoneNumber num) {
                              setState(() {
                                _phone = num.phoneNumber ?? '';
                                _initialPhone = num;
                                
                                // Réinitialiser l'erreur si saisie correcte
                                if (_phone.isNotEmpty && _phone.length > 7) {
                                  _phoneHasError = false;
                                  _phoneErrorText = null;
                                }
                              });
                            },
                            initialValue: _initialPhone,
                            textFieldController: _phoneController,
                            selectorConfig: const SelectorConfig(
                              selectorType: PhoneInputSelectorType.DIALOG,
                              showFlags: true,
                              setSelectorButtonAsPrefixIcon: true,
                            ),
                            ignoreBlank: false,
                            autoValidateMode: AutovalidateMode.disabled,
                            selectorTextStyle: GoogleFonts.poppins(color: Colors.black),
                            textStyle: GoogleFonts.poppins(),
                            formatInput: false,
                            keyboardType: const TextInputType.numberWithOptions(
                              signed: true,
                              decimal: true,
                            ),
                            inputDecoration: InputDecoration(
                              border: InputBorder.none,
                              hintText: 'Numéro de téléphone',
                              hintStyle: GoogleFonts.poppins(
                                fontSize: 14.sp,
                                color: Colors.grey[600],
                              ),
                              contentPadding: EdgeInsets.symmetric(
                                horizontal: 4.w,
                                vertical: 2.h,
                              ),
                            ),
                            spaceBetweenSelectorAndTextField: 10,
                          ),
                        ),

                        // Message d'erreur pour le téléphone
                        if (_phoneHasError && _phoneErrorText != null) ...[
                          SizedBox(height: 1.h),
                          Row(
                            children: [
                              SizedBox(width: 4.w),
                              const Icon(Icons.error_outline, 
                                       color: Colors.red, size: 18),
                              SizedBox(width: 2.w),
                              Expanded(
                                child: Text(
                                  _phoneErrorText!,
                                  style: GoogleFonts.poppins(
                                    fontSize: 12.sp,
                                    color: Colors.red,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],

                        SizedBox(height: 4.h),

                        // Champ mot de passe
                        CustomInputField(
                          controller: _passwordController,
                          hintText: "****************",
                          obscureText: !_isPasswordVisible,
                          onToggleVisibility: _togglePasswordVisibility,
                          hasError: _passwordHasError,
                          errorText: _passwordErrorText,
                        ),

                        SizedBox(height: 8.h),

                        // Bouton Enregistrer
                        CustomElevatedButton(
                          text: "Enregistrer",
                          backgroundColor: const Color(0xFF007AFF),
                          textColor: Colors.white,
                          onPressed: _validateAndSave,
                          width: double.infinity,
                          height: 7.h,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ), initialIndex: 3,

     
    );
  }

  void _showImagePickerOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
              topLeft: Radius.circular(6.w), topRight: Radius.circular(6.w)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 10.w,
              height: 1.h,
              decoration: BoxDecoration(
                color: Colors.grey.withOpacity(0.3),
                borderRadius: BorderRadius.circular(1.w),
              ),
            ),
            SizedBox(height: 3.h),
            Text("Modifier la photo de profil",
                style: TextStyle(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w600,
                    fontFamily: "Montserrat")),
            SizedBox(height: 3.h),
            ListTile(
              leading: const Icon(Icons.camera_alt, color: Color(0xFF007AFF)),
              title: const Text("Prendre une photo",
                  style: TextStyle(fontFamily: "Montserrat")),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library, color: Color(0xFF007AFF)),
              title: const Text("Choisir depuis la galerie",
                  style: TextStyle(fontFamily: "Montserrat")),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}

// ----------- Clipper Top -----------
class ProfileTopClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(0, 0);
    path.lineTo(size.width, 0);
    path.lineTo(size.width, size.height * 0.6);
    path.quadraticBezierTo(
        size.width * 0.85, size.height * 0.75, size.width * 0.7, size.height * 0.65);
    path.quadraticBezierTo(
        size.width * 0.5, size.height * 0.45, size.width * 0.3, size.height * 0.65);
    path.quadraticBezierTo(
        size.width * 0.15, size.height * 0.75, 0, size.height * 0.6);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}