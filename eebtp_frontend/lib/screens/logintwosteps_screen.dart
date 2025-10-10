import 'dart:convert';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:sizer/sizer.dart';
import 'package:provider/provider.dart';
import 'package:toastification/toastification.dart';
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
          fontSize: 13.sp,
          fontWeight: FontWeight.w500,
        ),
      ),
      autoCloseDuration: const Duration(seconds: 3),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 300),
      animationBuilder: (context, animation, alignment, child) {
        return ScaleTransition(
          scale: animation,
          child: child,
        );
      },
      borderRadius: BorderRadius.circular(12),
      boxShadow: const [
        BoxShadow(
          color: Color(0x07000000),
          blurRadius: 16,
          offset: Offset(0, 16),
          spreadRadius: 0,
        )
      ],
      showProgressBar: true,
      closeButtonShowType: CloseButtonShowType.onHover,
      closeOnClick: false,
      pauseOnHover: true,
      dragToClose: true,
      applyBlurEffect: true,
    );
  }

  void _clearControllers() {
    _phoneController.clear();
    _passController.clear();
  }

  void _next() {
    if (_pc.page == 0) {
      if (_phone.isNotEmpty && _phoneError == null) {
        _passController.clear();
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

  Widget _buildHeader(double availableHeight) {
    final illustrationHeight = (availableHeight * 0.25).clamp(120.0, 200.0);
    final titleSize = (availableHeight * 0.032).clamp(16.0, 22.0);
    final subtitleSize = (availableHeight * 0.025).clamp(13.0, 18.0);
    final descSize = (availableHeight * 0.022).clamp(11.0, 16.0);

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
        SvgPicture.asset(
          'assets/illustration.svg',
          height: illustrationHeight,
        ),
        SizedBox(height: availableHeight * 0.015),
        Text(
          'Bienvenue',
          style: GoogleFonts.poppins(
            fontSize: titleSize,
            color: const Color.fromRGBO(37, 37, 37, 1),
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: availableHeight * 0.008),
        Text(
          'Connectez-vous à votre compte',
          style: GoogleFonts.poppins(
            fontSize: subtitleSize,
            color: const Color.fromRGBO(37, 37, 37, 1),
          ),
        ),
        SizedBox(height: availableHeight * 0.015),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 5.w),
          child: Text(
            'Veuillez saisir votre numéro de téléphone pour vous connecter',
            style: GoogleFonts.poppins(
              fontSize: descSize,
              color: const Color.fromRGBO(37, 37, 37, 1),
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildPhoneStep(BuildContext ctx) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final availableHeight = constraints.maxHeight;
        final fieldFont = (availableHeight * 0.022).clamp(11.0, 16.0);
        final errorIconSize = (availableHeight * 0.025).clamp(14.0, 18.0);

        return Padding(
          padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(availableHeight),
              SizedBox(height: availableHeight * 0.04),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.8.h),
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
                  initialValue: _initialPhone,
                  textFieldController: _phoneController,
                  selectorConfig: const SelectorConfig(
                    selectorType: PhoneInputSelectorType.DROPDOWN,
                    showFlags: true,
                    setSelectorButtonAsPrefixIcon: true,
                  ),
                  selectorTextStyle: GoogleFonts.poppins(
                    color: Colors.black,
                    fontSize: fieldFont,
                  ),
                  textStyle: GoogleFonts.poppins(
                    fontSize: fieldFont,
                    color: Colors.black,
                  ),
                  formatInput: true,
                  keyboardType: TextInputType.phone,
                  inputDecoration: InputDecoration(
                    isDense: true,
                    border: InputBorder.none,
                    hintText: 'Numéro de téléphone',
                    hintStyle: GoogleFonts.poppins(
                      fontSize: fieldFont,
                      color: Colors.grey[600],
                    ),
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 2.w,
                      vertical: 1.h,
                    ),
                  ),
                  spaceBetweenSelectorAndTextField: 8,
                  maxLength: 15,
                ),
              ),
              if (_phoneError != null) ...[
                SizedBox(height: availableHeight * 0.008),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.error_outline, color: Colors.red, size: errorIconSize),
                    SizedBox(width: 2.w),
                    Expanded(
                      child: Text(
                        _phoneError!,
                        style: GoogleFonts.poppins(
                          fontSize: fieldFont * 0.9,
                          color: Colors.red,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
              SizedBox(height: availableHeight * 0.02),
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
              const Spacer(),
              Column(
                children: [
                  _buildProgressIndicator(0),
                  SizedBox(height: availableHeight * 0.02),
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

                      if (_phoneError != null) {
                                            return;
                      }

                      try {
                        final exists = await _userService.checkUserExists(_phone);
                        if (exists) {
                          _showToast(
                            message: "Numéro vérifié avec succès",
                            type: ToastificationType.success,
                          );
                          _next();
                        } else {
                          setState(() {
                            _phoneError = "Ce numéro n'est pas associé à un utilisateur";
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
              SizedBox(height: availableHeight * 0.02),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPasswordStep(BuildContext ctx) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final availableHeight = constraints.maxHeight;
        final illustrationHeight = (availableHeight * 0.22).clamp(110.0, 180.0);
        final titleSize = (availableHeight * 0.032).clamp(16.0, 22.0);
        final subtitleSize = (availableHeight * 0.023).clamp(12.0, 16.0);
        final fieldFont = (availableHeight * 0.022).clamp(11.0, 16.0);
        final infoBoxFont = (availableHeight * 0.018).clamp(10.0, 14.0);
        final errorIconSize = (availableHeight * 0.025).clamp(14.0, 18.0);

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
                    padding: EdgeInsets.all(8),
                    child: Icon(
                      Icons.arrow_back_ios_new,
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
                  onPressed: () {
                    _passController.clear();
                    _pc.previousPage(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                    );
                  },
                ),
              ),
              Center(
                child: SvgPicture.asset(
                  'assets/illustration.svg',
                  height: illustrationHeight,
                ),
              ),
              SizedBox(height: availableHeight * 0.015),
              Text(
                "Bienvenue",
                style: GoogleFonts.poppins(
                  fontSize: titleSize,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              SizedBox(height: availableHeight * 0.008),
              Text(
                "Connectez-vous à votre compte",
                style: GoogleFonts.poppins(
                  fontSize: subtitleSize,
                  color: Colors.black54,
                ),
              ),
              SizedBox(height: availableHeight * 0.025),
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
              SizedBox(height: availableHeight * 0.025),
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
                  obscureText: _obscurePass,
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
              SizedBox(height: availableHeight * 0.02),
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
              const Spacer(),
              Column(
                children: [
                  _buildProgressIndicator(1),
                  SizedBox(height: availableHeight * 0.02),
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

                      try {
                        final result = await _userService.loginByPhone(_phone, password);

                        if (result != null) {
                          final data = jsonDecode(result);
                          final String token = data['access_token'];
                          final bool firstLogin = data['first_login'];
                          await context.read<AuthProvider>().setToken(token);

                          _showToast(
                            message: "Connexion réussie !",
                            type: ToastificationType.success,
                          );

                          _clearControllers();

                          await Future.delayed(const Duration(milliseconds: 500));

                          if (firstLogin) {
                            Navigator.pushReplacementNamed(
                              context,
                              '/change_password',
                              arguments: {'phone': _phone},
                            );
                          } else {
                            Navigator.pushReplacementNamed(context, '/store_selection');
                          }
                        } else {
                          setState(() {
                            _errorMessage = "Mot de passe incorrect";
                          });
                    
                        }
                      } catch (e) {
                        setState(() {
                          _errorMessage = "Erreur de connexion au serveur";
                        });
                  
                      }
                    },
                  ),
                ],
              ),
              SizedBox(height: availableHeight * 0.02),
            ],
          ),
        );
      },
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