import 'package:flutter/material.dart';

/// Container qui gère le FAB + la BottomNavigation
class NavContainer extends StatefulWidget {
  final int initialIndex;
  final Widget body;

  const NavContainer({
    Key? key,
    required this.initialIndex,
    required this.body,
  }) : super(key: key);

  @override
  State<NavContainer> createState() => _NavContainerState();
}

class _NavContainerState extends State<NavContainer>
    with TickerProviderStateMixin {
  late int _currentIndex;
  bool _isFabExpanded = false;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;

    _animationController =
        AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
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

  void _handleSecondaryFabPressed(String type) {
    _toggleFab();
    switch (type) {
      case 'entry':
        Navigator.pushNamed(context, '/entry');
        break;
      case 'exit':
        Navigator.pushNamed(context, '/exit');
        break;
      case 'refresh':
        Navigator.pushNamed(context, '/refresh');
        break;
    }
  }

  void _handleNavigation(int index) {
    setState(() => _currentIndex = index);
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
        Navigator.pushReplacementNamed(   context,
                      '/profile',);
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.body,
      floatingActionButton: ImprovedFAB(
        isExpanded: _isFabExpanded,
        onToggle: _toggleFab,
        onSecondaryPressed: _handleSecondaryFabPressed,
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: ImprovedBottomNavigation(
        currentIndex: _currentIndex,
        onTap: _handleNavigation,
        showFabIndicator: false,
      ),
    );
  }
}

/// ---------------- FAB Amélioré ----------------
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
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
            bottom: isExpanded ? 100 : 0,
            left: isExpanded ? 60 : 0,
            child: Transform.scale(
              scale: isExpanded ? 1 : 0,
              child: FloatingActionButton(
                shape: const CircleBorder(),
                mini: true,
                heroTag: "entry",
                backgroundColor: const Color(0xFF007AFF),
                onPressed: () => onSecondaryPressed('entry'),
                child: const Icon(Icons.arrow_downward, color: Colors.white),
              ),
            ),
          ),
          AnimatedPositioned(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
            bottom: isExpanded ? 120 : 0,
            child: Transform.scale(
              scale: isExpanded ? 1 : 0,
              child: FloatingActionButton(
                shape: const CircleBorder(),
                mini: true,
                heroTag: "refresh",
                backgroundColor: const Color(0xFF007AFF),
                onPressed: () => onSecondaryPressed('refresh'),
                child: const Icon(Icons.refresh, color: Colors.white),
              ),
            ),
          ),
          AnimatedPositioned(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
            bottom: isExpanded ? 100 : 0,
            right: isExpanded ? 60 : 0,
            child: Transform.scale(
              scale: isExpanded ? 1 : 0,
              child: FloatingActionButton(
                shape: const CircleBorder(),
                mini: true,
                heroTag: "exit",
                backgroundColor: const Color(0xFF007AFF),
                onPressed: () => onSecondaryPressed('exit'),
                child: const Icon(Icons.arrow_upward, color: Colors.white),
              ),
            ),
          ),
               Positioned(
            bottom: MediaQuery.of(context).size.height * 0.05, // légèrement au-dessus du creux
            child: SizedBox(
              width: MediaQuery.of(context).size.width * 0.16, // responsive
              height: MediaQuery.of(context).size.width * 0.16,
              child: FloatingActionButton(
                heroTag: "main",
                backgroundColor: const Color(0xFF007AFF),
                onPressed: onToggle,
                shape: const CircleBorder(),
                child: AnimatedRotation(
                  turns: isExpanded ? 0.125 : 0,
                  duration: const Duration(milliseconds: 300),
                  child: Icon(
                    Icons.add,
                    size: MediaQuery.of(context).size.width * 0.12, // icône responsive
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),

        ],
      ),
    );
  }
}

/// ---------------- Bottom Nav Amélioré ----------------
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
              _buildNavItem(Icons.view_in_ar_outlined , Icons.view_in_ar, "Stock", 1),
              const SizedBox(width: 60),
              _buildNavItem(Icons.description_outlined, Icons.description, "Demande", 2),
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
          const SizedBox(height: 2),
          Column(
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.white,
                  fontFamily: "Montserrat",
                ),
              ),
              if (isSelected)
                Container(
                  margin: const EdgeInsets.only(top: 2),
                  height: 2,
                  width: label.length * 8.0,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

/// ---------------- Painter de la Bottom Nav ----------------
class ImprovedBottomNavPainter extends CustomPainter {
  final bool showFabIndicator;

  ImprovedBottomNavPainter({this.showFabIndicator = false});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF007AFF)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    final double fabRadius = size.width * 0.11; // plus large
    final double notchRadius = fabRadius + 10;   // moins profond
    final double notchStartX = size.width / 2 - notchRadius;
    final double notchEndX = size.width / 2 + notchRadius;
    final double smoothFactor = notchRadius * 0.3;

    final path = Path();

    path.moveTo(0, 0); // bord gauche droit
    path.lineTo(notchStartX - smoothFactor, 0);
    path.cubicTo(
      notchStartX, 0,
      notchStartX, notchRadius * 0.2,
      size.width / 2 - fabRadius, notchRadius * 0.4,
    );
    path.arcToPoint(
      Offset(size.width / 2 + fabRadius, notchRadius * 0.4),
      radius: Radius.circular(notchRadius),
      clockwise: false,
    );
    path.cubicTo(
      notchEndX, notchRadius * 0.2,
      notchEndX, 0,
      notchEndX + smoothFactor, 0,
    );
    path.lineTo(size.width, 0); // bord droit droit
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    canvas.drawShadow(path, Colors.black26, 5, true);
    canvas.drawPath(path, paint);

    if (showFabIndicator) {
      final indicatorPaint = Paint()
        ..color = Colors.white
        ..style = PaintingStyle.fill;

      final indicatorY = notchRadius * 0.6;
      const indicatorWidth = 30.0;
      const indicatorHeight = 3.0;

      canvas.drawRRect(
        RRect.fromLTRBR(
          size.width / 2 - indicatorWidth / 2,
          indicatorY,
          size.width / 2 + indicatorWidth / 2,
          indicatorY + indicatorHeight,
          const Radius.circular(1.5),
        ),
        indicatorPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
