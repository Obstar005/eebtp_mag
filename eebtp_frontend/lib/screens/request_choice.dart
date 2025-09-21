import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

import '../widgets/button.dart';

// Classes de la navbar
import '../widgets/nav.dart';
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
    return NavContainer(
     
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
 initialIndex: 2,
    );
  }
}