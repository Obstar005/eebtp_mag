import 'dart:ui';
import 'package:eebtp_frontend/models/utilisateur.dart';
import 'package:eebtp_frontend/services/auth.dart';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:toastification/toastification.dart';
import 'package:cached_network_image/cached_network_image.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  static const String backendUrl = 'http://38.242.139.218:8001';
  
  late Future<Utilisateur> _futureUser;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        Provider.of<AuthProvider>(context, listen: false).checkTokenExpiry(context);
      }
    });

    final token = context.read<AuthProvider>().token;
    if (token != null) {
      _futureUser = UserService().getUserInfo(token);
    } else {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pushReplacementNamed(context, '/login');
      });
    }
  }

  String? _getProfilePhotoUrl(String? photoPath) {
    if (photoPath == null || photoPath.isEmpty) return null;
    
    if (photoPath.startsWith('/media')) {
      return '$backendUrl$photoPath';
    }
    
    return photoPath;
  }

  String _getDisplayPoste(String? poste) {
    if (poste == null || poste.isEmpty || poste.toLowerCase() == 'string') {
      return 'Sans poste';
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
    final token = context.read<AuthProvider>().token;
    if (token == null) {
      _showToast(
        message: "Session expirée, veuillez vous reconnecter",
        type: ToastificationType.error,
      );
      return;
    }

    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: fromCamera ? ImageSource.camera : ImageSource.gallery,
      );

      if (pickedFile != null) {
        if (mounted) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => Center(
              child: CircularProgressIndicator(
                color: Color(0xFF007AFF),
              ),
            ),
          );
        }

        final currentUser = context.read<AuthProvider>().user;
        
        if (currentUser?.id == null) {
          if (mounted) {
            Navigator.pop(context);
          }
          _showToast(
            message: "Erreur: ID utilisateur manquant",
            type: ToastificationType.error,
          );
          return;
        }

        final success = await UserService().updateProfilePicture(
          token,
          currentUser!.id!,
          pickedFile.path,
        );

        if (mounted) {
          Navigator.pop(context);
        }

        if (success && mounted) {
          setState(() {
            _futureUser = UserService().getUserInfo(token);
          });
          Navigator.pop(context);
          _showToast(
            message: "Photo de profil mise à jour avec succès",
            type: ToastificationType.success,
          );
        } else {
          _showToast(
            message: "Erreur lors de la mise à jour de la photo",
            type: ToastificationType.error,
          );
        }
      }
    } catch (e) {
      if (mounted && Navigator.canPop(context)) {
        Navigator.pop(context);
      }
      _showToast(
        message: "Erreur lors de la sélection de l'image",
        type: ToastificationType.error,
      );
      print('Erreur _pickImage: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final token = context.watch<AuthProvider>().token;
    final storeId = context.watch<AuthProvider>().storeId;
    final currentUser = context.watch<AuthProvider>().user;

    if (token == null) {
      return Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    final screenHeight = MediaQuery.of(context).size.height;

    double avatarSize = 35.w;
    double topSpace = 12.h;
    double bottomSpace = 15.h;
    double btnSpace = 3.h;
    if (screenHeight < 550) {
      topSpace = 2.h;
      avatarSize = 28.w;
      bottomSpace = 3.h;
      btnSpace = 2.h;
    }

    return NavContainer(
      initialIndex: 3,
      body: FutureBuilder<Utilisateur>(
        future: _futureUser,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(
              child: Text(
                "Erreur: ${snapshot.error}",
                style: const TextStyle(color: Colors.red),
              ),
            );
          } else if (!snapshot.hasData) {
            return const Center(child: Text("Aucun utilisateur trouvé"));
          }

          final user = snapshot.data!;

          if (currentUser == null || currentUser.id != user.id) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              context.read<AuthProvider>().setUser(user);
            });
          }

          final photoUrl = _getProfilePhotoUrl(user.photoProfil);

          return Stack(
            children: [
              // ----------- Background ----------
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
                  ],
                ),
              ),

              // ----------- Contenu principal ----------
              SafeArea(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header
                    Padding(
                      padding:
                          EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Profil",
                            style: GoogleFonts.montserrat(
                              fontSize: 18.sp,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                          Stack(
                            children: [
                              GestureDetector(
                                onTap: () =>
                                    Navigator.pushNamed(context, '/notifications'),
                                child: Container(
                                  padding: EdgeInsets.all(2.3.w),
                                  decoration: const BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    Icons.notifications_outlined,
                                    size: 8.w,
                                    color: Color(0xFF007AFF),
                                  ),
                                ),
                              ),
                              Positioned(
                                right: 0,
                                top: 0,
                                child: Container(
                                  padding: EdgeInsets.all(1.w),
                                  decoration: const BoxDecoration(
                                    color: Colors.red,
                                    shape: BoxShape.circle,
                                  ),
                                  constraints: BoxConstraints(
                                    minWidth: 14,
                                    minHeight: 14,
                                  ),
                                  child: Text(
                                    "3",
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 10.sp,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Montserrat',
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    SizedBox(height: topSpace),

                    // Photo profil
                    Center(
                      child: Stack(
                        children: [
                          Container(
                            width: avatarSize,
                            height: avatarSize,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: const Color(0xFF007AFF),
                                width: 2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.11),
                                  blurRadius: 9,
                                  offset: const Offset(0, 5),
                                ),
                              ],
                            ),
                            child: ClipOval(
                              child: photoUrl != null
                                  ? CachedNetworkImage(
                                      imageUrl: photoUrl,
                                      fit: BoxFit.cover,
                                      placeholder: (context, url) => Container(
                                        color: Colors.grey[200],
                                        child: Center(
                                          child: SizedBox(
                                            width: avatarSize * 0.3,
                                            height: avatarSize * 0.3,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 3,
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
                                  : Image.asset(
                                      "assets/profile.png",
                                      fit: BoxFit.cover,
                                    ),
                            ),
                          ),
                          Positioned(
                            bottom: 2,
                            right: 2,
                            child: GestureDetector(
                              onTap: () => _showImagePickerOptions(context),
                              child: Container(
                                padding: EdgeInsets.all(2.w),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF007AFF),
                                  shape: BoxShape.circle,
                                  border:
                                      Border.all(color: Colors.white, width: 2),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.2),
                                      blurRadius: 4,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  Icons.edit,
                                  size: 4.5.w,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    SizedBox(height: 2.h),

                    // Nom complet
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 6.w),
                      child: Text(
                        "${user.firstName} ${user.lastName}",
                        style: GoogleFonts.montserrat(
                          fontSize: 20.sp,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF007AFF),
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),

                    // Poste
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 6.w),
                      child: Text(
                        _getDisplayPoste(user.poste),
                        style: GoogleFonts.montserrat(
                          fontSize: 15.sp,
                          color: const Color(0xFF8E8E93),
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),

                    SizedBox(height: bottomSpace*0.7),

                    // ✅ SECTION BOUTONS MODIFIÉE
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 6.w),
                      child: Column(
                        children: [
                          // Bouton Modifier votre profil
                          Container(
                            width: double.infinity,
                            height: 6.2.h,
                            margin: EdgeInsets.only(bottom: btnSpace),
                            child: CustomElevatedButton(
                              text: "Modifier votre profil",
                              backgroundColor: Colors.white,
                              textColor: const Color(0xFF007AFF),
                              onPressed: () => Navigator.pushNamed(
                                context,
                                '/edit_profile',
                                arguments: {
                                  'user': user,
                                },
                              ),
                              icon: Icons.edit_outlined,
                              iconColor: const Color(0xFF007AFF),
                              outlined: true,
                            ),
                          ),
                          
                          // ✅ NOUVEAU BOUTON : Changer de magasin
                          Container(
                            width: double.infinity,
                            height: 6.2.h,
                            margin: EdgeInsets.only(bottom: btnSpace),
                            child: CustomElevatedButton(
                              text: "Changer de magasin",
                              backgroundColor: Colors.white,
                              textColor: const Color(0xFF34C759),
                              onPressed: () {
                                Navigator.pushNamed(context, '/store_selection');
                              },
                              icon: Icons.store_outlined,
                              iconColor: const Color(0xFF34C759),
                              outlined: true,
                            ),
                          ),
                          
                          // Bouton Déconnecter
                          SizedBox(
                            width: double.infinity,
                            height: 6.2.h,
                            child: CustomElevatedButton(
                              text: "Déconnecter",
                              backgroundColor: Colors.white,
                              textColor: const Color(0xFFFF3B30),
                              onPressed: () => _showLogoutDialog(context),
                              icon: Icons.logout,
                              iconColor: const Color(0xFFFF3B30),
                              outlined: true,
                            ),
                          ),
                          
                          // Bouton Debug (à retirer en production)
                        SizedBox(height: 2.h),
                          SizedBox(
                            width: double.infinity,
                            height: 6.2.h,
                            child: CustomElevatedButton(
                              text: "🔧 Réinitialiser l'app (Debug)",
                              backgroundColor: Colors.orange,
                              textColor: Colors.white,
                              onPressed: () async {
                                await context.read<AuthProvider>().resetApp();
                                Navigator.pushNamedAndRemoveUntil(
                                  context,
                                  '/',
                                  (route) => false,
                                );
                              },
                              outlined: false,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
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
            topLeft: Radius.circular(6.w),
            topRight: Radius.circular(6.w),
          ),
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
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.w600,
                fontFamily: "Montserrat",
              ),
            ),
            SizedBox(height: 3.h),
            ListTile(
              leading: const Icon(Icons.camera_alt, color: Color(0xFF007AFF)),
              title: const Text("Prendre une photo"),
              onTap: () => _pickImage(true),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library, color: Color(0xFF007AFF)),
              title: const Text("Choisir depuis la galerie"),
              onTap: () => _pickImage(false),
            ),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.5),
      builder: (context) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 3.0, sigmaY: 3.0),
        child: AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4.w),
          ),
          title: Center(
            child: Text(
              "Déconnexion",
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.w700,
                fontFamily: "Montserrat",
              ),
            ),
          ),
          content: Text(
            "Souhaitez-vous vous déconnecter ?",
            style: TextStyle(fontSize: 14.sp, fontFamily: "Montserrat"),
          ),
          actionsPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          actions: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                CustomElevatedButton(
                  text: "NON",
                  backgroundColor: Colors.white,
                  textColor: const Color.fromARGB(255, 0, 0, 0),
                  onPressed: () => Navigator.pop(context),
                  width: 30.w,
                  outlined: true,
                ),
                SizedBox(width: 14),
                CustomElevatedButton(
                  text: "OUI",
                  backgroundColor: const Color(0xFFFF3B30),
                  textColor: Colors.white,
                  onPressed: () {
                    Navigator.pop(context);
                    context.read<AuthProvider>().clear();
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      '/login',
                      (route) => false,
                    );
                  },
                  width: 30.w,
                ),
              ],
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
      size.width * 0.85,
      size.height * 0.75,
      size.width * 0.7,
      size.height * 0.65,
    );
    path.quadraticBezierTo(
      size.width * 0.5,
      size.height * 0.45,
      size.width * 0.3,
      size.height * 0.65,
    );
    path.quadraticBezierTo(
      size.width * 0.15,
      size.height * 0.75,
      0,
      size.height * 0.6,
    );
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}