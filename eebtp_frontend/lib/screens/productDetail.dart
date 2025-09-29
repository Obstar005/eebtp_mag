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
          // Header avec couleur bleu vif
          Container(
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
                      "Détails produit",
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
          ),
          
          // Contenu principal
          Expanded(
            child: Container(
              color: Colors.white,
              child: SingleChildScrollView(
                padding: EdgeInsets.all(5.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image du produit
                    Container(
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
                    ),
                    
                    SizedBox(height: 3.h),
                    
                    // Informations principales du produit
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.product.name.toUpperCase(),
                                style: GoogleFonts.montserrat(
                                  fontSize: 22.sp,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.black,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              SizedBox(height: 1.h),
                              Text(
                                widget.product.code,
                                style: GoogleFonts.montserrat(
                                  fontSize: 15.sp,
                                  color: Colors.grey[500],
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.2.h),
                          decoration: BoxDecoration(
                            color: isLowStock 
                              ? const Color(0xFFFFE5E5) 
                              : const Color(0xFFE8F5E9),
                            borderRadius: BorderRadius.circular(8.w),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                "Seuil",
                                style: GoogleFonts.montserrat(
                                  fontSize: 13.sp,
                                  fontWeight: FontWeight.w600,
                                  color: isLowStock 
                                    ? Colors.red 
                                    : const Color(0xFF34C759),
                                ),
                              ),
                              SizedBox(width: 1.w),
                              Icon(
                               isLowStock ? Icons.south_east : Icons.north_east,
                                color:isLowStock ? Colors.red : const Color(0xFF34C759),
                                size: 16.sp,
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
                            icon: Icons.grid_view,
                            title: "Catégorie",
                            value: widget.product.category,
                          ),
                        ),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: _buildInfoCard(
                            icon: Icons.calendar_today_outlined,
                            title: "Ajouté le",
                            value: _formatDate(widget.product.addedDate),
                          ),
                        ),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: _buildInfoCard(
                            icon: Icons.shopping_cart_outlined,
                            title: "Qté actuelle",
                            value: "${widget.product.currentQuantity} t",
                          ),
                        ),
                      ],
                    ),
                    
                    SizedBox(height: 2.5.h),
                    
                    // Quantité seuil
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(4.w),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF5F5F5),
                        borderRadius: BorderRadius.circular(3.w),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: EdgeInsets.all(2.5.w),
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.warning_amber_outlined,
                              color: Colors.grey[700],
                              size: 6.w,
                            ),
                          ),
                          SizedBox(width: 3.w),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Qté seuil",
                                style: GoogleFonts.montserrat(
                                  fontSize: 13.sp,
                                  color: const Color.fromARGB(255, 53, 53, 53),
                                ),
                              ),
                              SizedBox(height: 0.3.h),
                              Text(
                                "${widget.product.threshold} t",
                                style: GoogleFonts.montserrat(
                                  fontSize: 16.sp,
                                  fontWeight: FontWeight.w700,
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
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                      ),
                    ),
                    SizedBox(height: 1.5.h),
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
                     
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFFF3B30),
                            padding: EdgeInsets.symmetric(vertical: 2.h),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6.w),
                            ),
                            elevation: 0,
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
      ), 
      initialIndex: 1,
    );
  }

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
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Ligne icône + titre
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: Colors.grey[600],
              size: 6.w,
            ),
            SizedBox(width: 2.w),
            Flexible(
              child: Text(
                title,
                style: GoogleFonts.montserrat(
                  fontSize: 13.sp,
                  color: const Color.fromARGB(255, 47, 47, 47),
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        
        SizedBox(height: 1.h),
        
        // Valeur
        Flexible(
          child: Text(
            value,
            style: GoogleFonts.montserrat(
              fontSize: 14.sp,
              fontWeight: FontWeight.w700,
              color: Colors.black,
            ),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.left,
          ),
        ),
      ],
    ),
  );
}
  String _formatDate(DateTime date) {
    return "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}";
  }
}