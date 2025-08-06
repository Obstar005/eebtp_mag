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

  void _next() {
    if (_pc.page == 0) {
      _pc.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      // TODO: submit login
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
                color: Color(0xFF2196F3),
                shape: BoxShape.circle,
              ),
              padding: const EdgeInsets.all(6),
              child: const Icon(
                Icons.arrow_back_ios_new,
                color: Colors.white,
                size: 14,
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
          'Bienvenue à nouveau',
          style: GoogleFonts.poppins(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 1.h),
        Text(
          'Connectez-vous à votre compte',
          style: GoogleFonts.poppins(
            fontSize: 13.sp,
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
        Container(
    decoration: BoxDecoration(
      color: const Color(0xFFF5F5F5),
      borderRadius: BorderRadius.circular(12),
    ),
    child: InternationalPhoneNumberInput(
      onInputChanged: (PhoneNumber num) {
        setState(() {
          _phone = num.phoneNumber ?? '';
          _initialPhone = num; // mise à jour dynamique
        });
      },
      initialValue: _initialPhone,
      textFieldController: _phoneController,
      selectorConfig: const SelectorConfig(
        selectorType: PhoneInputSelectorType.DIALOG,
        showFlags: true,
        setSelectorButtonAsPrefixIcon: true,
        // useEmoji: true,
      ),
      ignoreBlank: false,
      autoValidateMode: AutovalidateMode.onUserInteraction,
      selectorTextStyle: GoogleFonts.poppins(color: Colors.black),
      textStyle: GoogleFonts.poppins(),
      formatInput: true,
      keyboardType: const TextInputType.numberWithOptions(signed: true, decimal: true),
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
      spaceBetweenSelectorAndTextField: 0,
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
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: _remember ? Colors.blue : Colors.grey,
                          width: 2,
                        ),
                        color: _remember ? Colors.blue : Colors.transparent,
                      ),
                      child: _remember
                          ? const Icon( 
                              Icons.check,
                              size: 14,
                              color: Colors.white,
                            )
                          : null,
                    ),
                  ),
                  SizedBox(width: 2.w),
                  Text(
                    'Se souvenir de moi',
                    style: GoogleFonts.poppins(fontSize: 12.sp),
                  ),
                ],
              ),
              TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/forgot_password');
                },
                child: Text(
                  'Mot de passe oublié ?',
                  style: GoogleFonts.poppins(
                    fontSize: 12.sp,
                    color: Colors.blue,
                  ),
                ),
              ),
            ],
          ),
         SizedBox(height: MediaQuery.of(ctx).size.height * 0.35), // Espace flexible
         // Spacer(),
          Column(
            children: [
              _buildProgressIndicator(0),
              SizedBox(height: 2.h),
              _buildNextButton('Suivant'),
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
              borderRadius: BorderRadius.circular(12),
            ),
            child: TextField(
              controller: _passController,
              obscureText: true,
              decoration: InputDecoration(
                border: InputBorder.none,
                hintText: 'Mot de passe',
                hintStyle: GoogleFonts.poppins(
                  fontSize: 14.sp,
                  color: Colors.grey[600],
                ),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 4.w,
                  vertical: 2.h,
                ),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.visibility_off),
                  onPressed: () {},
                ),
              ),
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
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: _remember ? Colors.blue : Colors.grey,
                          width: 2,
                        ),
                        color: _remember ? Colors.blue : Colors.transparent,
                      ),
                      child: _remember
                          ? const Icon(
                              Icons.check,
                              size: 14,
                              color: Colors.white,
                            )
                          : null,
                    ),
                  ),
                  SizedBox(width: 2.w),
                  Text(
                    'Se souvenir de moi',
                    style: GoogleFonts.poppins(fontSize: 12.sp),
                  ),
                ],
              ),
              TextButton(
                onPressed: () {
                Navigator.pushNamed(context, '/forgot_password');

                },
                child: Text(
                  'Mot de passe ? oublié',
                  style: GoogleFonts.poppins(
                    fontSize: 12.sp,
                    color: Colors.blue,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: MediaQuery.of(ctx).size.height * 0.20), 
          Column(
            children: [
              _buildProgressIndicator(1),
              SizedBox(height: 2.h),
              _buildNextButton('Se connecter'),
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

  Widget _buildNextButton(String text) {
    return SizedBox(
      width: double.infinity,
      height: 6.h,
      child: ElevatedButton(
        onPressed: _next,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF2196F3),
          padding: EdgeInsets.symmetric(vertical: 2.h),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              text,
              style: GoogleFonts.poppins(
                fontSize: 14.sp,
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(width: 2.w),
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.white),
          ],
        ),
      ),
    );
  }
}