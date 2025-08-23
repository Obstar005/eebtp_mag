import 'dart:async';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:sizer/sizer.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final PageController _pc = PageController();
  PhoneNumber _initialPhone = PhoneNumber(isoCode: 'TG');
  bool _remember = false;
  String _phone = '';
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  int _countdown = 300;
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 0) {
        setState(() {
          _countdown--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  void _next() {
    if (_pc.page == 0) {
      _pc.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {}
  }

  void _resendCode() {
    setState(() {
      _countdown = 300;
      _startTimer();
    });
    // TODO: resend OTP
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
            _buildOtpVerificationStep(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader({
    required String svgAsset,
    required String title,
    required String subtitle,
  }) {
    return Column(
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: IconButton(
            icon: Container(
              decoration: BoxDecoration(
                color: Color(0xFF007AFF),
                shape: BoxShape.circle,
              ),
              padding: EdgeInsets.all(6.sp),
              child: Icon(
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
        SvgPicture.asset(svgAsset, height: 25.h),
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 1.h),
        Text(
          subtitle,
          style: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.grey[600]),
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
          _buildHeader(
            svgAsset: 'assets/forgot_pass.svg',
            title: 'Mot de passe oublié ?',
            subtitle:
                'Ne vous inquiétez pas ! Cela se passe.\nVeuillez saisir le numéro de téléphone\nauquel nous enverrons l\'OTP.',
          ),
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
                  _initialPhone = num;
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
                      width: 5.w,
                      height: 5.w,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: _remember ? Color(0xFF007AFF) : Colors.grey,
                          width: 2,
                        ),
                        color: _remember
                            ? Color(0xFF007AFF)
                            : Colors.transparent,
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
                onPressed: () {},
                child: Text(
                  'Mot de passe ? oublié',
                  style: GoogleFonts.poppins(
                    fontSize: 12.sp,
                    color: Color(0xFF007AFF),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: MediaQuery.of(ctx).size.height * 0.15),
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

  Widget _buildOtpVerificationStep(BuildContext ctx) {
    String displayedPhone = _phone.isNotEmpty
        ? _phone.replaceRange(5, _phone.length - 2, '*****')
        : '+228-*******';

    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(
            svgAsset: 'assets/otp_verif.svg',
            title: 'Vérification OTP',
            subtitle: 'Saisissez l\'OTP envoyé à $displayedPhone',
          ),
          SizedBox(height: 5.h),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 10.w),
            child: PinCodeTextField(
              appContext: context,
              length: 4,
              controller: _otpController,
              pinTheme: PinTheme(
                shape: PinCodeFieldShape.box,
                borderRadius: BorderRadius.circular(10),
                fieldHeight: 6.h,
                fieldWidth: 8.w,
                activeFillColor: Colors.white,
                activeColor: const Color(0xFF007AFF),
                selectedColor: const Color(0xFF007AFF),
                inactiveColor: Colors.grey[300],
                inactiveFillColor: Colors.grey[200],
              ),
              keyboardType: TextInputType.number,
              animationType: AnimationType.fade,
              enableActiveFill: true,
              onChanged: (value) {},
            ),
          ),
          SizedBox(height: 3.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Vous n\'avez pas reçu de code? ',
                style: GoogleFonts.poppins(
                  fontSize: 12.sp,
                  color: Colors.grey[600],
                ),
              ),
              GestureDetector(
                onTap: _countdown == 0 ? _resendCode : null,
                child: Text(
                  'Renvoyer le code',
                  style: GoogleFonts.poppins(
                    fontSize: 12.sp,
                    color: _countdown == 0 ? Color(0xFF007AFF) : Colors.grey,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 1.h),
          Center(
            child: Text(
              '${(_countdown ~/ 60).toString().padLeft(2, '0')}:${(_countdown % 60).toString().padLeft(2, '0')}',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 14.sp,
                color: Colors.grey[600],
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          SizedBox(height: 16.h),
          Column(
            children: [
              _buildProgressIndicator(1),
              SizedBox(height: 2.h),
              CustomElevatedButton(
                text:
                    'Envoyer  ', // J’ai ajouté la flèche directement dans le texte
                backgroundColor: const Color(0xFF007AFF),
                textColor: Colors.white,
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/otp_confirmation');
                },
                width: 80.w, // tu peux ajuster si besoin
                height: 7.h,
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
            color: i == activeIndex ? Color(0xFF007AFF) : Colors.grey[300],
            borderRadius: BorderRadius.circular(10),
          ),
        );
      }),
    );
  }
}
