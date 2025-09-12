import 'dart:ui';
import 'package:eebtp_frontend/models/return_item.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import 'profileScreen.dart';

class ReturnDetailPage extends StatefulWidget {
  final ReturnItem returnItem;

  const ReturnDetailPage({super.key, required this.returnItem});

  @override
  State<ReturnDetailPage> createState() => _ReturnDetailPageState();
}

class _ReturnDetailPageState extends State<ReturnDetailPage> {
  int _currentIndex = 1;
  bool _isFabExpanded = false;

  void _handleNavigation(int index) {
    setState(() => _currentIndex = index);
    switch (index) {
      case 0:
        Navigator.pushReplacementNamed(context, '/home');
        break;
      case 1:
        Navigator.pushReplacementNamed(context, '/stock');
        break;
      case 2:
        Navigator.pushReplacementNamed(context, '/demande');
        break;
      case 3:
        Navigator.pushReplacementNamed(context, '/profile');
        break;
    }
  }

  void _toggleFab() => setState(() => _isFabExpanded = !_isFabExpanded);

  void _handleSecondaryFabPressed(String type) {
    _toggleFab();
    Navigator.pushNamed(context, '/$type');
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.returnItem.product;
    final depositor = widget.returnItem.depositor;
    final isLowStock = product.currentQuantity <= product.threshold;

    return Scaffold(
      extendBody: true,
      body: Column(
        children: [
          // Header
          _buildHeader("Détails retour"),
          
          Expanded(
            child: Container(
              color: const Color(0xFFF8F9FA),
              child: SingleChildScrollView(
                padding: EdgeInsets.all(6.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image produit
                    _buildProductImage(),

                    SizedBox(height: 3.h),

                    // Nom, code + seuil
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(product.name,
                                style: GoogleFonts.montserrat(
                                    fontSize: 20.sp,
                                    fontWeight: FontWeight.w700)),
                            Text(product.code,
                                style: GoogleFonts.montserrat(
                                    fontSize: 14.sp, color: Colors.grey[600])),
                          ],
                        ),
                      ],
                    ),

                    SizedBox(height: 3.h),

                    // Info cards : catégorie, retour le, qté retour
                    Row(
                      children: [
                        Expanded(
                          child: _buildInfoCard(
                              icon: Icons.category,
                              title: "Catégorie",
                              value: product.category),
                        ),
                        SizedBox(width: 4.w),
                        Expanded(
                          child: _buildInfoCard(
                              icon: Icons.calendar_today,
                              title: "Retour le",
                              value: _formatDate(widget.returnItem.date)),
                        ),
                        SizedBox(width: 4.w),
                        Expanded(
                          child: _buildInfoCard(
                              icon: Icons.assignment_return,
                              title: "Qté retour",
                              value: "${widget.returnItem.quantity} t"),
                        ),
                      ],
                    ),

                    SizedBox(height: 3.h),

                    // Card déposant
                    _buildPersonCard(
                      title: "Déposant",
                      personName: depositor.name,
                      role: depositor.role,
                      phone: depositor.phone,
                    ),

                    SizedBox(height: 10.h),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: ImprovedFAB(
        isExpanded: _isFabExpanded,
        onToggle: _toggleFab,
        onSecondaryPressed: _handleSecondaryFabPressed,
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: ImprovedBottomNavigation(
        currentIndex: _currentIndex,
        onTap: _handleNavigation,
      ),
    );
  }

  Widget _buildHeader(String title) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF007AFF), Color(0xFF0056CC)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: _circleButton(Icons.arrow_back)),
              Text(title,
                  style: GoogleFonts.montserrat(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.white)),
              _circleButton(Icons.notifications_outlined),
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
        child: Icon(icon, color: const Color(0xFF007AFF), size: 6.w),
      );

  Widget _buildProductImage() => Container(
        height: 35.h,
        decoration: BoxDecoration(
          color: Colors.grey[300],
          borderRadius: BorderRadius.circular(4.w),
        ),
        child: Center(
          child: Icon(Icons.inventory_2, size: 20.w, color: Colors.grey[600]),
        ),
      );

     

  Widget _buildInfoCard(
          {required IconData icon,
          required String title,
          required String value}) =>
      Container(
        padding: EdgeInsets.all(3.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(2.w),
          boxShadow: [
            BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                blurRadius: 5,
                offset: const Offset(0, 2))
          ],
        ),
        child: Column(
          children: [
            Icon(icon, size: 5.w, color: Colors.grey[600]),
            SizedBox(height: 1.h),
            Text(title,
                style: GoogleFonts.montserrat(
                    fontSize: 12.sp, color: Colors.grey[600])),
            Text(value,
                style: GoogleFonts.montserrat(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black)),
          ],
        ),
      );

  Widget _buildPersonCard(
          {required String title,
          required String personName,
          required String role,
          required String phone}) =>
      Container(
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(3.w),
          boxShadow: [
            BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                blurRadius: 5,
                offset: const Offset(0, 2))
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
                    Text(personName,
                        style: GoogleFonts.montserrat(
                            fontSize: 16.sp, fontWeight: FontWeight.w600)),
                    Text(role,
                        style: GoogleFonts.montserrat(
                            fontSize: 14.sp, color: Colors.grey[600])),
                  ]),
            ),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(2.w),
              ),
              child: Text(
                phone,
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

  String _formatDate(DateTime date) {
    return "${date.day.toString().padLeft(2,'0')}/${date.month.toString().padLeft(2,'0')}/${date.year}";
  }
}
