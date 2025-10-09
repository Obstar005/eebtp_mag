import 'package:eebtp_frontend/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class GetStartedScreen extends StatelessWidget {
  const GetStartedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final double bumpHeight = 11.h;
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

          // Bannière blanche arrondie en haut à droite avec logo centré
          Positioned(
            top: -6.h,
            right: -6.h,
            child: Container(
              height: 20.h,
              width: 60.w,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30.h),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 6.0,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              padding: EdgeInsets.only(
                left: 8.w,
                right: 6.w,
                bottom: 1.5.h,
                top: 5.h,
              ),
              child: Center(
                child: Image.asset(
                  'assets/logo_eebtp.png',
                  fit: BoxFit.contain,
                  height: 11.h,
                  width: 11.h,
                ),
              ),
            ),
          ),

          // Conteneur bas bleu avec parabole
          Positioned(
            bottom: 0,
            left: 0,
            child: SizedBox(
              height: containerHeight + bumpHeight,
              width: 100.w,
              child: Stack(
                children: [
                  ClipPath(
                    clipper: TopParabolaClipper(bump: bumpHeight),
                    child: Container(
                      width: 100.w,
                      height: containerHeight + bumpHeight,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Color(0xFF0649AD), Color(0xFF7197FB)],
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: bumpHeight * 0.3,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    child: Padding(
                      padding: EdgeInsets.only(
                        top: 3.h,
                        left: 10.w,
                        right: 6.w,
                        bottom: 3.h,
                      ),
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          final titleFont = constraints.maxHeight < 220 ? 14.sp : 22.sp;
                          final descFont  = constraints.maxHeight < 220 ? 10.sp : 16.sp;
                          final space1 = constraints.maxHeight < 220 ? 0.2.h : 1.h;
                          final space2 = constraints.maxHeight < 220 ? 3.h : 8.h;
                          
                          return Column(
                            mainAxisSize: MainAxisSize.max,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'BIENVENUE SUR\nEEBTP_MAG',
                                style: GoogleFonts.inter(
                                  fontSize: titleFont,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  fontStyle: FontStyle.italic,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              SizedBox(height: space1),
                              Text(
                                'Votre plateforme de suivi en temps réel des stocks.',
                                style: GoogleFonts.inter(
                                  fontSize: descFont,
                                  color: Colors.white70,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Spacer(),
                              Spacer(),
                              Center(
                                child: ConstrainedBox(
                                  constraints: BoxConstraints(
                                    minWidth: 40.0,
                                    maxWidth: constraints.maxWidth,
                                  ),
                                  child: CustomElevatedButton(
                                    text: 'Commencer ici',
                                    backgroundColor: Colors.white,
                                    textColor: const Color(0xFF007AFF),
                                    onPressed: () => Navigator.pushNamed(context, '/login'),
                                    width: constraints.maxWidth > 400 ? 80.w : constraints.maxWidth,
                                  ),
                                ),
                              ),
                              SizedBox(height: space2),
                            ],
                          );
                        },
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

class TopParabolaClipper extends CustomClipper<Path> {
  final double bump;
  TopParabolaClipper({required this.bump});

  @override
  Path getClip(Size size) {
    final path = Path();

    path.moveTo(0, bump);
    path.quadraticBezierTo(
      size.width * 0.4,
      -bump * 0.8,
      size.width,
      bump,
    );
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
