import 'package:eebtp_frontend/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sizer/sizer.dart';

class ProfilePage extends StatefulWidget {
  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  int _currentIndex = 3; // Profile tab is selected

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Arrière-plan avec gradient et forme ondulée
          Container(
            height: 100.h,
            width: 100.w,
            child: Stack(
              children: [
                // Section bleue du haut
                ClipPath(
                  clipper: ProfileTopClipper(),
                  child: Container(
                    height: 55.h,
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
                    height: 50.h,
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
                        ),
                      ),
                      Stack(
                        children: [
                          GestureDetector(
                            onTap: () {
                              // Navigation vers page notifications
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
                                size: 6.w,
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
                                  fontSize: 10.sp,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                SizedBox(height: 4.h),
                
                // Photo de profil avec bouton d'édition
                Stack(
                  children: [
                    Container(
                      width: 35.w,
                      height: 35.w,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white,
                          width: 4,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 10,
                            offset: Offset(0, 5),
                          ),
                        ],
                      ),
                      child: ClipOval(
                        child: SvgPicture.asset(
                          'assets/Ellipse 3.svg', // Image par défaut
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            // Avatar par défaut si l'image n'existe pas
                            return Container(
                              color: Color(0xFFE5E5EA),
                              child: Icon(
                                Icons.person,
                                size: 15.w,
                                color: Colors.grey[600],
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    
                    // Bouton d'édition
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: () {
                          // Action pour modifier la photo
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
                  ),
                ),
                
                SizedBox(height: 1.h),
                
                Text(
                  'Magasinier',
                  style: TextStyle(
                    fontSize: 16.sp,
                    color: Color(0xFF8E8E93),
                    fontWeight: FontWeight.w500,
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
                      Container(
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
      
      // Bottom Navigation Bar
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Color(0xFF007AFF),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(8.w),
            topRight: Radius.circular(8.w),
          ),
        ),
        child: SafeArea(
          child: Container(
            height: 10.h,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildNavItem(Icons.home_outlined, 'Accueil', 0),
                _buildNavItem(Icons.inventory_2_outlined, 'Stock', 1),
                // Bouton central "+"
                Container(
                  width: 15.w,
                  height: 15.w,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.add,
                    size: 8.w,
                    color: Color(0xFF007AFF),
                  ),
                ),
                _buildNavItem(Icons.assignment_outlined, 'Demande', 2),
                _buildNavItem(Icons.person, 'Profil', 3),
              ],
            ),
          ),
        ),
      ),
    );
  }
  
  Widget _buildNavItem(IconData icon, String label, int index) {
    bool isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          _currentIndex = index;
        });
        // Navigation selon l'index
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
              ),
            ),
            SizedBox(height: 3.h),
            ListTile(
              leading: Icon(Icons.camera_alt, color: Color(0xFF007AFF)),
              title: Text('Prendre une photo'),
              onTap: () {
                Navigator.pop(context);
                // Logique pour prendre une photo
              },
            ),
            ListTile(
              leading: Icon(Icons.photo_library, color: Color(0xFF007AFF)),
              title: Text('Choisir depuis la galerie'),
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
          ),
        ),
        content: Text(
          'Êtes-vous sûr de vouloir vous déconnecter ?',
          style: TextStyle(fontSize: 14.sp),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Annuler',
              style: TextStyle(color: Color(0xFF8E8E93)),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Logique de déconnexion
              Navigator.pushNamedAndRemoveUntil(
                context,
                '/login',
                (route) => false,
              );
            },
            child: Text(
              'Déconnecter',
              style: TextStyle(color: Color(0xFFFF3B30)),
            ),
          ),
        ],
      ),
    );
  }
}

// Clipper pour la forme ondulée du haut
class ProfileTopClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    
    path.moveTo(0, 0);
    path.lineTo(size.width, 0);
    path.lineTo(size.width, size.height * 0.7);
    
    // Courbe ondulée
    path.quadraticBezierTo(
      size.width * 0.5,
      size.height * 1.1,
      0,
      size.height * 0.7,
    );
    
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}