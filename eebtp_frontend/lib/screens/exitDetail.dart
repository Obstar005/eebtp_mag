import 'dart:ui';
import 'package:eebtp_frontend/models/exit_item.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

import '../widgets/nav.dart';

class ExitDetailPage extends StatelessWidget {
  final ExitItem exit;

  const ExitDetailPage({super.key, required this.exit});

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      body: _ExitDetailContent(exit: exit), 
      initialIndex: 1,
    );
  }
}

class _ExitDetailContent extends StatelessWidget {
  final ExitItem exit;

  const _ExitDetailContent({required this.exit});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _buildHeader(context),

        Expanded(
          child: Container(
            color: Colors.white,
            child: SingleChildScrollView(
              padding: EdgeInsets.all(5.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image du produit
                  _buildProductImage(),

                  SizedBox(height: 3.h),

                  // Nom du produit en UPPERCASE
                  Text(
                    exit.product.name.toUpperCase(),
                    style: GoogleFonts.montserrat(
                      fontSize: 22.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                      letterSpacing: 0.5,
                    ),
                  ),
                  SizedBox(height: 1.h),
                  Text(
                    exit.product.code,
                    style: GoogleFonts.montserrat(
                      fontSize: 15.sp,
                      color: Colors.grey[500],
                      fontWeight: FontWeight.w500,
                    ),
                  ),

                  SizedBox(height: 3.h),

                  // Informations détaillées
                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.grid_view,
                          title: "Catégorie",
                          value: exit.product.category,
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.calendar_today_outlined,
                          title: "Sortie le",
                          value: _formatDate(exit.date),
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.shopping_cart_outlined,
                          title: "Qté sortie",
                          value: "${exit.quantity} t",
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 3.h),

                  // Informations du receveur
                  _buildReceiverCard(),

                  SizedBox(height: 3.h),

                  // Motif du sortie
                  Text(
                    "Motif du sortie",
                    style: GoogleFonts.montserrat(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(height: 1.5.h),
                  Text(
                    exit.reason,
                    style: GoogleFonts.montserrat(
                      fontSize: 14.sp,
                      color: Colors.grey[600],
                      height: 1.5,
                    ),
                  ),

                  SizedBox(height: 10.h),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0A84FF),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: EdgeInsets.all(3.w),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.arrow_back_ios_new,
                    size: 5.w,
                    color: const Color(0xFF0A84FF),
                  ),
                ),
              ),
              Text(
                "Détails sortie",
                style: GoogleFonts.montserrat(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              Stack(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pushNamed(context, '/notifications'),
                    child: Container(
                      padding: EdgeInsets.all(3.w),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.notifications_outlined,
                        size: 6.w,
                        color: const Color(0xFF0A84FF),
                      ),
                    ),
                  ),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 1.5.w, vertical: 0.3.h),
                      constraints: BoxConstraints(minWidth: 5.w, minHeight: 2.h),
                      decoration: const BoxDecoration(
                        color: Color(0xFFFF3B30),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          "3",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10.sp,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Montserrat',
                          ),
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

  Widget _buildProductImage() => Container(
        height: 30.h,
        width: double.infinity,
        decoration: BoxDecoration(
          color: const Color(0xFFF5F5F5),
          borderRadius: BorderRadius.circular(4.w),
        ),
        child: Center(
          child: Icon(
            Icons.inventory_2,
            size: 20.w,
            color: Colors.grey[400],
          ),
        ),
      );

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Container(
      padding: EdgeInsets.all(3.5.w),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(3.w),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icône et titre en Row
          Row(
            children: [
              Icon(
                icon,
                color: Colors.grey[600],
                size: 5.w,
              ),
              SizedBox(width: 2.w),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.montserrat(
                    fontSize: 11.sp,
                    color: Colors.grey[600],
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 1.h),
          // Valeur en bas
          Text(
            value,
            style: GoogleFonts.montserrat(
              fontSize: 14.sp,
              fontWeight: FontWeight.w700,
              color: Colors.black,
            ),
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
        color: const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(3.w),
      ),
      child: Row(
        children: [
          // Avatar avec image
          Container(
            width: 16.w,
            height: 16.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.grey[300],
              image: const DecorationImage(
                image: NetworkImage('https://via.placeholder.com/150'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          SizedBox(width: 4.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  exit.receiver.name,
                  style: GoogleFonts.montserrat(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w700,
                    color: Colors.black,
                  ),
                ),
                SizedBox(height: 0.3.h),
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
          // Téléphone
          Container(
            padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F5E9),
              borderRadius: BorderRadius.circular(2.w),
            ),
            child: Text(
              exit.receiver.phone,
              style: GoogleFonts.montserrat(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF34C759),
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