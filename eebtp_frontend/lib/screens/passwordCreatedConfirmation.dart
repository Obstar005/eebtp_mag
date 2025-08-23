import 'package:eebtp_frontend/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'dart:ui';
import 'dart:math' as math;

class PasswordCreatedModal extends StatefulWidget {
  @override
  _PasswordCreatedModalState createState() => _PasswordCreatedModalState();
}

class _PasswordCreatedModalState extends State<PasswordCreatedModal>
    with TickerProviderStateMixin {
  late AnimationController _slideController;
  late AnimationController _bounceController;
  late AnimationController _decorationController;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _bounceAnimation;
  late Animation<double> _decorationAnimation;

  @override
  void initState() {
    super.initState();

    _slideController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );

    _bounceController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _decorationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, 1.0),
      end: const Offset(0.0, 0.0),
    ).animate(CurvedAnimation(parent: _slideController, curve: Curves.easeOut));

    _bounceAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _bounceController, curve: Curves.elasticOut),
    );

    _decorationAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _decorationController, curve: Curves.easeInOut),
    );

    // Lancement des animations
    _slideController.forward();
    Future.delayed(const Duration(milliseconds: 200), () {
      _bounceController.forward();
    });
    Future.delayed(const Duration(milliseconds: 400), () {
      _decorationController.forward();
    });
  }

  @override
  void dispose() {
    _slideController.dispose();
    _bounceController.dispose();
    _decorationController.dispose();
    super.dispose();
  }

  void _closeModal() {
    _slideController.reverse().then((_) {
      Navigator.of(context).pop();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          // Fond avec effet de flou
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(color: Colors.black.withOpacity(0.4)),
            ),
          ),

          // Modal qui slide du bas
          SlideTransition(
            position: _slideAnimation,
            child: Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                width: double.infinity,
                height: 65.h,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(6.w),
                    topRight: Radius.circular(6.w),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 20,
                      offset: const Offset(0, -5),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Handle pour fermer le modal
                    Container(
                      width: 10.w,
                      height: 1.h,
                      margin: EdgeInsets.only(top: 2.h),
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(1.w),
                      ),
                    ),

                    // Contenu principal
                    Expanded(
                      child: Padding(
                        padding: EdgeInsets.symmetric(
                          horizontal: 6.w,
                          vertical: 4.h,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Animation des éléments décoratifs et icône principale
                            AnimatedBuilder(
                              animation: _decorationAnimation,
                              builder: (context, child) {
                                return Stack(
                                  alignment: Alignment.center,
                                  children: [
                                    // Éléments décoratifs animés
                                    ...List.generate(8, (index) {
                                      final angle =
                                          (index * 45.0) * (math.pi / 180);
                                      final radius =
                                          15.w * _decorationAnimation.value;
                                      final x = radius * math.cos(angle);
                                      final y = radius * math.sin(angle);

                                      return Transform.translate(
                                        offset: Offset(x, y),
                                        child: Transform.scale(
                                          scale: _decorationAnimation.value,
                                          child: _getDecorationElement(index),
                                        ),
                                      );
                                    }),

                                    // Cercle de fond avec blur
                                    ScaleTransition(
                                      scale: _bounceAnimation,
                                      child: Container(
                                        width: 25.w,
                                        height: 25.w,
                                        decoration: BoxDecoration(
                                          color: const Color(
                                            0xFF007AFF,
                                          ).withOpacity(0.1),
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                    ),

                                    // Icône principale avec animation de rebond
                                    ScaleTransition(
                                      scale: _bounceAnimation,
                                      child: Container(
                                        width: 20.w,
                                        height: 20.w,
                                        decoration: BoxDecoration(
                                          border: Border.all(
                                            color: const Color(0xFF007AFF),
                                            width: 3,
                                          ),
                                          shape: BoxShape.circle,
                                          color: Colors.white,
                                          boxShadow: [
                                            BoxShadow(
                                              color: const Color(
                                                0xFF007AFF,
                                              ).withOpacity(0.2),
                                              blurRadius: 15,
                                              offset: const Offset(0, 8),
                                            ),
                                          ],
                                        ),
                                        child: Icon(
                                          Icons.check,
                                          color: const Color(0xFF007AFF),
                                          size: 8.w,
                                        ),
                                      ),
                                    ),
                                  ],
                                );
                              },
                            ),

                            SizedBox(height: 6.h),

                            // Titre
                            Text(
                              'Mot de passe modifié',
                              style: TextStyle(
                                fontSize: 22.sp,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1D1D1F),
                              ),
                            ),

                            SizedBox(height: 3.h),

                            // Description
                            Text(
                              'Le mot de passe a été modifié avec succès, vous\n'
                              'pouvez vous connecter à nouveau avec le nouveau\n'
                              'mot de passe.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 14.sp,
                                color: const Color(0xFF8E8E93),
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Bouton en bas
                    SizedBox(height: 6.h),
                    Container(
                      width: double.infinity,
                      height: 6.5.h,
                      margin: EdgeInsets.symmetric(horizontal: 6.w),
                      child: CustomElevatedButton(
                        text: 'Connectez-vous',
                        backgroundColor: const Color(0xFF007AFF),
                        textColor: Colors.white,
                        onPressed: _closeModal,
                        width: 80.w, // ou tu ajustes si nécessaire
                        height: 7.h,
                      ),
                    ),
                    SizedBox(height: 4.h),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _getDecorationElement(int index) {
    switch (index % 6) {
      case 0:
        return Container(
          width: 2.5.w,
          height: 2.5.w,
          decoration: const BoxDecoration(
            color: Color(0xFF007AFF),
            shape: BoxShape.circle,
          ),
        );
      case 1:
        return Container(
          width: 2.w,
          height: 2.w,
          decoration: BoxDecoration(
            color: const Color(0xFF007AFF),
            borderRadius: BorderRadius.circular(0.5.w),
          ),
        );
      case 2:
        return Container(
          width: 5.w,
          height: 0.8.w,
          decoration: BoxDecoration(
            color: const Color(0xFF007AFF),
            borderRadius: BorderRadius.circular(0.4.w),
          ),
        );
      case 3:
        return Icon(Icons.star, size: 3.w, color: const Color(0xFF007AFF));
      case 4:
        return Transform.rotate(
          angle: 45 * (math.pi / 180),
          child: Container(
            width: 2.5.w,
            height: 2.5.w,
            decoration: BoxDecoration(
              color: const Color(0xFF007AFF),
              borderRadius: BorderRadius.circular(0.5.w),
            ),
          ),
        );
      default:
        return CustomPaint(
          size: Size(4.w, 2.w),
          painter: WavePainter(color: const Color(0xFF007AFF)),
        );
    }
  }
}

class WavePainter extends CustomPainter {
  final Color color;

  WavePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final path = Path();
    path.moveTo(0, size.height / 2);
    path.quadraticBezierTo(size.width / 4, 0, size.width / 2, size.height / 2);
    path.quadraticBezierTo(
      3 * size.width / 4,
      size.height,
      size.width,
      size.height / 2,
    );

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
