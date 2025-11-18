import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3), // ✅ Réduit à 3 secondes
    );

    _fadeAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.7, 1.0, curve: Curves.easeOut),
      ),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 1.0, curve: Curves.easeInOut),
      ),
    );

    _controller.forward();
    
    // ✅ Vérifier l'authentification après l'animation
    _checkAuthAndNavigate();
  }

  // ✅ NOUVELLE MÉTHODE : Logique de navigation
  Future<void> _checkAuthAndNavigate() async {
    // Attendre la fin de l'animation
    await Future.delayed(const Duration(seconds: 3));

    if (!mounted) return;

    final authProvider = context.read<AuthProvider>();

    // 1. Vérifier si c'est la première fois
    final isFirstTime = await authProvider.isFirstTime();
    
    if (isFirstTime) {
      // Première installation → GetStarted
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/getStarted');
      }
      return;
    }

    // 2. Vérifier si l'utilisateur est connecté et le token est valide
    if (authProvider.isAuthenticated && authProvider.token != null) {
      // Token valide → Vérifier si storeId existe
      if (authProvider.storeId != null) {
        // StoreId existe → HomePage
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/home');
        }
      } else {
        // Pas de storeId → StoreSelection
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/store_selection');
        }
      }
    } else {
      // Pas de token valide → Login
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/login');
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double logoSize = (20.h < 30.w) ? 20.h : 30.w;

    return Scaffold(
      backgroundColor: Colors.white,
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: Center(
          child: ScaleTransition(
            scale: _scaleAnimation,
            child: Container(
              constraints: BoxConstraints(
                maxWidth: 40.w,
                maxHeight: 40.h,
                minWidth: 12.w,
                minHeight: 12.h,
              ),
              child: SvgPicture.asset(
                'assets/logo_eebtp.svg',
                width: logoSize,
                height: logoSize,
                fit: BoxFit.contain,
                semanticsLabel: "Logo EEBTP",
              ),
            ),
          ),
        ),
      ),
    );
  }
}