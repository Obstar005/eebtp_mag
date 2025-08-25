import 'package:eebtp_frontend/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sizer/sizer.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> with TickerProviderStateMixin {
  int _currentIndex = 3; // Profile tab is selected
  bool _isFabExpanded = false;
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 300),
    );
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleFab() {
    setState(() {
      _isFabExpanded = !_isFabExpanded;
    });
    if (_isFabExpanded) {
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Arrière-plan avec gradient et forme ondulée
          SizedBox(
            height: 100.h,
            width: 100.w,
            child: Stack(
              children: [
                // Section bleue du haut
                ClipPath(
                  clipper: ProfileTopClipper(),
                  child: Container(
                    height: 50.h,
                    width: 100.w,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Color(0xFF007AFF),
                          Color(0xFF0056CC),
                        ],
                      ),
                    ),
                  ),
                ),
                
                // Section blanche du bas
                Positioned(
                  bottom: 0,
                  child: Container(
                    height: 55.h,
                    width: 100.w,
                    color: Color(0xFFF8F9FA),
                  ),
                ),
              ],
            ),
          ),
          
          // Contenu principal
          SafeArea(
            child: Column(
              children: [
                // Header avec titre et notifications
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Profil',
                        style: TextStyle(
                          fontSize: 24.sp,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      Stack(
                        children: [
                          GestureDetector(
                            onTap: () {
                              Navigator.pushNamed(context, '/notifications');
                            },
                            child: Container(
                              padding: EdgeInsets.all(2.w),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.notifications_outlined,
                                size: 10.w,
                                color: Color(0xFF007AFF),
                              ),
                            ),
                          ),
                          // Badge de notification
                          Positioned(
                            right: 0,
                            top: 0,
                            child: Container(
                              padding: EdgeInsets.all(1.w),
                              decoration: BoxDecoration(
                                color: Colors.red,
                                shape: BoxShape.circle,
                              ),
                              child: Text(
                                '3',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14.sp,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Poppins',
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                SizedBox(height: 18.h),
                
                // Photo de profil avec bouton d'édition (positionnée dans le creux)
                Stack(
                  children: [
                    Container(
                      width: 35.w,
                      height: 35.w,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: const Color(0xFF007AFF),
                          width: 4,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 10,
                            offset: Offset(0, 5),
                          ),
                        ],
                        //color: Colors.white,
                      ),
                      child: ClipOval(
                        child: SvgPicture.asset(
                          'assets/profile.svg', 
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    
                    // Bouton d'édition
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: () {
                          _showImagePickerOptions(context);
                        },
                        child: Container(
                          padding: EdgeInsets.all(2.w),
                          decoration: BoxDecoration(
                            color: Color(0xFF007AFF),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Colors.white,
                              width: 2,
                            ),
                          ),
                          child: Icon(
                            Icons.edit,
                            size: 4.w,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                
                SizedBox(height: 3.h),
                
                // Nom et poste
                Text(
                  'John Doe',
                  style: TextStyle(
                    fontSize: 22.sp,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF007AFF),
                    fontFamily: 'Poppins',
                  ),
                ),
                
                SizedBox(height: 1.h),
                
                Text(
                  'Magasinier',
                  style: TextStyle(
                    fontSize: 16.sp,
                    color: Color(0xFF8E8E93),
                    fontWeight: FontWeight.w500,
                    fontFamily: 'Poppins',
                  ),
                ),
                
                SizedBox(height: 6.h),
                
                // Boutons d'action
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 6.w),
                  child: Column(
                    children: [
                      // Bouton Modifier profil
                      Container(
                        width: double.infinity,
                        height: 6.5.h,
                        margin: EdgeInsets.only(bottom: 3.h),
                        child: CustomElevatedButton(
                          text: "Modifier votre profil",
                          backgroundColor: Colors.white,
                          textColor: const Color(0xFF007AFF),
                          onPressed: () => Navigator.pushNamed(context, '/edit_profile'),
                          icon: Icons.edit_outlined,
                          iconColor: const Color(0xFF007AFF),
                          outlined: true,
                        ),
                      ),
                      
                      // Bouton Déconnecter
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
      
      // Floating Action Button avec animation
    // Navigation bar avec courbe centrale et FAB flottant
floatingActionButton: Stack(
  children: [
    // Boutons secondaires animés
    AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Stack(
          children: [
            // Bouton Entrée (gauche)
            if (_isFabExpanded)
              Positioned(
                bottom: 12.h,
                left: MediaQuery.of(context).size.width * 0.5 - 80 - (60 * _animation.value),
                child: Transform.scale(
                  scale: _animation.value,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 8,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: FloatingActionButton(
                      
                      mini: true,
                      backgroundColor: Colors.green,
                      heroTag: "entry",
                      elevation: 0,
                      onPressed: () {
                        // Action pour entrée
                        _toggleFab();
                      },
                      child: Icon(Icons.arrow_downward, color: Colors.white, size: 20),
                    ),
                  ),
                ),
              ),
            
            // Bouton Actualiser (haut)
            if (_isFabExpanded)
              Positioned(
                bottom: 12.h + (70 * _animation.value),
                left: MediaQuery.of(context).size.width * 0.5 - 20,
                child: Transform.scale(
                  scale: _animation.value,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.orange,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 8,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: FloatingActionButton(
                      mini: true,
                      backgroundColor: Colors.orange,
                      heroTag: "refresh",
                      elevation: 0,
                      onPressed: () {
                        // Action pour actualiser
                        _toggleFab();
                      },
                      child: Icon(Icons.refresh, color: Colors.white, size: 20),
                    ),
                  ),
                ),
              ),
            
            // Bouton Sortie (droite)
            if (_isFabExpanded)
              Positioned(
                bottom: 12.h,
                left: MediaQuery.of(context).size.width * 0.5 + 20 + (60 * _animation.value),
                child: Transform.scale(
                  scale: _animation.value,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 8,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: FloatingActionButton(
                      mini: true,
                      backgroundColor: Colors.red,
                      heroTag: "exit",
                      elevation: 0,
                      onPressed: () {
                        // Action pour sortie
                        _toggleFab();
                      },
                      child: Icon(Icons.arrow_upward, color: Colors.white, size: 20),
                    ),
                  ),
                ),
              ),
               // Bouton principal
          Positioned(
            bottom: 8.h,
            right: 25.w,
            child: FloatingActionButton(
              backgroundColor: Colors.white,
              heroTag: "main",
              onPressed: _toggleFab,
              child: AnimatedRotation(
                turns: _isFabExpanded ? 0.125 : 0,
                duration: Duration(milliseconds: 300),
                child: Icon(
                  Icons.add,
                  size: 8.w,
                  color: Color(0xFF007AFF),
                ),
              ),
            ),
          ),
          ],
        );
      },
    ),
    
    // Bouton principal FAB
 /*    Container(
      decoration: BoxDecoration(
        color: Color(0xFF007AFF),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 12,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: FloatingActionButton(
        
        backgroundColor: Color(0xFF007AFF),
        heroTag: "main",
        elevation: 0,
        onPressed: _toggleFab,
        child: AnimatedRotation(
          turns: _isFabExpanded ? 0.125 : 0,
          duration: Duration(milliseconds: 300),
          child: Icon(
            Icons.add,
            size: 32,
            color: Colors.white,
          ),
        ),
      ),
    ),
 */  ],
),

// Bottom Navigation Bar avec courbe exacte comme l'image
bottomNavigationBar: Container(
  height: 80,
  child: Stack(
    children: [
      // Barre de navigation avec découpe
      CustomPaint(
        size: Size(MediaQuery.of(context).size.width, 80),
        painter: BottomNavPainter(),
      ),
      
      // Contenu de la navigation
      Container(
        height: 80,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            // Accueil
            Expanded(
              child: _buildNavItem(Icons.home_outlined, 'Accueil', 0),
            ),
            // Stock
            Expanded(
              child: _buildNavItem(Icons.inventory_2_outlined, 'Stock', 1),
            ),
            // Espace pour le FAB
            SizedBox(width: 80),
            // Demande
            Expanded(
              child: _buildNavItem(Icons.assignment_outlined, 'Demande', 2),
            ),
            // Profil
            Expanded(
              child: _buildNavItem(Icons.person_outline, 'Profil', 3),
            ),
          ],
        ),
      ),
    ],
  ),
),
floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
);
  }

  Widget _buildNavItem(IconData icon, String label, int index) {
    bool isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          _currentIndex = index;
        });
        _navigateToPage(index);
      },
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 6.w,
            color: isSelected ? Colors.white : Colors.white.withOpacity(0.6),
          ),
          SizedBox(height: 0.5.h),
          Text(
            label,
            style: TextStyle(
              fontSize: 10.sp,
              color: isSelected ? Colors.white : Colors.white.withOpacity(0.6),
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              fontFamily: 'Poppins',
            ),
          ),
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
        // Déjà sur la page profil
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
              'Modifier la photo de profil',
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.w600,
                fontFamily: 'Poppins',
              ),
            ),
            SizedBox(height: 3.h),
            ListTile(
              leading: Icon(Icons.camera_alt, color: Color(0xFF007AFF)),
              title: Text(
                'Prendre une photo',
                style: TextStyle(fontFamily: 'Poppins'),
              ),
              onTap: () {
                Navigator.pop(context);
                // Logique pour prendre une photo
              },
            ),
            ListTile(
              leading: Icon(Icons.photo_library, color: Color(0xFF007AFF)),
              title: Text(
                'Choisir depuis la galerie',
                style: TextStyle(fontFamily: 'Poppins'),
              ),
              onTap: () {
                Navigator.pop(context);
                // Logique pour choisir depuis la galerie
              },
            ),
            SizedBox(height: 2.h),
          ],
        ),
      ),
    );
  }
  
  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4.w),
        ),
        title: Text(
          'Déconnexion',
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.w600,
            fontFamily: 'Poppins',
          ),
        ),
        content: Text(
          'Êtes-vous sûr de vouloir vous déconnecter ?',
          style: TextStyle(
            fontSize: 14.sp,
            fontFamily: 'Poppins',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Annuler',
              style: TextStyle(
                color: Color(0xFF8E8E93),
                fontFamily: 'Poppins',
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamedAndRemoveUntil(
                context,
                '/login',
                (route) => false,
              );
            },
            child: Text(
              'Déconnecter',
              style: TextStyle(
                color: Color(0xFFFF3B30),
                fontFamily: 'Poppins',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
// Custom Painter pour créer la courbe exacte
class BottomNavPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    Paint paint = Paint()
      ..color = Color(0xFF007AFF)
      ..style = PaintingStyle.fill;

    Path path = Path();
    
    // Commencer du coin gauche
    path.moveTo(0, 20);
    
    // Coin arrondi gauche
    path.quadraticBezierTo(0, 0, 20, 0);
    
    // Ligne droite jusqu'au début de la courbe
    path.lineTo(size.width * 0.35, 0);
    
    // Courbe pour le FAB
    path.quadraticBezierTo(size.width * 0.40, 0, size.width * 0.45, 10);
    path.quadraticBezierTo(size.width * 0.50, 25, size.width * 0.55, 10);
    path.quadraticBezierTo(size.width * 0.60, 0, size.width * 0.65, 0);
    
    // Ligne droite jusqu'au coin droit
    path.lineTo(size.width - 20, 0);
    
    // Coin arrondi droit
    path.quadraticBezierTo(size.width, 0, size.width, 20);
    
    // Ligne droite vers le bas
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
} 
  
// Clipper modifié pour créer un creux plus prononcé
class ProfileTopClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    
    path.moveTo(0, 0);
    path.lineTo(size.width, 0);
    path.lineTo(size.width, size.height * 0.6);
    
    // Courbe ondulée avec creux plus prononcé au centre
    path.quadraticBezierTo(
      size.width * 0.85,
      size.height * 0.75,
      size.width * 0.7,
      size.height * 0.65,
    );
    
    // Creux central pour la photo de profil
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