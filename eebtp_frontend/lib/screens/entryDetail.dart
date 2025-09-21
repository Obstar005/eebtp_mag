import 'dart:ui';
import 'package:eebtp_frontend/models/entry_item.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

import '../widgets/nav.dart'; // <-- ton NavContainer + ImprovedFAB + BottomNavigation

class EntryDetailPage extends StatelessWidget {
  final EntryItem entry;

  const EntryDetailPage({super.key, required this.entry});

  @override
  Widget build(BuildContext context) {
    return NavContainer(
    
      body: _EntryDetailContent(entry: entry), initialIndex: 1,
    );
  }
}

class _EntryDetailContent extends StatelessWidget {
  final EntryItem entry;

  const _EntryDetailContent({required this.entry});

  @override
  Widget build(BuildContext context) {
    final product = entry.product;
    final deliveryPerson = entry.deliveryPerson;

    return Column(
      children: [
        _buildHeader(context, "Détails entrée"),
        Expanded(
          child: Container(
            color: const Color(0xFFF8F9FA),
            child: SingleChildScrollView(
              padding: EdgeInsets.all(6.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildProductImage(),

                  SizedBox(height: 3.h),

                  // Nom, code
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(product.name,
                                style: GoogleFonts.montserrat(
                                  fontSize: 20.sp,
                                  fontWeight: FontWeight.w700,
                                )),
                            SizedBox(height: 0.5.h),
                            Text(product.code,
                                style: GoogleFonts.montserrat(
                                  fontSize: 14.sp,
                                  color: Colors.grey[600],
                                )),
                          ],
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 3.h),

                  // Infos principales
                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.category,
                          title: "Catégorie",
                          value: product.category,
                        ),
                      ),
                      SizedBox(width: 4.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.calendar_today,
                          title: "Ajouté le",
                          value: _formatDate(entry.date),
                        ),
                      ),
                      SizedBox(width: 4.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.add_shopping_cart,
                          title: "Qté ajoutée",
                          value: "${entry.quantity} t",
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 3.h),

                  // Livreur
                  _buildPersonCard(
                    title: "Livreur",
                    personName: deliveryPerson.name,
                    role: deliveryPerson.role,
                    phone: deliveryPerson.phone,
                    signature: deliveryPerson.signature,
                  ),

                  SizedBox(height: 3.h),

                  // Fournisseur
                  _buildSupplierCard(
                    supplier: entry.supplier,
                    phone: entry.supplierPhone,
                  ),

                  SizedBox(height: 10.h), // espace pour nav
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // -------- Widgets --------
  Widget _buildHeader(BuildContext context, String title) {
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
                child: _circleButton(Icons.arrow_back),
              ),
              Text(title,
                  style: GoogleFonts.montserrat(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.white)),
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/notifications'),
                child: _circleButton(Icons.notifications_outlined),
              ),
            ],
          ),
        ),
      ),
    );
  }

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
  }

  Widget _buildPersonCard({
    required String title,
    required String personName,
    required String role,
    required String phone,
    String? signature,
  }) {
    return Container(
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
                if (signature != null)
                  Text("Signature: $signature",
                      style: GoogleFonts.montserrat(
                          fontSize: 12.sp, color: Colors.grey[700])),
              ],
            ),
          ),
          Text(phone,
              style: GoogleFonts.montserrat(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.green)),
        ],
      ),
    );
  }

  Widget _buildSupplierCard({required String supplier, required String phone}) {
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
              offset: const Offset(0, 2))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Fournisseur",
              style: GoogleFonts.montserrat(
                  fontSize: 16.sp, fontWeight: FontWeight.w600)),
          SizedBox(height: 1.h),
          Text(supplier,
              style: GoogleFonts.montserrat(
                  fontSize: 14.sp, color: Colors.black)),
          Text("Téléphone: $phone",
              style: GoogleFonts.montserrat(
                  fontSize: 14.sp, color: Colors.grey[700])),
        ],
      ),
    );
  }

  Widget _circleButton(IconData icon) => Container(
        padding: EdgeInsets.all(2.w),
        decoration: const BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, size: 6.w, color: Color(0xFF007AFF)),
      );

  String _formatDate(DateTime date) =>
      "${date.day.toString().padLeft(2, '0')}/"
      "${date.month.toString().padLeft(2, '0')}/"
      "${date.year}";
}
