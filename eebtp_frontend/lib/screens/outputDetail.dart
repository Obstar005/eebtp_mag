import 'dart:ui';
import 'package:eebtp_frontend/models/exit_item.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

import '../widgets/nav.dart'; // NavContainer + ImprovedFAB + ImprovedBottomNavigation

class ExitDetailPage extends StatelessWidget {
  final ExitItem exit;

  const ExitDetailPage({super.key, required this.exit});

  @override
  Widget build(BuildContext context) {
    return NavContainer(
     
      body: _ExitDetailContent(exit: exit), initialIndex: 1,
    );
  }
}

// ----------- Contenu de la page -----------
class _ExitDetailContent extends StatelessWidget {
  final ExitItem exit;

  const _ExitDetailContent({required this.exit});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header avec dégradé bleu
        _buildHeader(context),

        Expanded(
          child: Container(
            color: const Color(0xFFF8F9FA),
            child: SingleChildScrollView(
              padding: EdgeInsets.all(6.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image du produit
                  _buildProductImage(),

                  SizedBox(height: 4.h),

                  // Nom + code produit
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              exit.product.name,
                              style: GoogleFonts.montserrat(
                                fontSize: 20.sp,
                                fontWeight: FontWeight.w700,
                                color: Colors.black,
                              ),
                            ),
                            SizedBox(height: 1.h),
                            Text(
                              exit.product.code,
                              style: GoogleFonts.montserrat(
                                fontSize: 14.sp,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 3.h),

                  // Informations détaillées
                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.category,
                          title: "Catégorie",
                          value: exit.product.category,
                        ),
                      ),
                      SizedBox(width: 4.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.calendar_today,
                          title: "Sortie le",
                          value: _formatDate(exit.date),
                        ),
                      ),
                      SizedBox(width: 4.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.shopping_cart,
                          title: "Qté sortie",
                          value: "${exit.quantity} t",
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 4.h),

                  // Informations du receveur
                  _buildReceiverCard(),

                  SizedBox(height: 3.h),

                  // Motif
                  Text(
                    "Motif de sortie",
                    style: GoogleFonts.montserrat(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    exit.reason,
                    style: GoogleFonts.montserrat(
                      fontSize: 14.sp,
                      color: Colors.grey[600],
                      height: 1.5,
                    ),
                  ),

                  SizedBox(height: 10.h), // espace pour FAB
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // -------- Widgets utilitaires --------

  Widget _buildHeader(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF007AFF), Color(0xFF0056CC)],
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Bouton retour
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: _circleButton(Icons.arrow_back),
              ),
              Text(
                "Détails sortie",
                style: GoogleFonts.montserrat(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              // Notifications
              Stack(
                children: [
                  _circleButton(Icons.notifications_outlined),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: EdgeInsets.all(1.w),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        "3",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12.sp,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Montserrat',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _circleButton(IconData icon) => Container(
        padding: EdgeInsets.all(2.w),
        decoration: const BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, size: 6.w, color: const Color(0xFF007AFF)),
      );

  Widget _buildProductImage() => Container(
        height: 35.h,
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.grey[300],
          borderRadius: BorderRadius.circular(4.w),
        ),
        child: Center(
          child: Icon(Icons.inventory_2, size: 20.w, color: Colors.grey[600]),
        ),
      );

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Container(
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(2.w),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: Colors.grey[600], size: 5.w),
          SizedBox(height: 1.h),
          Text(
            title,
            style: GoogleFonts.montserrat(
              fontSize: 12.sp,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 0.5.h),
          Text(
            value,
            style: GoogleFonts.montserrat(
              fontSize: 14.sp,
              fontWeight: FontWeight.w600,
              color: Colors.black,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildReceiverCard() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(3.w),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(radius: 8.w, backgroundColor: Colors.grey[300]),
          SizedBox(width: 4.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  exit.receiver.name,
                  style: GoogleFonts.montserrat(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                ),
                SizedBox(height: 0.5.h),
                Text(
                  exit.receiver.role,
                  style: GoogleFonts.montserrat(
                    fontSize: 14.sp,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(2.w),
            ),
            child: Text(
              exit.receiver.phone,
              style: GoogleFonts.montserrat(
                fontSize: 12.sp,
                color: Colors.green,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return "${date.day.toString().padLeft(2, '0')}/"
        "${date.month.toString().padLeft(2, '0')}/"
        "${date.year}";
  }
}
