import 'dart:ui';
import 'package:eebtp_frontend/models/entry_item.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import '../widgets/nav.dart';
import 'package:provider/provider.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';

class EntryDetailPage extends StatefulWidget {
  final Entree entry;

  const EntryDetailPage({super.key, required this.entry});

  @override
  State<EntryDetailPage> createState() => _EntryDetailPageState();
}

class _EntryDetailPageState extends State<EntryDetailPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        Provider.of<AuthProvider>(context, listen: false)
            .checkTokenExpiry(context);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      body: _EntryDetailContent(entry: widget.entry),
      initialIndex: 1,
    );
  }
}

class _EntryDetailContent extends StatelessWidget {
  final Entree entry;
  const _EntryDetailContent({required this.entry});

  @override
  Widget build(BuildContext context) {
    final isRetour = entry.type == "retour";
    final String pageTitle = isRetour ? "Détail retour" : "Détail entrée";
    final String cardLabel = isRetour ? "Déposant" : "Livreur";
    final String dateLabel = isRetour ? "Retour le" : "Entrée le";

    return Column(
      children: [
        _buildHeader(context, pageTitle),
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
                    // Désignation stock
                    Text(
                      (entry.stockItemName ?? "-").toUpperCase(),
                      style: GoogleFonts.montserrat(
                        fontSize: 22.sp,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                        letterSpacing: 0.5,
                      ),
                    ),
                    SizedBox(height: 1.h),
                    Text(
                      "StockID: ${entry.stockItem}",
                      style: GoogleFonts.montserrat(
                        fontSize: 15.sp,
                        color: Colors.grey[500],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 3.h),
                    // Informations principales
                    Row(
                      children: [
                        Expanded(
                          child: _buildInfoCard(
                            icon: Icons.grid_view,
                            title: "Type",
                            value: entry.stockItemType ?? "-",
                          ),
                        ),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: _buildInfoCard(
                              icon: Icons.calendar_today_outlined,
                              title: dateLabel,
                              value: _formatDate(entry.dateCreation)),
                        ),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: _buildInfoCard(
                              icon: Icons.shopping_cart_outlined,
                              title: "Qté entrée",
                              value: "${entry.quantiteM}"),
                        ),
                      ],
                    ),
                    SizedBox(height: 3.h),
                    // Card Livreur ou déposant
                    _buildPersonCard(
                      label: cardLabel,
                      name: entry.nomDeposant ?? "-",
                      role: entry.fonctionDeposant ?? "-",
                      phone: entry.telDeposant ?? "-",
                    ),
                    if (entry.societe?.isNotEmpty == true) ...[
                      SizedBox(height: 2.h),
                      _buildSupplierCard(entry.societe!, entry.telSociete ?? "-"),
                    ],
                    /*  -------
                    SizedBox(height: 3.h),
                    // Description
                    if (entry.remarques != null && entry.remarques!.isNotEmpty) ...[
                      Text(
                        "Remarques",
                        style: GoogleFonts.montserrat(
                          fontSize: 20.sp,
                          fontWeight: FontWeight.w700,
                          color: Colors.black,
                        ),
                      ),
                      SizedBox(height: 1.5.h),
                      Text(
                        entry.remarques!,
                        style: GoogleFonts.montserrat(
                          fontSize: 14.sp,
                          color: Colors.grey[600],
                          height: 1.5,
                        ),
                      ),
                    ],
                    ------- */
                    SizedBox(height: 10.h),
                  ],
                )),
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
              Container(width: 10.w),
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
          Row(
            children: [
              Icon(icon, color: Colors.grey[600], size: 5.w),
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
    required String label,
    required String name,
    required String role,
    required String phone,
  }) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(3.w),
      ),
      child: Row(
        children: [
          Container(
            width: 16.w,
            height: 16.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.grey[300],
              // option image: DecorationImage(...)
            ),
            child: Icon(Icons.person, size: 10.w, color: Colors.white),
          ),
          SizedBox(width: 4.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
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

  Widget _buildSupplierCard(String supplier, String phone) {
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

  String _formatDate(String? dateIso) {
    if (dateIso == null || dateIso.isEmpty) return "-";
    try {
      final date = DateTime.parse(dateIso);
      return "${date.day.toString().padLeft(2, '0')}/"
          "${date.month.toString().padLeft(2, '0')}/"
          "${date.year}";
    } catch (e) {
      return dateIso.split('T').first;
    }
  }
}
