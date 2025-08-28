import 'package:flutter/material.dart';
import 'dart:ui';

class BaseScaffold extends StatefulWidget {
  final Widget body;
  final int currentIndex; // onglet actif
  final Function(int)? onNavTap;

  const BaseScaffold({
    super.key,
    required this.body,
    required this.currentIndex,
    this.onNavTap,
  });

  @override
  _BaseScaffoldState createState() => _BaseScaffoldState();
}

class _BaseScaffoldState extends State<BaseScaffold>
    with TickerProviderStateMixin {
  bool _isFabExpanded = false;
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController =
        AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
    _animation = CurvedAnimation(parent: _animationController, curve: Curves.easeInOut);
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
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: widget.body,
      floatingActionButton: _buildFab(),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  // ------------------- FAB principal + secondaires fixes -------------------
  Widget _buildFab() {
    final fabItems = [
      {"icon": Icons.arrow_downward, "onPressed": () {
        Navigator.pushReplacementNamed(context, '/entry');
      }, "leftOffset": 60.0},
      {"icon": Icons.arrow_upward, "onPressed": () {
        Navigator.pushReplacementNamed(context, '/exit');
      }, "rightOffset": 60.0},
    ];

    return SizedBox(
      width: 300,
      height: 170,
      child: Stack(
        alignment: Alignment.center,
        children: [
          for (int i = 0; i < fabItems.length; i++)
            AnimatedPositioned(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOut,
              bottom: _isFabExpanded ? 100 : 0,
              left: fabItems[i]["leftOffset"] as double? ?? 0,
              right: fabItems[i]["rightOffset"] as double? ?? 0,
              child: Transform.scale(
                scale: _isFabExpanded ? 1 : 0,
                child: FloatingActionButton(
                  mini: true,
                  heroTag: "fab_$i",
                  backgroundColor: const Color(0xFF007AFF),
                  onPressed: fabItems[i]["onPressed"] as VoidCallback,
                  child: Icon(fabItems[i]["icon"] as IconData, color: Colors.white),
                ),
              ),
            ),
          FloatingActionButton(
            heroTag: "main",
            backgroundColor: const Color(0xFF007AFF),
            onPressed: _toggleFab,
            shape: const CircleBorder(),
            child: AnimatedRotation(
              turns: _isFabExpanded ? 0.125 : 0,
              duration: const Duration(milliseconds: 300),
              child: const Icon(Icons.add, size: 50, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  // ------------------- BottomNav avec creux -------------------
  Widget _buildBottomNav() {
    final icons = [
      {"icon": Icons.home_outlined, "label": "Accueil"},
      {"icon": Icons.inventory_2_outlined, "label": "Stock"},
      {"icon": null, "label": ""}, // creux du FAB
      {"icon": Icons.assignment_outlined, "label": "Demande"},
      {"icon": Icons.person_outline, "label": "Profil"},
    ];

    return SizedBox(
      height: 70,
      child: Stack(
        children: [
          CustomPaint(
            size: Size(MediaQuery.of(context).size.width, 70),
            painter: BottomNavPainter(),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(icons.length, (index) {
              final item = icons[index];
              if (item["icon"] == null) return SizedBox(width: 60);
              final isSelected = index == widget.currentIndex;
              return GestureDetector(
                onTap: () {
                  if (widget.onNavTap != null) widget.onNavTap!(index);
                },
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      item["icon"] as IconData,
                      size: 22,
                      color: isSelected ? Colors.white : Colors.white70,
                    ),
                    const SizedBox(height: 4),
                    if (isSelected)
                      Container(
                        height: 2,
                        width: 20,
                        color: Colors.white,
                      )
                  ],
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

}

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
