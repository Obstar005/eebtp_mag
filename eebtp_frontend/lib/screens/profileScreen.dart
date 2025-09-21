import 'dart:ui';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      initialIndex: 3, // Onglet "Profil" sélectionné
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
                // Header
                Padding(
                  padding:
                      EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Profil",
                          style: GoogleFonts.montserrat(
                              fontSize: 18.sp,
                              fontWeight: FontWeight.w700,
                              color: Colors.white)),
                      Stack(
                        children: [
                          GestureDetector(
                            onTap: () =>
                                Navigator.pushNamed(context, '/notifications'),
                            child: Container(
                              padding: EdgeInsets.all(2.w),
                              decoration: const BoxDecoration(
                                  color: Colors.white, shape: BoxShape.circle),
                              child: Icon(Icons.notifications_outlined,
                                  size: 10.w, color: Color(0xFF007AFF)),
                            ),
                          ),
                          Positioned(
                            right: 0,
                            top: 0,
                            child: Container(
                              padding: EdgeInsets.all(1.w),
                              decoration: const BoxDecoration(
                                  color: Colors.red, shape: BoxShape.circle),
                              child: Text("3",
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 14.sp,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Montserrat')),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 12.h),

                // Photo profil + bouton édit
                Stack(
                  children: [
                    Container(
                      width: 35.w,
                      height: 35.w,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: const Color(0xFF007AFF), width: 2),
                        boxShadow: [
                          BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 10,
                              offset: const Offset(0, 5))
                        ],
                      ),
                      child: Image.asset("assets/profile.png",
                          height: 25.h, fit: BoxFit.cover),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: () => _showImagePickerOptions(context),
                        child: Container(
                          padding: EdgeInsets.all(2.w),
                          decoration: BoxDecoration(
                              color: const Color(0xFF007AFF),
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: Colors.white, width: 2)),
                          child: Icon(Icons.edit,
                              size: 4.w, color: Colors.white),
                        ),
                      ),
                    )
                  ],
                ),

                SizedBox(height: 1.5.h),

                Text("John Doe",
                    style: GoogleFonts.montserrat(
                        fontSize: 22.sp,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF007AFF))),
                Text("Magasinier",
                    style: GoogleFonts.montserrat(
                        fontSize: 16.sp,
                        color: Color(0xFF8E8E93),
                        fontWeight: FontWeight.w500)),

                SizedBox(height: 6.h),

                // Boutons action
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 6.w),
                  child: Column(
                    children: [
                      Container(
                        width: double.infinity,
                        height: 6.5.h,
                        margin: EdgeInsets.only(bottom: 3.h),
                        child: CustomElevatedButton(
                          text: "Modifier votre profil",
                          backgroundColor: Colors.white,
                          textColor: const Color(0xFF007AFF),
                          onPressed: () =>
                              Navigator.pushNamed(context, '/edit_profile'),
                          icon: Icons.edit_outlined,
                          iconColor: const Color(0xFF007AFF),
                          outlined: true,
                        ),
                      ),
                      SizedBox(
                        width: double.infinity,
                        height: 6.5.h,
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
              topRight: Radius.circular(6.w)),
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

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.5),
      builder: (context) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 3.0, sigmaY: 3.0),
        child: AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(4.w)),
          title: Center(
              child: Text("Déconnexion",
                  style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w700,
                      fontFamily: "Montserrat"))),
          content: Text("Souhaitez-vous vous déconnecter ?",
              style:
                  TextStyle(fontSize: 14.sp, fontFamily: "Montserrat")),
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
                Navigator.pushNamedAndRemoveUntil(
                    context, '/login', (route) => false);
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
