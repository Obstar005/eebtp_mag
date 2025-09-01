// Composant NavBar amélioré à ajouter dans vos pages

import 'package:flutter/material.dart';

class ImprovedBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final bool showFabIndicator; // Pour montrer l'indicateur sous le FAB

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
              SizedBox(width: 60), // Espace pour le FAB
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
                    width: label.length * 8.0, // Largeur adaptée au texte
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

// Painter amélioré pour la NavBar
class ImprovedBottomNavPainter extends CustomPainter {
  final bool showFabIndicator;

  ImprovedBottomNavPainter({this.showFabIndicator = false});

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

    // Facteur de douceur
    final double smoothFactor = notchRadius * 0.4;

    final path = Path();

    // Coin arrondi gauche
    path.moveTo(0, 20);
    path.quadraticBezierTo(0, 0, 20, 0);

    // Plateau gauche jusqu'avant le creux
    path.lineTo(notchStartX - smoothFactor, 0);

    // Transition douce vers le creux
    path.cubicTo(
      notchStartX, 0,
      notchStartX, notchRadius * 0.3,
      size.width / 2 - fabRadius, notchRadius * 0.6,
    );

    // Arc central du creux
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

    // Plateau droit
    path.lineTo(size.width - 20, 0);
    path.quadraticBezierTo(size.width, 0, size.width, 20);

    // Bas de la barre
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    // Ombre
    canvas.drawShadow(path, Colors.black26, 5, true);
    canvas.drawPath(path, paint);

    // Indicateur sous le FAB si activé
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

// FAB amélioré avec navigation
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
          // Bouton Entrée
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
                onPressed: () {
                  onToggle(); // Ferme le FAB
                  onSecondaryPressed('entry'); // Navigation
                },
                child: Icon(Icons.arrow_downward, color: Colors.white),
              ),
            ),
          ),
          
          // Bouton Actualiser
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
                onPressed: () {
                  onToggle();
                  onSecondaryPressed('refresh');
                },
                child: Icon(Icons.refresh, color: Colors.white),
              ),
            ),
          ),
          
          // Bouton Sortie
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
                onPressed: () {
                  onToggle();
                  onSecondaryPressed('exit');
                },
                child: Icon(Icons.arrow_upward, color: Colors.white),
              ),
            ),
          ),

          // FAB principal
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