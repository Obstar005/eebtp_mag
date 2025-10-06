import 'dart:convert';
import 'package:eebtp_frontend/screens/passwordCreatedConfirmation.dart';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:eebtp_frontend/widgets/input.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:sizer/sizer.dart';
import 'package:provider/provider.dart';
import 'package:eebtp_frontend/services/auth.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';

class LoginTwoStepScreen extends StatefulWidget {
  const LoginTwoStepScreen({super.key});

  @override
  State<LoginTwoStepScreen> createState() => _LoginTwoStepScreenState();
}

class _LoginTwoStepScreenState extends State<LoginTwoStepScreen> {
  final PageController _pc = PageController();
  PhoneNumber _initialPhone = PhoneNumber(isoCode: 'TG');
  bool _remember = false;
  String _phone = '';
  final _phoneController = TextEditingController();
  final _passController = TextEditingController();
  bool _obscurePass = true;
  String? _errorMessage;
  String? _phoneError;
  final UserService _userService = UserService();

  void _next() {
    if (_pc.page == 0) {
      if (_phone.isNotEmpty && _phoneError == null) {
        _pc.nextPage(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      } else {
        setState(() {
          _phoneError = "Veuillez entrer un numéro valide";
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: PageView(
          controller: _pc,
          physics: const NeverScrollableScrollPhysics(),
          children: [_buildPhoneStep(context), _buildPasswordStep(context)],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
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
                size: 15.sp,
              ),
            ),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        SvgPicture.asset('assets/illustration.svg', height: 23.h),
        Text(
          'Bienvenue',
          style: GoogleFonts.poppins(
            fontSize: 18.sp,
            color: const Color.fromRGBO(37, 37, 37, 1),
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 1.h),
        Text(
          'Connectez-vous à votre compte',
          style: GoogleFonts.poppins(
            fontSize: 15.sp,
            color: const Color.fromRGBO(37, 37, 37, 1),
          ),
        ),
        SizedBox(height: 2.h),
        Text(
          'Veuillez saisir votre numéro de téléphone pour vous connecter',
          style: GoogleFonts.poppins(
            fontSize: 14.sp,
            color: const Color.fromRGBO(37, 37, 37, 1),
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildPhoneStep(BuildContext ctx) {
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          SizedBox(height: 5.h),

          // Champ téléphone
          Container(
            padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.5.h),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(30),
              border: Border.all(
                color: _phoneError != null
                    ? Colors.red
                    : const Color.fromRGBO(226, 232, 240, 1),
                width: 1.2,
              ),
            ),
            child: InternationalPhoneNumberInput(
              onInputChanged: (PhoneNumber num) {
                setState(() {
                  _phone = num.phoneNumber ?? '';
                  _initialPhone = num;
                });
              },
              onInputValidated: (_) {},
              initialValue: _initialPhone,
              textFieldController: _phoneController,
              selectorConfig: const SelectorConfig(
                selectorType: PhoneInputSelectorType.DROPDOWN,
                showFlags: true,
                setSelectorButtonAsPrefixIcon: true,
              ),
              ignoreBlank: false,
              autoValidateMode: AutovalidateMode.disabled,
              selectorTextStyle: GoogleFonts.poppins(color: Colors.black),
              textStyle: GoogleFonts.poppins(fontSize: 14.sp),
              formatInput: true,
              keyboardType: const TextInputType.numberWithOptions(
                signed: false,
                decimal: false,
              ),
              inputDecoration: InputDecoration(
                isDense: true,
                border: InputBorder.none,
                hintText: 'Numéro de téléphone',
                hintStyle: GoogleFonts.poppins(
                  fontSize: 14.sp,
                  color: Colors.grey[600],
                ),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 2.w,
                  vertical: 1.5.h,
                ),
              ),
              spaceBetweenSelectorAndTextField: 10,
            ),
          ),

          // Erreur affichée
          if (_phoneError != null) ...[
            SizedBox(height: 0.5.h),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.error_outline, color: Colors.red, size: 4.w),
                SizedBox(width: 1.w),
                Expanded(
                  child: Text(
                    _phoneError!,
                    style: GoogleFonts.poppins(
                      fontSize: 12.sp,
                      color: Colors.red,
                    ),
                  ),
                ),
              ],
            ),
          ],

          SizedBox(height: 2.h),

          // Checkbox
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

          SizedBox(height: 28.h),

          Column(
            children: [
              _buildProgressIndicator(0),
              SizedBox(height: 2.h),
              CustomElevatedButton(
                text: 'Suivant',
                backgroundColor: const Color(0xFF007AFF),
                textColor: Colors.white,
                onPressed: () async {
                  setState(() {
                    if (_phone.isEmpty) {
                      _phoneError = "Veuillez entrer un numéro de téléphone";
                    } else if (_phone.length < 8) {
                      _phoneError = "Numéro trop court";
                    } else {
                      _phoneError = null;
                    }
                  });

                  if (_phoneError != null) return;

                  try {
                    final exists = await _userService.checkUserExists(_phone);
                    print(_phone);
                    if (exists) {
                      _next();
                    } else {
                      setState(() {
                        _phoneError =
                            "Ce numéro n'est pas associé à un utilisateur";
                      });
                    }
                  } catch (e) {
                    setState(() {
                      _phoneError = "Erreur de connexion au serveur";
                    });
                  }
                },
                width: 70.w,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPasswordStep(BuildContext ctx) {
    return SingleChildScrollView(
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
              onPressed: () => _pc.previousPage(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
              ),
            ),
          ),

          // Illustration
          Center(
            child: SvgPicture.asset('assets/illustration.svg', height: 23.h),
          ),
          SizedBox(height: 2.h),

          // Titre
          Text(
            "Bienvenue",
            style: GoogleFonts.poppins(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          SizedBox(height: 1.h),

          // Sous-titre
          Text(
            "Connectez-vous à votre compte",
            style: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.black54),
          ),
          SizedBox(height: 3.h),

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

          // Champ mot de passe
          Container(
            padding: EdgeInsets.symmetric(horizontal: 3.w),
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
              obscureText: _obscurePass,
              decoration: InputDecoration(
                border: InputBorder.none,
                hintText: "Mot de passe",
                hintStyle: GoogleFonts.poppins(
                  fontSize: 13.sp,
                  color: Colors.grey,
                ),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePass ? Icons.visibility_off : Icons.visibility,
                    color: Colors.grey,
                  ),
                  onPressed: () {
                    setState(() => _obscurePass = !_obscurePass);
                  },
                ),
              ),
            ),
          ),

          if (_errorMessage != null) ...[
            SizedBox(height: 0.5.h),
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

          SizedBox(height: 2.h),

          // Checkbox se souvenir
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

          SizedBox(height: 15.h),

          // Progression + bouton
          Column(
            children: [
              _buildProgressIndicator(1),
              SizedBox(height: 2.h),
              CustomElevatedButton(
                text: 'Se connecter',
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

                  // Appel API de connexion
                  final result = await _userService.loginByPhone(
                    _phone,
                    password,
                  );

                  if (result != null) {
                    // Décoder la réponse
                    final data = jsonDecode(result);
                    final String token = data['access_token'];
                    final bool firstLogin = data['first_login'];

                    // 🔥 CHANGEMENT ICI : Stocker le token dans Provider
                    await context.read<AuthProvider>().setToken(token);
                    
                    // Optionnel : stocker le numéro de téléphone si nécessaire
                    // await context.read<AuthProvider>().setPhoneNumber(_phone);

                    if (firstLogin) {
                      // Premier login → Page de modification de mot de passe
                      Navigator.pushNamed(
                        context,
                        '/change_password',
                        arguments: {'phone': _phone}, // Garde seulement phone si nécessaire
                      );
                    } else {
                      // Déjà connecté avant → Page de sélection magasin
                      // Plus besoin de passer le token en argument
                      Navigator.pushNamed(context, '/store_selection');
                    }
                  } else {
                    setState(() {
                      _errorMessage =
                          "Mot de passe incorrect ou erreur serveur";
                    });
                  }
                },
                width: 70.w,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator(int activeIndex) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(2, (i) {
        return Container(
          margin: EdgeInsets.symmetric(horizontal: 1.w),
          width: i == activeIndex ? 10.w : 4.w,
          height: 1.h,
          decoration: BoxDecoration(
            color: i == activeIndex ? Colors.blue : Colors.grey[300],
            borderRadius: BorderRadius.circular(10),
          ),
        );
      }),
    );
  }
}
