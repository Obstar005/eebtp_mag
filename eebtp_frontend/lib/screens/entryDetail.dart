import 'dart:ui';
import 'package:eebtp_frontend/models/entry_item.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

import '../widgets/nav.dart';

class EntryDetailPage extends StatelessWidget {
  final EntryItem entry;

  const EntryDetailPage({super.key, required this.entry});

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      body: _EntryDetailContent(entry: entry), 
      initialIndex: 1,
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
            color: Colors.white,
            child: SingleChildScrollView(
              padding: EdgeInsets.all(5.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildProductImage(),

                  SizedBox(height: 3.h),

                  // Nom produit en UPPERCASE
                  Text(
                    product.name.toUpperCase(),
                    style: GoogleFonts.montserrat(
                      fontSize: 22.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                      letterSpacing: 0.5,
                    ),
                  ),
                  SizedBox(height: 1.h),
                  Text(
                    product.code,
                    style: GoogleFonts.montserrat(
                      fontSize: 15.sp,
                      color: Colors.grey[500],
                      fontWeight: FontWeight.w500,
                    ),
                  ),

                  SizedBox(height: 3.h),

                  // Infos principales - layout horizontal avec icône + titre, valeur en bas
                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.grid_view,
                          title: "Catégorie",
                          value: product.category,
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.calendar_today_outlined,
                          title: "Ajouté le",
                          value: _formatDate(entry.date),
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.shopping_cart_outlined,
                          title: "Qté ajoutée",
                          value: "${entry.quantity} t",
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 3.h),

                  // Livreur
                  _buildPersonCard(
                    personName: deliveryPerson.name,
                    role: deliveryPerson.role,
                    phone: deliveryPerson.phone,
                    signature: deliveryPerson.signature,
                  ),

                  SizedBox(height: 3.h),

                  // Description
                  Text(
                    "Description",
                    style: GoogleFonts.montserrat(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(height: 1.5.h),
                  Text(
                    "Meet Whiskers, the embodiment of joy and cuddles! With his mesmerizing green eyes and soft fur, this playful 3-",
                    style: GoogleFonts.montserrat(
                      fontSize: 14.sp,
                      color: Colors.grey[600],
                      height: 1.5,
                    ),
                  ),

                  SizedBox(height: 3.h),

                  // Fournisseur
                  Text(
                    "Fournisseur",
                    style: GoogleFonts.montserrat(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(height: 1.5.h),
                  _buildSupplierCard(
                    supplier: entry.supplier,
                    phone: entry.supplierPhone,
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

  Widget _buildHeader(BuildContext context, String title) {
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
                title,
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

  Widget _buildPersonCard({
    required String personName,
    required String role,
    required String phone,
    String? signature,
  }) {
    return Container(
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
                  personName,
                  style: GoogleFonts.montserrat(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w700,
                    color: Colors.black,
                  ),
                ),
                SizedBox(height: 0.3.h),
                Text(
                  role,
                  style: GoogleFonts.montserrat(
                    fontSize: 14.sp,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          // Signature button
          if (signature != null)
            Container(
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
              decoration: BoxDecoration(
                color: const Color(0xFFE3F2FD),
                borderRadius: BorderRadius.circular(2.w),
              ),
              child: Text(
                "Signature",
                style: GoogleFonts.montserrat(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF0A84FF),
                ),
              ),
            ),
          SizedBox(width: 3.w),
          // Téléphone
          Container(
            padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F5E9),
              borderRadius: BorderRadius.circular(2.w),
            ),
            child: Text(
              phone,
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

  Widget _buildSupplierCard({required String supplier, required String phone}) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(3.w),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            supplier,
            style: GoogleFonts.montserrat(
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
              color: Colors.black,
            ),
          ),
          Text(
            phone,
            style: GoogleFonts.montserrat(
              fontSize: 14.sp,
              fontWeight: FontWeight.w600,
              color: Colors.black,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) =>
      "${date.day.toString().padLeft(2, '0')}/"
      "${date.month.toString().padLeft(2, '0')}/"
      "${date.year}";
}