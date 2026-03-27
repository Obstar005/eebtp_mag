import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:eebtp_frontend/services/notification_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:sizer/sizer.dart';
import '../widgets/button.dart';
import '../widgets/nav.dart';

class SupplyRequestHomeScreen extends StatefulWidget {
  const SupplyRequestHomeScreen({super.key});

  @override
  State<SupplyRequestHomeScreen> createState() => _SupplyRequestHomeScreenState();
}

class _SupplyRequestHomeScreenState extends State<SupplyRequestHomeScreen> {
  @override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (mounted) {
      Provider.of<AuthProvider>(context, listen: false).checkTokenExpiry(context);
   _fetchUnreadCount();
    }
  });
  
}
int _unreadNotifCount = 0;

Future<void> _fetchUnreadCount() async {
  final token = Provider.of<AuthProvider>(context, listen: false).token;
  if (token == null) return;
  try {
    final data = await NotificationService(token: token).getNotificationsByUser();
    if (!mounted) return;
    setState(() {
      _unreadNotifCount = data.where((n) => !n.isRead).length;
    });
  } catch (e) {
    debugPrint('Erreur fetch unread count: $e');
  }
}
  void _navigateToCreateRequest() {
    Navigator.pushNamed(context, '/demande_form');
  }

  void _navigateToMyRequests() {
    Navigator.pushNamed(context, '/suivi_demande');
  }

  Widget _buildAppBar() {
    return SafeArea(
      bottom: false,
      child: Container(
        padding: EdgeInsets.only(
          left: 5.w,
          right: 5.w,
          top: 2.h, // la SafeArea gère la barre d'état, on continue le padding
          bottom: 2.h,
        ),
        decoration: BoxDecoration(
          color: const Color(0xFF007AFF),
        
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.07),
              blurRadius: 16,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(width: 2), // espace pour alignement du titre
            Expanded(
              child: Text(
                "Demande\nd'approvisionnement",
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  fontSize: 17.sp,
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  height: 1.25,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
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
              if (_unreadNotifCount > 0)
  Positioned(
    right: 0,
    top: 0,
    child: Container(
      padding: EdgeInsets.all(5),
      decoration: const BoxDecoration(
        color: Colors.red,
        shape: BoxShape.circle,
      ),
      child: Text(
        '$_unreadNotifCount',
        style: TextStyle(
          color: Colors.white,
          fontSize: 14.sp,
          fontWeight: FontWeight.bold,
        ),
      ),
    ),
  ),],
            ),
          ],
        ),
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
    return NavContainer(
      initialIndex: 2,
      body: Column(
        children: [
          _buildAppBar(),
          Expanded(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isSmallHeight = constraints.maxHeight < 500;
                return Center(
                  child: SingleChildScrollView(
                    // assure acces même sur écran très petit
                    padding: EdgeInsets.zero,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(height: isSmallHeight ? 6.h : 10.h),
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
                        SizedBox(height: isSmallHeight ? 4.h : 15.h),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
