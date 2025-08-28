import 'dart:ui';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage>
    with TickerProviderStateMixin {
  int _currentIndex = 3; // Onglet profil sélectionné
  bool _isFabExpanded = false;
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController =
        AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
    _animation =
        CurvedAnimation(parent: _animationController, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleFab() {
    setState(() {
      _isFabExpanded = !_isFabExpanded;
      if (_isFabExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
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

                SizedBox(height: 15.h),

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
                      child: ClipOval(
                        child: SvgPicture.asset("assets/profile.svg",
                            height: 25.h, fit: BoxFit.cover),
                      ),
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
                    style: TextStyle(
                        fontSize: 22.sp,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF007AFF),
                        fontFamily: 'Montserrat')),
                Text("Magasinier",
                    style: TextStyle(
                        fontSize: 16.sp,
                        color: Color(0xFF8E8E93),
                        fontWeight: FontWeight.w500,
                        fontFamily: 'Montserrat')),

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
                          onPressed: () => Navigator.pushNamed(
                              context, '/edit_profile'),
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

      // ----------- FAB principal + secondaires ----------
      floatingActionButton: SizedBox(
        width: 300,
        height: 170,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Bouton Entrée
            AnimatedPositioned(
              duration: Duration(milliseconds: 300),
              curve: Curves.easeOut,
              bottom: _isFabExpanded ? 100 : 0,
              left: _isFabExpanded ? 60 : 0,
              
              child: Transform.scale(
                scale: _isFabExpanded ? 1 : 0,
                child: FloatingActionButton(
                  shape: const CircleBorder(),
                  mini: true,
                  heroTag: "entry",
                  backgroundColor: Color(0xFF007AFF),
                  onPressed: () {},
                  child: Icon(Icons.arrow_downward, color: Colors.white),
                ),
              ),
            ),
            // Bouton Actualiser
            AnimatedPositioned(
              duration: Duration(milliseconds: 300),
              curve: Curves.easeOut,
              bottom: _isFabExpanded ? 120 : 0,
              child: Transform.scale(
                scale: _isFabExpanded ? 1 : 0,
                child: FloatingActionButton(
                  shape: const CircleBorder(),
                  mini: true,
                  heroTag: "refresh",
                  backgroundColor: Color(0xFF007AFF),
                  onPressed: () {},
                  child: Icon(Icons.refresh, color: Colors.white),
                ),
              ),
            ),
            // Bouton Sortie
            AnimatedPositioned(
              duration: Duration(milliseconds: 300),
              curve: Curves.easeOut,
              bottom: _isFabExpanded ? 100 : 0,
              right: _isFabExpanded ? 60 : 0,
              child: Transform.scale(
                scale: _isFabExpanded ? 1 : 0,
                child: FloatingActionButton(
                  shape: const CircleBorder(),
                  mini: true,
                  heroTag: "exit",
                  backgroundColor: Color(0xFF007AFF),
                  onPressed: () {},
                  child: Icon(Icons.arrow_upward, color: Colors.white),
                ),
              ),
            ),

            // FAB principal
            FloatingActionButton(
              heroTag: "main",
              backgroundColor: Color(0xFF007AFF),
              onPressed: _toggleFab,
             shape: const CircleBorder(),
              child: AnimatedRotation(
                turns: _isFabExpanded ? 0.125 : 0,
                duration: Duration(milliseconds: 300),
                child: Icon(Icons.add, size: 50, color: Colors.white),
              ),
            ),
          ],
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,

      // ----------- BottomNav avec creux ----------
      bottomNavigationBar: SizedBox(
        height: 70,
        child: Stack(
          children: [
            CustomPaint(
              size: Size(MediaQuery.of(context).size.width, 70),
              painter: BottomNavPainter(),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(Icons.home_outlined, "Accueil", 0),
                _buildNavItem(Icons.inventory_2_outlined, "Stock", 1),
                SizedBox(width: 60),
                _buildNavItem(Icons.assignment_outlined, "Demande", 2),
                _buildNavItem(Icons.person_outline, "Profil", 3),
              ],
            )
          ],
        ),
      ),
    );
  }

  // ------------------- Helpers -------------------
  Widget _buildNavItem(IconData icon, String label, int index) {
    bool isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() => _currentIndex = index);
        _navigateToPage(index);
      },
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon,
              size: 22,
              color: isSelected ? Colors.white : Colors.white70),
          Text(label,
              style: TextStyle(
                  fontSize: 12,
                  color: isSelected ? Colors.white : Colors.white70,
                  fontFamily: "Montserrat")),
        ],
      ),
    );
  }

  void _navigateToPage(int index) {
    switch (index) {
      case 0:
        Navigator.pushReplacementNamed(context, '/home');
        break;
      case 1:
        Navigator.pushReplacementNamed(context, '/stock');
        break;
      case 2:
        Navigator.pushReplacementNamed(context, '/demande');
        break;
      case 3:
        break;
    }
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

// ----------- Bottom Nav Painter -----------
/// Painter de la bottom bar avec un creux circulaire arrondi aux bords
class BottomNavPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF007AFF)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    // Rayon du FAB et creux
    final double fabRadius = size.width * 0.08;
    final double notchRadius = fabRadius + 8;

    // Largeur horizontale de la zone du creux
    final double notchStartX = size.width / 2 - notchRadius;
    final double notchEndX = size.width / 2 + notchRadius;

    // Facteur de douceur (ajuste si besoin)
    final double smoothFactor = notchRadius * 0.4;

    final path = Path();

    // Coin arrondi gauche
    path.moveTo(0, 20);
    path.quadraticBezierTo(0, 0, 20, 0);

    // Plateau gauche jusqu'avant le creux
    path.lineTo(notchStartX - smoothFactor, 0);

    // Transition douce vers le creux
    path.cubicTo(
      notchStartX, 0,                     // contrôle proche plateau
      notchStartX, notchRadius * 0.3,     // contrôle qui descend légèrement
      size.width / 2 - fabRadius, notchRadius * 0.6, // entrée arrondie
    );

    // Arc central du creux (semi-circulaire)
    path.arcToPoint(
      Offset(size.width / 2 + fabRadius, notchRadius * 0.6),
      radius: Radius.circular(notchRadius),
      clockwise: false,
    );

    // Transition douce vers le plateau droit
    path.cubicTo(
      notchEndX, notchRadius * 0.3,
      notchEndX, 0,
      notchEndX + smoothFactor, 0,
    );

    // Plateau droit jusqu'au coin
    path.lineTo(size.width - 20, 0);
    path.quadraticBezierTo(size.width, 0, size.width, 20);

    // Bas de la barre
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    // Ombre
    canvas.drawShadow(path, Colors.black26, 5, true);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// Clipper pour créer une courbe simple comme dans l'image

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
