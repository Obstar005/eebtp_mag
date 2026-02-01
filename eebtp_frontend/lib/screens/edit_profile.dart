import 'dart:convert';
import 'dart:io';
import 'dart:ui';
import 'package:eebtp_frontend/models/utilisateur.dart';
import 'package:eebtp_frontend/services/auth.dart';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:country_picker/country_picker.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:sizer/sizer.dart';
import 'package:provider/provider.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:toastification/toastification.dart';
import 'package:cached_network_image/cached_network_image.dart'; // ✅ Ajouté

class EditProfilePage extends StatefulWidget {
  final Utilisateur user;
  const EditProfilePage({super.key, required this.user});
  @override
  _EditProfilePageState createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  // ✅ AJOUT : URL du backend
  static const String backendUrl = 'http://38.242.139.218:8000';
  
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _surnameController = TextEditingController();
  final _emailController = TextEditingController();
  final TextEditingController _inputPhoneRawController = TextEditingController();

  Country _selectedCountry = Country.parse('TG');

  bool _loading = false;
  File? _pickedImage;
  String? _serverPhotoUrl;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        Provider.of<AuthProvider>(context, listen: false).checkTokenExpiry(context);
      }
    });
    _firstNameController.text = widget.user.firstName ?? '';
    _lastNameController.text = widget.user.lastName ?? '';
    _surnameController.text = widget.user.surname ?? '';
    _emailController.text = widget.user.email ?? '';
    final rawPhone = widget.user.telephone ?? '';
    final countryList = ['TG', 'BJ', 'SN', 'CI'];
    for (final code in countryList) {
      final country = Country.parse(code);
      if (rawPhone.startsWith('00${country.phoneCode}')) {
        _selectedCountry = country;
        _inputPhoneRawController.text =
            rawPhone.replaceFirst('00${country.phoneCode}', '');
        break;
      }
    }
    _serverPhotoUrl = widget.user.photoProfil;
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _surnameController.dispose();
    _emailController.dispose();
    _inputPhoneRawController.dispose();
    super.dispose();
  }

  // ✅ NOUVELLE MÉTHODE : Construire l'URL complète de la photo
  String? _getProfilePhotoUrl(String? photoPath) {
    if (photoPath == null || photoPath.isEmpty) return null;
    
    // Si l'URL commence par '/media', ajouter le backend
    if (photoPath.startsWith('/media')) {
      return '$backendUrl$photoPath';
    }
    
    // Sinon, retourner tel quel (URL complète déjà)
    return photoPath;
  }

  // ✅ NOUVELLE MÉTHODE : Affichage du poste
  String _getDisplayPoste(String? poste) {
    if (poste == null || poste.isEmpty || poste.toLowerCase() == 'string') {
      return 'Utilisateur';
    }
    return poste;
  }

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

  Future<void> _pickImage(bool fromCamera) async {
    try {
      final picker = ImagePicker();
      final picked = await picker.pickImage(
        source: fromCamera ? ImageSource.camera : ImageSource.gallery,
        imageQuality: 75,
      );
      if (picked != null) {
        setState(() => _pickedImage = File(picked.path));
        if (Navigator.canPop(context)) Navigator.pop(context);
      }
    } catch (e) {
      _showToast(
        message: "Erreur lors de la sélection de l'image",
        type: ToastificationType.error,
      );
      print('[ERROR] _pickImage: $e');
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _loading = true);
    
    final userService = UserService();
    final token = context.read<AuthProvider>().token;
    
    if (token == null) {
      setState(() => _loading = false);
      _showToast(
        message: "Session expirée, veuillez vous reconnecter",
        type: ToastificationType.error,
      );
      return;
    }

    final phoneRaw = _inputPhoneRawController.text.trim().replaceAll(RegExp(r'[^0-9]'), '');
    String fullPhone = '';
    if (phoneRaw.isNotEmpty) {
      fullPhone = '00${_selectedCountry.phoneCode}$phoneRaw';
    }
    print('[DEBUG] Numéro à envoyer : $fullPhone');

    if (fullPhone.length < 10) {
      setState(() => _loading = false);
      _showToast(
        message: "Numéro de téléphone invalide",
        type: ToastificationType.error,
      );
      return;
    }

    String? finalPhotoUrl = _serverPhotoUrl ?? widget.user.photoProfil;
    
    // Upload de la photo si une nouvelle image a été sélectionnée
    if (_pickedImage != null) {
      print('[DEBUG] Upload de la nouvelle photo de profil...');
      
      // Vérification de l'ID utilisateur
      if (widget.user.id == null) {
        setState(() => _loading = false);
        _showToast(
          message: "Erreur: ID utilisateur manquant",
          type: ToastificationType.error,
        );
        print('[ERROR] widget.user.id est null');
        return;
      }
      
      try {
        final uploadSuccess = await userService.updateProfilePicture(
          token,
          widget.user.id!,
          _pickedImage!.path,
        );
        
        if (uploadSuccess) {
          print('[DEBUG] Photo uploadée avec succès');
          
          // Récupération des informations mises à jour pour obtenir la nouvelle URL de la photo
          try {
            final refreshed = await userService.getUserInfo(token);
            finalPhotoUrl = refreshed.photoProfil;
            
            setState(() {
              _serverPhotoUrl = finalPhotoUrl;
              _pickedImage = null; // Réinitialiser l'image locale
            });
            
            context.read<AuthProvider>().setUser(refreshed);
            print('[DEBUG] Nouvelle URL de la photo: $finalPhotoUrl');
          } catch (e) {
            print('[ERROR] Erreur lors de la récupération des infos utilisateur: $e');
            _showToast(
              message: "Photo uploadée mais erreur de synchronisation",
              type: ToastificationType.warning,
            );
          }
        } else {
          setState(() => _loading = false);
          _showToast(
            message: "Échec de l'upload de la photo de profil",
            type: ToastificationType.error,
          );
          print('[ERROR] updateProfilePicture a retourné false');
          return;
        }
      } catch (e) {
        setState(() => _loading = false);
        _showToast(
          message: "Erreur lors de l'upload de la photo",
          type: ToastificationType.error,
        );
        print('[ERROR] Exception lors de l\'upload de la photo: $e');
        return;
      }
    }

    // Mise à jour des autres informations du profil
    final updatedUser = widget.user.copyWith(
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      surname: _surnameController.text.trim(),
      email: _emailController.text.trim(),
      telephone: fullPhone,
      photoProfil: finalPhotoUrl,
    );

    try {
      print('[DEBUG] Mise à jour du profil utilisateur...');
      final resp = await userService.updateUser(widget.user.id!, updatedUser, token);
      
      setState(() => _loading = false);
      
      if (resp) {
        context.read<AuthProvider>().setUser(updatedUser);
        _showToast(
          message: "Profil mis à jour avec succès",
          type: ToastificationType.success,
        );
        print('[DEBUG] Profil mis à jour avec succès');
        _showSuccessDialog();
      } else {
        _showToast(
          message: "Échec de la mise à jour du profil",
          type: ToastificationType.error,
        );
        print('[ERROR] updateUser a retourné false');
      }
    } catch (e) {
      setState(() => _loading = false);

      String errorMsg = "Impossible de mettre à jour votre profil";

      if (e is http.Response) {
        try {
          final decoded = jsonDecode(e.body);
          if (decoded is Map && decoded['detail'] != null) {
            errorMsg = decoded['detail'].toString();
          } else if (decoded is String) {
            errorMsg = decoded;
          } else {
            errorMsg = e.body;
          }
        } catch (_) {
          errorMsg = e.body;
        }
      }
      
      _showToast(
        message: errorMsg,
        type: ToastificationType.error,
      );
      print('[ERROR] Exception lors de la mise à jour du profil: $e');
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
              style: GoogleFonts.montserrat(fontSize: 16.sp, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 3.h),
            ListTile(
              leading: Icon(Icons.camera_alt, color: const Color(0xFF007AFF)),
              title: Text("Prendre une photo", style: GoogleFonts.montserrat()),
              onTap: () => _pickImage(true),
            ),
            ListTile(
              leading: Icon(Icons.photo_library, color: const Color(0xFF007AFF)),
              title: Text("Choisir depuis la galerie", style: GoogleFonts.montserrat()),
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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          backgroundColor: Colors.white,
          shadowColor: Colors.black.withOpacity(0.3),
          elevation: 10,
          title: Center(
            child: Column(
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 15.w),
                SizedBox(height: 2.h),
                Text("Succès", style: GoogleFonts.montserrat(fontSize: 18.sp, fontWeight: FontWeight.w700, color: const Color(0xFF2D3748))),
              ],
            ),
          ),
          content: Text(
            "Votre profil a été mis à jour avec succès !",
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(fontSize: 14.sp, color: const Color(0xFF4A5568)),
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

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    IconData? icon,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: 2.5.h),
      child: TextFormField(
        controller: controller,
        validator: validator,
        keyboardType: keyboardType,
        style: GoogleFonts.montserrat(fontSize: 14.sp, fontWeight: FontWeight.w500),
        decoration: InputDecoration(
          prefixIcon: icon != null ? Icon(icon, color: const Color(0xFF007AFF)) : null,
          contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
          labelText: label,
          labelStyle: GoogleFonts.montserrat(
              color: Colors.grey[800], fontWeight: FontWeight.w600, fontSize: 13.sp),
          filled: true,
          fillColor: const Color(0xFFF7F7F7),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: const Color(0xFF007AFF).withOpacity(0.35)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: const Color(0xFF007AFF), width: 1.6),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // ✅ Obtenir l'URL complète de la photo serveur
    final serverPhotoUrlComplete = _getProfilePhotoUrl(_serverPhotoUrl);
    final userPhotoUrlComplete = _getProfilePhotoUrl(widget.user.photoProfil);
    
    return Scaffold(
      backgroundColor: const Color(0xFFF6F7FB),
      body: NavContainer(
        initialIndex: 3,
        body: Stack(
          children: [
            Container(
              height: 36.h,
              width: 100.w,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF007AFF), Color(0xFF0056CC)],
                ),
              ),
            ),
            SafeArea(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.5.h),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: Container(
                            padding: EdgeInsets.all(2.5.w),
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(Icons.arrow_back_ios_new, color: Color(0xFF007AFF), size: 22),
                          ),
                        ),
                        SizedBox(width: 4.w),
                        Text(
                          "Mon profil",
                          style: GoogleFonts.montserrat(
                            fontSize: 18.sp,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            shadows: [
                              Shadow(
                                color: Colors.black.withOpacity(0.08),
                                blurRadius: 10,
                                offset: const Offset(0, 1),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.zero,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          SizedBox(height: 1.5.h),
                          Container(
                            padding: EdgeInsets.all(4.w),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.06),
                                  blurRadius: 16,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              children: [
                                Stack(
                                  children: [
                                    Container(
                                      width: 28.w,
                                      height: 28.w,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        border: Border.all(color: const Color(0xFF007AFF), width: 4),
                                        boxShadow: [
                                          BoxShadow(
                                            color: const Color(0xFF007AFF).withOpacity(0.14),
                                            blurRadius: 10,
                                            offset: const Offset(0, 4),
                                          ),
                                        ],
                                      ),
                                      // ✅ WIDGET PHOTO AMÉLIORÉ
                                      child: ClipOval(
                                        child: _pickedImage != null
                                            ? Image.file(_pickedImage!, fit: BoxFit.cover)
                                            : serverPhotoUrlComplete != null
                                                ? CachedNetworkImage(
                                                    imageUrl: serverPhotoUrlComplete,
                                                    fit: BoxFit.cover,
                                                    placeholder: (context, url) => Container(
                                                      color: Colors.grey[200],
                                                      child: Center(
                                                        child: SizedBox(
                                                          width: 8.w,
                                                          height: 8.w,
                                                          child: CircularProgressIndicator(
                                                            strokeWidth: 2,
                                                            color: Color(0xFF007AFF),
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                    errorWidget: (context, url, error) => Image.asset(
                                                      "assets/profile.png",
                                                      fit: BoxFit.cover,
                                                    ),
                                                  )
                                                : userPhotoUrlComplete != null
                                                    ? CachedNetworkImage(
                                                        imageUrl: userPhotoUrlComplete,
                                                        fit: BoxFit.cover,
                                                        placeholder: (context, url) => Container(
                                                          color: Colors.grey[200],
                                                          child: Center(
                                                            child: SizedBox(
                                                              width: 8.w,
                                                              height: 8.w,
                                                              child: CircularProgressIndicator(
                                                                strokeWidth: 2,
                                                                color: Color(0xFF007AFF),
                                                              ),
                                                            ),
                                                          ),
                                                        ),
                                                        errorWidget: (context, url, error) => Image.asset(
                                                          "assets/profile.png",
                                                          fit: BoxFit.cover,
                                                        ),
                                                      )
                                                    : Image.asset("assets/profile.png", fit: BoxFit.cover),
                                      ),
                                    ),
                                    Positioned(
                                      right: 3,
                                      bottom: 3,
                                      child: GestureDetector(
                                        onTap: () => _showImagePickerOptions(context),
                                        child: Container(
                                          padding: EdgeInsets.all(2.9.w),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF007AFF),
                                            shape: BoxShape.circle,
                                            border: Border.all(color: Colors.white, width: 2),
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.black.withOpacity(0.15),
                                                blurRadius: 12,
                                                offset: const Offset(0, 2),
                                              ),
                                            ],
                                          ),
                                          child: Icon(Icons.photo_camera, color: Colors.white, size: 22),
                                        ),
                                      ),
                                    )
                                  ],
                                ),
                                SizedBox(height: 2.2.h),
                                Text(
                                  "${widget.user.firstName ?? ""} ${widget.user.lastName ?? ""}",
                                  style: GoogleFonts.montserrat(
                                    fontSize: 17.sp,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFF007AFF),
                                  ),
                                  textAlign: TextAlign.center,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                SizedBox(height: 0.5.h),
                                Text(
                                  _getDisplayPoste(widget.user.poste), // ✅ Corrigé
                                  style: GoogleFonts.montserrat(
                                    fontSize: 13.sp,
                                    color: const Color(0xFF8E8E93),
                                    fontWeight: FontWeight.w500,
                                  ),
                                  textAlign: TextAlign.center,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          SizedBox(height: 2.5.h),
                          Container(
                            width: double.infinity,
                            padding: EdgeInsets.all(5.w),
                            margin: EdgeInsets.symmetric(horizontal: 5.w),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.08),
                                  blurRadius: 20,
                                  offset: const Offset(0, 8),
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
                                        fontSize: 16.sp, fontWeight: FontWeight.w700, color: const Color(0xFF2D3748)),
                                  ),
                                  SizedBox(height: 3.h),
                                  _buildTextField(
                                    controller: _firstNameController,
                                    label: "Prénom",
                                    validator: (v) => v!.isEmpty ? "Le prénom est requis" : null,
                                    icon: Icons.person_outline,
                                  ),
                                  _buildTextField(
                                    controller: _lastNameController,
                                    label: "Nom de famille",
                                    icon: Icons.badge_outlined,
                                  ),
                                  _buildTextField(
                                    controller: _surnameController,
                                    label: "Surnom",
                                    validator: (v) => v!.isEmpty ? "Le surnom est requis" : null,
                                    icon: Icons.drive_file_rename_outline,
                                  ),
                                  _buildTextField(
                                    controller: _emailController,
                                    label: "Adresse e-mail",
                                    keyboardType: TextInputType.emailAddress,
                                    icon: Icons.email_outlined,
                                  ),
                                  SizedBox(height: 2.h),
                                  Align(
                                    alignment: Alignment.centerLeft,
                                    child: Text(
                                      "Téléphone",
                                      style: GoogleFonts.montserrat(
                                        fontSize: 13.sp,
                                        fontWeight: FontWeight.bold,
                                        color: const Color(0xFF2D3748),
                                      ),
                                    ),
                                  ),
                                  SizedBox(height: 1.h),
                                  Container(
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF7F7F7),
                                      borderRadius: BorderRadius.circular(13),
                                      border: Border.all(color: const Color(0xFF007AFF).withOpacity(0.39)),
                                    ),
                                    child: Row(
                                      children: [
                                        GestureDetector(
                                          onTap: () {
                                            showCountryPicker(
                                              context: context,
                                              showPhoneCode: true,
                                              countryListTheme: CountryListThemeData(
                                                borderRadius: BorderRadius.circular(10),
                                                backgroundColor: Colors.white,
                                                inputDecoration: InputDecoration(
                                                  hintText: 'Chercher un pays',
                                                  prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
                                                  border: OutlineInputBorder(
                                                    borderRadius: BorderRadius.circular(10),
                                                  ),
                                                ),
                                              ),
                                              onSelect: (Country c) {
                                                setState(() => _selectedCountry = c);
                                              },
                                              countryFilter: ['TG', 'BJ', 'SN', 'CI'],
                                            );
                                          },
                                          child: Padding(
                                            padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 2.2.h),
                                            child: Row(
                                              children: [
                                                Text(
                                                  _selectedCountry.flagEmoji,
                                                  style: TextStyle(fontSize: 24),
                                                ),
                                                SizedBox(width: 6),
                                                Text(
                                                  "+${_selectedCountry.phoneCode}",
                                                  style: GoogleFonts.montserrat(fontSize: 13.sp, fontWeight: FontWeight.bold),
                                                ),
                                                SizedBox(width: 3),
                                                Icon(Icons.keyboard_arrow_down, size: 18, color: const Color(0xFF007AFF)),
                                              ],
                                            ),
                                          ),
                                        ),
                                        Container(width: 1.5, height: 4.9.h, color: Colors.grey.withOpacity(0.18)),
                                        Expanded(
                                          child: TextFormField(
                                            controller: _inputPhoneRawController,
                                            keyboardType: TextInputType.phone,
                                            style: GoogleFonts.montserrat(fontSize: 14.sp),
                                            decoration: InputDecoration(
                                              hintText: "Numéro de téléphone",
                                              hintStyle: GoogleFonts.montserrat(color: const Color(0xFFA0AEC0), fontSize: 12.sp),
                                              border: InputBorder.none,
                                              contentPadding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 2.h),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  SizedBox(height: 4.h),
                                  _loading
                                      ? Center(
                                          child: CircularProgressIndicator(
                                              valueColor: AlwaysStoppedAnimation<Color>(const Color(0xFF007AFF)), strokeWidth: 2))
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
                          SizedBox(height: 6.h),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}