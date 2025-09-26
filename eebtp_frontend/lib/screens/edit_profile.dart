import 'dart:io';
import 'dart:ui';
import 'package:eebtp_frontend/models/utilisateur.dart';
import 'package:eebtp_frontend/services/auth.dart';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:sizer/sizer.dart';

/// ----------------- Helpers pour indicatifs / ISO -----------------
const Map<String, String> _prefixToIso = {
  "00228": "TG", // Togo
  "00229": "BJ", // Bénin
  "00221": "SN", // Sénégal
  "00225": "CI", // Côte d'Ivoire
};

const Map<String, String> _isoToDial = {
  "TG": "228",
  "BJ": "229",
  "SN": "221",
  "CI": "225",
};

String _getIsoFromRawPhone(String phone) {
  for (final e in _prefixToIso.entries) {
    if (phone.startsWith(e.key)) return e.value;
  }
  return "TG"; // fallback
}

String _stripCountryCode(String phone) {
  final regex = RegExp(r"^00\d{2,3}");
  return phone.replaceFirst(regex, "");
}

/// ----------------- Page -----------------
class EditProfilePage extends StatefulWidget {
  final Utilisateur user;
  final String token;

  const EditProfilePage({super.key, required this.user, required this.token});

  @override
  _EditProfilePageState createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();

  // controllers
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _surnameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();

  // phone helper
  String _phone = '';
  PhoneNumber _initialPhone = PhoneNumber(isoCode: 'TG');
  String _currentIso = 'TG';
  String _currentDial = '228';

  // UI state
  bool _isPasswordVisible = false;
  bool _loading = false;
  File? _pickedImage;
  String? _serverPhotoUrl;

  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();

    _firstNameController.text = widget.user.firstName ?? '';
    _lastNameController.text = widget.user.lastName ?? '';
    _surnameController.text = widget.user.surname ?? '';
    _emailController.text = widget.user.email ?? '';

    final rawPhone = widget.user.telephone ?? '';
    final iso = _getIsoFromRawPhone(rawPhone);
    final local = rawPhone.isNotEmpty ? _stripCountryCode(rawPhone) : '';

    _currentIso = iso;
    _currentDial = _isoToDial[iso] ?? '228';
    _initialPhone = PhoneNumber(isoCode: _currentIso, phoneNumber: local);
    _phoneController.text = local;
    _phone = local;

    _serverPhotoUrl = widget.user.photoProfil;
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _surnameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  /// Formatte le numéro pour le backend (format '00' + dial + local)
  String _formatPhoneForBackend() {
    if (_phone.isNotEmpty) {
      if (_phone.startsWith('+')) return _phone.replaceFirst('+', '00');
      if (_phone.startsWith('00')) return _phone;
      return '00$_currentDial${_phone.replaceAll(RegExp(r'[^0-9]'), '')}';
    }

    final local = _phoneController.text.trim().replaceAll(
      RegExp(r'[^0-9]'),
      '',
    );
    if (local.isEmpty) return local;
    return '00$_currentDial$local';
  }

  Future<void> _pickImage(bool fromCamera) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: fromCamera ? ImageSource.camera : ImageSource.gallery,
      imageQuality: 75,
    );

    if (picked != null) {
      setState(() {
        _pickedImage = File(picked.path);
      });

      if (Navigator.canPop(context)) Navigator.pop(context);
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);

    final userService = UserService();
    final formattedPhone = _formatPhoneForBackend();

    // Validation du numéro de téléphone
    if (formattedPhone.length < 10) {
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Numéro de téléphone invalide"),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    String? finalPhotoUrl = _serverPhotoUrl ?? widget.user.photoProfil;

    // Upload de la photo si sélectionnée
    if (_pickedImage != null) {
      final uploadSuccess = await userService.updateProfilePicture(
        widget.token,
        _pickedImage!.path,
      );

      if (uploadSuccess) {
        try {
          final refreshed = await userService.getUserInfo(widget.token);
          finalPhotoUrl = refreshed.photoProfil;
          setState(() {
            _serverPhotoUrl = finalPhotoUrl;
          });
        } catch (_) {
          // Continuer même si le rechargement échoue
        }
      } else {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Échec de l'upload de la photo de profil"),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }
    }

    final updatedUser = widget.user.copyWith(
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      surname: _surnameController.text.trim(),
      email: _emailController.text.trim(),
      telephone: formattedPhone,
      photoProfil: finalPhotoUrl,
    );

    final success = await userService.updateUser(widget.user.id!, updatedUser);

    setState(() => _loading = false);

    if (success) {
      _showSuccessDialog();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Erreur lors de la mise à jour du profil"),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showImagePickerOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(6.w),
            topRight: Radius.circular(6.w),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
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
            Text(
              "Modifier la photo de profil",
              style: GoogleFonts.montserrat(
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 3.h),
            ListTile(
              leading: Icon(Icons.camera_alt, color: const Color(0xFF007AFF)),
              title: Text("Prendre une photo", style: GoogleFonts.montserrat()),
              onTap: () => _pickImage(true),
            ),
            ListTile(
              leading: Icon(
                Icons.photo_library,
                color: const Color(0xFF007AFF),
              ),
              title: Text(
                "Choisir depuis la galerie",
                style: GoogleFonts.montserrat(),
              ),
              onTap: () => _pickImage(false),
            ),
            SizedBox(height: 2.h),
          ],
        ),
      ),
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.5),
      builder: (ctx) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 3.0, sigmaY: 3.0),
        child: AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          backgroundColor: Colors.white,
          shadowColor: Colors.black.withOpacity(0.3),
          elevation: 10,
          title: Center(
            child: Column(
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 15.w),
                SizedBox(height: 2.h),
                Text(
                  "Succès",
                  style: GoogleFonts.montserrat(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF2D3748),
                  ),
                ),
              ],
            ),
          ),
          content: Text(
            "Votre profil a été mis à jour avec succès !",
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(
              fontSize: 14.sp,
              color: const Color(0xFF4A5568),
            ),
          ),
          actions: [
            Center(
              child: CustomElevatedButton(
                text: "OK",
                backgroundColor: const Color(0xFF007AFF),
                textColor: Colors.white,
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pop(context, true);
                },
                width: 60.w,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Champ stylisé amélioré
  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    bool isPassword = false,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: 2.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.montserrat(
              fontSize: 13.sp,
              fontWeight: FontWeight.w600,
              color: const Color.fromARGB(255, 8, 8, 8),
            ),
          ),
          SizedBox(height: 1.h),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Color(0xFF007AFF).withOpacity(0.6)),
            ),
            child: TextFormField(
              controller: controller,
              validator: validator,
              obscureText: isPassword ? !_isPasswordVisible : false,
              keyboardType: keyboardType,
              style: GoogleFonts.montserrat(fontSize: 14.sp),
              decoration: InputDecoration(
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 4.w,
                  vertical: 2.h,
                ),
                border: InputBorder.none,
                hintText: isPassword
                    ? "Laisser vide si inchangé"
                    : "Entrez votre $label",
                hintStyle: GoogleFonts.montserrat(
                  color: const Color.fromARGB(255, 0, 0, 0),
                  fontSize: 12.sp,
                ),
                suffixIcon: isPassword
                    ? IconButton(
                        icon: Icon(
                          _isPasswordVisible
                              ? Icons.visibility
                              : Icons.visibility_off,
                          color: const Color(0xFF007AFF),
                        ),
                        onPressed: () => setState(
                          () => _isPasswordVisible = !_isPasswordVisible,
                        ),
                      )
                    : null,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 255, 255, 255),
      body: NavContainer(
        initialIndex: 3,
        body: Stack(
          children: [
            // Background avec clipper amélioré
            SizedBox(
              height: 100.h,
              width: 100.w,
              child: Stack(
                children: [
                  // Partie bleue avec clipper
                  ClipPath(
                    clipper: ProfileTopClipper(),
                    child: Container(
                      height: 40.h,
                      width: 100.w,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Color(0xFF007AFF), Color(0xFF0056CC)],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF007AFF).withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: _pickedImage != null || _serverPhotoUrl != null
                          ? Opacity(
                              opacity: 0.1,
                              child: ImageFiltered(
                                imageFilter: ImageFilter.blur(
                                  sigmaX: 10,
                                  sigmaY: 10,
                                ),
                                child: _pickedImage != null
                                    ? Image.file(
                                        _pickedImage!,
                                        fit: BoxFit.cover,
                                      )
                                    : Image.network(
                                        _serverPhotoUrl!,
                                        fit: BoxFit.cover,
                                      ),
                              ),
                            )
                          : null,
                    ),
                  ),
                  // Partie blanche en bas
                  /*     Positioned(
                    bottom: 0,
                    child: Container(
                      height: 60.h, 
                      width: 100.w, 
                      color: const Color(0xFFF8F9FA),
                    ),
                  ),
                */
                ],
              ),
            ),

            // Header fixe
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: SafeArea(
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                  child: Row(
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          padding: EdgeInsets.all(3.w),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 10,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Icon(
                            Icons.arrow_back_ios,
                            size: 5.w,
                            color: const Color(0xFF007AFF),
                          ),
                        ),
                      ),
                      SizedBox(width: 4.w),
                      Text(
                        "Modification",
                        style: GoogleFonts.montserrat(
                          fontSize: 18.sp,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          shadows: [
                            Shadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Contenu défilable
            Padding(
              padding: EdgeInsets.only(top: 12.h), // Espace pour le header fixe
              child: SingleChildScrollView(
                controller: _scrollController,
                padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                child: Column(
                  children: [
                    // Photo card améliorée
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(5.w),
                      margin: EdgeInsets.only(bottom: 4.h),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.15),
                            blurRadius: 25,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Stack(
                            children: [
                              Container(
                                width: 30.w,
                                height: 30.w,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: const Color(0xFF007AFF),
                                    width: 4,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(
                                        0xFF007AFF,
                                      ).withOpacity(0.3),
                                      blurRadius: 15,
                                      offset: const Offset(0, 5),
                                    ),
                                  ],
                                ),
                                child: ClipOval(
                                  child: _pickedImage != null
                                      ? Image.file(
                                          _pickedImage!,
                                          fit: BoxFit.cover,
                                        )
                                      : (_serverPhotoUrl != null
                                            ? Image.network(
                                                _serverPhotoUrl!,
                                                fit: BoxFit.cover,
                                              )
                                            : (widget.user.photoProfil != null
                                                  ? Image.network(
                                                      widget.user.photoProfil!,
                                                      fit: BoxFit.cover,
                                                    )
                                                  : Image.asset(
                                                      "assets/profile.png",
                                                      fit: BoxFit.cover,
                                                    ))),
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
                                      border: Border.all(
                                        color: Colors.white,
                                        width: 3,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.2),
                                          blurRadius: 10,
                                          offset: const Offset(0, 3),
                                        ),
                                      ],
                                    ),
                                    child: Icon(
                                      Icons.camera_alt,
                                      size: 5.w,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 3.h),
                          Text(
                            "${widget.user.firstName ?? ""} ${widget.user.lastName ?? ""}",
                            style: GoogleFonts.montserrat(
                              fontSize: 18.sp,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF007AFF),
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: 0.5.h),
                          Text(
                            widget.user.poste ?? "Utilisateur",
                            style: GoogleFonts.montserrat(
                              fontSize: 12.sp,
                              color: const Color(0xFF8E8E93),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Form card améliorée
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(5.w),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.15),
                            blurRadius: 25,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Informations personnelles",
                              style: GoogleFonts.montserrat(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF2D3748),
                              ),
                            ),
                            SizedBox(height: 3.h),

                            _buildTextField(
                              controller: _firstNameController,
                              label: "Prénom",
                              validator: (v) =>
                                  v!.isEmpty ? "Le prénom est requis" : null,
                            ),
                            _buildTextField(
                              controller: _lastNameController,
                              label: "Nom",
                            ),
                            _buildTextField(
                              controller: _surnameController,
                              label: "Surnom",
                              validator: (v) =>
                                  v!.isEmpty ? "Le surnom est requis" : null,
                            ),
                            _buildTextField(
                              controller: _emailController,
                              label: "Email",
                              keyboardType: TextInputType.emailAddress,
                            ),

                            // Champ téléphone amélioré
                            Container(
                              margin: EdgeInsets.only(bottom: 2.h),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "Téléphone",
                                    style: GoogleFonts.montserrat(
                                      fontSize: 12.sp,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFF2D3748),
                                    ),
                                  ),
                                  SizedBox(height: 1.h),
                                  Container(
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: Color(
                                          0xFF007AFF,
                                        ).withOpacity(0.6),
                                      ),
                                    ),
                                    child: InternationalPhoneNumberInput(
                                      onInputChanged: (PhoneNumber num) {
                                        setState(() {
                                          _phone = num.phoneNumber ?? '';
                                          _initialPhone = num;
                                          if (num.isoCode != null) {
                                            _currentIso = num.isoCode!;
                                            _currentDial =
                                                num.dialCode?.replaceFirst(
                                                  '+',
                                                  '',
                                                ) ??
                                                _isoToDial[_currentIso] ??
                                                _currentDial;
                                          }
                                        });
                                      },
                                      onInputValidated: (bool isValid) {
                                        // Validation supplémentaire si nécessaire
                                      },
                                      initialValue: _initialPhone,
                                      textFieldController: _phoneController,
                                      selectorConfig: SelectorConfig(
                                        selectorType:
                                            PhoneInputSelectorType.DIALOG,
                                        useEmoji: true,
                                        setSelectorButtonAsPrefixIcon: true,
                                      ),
                                      formatInput: true,
                                      keyboardType: TextInputType.phone,
                                      inputDecoration: InputDecoration(
                                        contentPadding: EdgeInsets.symmetric(
                                          horizontal: 4.w,
                                          vertical: 2.h,
                                        ),
                                        border: InputBorder.none,
                                        hintText: "Entrez votre numéro",
                                        hintStyle: GoogleFonts.montserrat(
                                          color: const Color(0xFFA0AEC0),
                                          fontSize: 12.sp,
                                        ),
                                      ),
                                      textStyle: GoogleFonts.montserrat(
                                        fontSize: 13.sp,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            _buildTextField(
                              controller: _passwordController,
                              label: "Mot de passe",
                              isPassword: true,
                            ),

                            SizedBox(height: 4.h),
                            _loading
                                ? Center(
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        const Color(0xFF007AFF),
                                      ),
                                      strokeWidth: 2,
                                    ),
                                  )
                                : CustomElevatedButton(
                                    text: "Enregistrer les modifications",
                                    backgroundColor: const Color(0xFF007AFF),
                                    textColor: Colors.white,
                                    onPressed: _saveProfile,
                                    width: double.infinity,
                                  ),
                          ],
                        ),
                      ),
                    ),

                    SizedBox(height: 4.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Clipper amélioré avec effet plus fluide
class ProfileTopClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(0, 0);
    path.lineTo(size.width, 0);
    path.lineTo(size.width, size.height * 0.7);
    path.quadraticBezierTo(
      size.width * 0.8,
      size.height * 0.9,
      size.width * 0.6,
      size.height * 0.8,
    );
    path.quadraticBezierTo(
      size.width * 0.4,
      size.height * 0.7,
      size.width * 0.2,
      size.height * 0.8,
    );
    path.quadraticBezierTo(
      size.width * 0.05,
      size.height * 0.9,
      0,
      size.height * 0.7,
    );
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
