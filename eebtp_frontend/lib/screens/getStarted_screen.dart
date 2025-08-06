import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class GetStartedScreen extends StatelessWidget {
  const GetStartedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Hauteur de la bosse (20% de la hauteur du conteneur)
    final double bumpHeight = 11.h;
    // Hauteur totale du conteneur bleu
    final double containerHeight = 33.h;

    return Scaffold(
      body: Stack(
        children: [
          // Image de fond
          SizedBox(
            height: 100.h,
            width: 100.w,
            child: Image.asset('assets/background.jpg', fit: BoxFit.cover),
          ),

          // Logo en haut à droite
          Positioned(
            top: 0,
            right: 0,
            child: Container(
              height: 14.h,
              width: 14.h,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(bottomLeft: Radius.circular(100)),
              ),
              child: Padding(
                padding: EdgeInsets.all(2.h),
                child: Image.asset('assets/logo_eebtp.png', fit: BoxFit.contain),
              ),
            ),
          ),

          // Container bas avec la parabole
          Positioned(
            bottom: 0,
            left: 0,
            child: SizedBox(
              height: containerHeight + bumpHeight, // Ajoute la hauteur de la bosse
              width: 100.w,
              child: Stack(
                children: [
                  // Partie bleue avec la parabole
                  ClipPath(
                    clipper: TopParabolaClipper(bump: bumpHeight),
                    child: Container(
                      width: 100.w,
                      height: containerHeight + bumpHeight,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Color(0xFF044CB2), Color(0xFF87ACE7)],
                        ),
                      ),
                    ),
                  ),
                  
                  // Contenu positionné sous la parabole
                  Positioned(
                    top: bumpHeight,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    child: Padding(
                      padding: EdgeInsets.only(
                        top: 5.h,
                        left: 6.w,
                        right: 6.w,
                        bottom: 5.h,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'BIENVENUE SUR\nEEBTP_MAG',
                            style: GoogleFonts.inter(
                              fontSize: 22.sp,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                          SizedBox(height: 1.5.h),
                          Text(
                            'Votre plateforme de suivi en temps réel des stocks.',
                            style: GoogleFonts.inter(
                              fontSize: 14.sp,
                              color: Colors.white70,
                            ),
                          ),
                          const Spacer(),
                          Center(
                            child: ElevatedButton(
                              onPressed: () => Navigator.pushNamed(context, '/login'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                padding: EdgeInsets.symmetric(
                                    horizontal: 8.w, vertical: 1.8.h),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'Commencer ici',
                                    style: GoogleFonts.poppins(
                                      fontSize: 14.sp,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF007AFF),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  const Icon(Icons.arrow_forward_ios,
                                      size: 18, color: Color(0xFF007AFF)),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Clipper qui dessine le bump (parabole) au-dessus du container
class TopParabolaClipper extends CustomClipper<Path> {
  final double bump;
  TopParabolaClipper({required this.bump});

  @override
  Path getClip(Size size) {
    final path = Path();

    // 1) on commence à x=0, y=bump
    path.moveTo(0, bump);

    // 2) on dessine la parabole vers -bump (crête) avant de redescendre à y=bump
    path.quadraticBezierTo(
      size.width * 0.4,   // contrôle x (milieu)
      -bump* 0.8,       // contrôle y (crête au-dessus - réduit pour un effet plus doux)
      size.width ,        // fin à droite
      bump,
    );

    // 3) on descend au bas du container
    path.lineTo(size.width, size.height);

    // 4) on revient à gauche
    path.lineTo(0, size.height,);

    // 5) fermeture
    path.close();

    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}