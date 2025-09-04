import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

import '../widgets/button.dart';

// Classes de la navbar
class ImprovedBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final bool showFabIndicator;

  const ImprovedBottomNavigation({
    Key? key,
    required this.currentIndex,
    required this.onTap,
    this.showFabIndicator = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 70,
      child: Stack(
        children: [
          CustomPaint(
            size: Size(MediaQuery.of(context).size.width, 70),
            painter: ImprovedBottomNavPainter(showFabIndicator: showFabIndicator),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(Icons.home_outlined, Icons.home, "Accueil", 0),
              _buildNavItem(Icons.inventory_2_outlined, Icons.inventory_2, "Stock", 1),
              SizedBox(width: 60),
              _buildNavItem(Icons.assignment_outlined, Icons.assignment, "Demande", 2),
              _buildNavItem(Icons.person_outline, Icons.person, "Profil", 3),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData outlinedIcon, IconData filledIcon, String label, int index) {
    bool isSelected = currentIndex == index;
    
    return GestureDetector(
      onTap: () => onTap(index),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isSelected ? filledIcon : outlinedIcon,
            size: 22,
            color: Colors.white,
          ),
          SizedBox(height: 2),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 4),
            child: Column(
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white,
                    fontFamily: "Montserrat",
                  ),
                ),
                if (isSelected)
                  Container(
                    margin: EdgeInsets.only(top: 2),
                    height: 2,
                    width: label.length * 8.0,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ImprovedBottomNavPainter extends CustomPainter {
  final bool showFabIndicator;

  ImprovedBottomNavPainter({this.showFabIndicator = false});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF007AFF)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    final double fabRadius = size.width * 0.08;
    final double notchRadius = fabRadius + 8;
    final double notchStartX = size.width / 2 - notchRadius;
    final double notchEndX = size.width / 2 + notchRadius;
    final double smoothFactor = notchRadius * 0.4;

    final path = Path();

    path.moveTo(0, 20);
    path.quadraticBezierTo(0, 0, 20, 0);
    path.lineTo(notchStartX - smoothFactor, 0);
    path.cubicTo(
      notchStartX, 0,
      notchStartX, notchRadius * 0.3,
      size.width / 2 - fabRadius, notchRadius * 0.6,
    );
    path.arcToPoint(
      Offset(size.width / 2 + fabRadius, notchRadius * 0.6),
      radius: Radius.circular(notchRadius),
      clockwise: false,
    );
    path.cubicTo(
      notchEndX, notchRadius * 0.3,
      notchEndX, 0,
      notchEndX + smoothFactor, 0,
    );
    path.lineTo(size.width - 20, 0);
    path.quadraticBezierTo(size.width, 0, size.width, 20);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    canvas.drawShadow(path, Colors.black26, 5, true);
    canvas.drawPath(path, paint);

    if (showFabIndicator) {
      final indicatorPaint = Paint()
        ..color = Colors.white
        ..style = PaintingStyle.fill;

      final indicatorPath = Path();
      final indicatorY = notchRadius * 0.8;
      final indicatorWidth = 30.0;
      final indicatorHeight = 3.0;

      indicatorPath.addRRect(
        RRect.fromLTRBR(
          size.width / 2 - indicatorWidth / 2,
          indicatorY,
          size.width / 2 + indicatorWidth / 2,
          indicatorY + indicatorHeight,
          Radius.circular(1.5),
        ),
      );

      canvas.drawPath(indicatorPath, indicatorPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class ImprovedFAB extends StatelessWidget {
  final bool isExpanded;
  final VoidCallback onToggle;
  final Function(String) onSecondaryPressed;

  const ImprovedFAB({
    Key? key,
    required this.isExpanded,
    required this.onToggle,
    required this.onSecondaryPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 300,
      height: 170,
      child: Stack(
        alignment: Alignment.center,
        children: [
          AnimatedPositioned(
            duration: Duration(milliseconds: 300),
            curve: Curves.easeOut,
            bottom: isExpanded ? 100 : 0,
            left: isExpanded ? 60 : 0,
            child: Transform.scale(
              scale: isExpanded ? 1 : 0,
              child: FloatingActionButton(
                shape: const CircleBorder(),
                mini: true,
                heroTag: "entry",
                backgroundColor: Color(0xFF007AFF),
                onPressed: () => onSecondaryPressed('entry'),
                child: Icon(Icons.arrow_downward, color: Colors.white),
              ),
            ),
          ),
          AnimatedPositioned(
            duration: Duration(milliseconds: 300),
            curve: Curves.easeOut,
            bottom: isExpanded ? 120 : 0,
            child: Transform.scale(
              scale: isExpanded ? 1 : 0,
              child: FloatingActionButton(
                shape: const CircleBorder(),
                mini: true,
                heroTag: "refresh",
                backgroundColor: Color(0xFF007AFF),
                onPressed: () => onSecondaryPressed('refresh'),
                child: Icon(Icons.refresh, color: Colors.white),
              ),
            ),
          ),
          AnimatedPositioned(
            duration: Duration(milliseconds: 300),
            curve: Curves.easeOut,
            bottom: isExpanded ? 100 : 0,
            right: isExpanded ? 60 : 0,
            child: Transform.scale(
              scale: isExpanded ? 1 : 0,
              child: FloatingActionButton(
                shape: const CircleBorder(),
                mini: true,
                heroTag: "exit",
                backgroundColor: Color(0xFF007AFF),
                onPressed: () => onSecondaryPressed('exit'),
                child: Icon(Icons.arrow_upward, color: Colors.white),
              ),
            ),
          ),
          FloatingActionButton(
            heroTag: "main",
            backgroundColor: Color(0xFF007AFF),
            onPressed: onToggle,
            shape: const CircleBorder(),
            child: AnimatedRotation(
              turns: isExpanded ? 0.125 : 0,
              duration: Duration(milliseconds: 300),
              child: Icon(Icons.add, size: 50, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}

class SupplyRequestHomeScreen extends StatefulWidget {
  const SupplyRequestHomeScreen({super.key});

  @override
  State<SupplyRequestHomeScreen> createState() => _SupplyRequestHomeScreenState();
}

class _SupplyRequestHomeScreenState extends State<SupplyRequestHomeScreen> {
  
  void _navigateToCreateRequest() {
    Navigator.pushNamed(context, '/demande_form');
  }

  void _navigateToMyRequests() {
    Navigator.pushNamed(context, '/suivi_demande');
  }

  Widget _buildAppBar() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
      decoration: const BoxDecoration(
        color: Color(0xFF007AFF),
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(20),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Espace vide pour centrer le titre
          SizedBox(width: 12.w),
          Text(
            "Demande\nd'approvisionnement",
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 18.sp,
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          Stack(
            children: [
              Container(
                padding: EdgeInsets.all(2.5.w),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.notifications_outlined,
                    size: 7.w, color: Color(0xFF007AFF)),
              ),
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: EdgeInsets.all(1.w),
                  decoration: const BoxDecoration(
                      color: Colors.red, shape: BoxShape.circle),
                  child: Text(
                    "3",
                    style: GoogleFonts.poppins(
                      fontSize: 9.sp,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String text,
    required VoidCallback onPressed,
    required double topMargin,
  }) {
    return Container(
      margin: EdgeInsets.only(top: topMargin),
      child: CustomElevatedButton(
        text: text,
        backgroundColor: const Color(0xFF007AFF),
        textColor: Colors.white,
        onPressed: onPressed,
        width: 85.w,
        height: 7.h,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: Column(
        children: [
          _buildAppBar(),
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Espace pour centrer verticalement les boutons
                  SizedBox(height: 10.h),
                  
                  _buildActionButton(
                    text: "Déclarer une demande",
                    onPressed: _navigateToCreateRequest,
                    topMargin: 0,
                  ),
                  
                  _buildActionButton(
                    text: "Suivre mes demandes",
                    onPressed: _navigateToMyRequests,
                    topMargin: 4.h,
                  ),
                  
                  // Espace pour équilibrer le centrage
                  SizedBox(height: 15.h),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: ImprovedBottomNavigation(
        currentIndex: 2, // Index pour "Demande"
        showFabIndicator: true,
        onTap: (index) {
          debugPrint("Navigation index: $index");
        },
      ),
      floatingActionButton: ImprovedFAB(
        isExpanded: false,
        onToggle: () {
          debugPrint("FAB toggled");
        },
        onSecondaryPressed: (String action) {
          debugPrint("FAB action: $action");
        },
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }
}