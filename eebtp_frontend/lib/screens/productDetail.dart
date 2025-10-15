import 'dart:ui';
import 'package:eebtp_frontend/models/stockitem.dart';
import 'package:eebtp_frontend/models/article.dart';
import 'package:eebtp_frontend/services/stockservice.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ProductDetailPage extends StatefulWidget {
  final StockItem stockItem;
  const ProductDetailPage({super.key, required this.stockItem});

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  ArticleStock? article;
  bool isLoading = true;
  bool isError = false;

  @override
    @override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (mounted) {
      Provider.of<AuthProvider>(context, listen: false).checkTokenExpiry(context);
    }
  });

    _loadArticle();
  }

  Future<void> _loadArticle() async {
    setState(() {
      isLoading = true;
      isError = false;
    });
    try {
      final token = context.read<AuthProvider>().token;
      final fetched = await StockService(token: token)
          .getArticleDetail(widget.stockItem.produit);
      if (!mounted) return;
      setState(() {
        article = fetched;
        isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        isError = true;
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Utilise des doubles pour gérer "40.00" etc.
    final quantiteActuelle = double.tryParse(widget.stockItem.quantite) ?? 0.0;
    final seuil = double.tryParse(widget.stockItem.quantiteSeuil) ?? 0.0;
    final isLowStock = (quantiteActuelle <= seuil) && seuil > 0;

    return NavContainer(
      initialIndex: 1,
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : isError
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.warning_amber_rounded,
                          color: Colors.red, size: 40),
                      SizedBox(height: 2.h),
                      Text(
                        'Erreur lors du chargement de l\'article.',
                        style: GoogleFonts.montserrat(
                          fontSize: 16,
                          color: Colors.red,
                        ),
                      ),
                      SizedBox(height: 2.h),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                        ),
                        onPressed: _loadArticle,
                        child: Text('Réessayer'),
                      ),
                    ],
                  ),
                )
              : _buildContent(context, quantiteActuelle, seuil, isLowStock),
    );
  }

  Widget _buildContent(
    BuildContext context,
    double quantiteActuelle,
    double seuil,
    bool isLowStock,
  ) {
    final String designation =
        article?.designation ?? widget.stockItem.produitName ?? "Produit #${widget.stockItem.produit}";
    final String type = article?.type ?? "-";
    final String unite = article?.unite ?? "-";
    final String code = "ID Article : ${article?.id ?? widget.stockItem.produit}";
    final String magasin =
        widget.stockItem.magasinName ?? "Magasin #${widget.stockItem.magasin}";

    return Column(
      children: [
        // Header
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
                        color: Color(0xFF0A84FF),
                      ),
                    ),
                  ),
                  Text(
                    "Détail stock",
                    style: GoogleFonts.montserrat(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  Container(width: 10.w),
                ],
              ),
            ),
          ),
        ),

        // Corps principal
        Expanded(
          child: Container(
            color: Colors.white,
            child: SingleChildScrollView(
              padding: EdgeInsets.all(5.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image/vignette
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

                  // Ligne nom + code + badge "Seuil"
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              designation,
                              style: GoogleFonts.montserrat(
                                fontSize: 22.sp,
                                fontWeight: FontWeight.w700,
                                color: Colors.black,
                                letterSpacing: 0.5,
                              ),
                            ),
                            SizedBox(height: 1.h),
                            // Code format PRD-xxx-xx + type + ID + magasin
                            Text(
                              "PRD-${widget.stockItem.produit.toString().padLeft(3, '0')}-${widget.stockItem.id.toString().padLeft(2, '0')}",
                              style: GoogleFonts.montserrat(
                                fontSize: 14.sp,
                                color: const Color.fromRGBO(147, 147, 147, 1),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            SizedBox(height: 1.h),
                            Text(
                              type,
                              style: GoogleFonts.montserrat(
                                fontSize: 14.sp,
                                color: Colors.grey[600],
                                height: 1.5,
                              ),
                            ),
                            SizedBox(height: 0.5.h),
                         /*    Text(
                              code,
                              style: GoogleFonts.montserrat(
                                fontSize: 15.sp,
                                color: Colors.grey[600],
                                fontWeight: FontWeight.w500,
                              ),
                            ), */
                            Text(
                              magasin,
                              style: GoogleFonts.montserrat(
                                fontSize: 13.sp,
                                color: Colors.blue[300],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 4.w,
                          vertical: 1.2.h,
                        ),
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
                              color: isLowStock
                                  ? Colors.red
                                  : const Color(0xFF34C759),
                              size: 16.sp,
                            ),
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
                          icon: Icons.label_outline,
                          title: "Type",
                          value: type,
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.shopping_cart_outlined,
                          title: "Unité",
                          value: unite,
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.calendar_today_outlined,
                          title: "Ajout",
                          value: _formatDate(widget.stockItem.dateAjout),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 2.5.h),

                  // Quantité et seuil
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
                            Icons.layers_outlined,
                            color: Colors.grey[700],
                            size: 6.w,
                          ),
                        ),
                        SizedBox(width: 3.w),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Quantité actuelle",
                              style: GoogleFonts.montserrat(
                                fontSize: 13.sp,
                                color:
                                    const Color.fromARGB(255, 53, 53, 53),
                              ),
                            ),
                            SizedBox(height: 0.3.h),
                            Text(
                              "${quantiteActuelle.toStringAsFixed(2)} $unite",
                              style: GoogleFonts.montserrat(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w700,
                                color: Colors.black,
                              ),
                            ),
                            Text(
                              "Seuil : ${seuil.toStringAsFixed(2)} $unite",
                              style: GoogleFonts.montserrat(
                                fontSize: 12.sp,
                                color: Colors.deepOrange,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 4.h),

                  if (isLowStock)
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          // signale seuil
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
                  SizedBox(height: 10.h),
                ],
              ),
            ),
          ),
        ),
      ],
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
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: Colors.grey[600], size: 6.w),
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

  String _formatDate(String? dateIso) {
    if (dateIso == null || dateIso.isEmpty) return "-";
    try {
      final date = DateTime.parse(dateIso);
      return "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}";
    } catch (e) {
      return dateIso.split('T').first;
    }
  }
}
