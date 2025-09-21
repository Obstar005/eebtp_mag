import 'dart:ui';
import 'package:eebtp_frontend/models/product.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class ProductDetailPage extends StatefulWidget {
  final Product product;

  const ProductDetailPage({super.key, required this.product});

  @override
  _ProductDetailPageState createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  
  @override
  Widget build(BuildContext context) {
    bool isLowStock = widget.product.currentQuantity <= widget.product.threshold;

    return NavContainer(
     
      body: Column(
        children: [
          // Header avec dégradé bleu
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF007AFF), Color(0xFF0056CC)],
              ),
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
                        padding: EdgeInsets.all(2.w),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.arrow_back,
                          size: 6.w,
                          color: const Color(0xFF007AFF),
                        ),
                      ),
                    ),
                    Text(
                      "Détails produit",
                      style: GoogleFonts.montserrat(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    Stack(
                      children: [
                        GestureDetector(
                          onTap: () => Navigator.pushNamed(context, '/notifications'),
                          child: Container(
                            padding: EdgeInsets.all(2.w),
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.notifications_outlined,
                              size: 6.w,
                              color: const Color(0xFF007AFF),
                            ),
                          ),
                        ),
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
          ),
          
          // Contenu principal
          Expanded(
            child: Container(
              color: const Color(0xFFF8F9FA),
              child: SingleChildScrollView(
                padding: EdgeInsets.all(6.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image du produit
                    Container(
                      height: 35.h,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(4.w),
                      ),
                      child: Center(
                        child: Icon(
                          Icons.inventory_2,
                          size: 20.w,
                          color: Colors.grey[600],
                        ),
                      ),
                    ),
                    
                    SizedBox(height: 4.h),
                    
                    // Informations principales du produit
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.product.name,
                                style: GoogleFonts.montserrat(
                                  fontSize: 20.sp,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.black,
                                ),
                              ),
                              SizedBox(height: 1.h),
                              Text(
                                widget.product.code,
                                style: GoogleFonts.montserrat(
                                  fontSize: 14.sp,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
                          decoration: BoxDecoration(
                            color: isLowStock ? Colors.red[100] : Colors.green[100],
                            borderRadius: BorderRadius.circular(5.w),
                            border: Border.all(
                              color: isLowStock ? Colors.red : Colors.green,
                              width: 1,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                "Seuil",
                                style: GoogleFonts.montserrat(
                                  fontSize: 12.sp,
                                  fontWeight: FontWeight.w500,
                                  color: isLowStock ? Colors.red : Colors.green,
                                ),
                              ),
                              SizedBox(width: 1.w),
                              Icon(
                                isLowStock ? Icons.keyboard_arrow_down : Icons.keyboard_arrow_up,
                                color: isLowStock ? Colors.red : Colors.green,
                                size: 4.w,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    
                    SizedBox(height: 3.h),
                    
                    // Informations détaillées en grid
                    Row(
                      children: [
                        Expanded(
                          child: _buildInfoCard(
                            icon: Icons.category,
                            title: "Catégorie",
                            value: widget.product.category,
                          ),
                        ),
                        SizedBox(width: 4.w),
                        Expanded(
                          child: _buildInfoCard(
                            icon: Icons.calendar_today,
                            title: "Ajouté le",
                            value: _formatDate(widget.product.addedDate),
                          ),
                        ),
                        SizedBox(width: 4.w),
                        Expanded(
                          child: _buildInfoCard(
                            icon: Icons.shopping_cart,
                            title: "Qté actuelle",
                            value: "${widget.product.currentQuantity} t",
                          ),
                        ),
                      ],
                    ),
                    
                    SizedBox(height: 3.h),
                    
                    // Quantité seuil
                    Container(
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
                          Container(
                            padding: EdgeInsets.all(2.w),
                            decoration: BoxDecoration(
                              color: Colors.orange[50],
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.warning_amber,
                              color: Colors.orange,
                              size: 5.w,
                            ),
                          ),
                          SizedBox(width: 3.w),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Qté seuil",
                                style: GoogleFonts.montserrat(
                                  fontSize: 14.sp,
                                  color: Colors.grey[600],
                                ),
                              ),
                              Text(
                                "${widget.product.threshold} t",
                                style: GoogleFonts.montserrat(
                                  fontSize: 16.sp,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    
                    SizedBox(height: 3.h),
                    
                    // Description
                    Text(
                      "Description",
                      style: GoogleFonts.montserrat(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                      ),
                    ),
                    SizedBox(height: 2.h),
                    Text(
                      widget.product.description,
                      style: GoogleFonts.montserrat(
                        fontSize: 14.sp,
                        color: Colors.grey[600],
                        height: 1.5,
                      ),
                    ),
                    
                    SizedBox(height: 4.h),
                    
                    // Bouton signaler le seuil (affiché seulement si stock faible)
                    if (isLowStock)
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            // Action pour signaler le seuil
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text("Seuil signalé avec succès"),
                                backgroundColor: Colors.green,
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            padding: EdgeInsets.symmetric(vertical: 2.h),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(3.w),
                            ),
                          ),
                          child: Text(
                            "Signaler le seuil",
                            style: GoogleFonts.montserrat(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    
                    SizedBox(height: 10.h), // Espace pour le bottom nav
                  ],
                ),
              ),
            ),
          ),
        ],
      ), initialIndex: 1,
      

    );
  }

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
          Icon(
            icon,
            color: Colors.grey[600],
            size: 5.w,
          ),
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

  String _formatDate(DateTime date) {
    return "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}";
  }
}


