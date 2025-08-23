import 'package:eebtp_frontend/widgets/button.dart';
import 'package:eebtp_frontend/widgets/input.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:sizer/sizer.dart';

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

  void _next() {
    if (_pc.page == 0) {
      if (_phone.isNotEmpty) {
        _pc.nextPage(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      } else {
        setState(() {
          _errorMessage = 'Veuillez entrer votre numéro de téléphone';
        });
      }
    } else {
     
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: PageView(
          controller: _pc,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            _buildPhoneStep(context),
            _buildPasswordStep(context),
          ],
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
              padding: const EdgeInsets.all(6),
              child:  Icon(
                Icons.arrow_back_ios_new,
                color: Colors.white,
                size: 14.sp,
              ),
            ),
            onPressed: () => _pc.previousPage(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
            ),
          ),
        ),
        SvgPicture.asset(
          'assets/illustration.svg',
          height: 25.h,
        ),
        Text(
          'Bienvenue ',
          style: GoogleFonts.poppins(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 1.h),
        Text(
          'Connectez-vous à votre compte',
          style: GoogleFonts.poppins(
            fontSize: 15.sp,
            color: Colors.grey[600],
          ),
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
          decoration: BoxDecoration(
            color: const Color(0xFFF5F5F5),
            borderRadius: BorderRadius.circular(30), // arrondi
          ),
          child: InternationalPhoneNumberInput(
            onInputChanged: (PhoneNumber num) {
              setState(() {
                _phone = num.phoneNumber ?? '';
                _initialPhone = num;

                //formatation du numéro pour communication avec le backend:
                // String formattedPhone = "${num.dialCode?.replaceAll('+', '00')}${num.parseNumber()}";
                // print("Téléphone formaté : $formattedPhone");
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
            autoValidateMode: AutovalidateMode.onUserInteraction,
            selectorTextStyle: GoogleFonts.poppins(color: Colors.black),
            textStyle: GoogleFonts.poppins(),
            formatInput: true,
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
            spaceBetweenSelectorAndTextField: 10, // plus d’espace pour pays longs
          ),
        ),

        SizedBox(height: 2.h),

        // Checkbox + mot de passe oublié
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
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
                        ? Icon(
                            Icons.check,
                            size: 2.w,
                            color: Colors.white,
                          )
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
            TextButton(
              onPressed: () {
                Navigator.pushNamed(context, '/forgot_password');
              },
              child: Text(
                'Mot de passe oublié ?',
                style: GoogleFonts.poppins(
                  fontSize: 14.sp,
                  color: Colors.blue,
                ),
              ),
            ),
          ],
        ),

        SizedBox(height: 28.h),

        // Progress + bouton
        Column(
          children: [
            _buildProgressIndicator(0),
            SizedBox(height: 2.h),
            CustomElevatedButton(
              text: 'Suivant',
              backgroundColor: const Color(0xFF007AFF),
              textColor: Colors.white,
              onPressed: () => _next(),
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
          _buildHeader(),
          SizedBox(height: 5.h),
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5),
              borderRadius: BorderRadius.circular(30),
            ),
            child:   CustomInputField(
              controller: _passController,
              hintText: "Mot de passe",
              obscureText: _obscurePass,
              onToggleVisibility: () {
                setState(() => _obscurePass = !_obscurePass);
              },
              hasError: _errorMessage != null,
              errorText: _errorMessage,
            ),
          ),
          SizedBox(height: 2.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
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
                          width: 0.5.w,
                        ),
                        color: _remember ? Colors.blue : Colors.transparent,
                      ),
                      child: _remember
                          ?  Icon(
                              Icons.check,
                              size: 3.w,
                              color: Colors.white,
                            )
                          : null,
                    ),
                  ),
                  SizedBox(width: 2.w),
                  Text(
                    'Se souvenir de moi',
                    style: GoogleFonts.poppins(fontSize: 13.sp),
                  ),
                ],
              ),
              TextButton(
                onPressed: () {
                   /*
                if (!_validatePassword(_passController.text)) {
                  return;
                }
                */
                Navigator.pushNamed(context, '/forgot_password');

                },
                child: Text(
                  'Mot de passe ? oublié',
                  style: GoogleFonts.poppins(
                    fontSize: 13.sp,
                    color: Colors.blue,
                  ),
                ),
              ),
            ],
          ),
         SizedBox(height: 30.h),
          Column(
            children: [
              _buildProgressIndicator(1),
              SizedBox(height: 2.h),
               CustomElevatedButton(
    text: 'Se connecter',
    backgroundColor:const Color(0xFF007AFF) ,
    textColor: Colors.white,
    onPressed: () =>_next(),
    width: 70.w, 
  ),
             
            ],
          ),
        ],
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