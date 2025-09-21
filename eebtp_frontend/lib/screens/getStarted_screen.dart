import 'package:eebtp_frontend/widgets/button.dart';
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

          // Bannière blanche avec logo en haut à droite
          Positioned(
            top: -6
                .h, // Converti à partir de -50 pixels (environ 6% de la hauteur d'écran)
            right: -6.h, // Converti à partir de -50 pixels
            child: Container(
              height: 20.h,
              width: 60.w,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30.h), // Responsive courbure
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 6.0,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              padding: EdgeInsets.only(
                left: 8.w,
                right: 17.w,
                bottom: 1.5.h,
                top: 5.h,
              ),
              child: Align(
                alignment: Alignment.centerRight,
                child: Image.asset(
                  'assets/logo_eebtp.png',
                  fit: BoxFit.contain,
                  height: 11.h,
                  width: 11.h,
                ),
              ),
            ),
          ),

          // Container bas avec la parabole
          Positioned(
            bottom: 0,
            left: 0,
            child: SizedBox(
              height:
                  containerHeight + bumpHeight, // Ajoute la hauteur de la bosse
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
                          colors: [
                            Color(0xFF0649AD), // #0649AD,
                            Color(0xFF7197FB),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Contenu positionné sous la parabole
                  Positioned(
                    top: bumpHeight*0.3,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    child: Padding(
                      padding: EdgeInsets.only(
                        top: 5.h,
                        left: 14.w,
                        right: 6.w,
                        bottom: 5.h,
                      ),
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'BIENVENUE SUR\nEEBTP_MAG',
                              style: GoogleFonts.inter(
                                fontSize: 22.sp,
                                fontWeight: FontWeight.w900,
                                color: const Color.fromRGBO(255, 255, 255, 1),
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                            SizedBox(height: 1.h),
                            Text(
                              'Votre plateforme de suivi en temps réel des stocks.',
                              style: GoogleFonts.inter(
                                fontSize: 16.sp,
                                color: Colors.white70,
                              ),
                            ),
                            //Spacer(),
                            SizedBox(height: 8.h),
                            Center(
                              child: CustomElevatedButton(
                                text: 'Commencer ici',
                                backgroundColor: Colors.white,
                                textColor: const Color(0xFF007AFF),
                                onPressed: () =>
                                    Navigator.pushNamed(context, '/login'),
                                width: 80.w, // Largeur augmentée (80% de l'écran)
                              ),
                            ),
                          ],
                        ),
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
      size.width * 0.4, // contrôle x (milieu)
      -bump *
          0.8, // contrôle y (crête au-dessus - réduit pour un effet plus doux)
      size.width, // fin à droite
      bump,
    );

    // 3) on descend au bas du container
    path.lineTo(size.width, size.height);

    // 4) on revient à gauche
    path.lineTo(0, size.height);

    // 5) fermeture
    path.close();

    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
