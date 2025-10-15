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

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
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


  Future<void> _pickImage(bool fromCamera) async {
    final token = context.read<AuthProvider>().token;
    if (token == null) return;

    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: fromCamera ? ImageSource.camera : ImageSource.gallery,
    );

    if (pickedFile != null) {
      final success =
          await UserService().updateProfilePicture(token, pickedFile.path);
      if (success && mounted) {
        setState(() {
          _futureUser = UserService().getUserInfo(token);
        });
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Photo de profil mise à jour !")),
        );
      }
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

    // --------------- Correction: Utilise MediaQuery pour la responsivité ---------------
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
    // ----------------

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
                              child: user.photoProfil == null
                                  ? Image.asset(
                                      "assets/profile.png",
                                      fit: BoxFit.cover,
                                    )
                                  : Image.network(
                                      user.photoProfil!,
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
                    Text(
                      "${user.firstName} ${user.lastName} ${user.surname} ",
                      style: GoogleFonts.montserrat(
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF007AFF),
                      ),
                      textAlign: TextAlign.center,
                    ),

                    // Poste
                    Text(
                      user.poste,
                      style: GoogleFonts.montserrat(
                        fontSize: 15.sp,
                        color: const Color(0xFF8E8E93),
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),

                    SizedBox(height: bottomSpace),

                    // Boutons
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 6.w),
                      child: Column(
                        children: [
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
          actionsAlignment: MainAxisAlignment.spaceAround,
          actions: [
            CustomElevatedButton(
              text: "NON",
              backgroundColor: Colors.transparent,
              textColor: const Color(0xFF8E8E93),
              onPressed: () => Navigator.pop(context),
              width: 30.w,
              outlined: true,
            ),
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
