import 'dart:ui';
import 'package:eebtp_frontend/models/entry_item.dart';
import 'package:eebtp_frontend/models/article.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import '../widgets/nav.dart';
import 'package:provider/provider.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:eebtp_frontend/services/stockservice.dart';
import 'package:eebtp_frontend/services/projetservice.dart';
class EntryDetailPage extends StatefulWidget {
  final Entree entry;
  const EntryDetailPage({super.key, required this.entry});

  @override
  State<EntryDetailPage> createState() => _EntryDetailPageState();
}

class _EntryDetailPageState extends State<EntryDetailPage> {
  ArticleStock? article;
  String magasinName = "-";
  bool loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (mounted) {
        Provider.of<AuthProvider>(context, listen: false).checkTokenExpiry(context);
        await _fetchAllData();
      }
    });
  }

  Future<void> _fetchAllData() async {
    final token = context.read<AuthProvider>().token;
    final stockService = StockService(token: token!);
    ArticleStock? art;
    String magName = "-";
    try {
      // 1. Article lié pour l'unité (si besoin)
      art = await stockService.getArticleDetail(widget.entry.stockItem ?? -1);

      // 2. Nom du magasin via storeId
      int? storeId = context.read<AuthProvider>().storeId;
      if (storeId != null) {
        final res = await ProjetService().getMagasinDetail(storeId);
        magName = res['nom'] ?? "-";
      }
    } catch (e) {
      print("Erreur chargement article ou magasin: $e");
    }

    if (mounted) {
      setState(() {
        article = art;
        magasinName = magName;
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      body: loading
          ? Center(child: CircularProgressIndicator(color: Color(0xFF0A84FF)))
          : _EntryDetailContent(
              entry: widget.entry,
              magasinName: magasinName,
              article: article,
            ),
      initialIndex: 1,
    );
  }
}

class _EntryDetailContent extends StatelessWidget {
  final Entree entry;
  final String magasinName;
  final ArticleStock? article;
  const _EntryDetailContent({
    required this.entry,
    required this.magasinName,
    required this.article,
  });

  static const String backendUrl = 'http://38.242.139.218:8001';

  @override
  Widget build(BuildContext context) {
    final isRetour = entry.type == "Retour";
    final String pageTitle = isRetour ? "Détail retour" : "Détail entrée";
    final String cardLabel = isRetour ? "Déposant(e)" : "Livreur";
    final String dateLabel = isRetour ? "Retournée le" : "Entrée le";
    final String unit = article?.unite ?? "";

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
                  Text(
                    (entry.stockItemName ?? article?.designation ?? "-").toUpperCase(),
                    style: GoogleFonts.montserrat(
                      fontSize: 22.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                      letterSpacing: 0.5,
                    ),
                  ),
                  SizedBox(height: 1.h),
                  if (magasinName.isNotEmpty && magasinName != "-")
                    Container(
                      margin: EdgeInsets.only(bottom: 1.h),
                      padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F0FE),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        magasinName,
                        style: GoogleFonts.montserrat(fontSize: 15.sp, color: Color(0xFF2973E2), fontWeight: FontWeight.bold),
                      ),
                    ),
                  SizedBox(height: 2.h),
                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.grid_view,
                          title: "Type",
                          value: entry.stockItemType ?? article?.type ?? "-",
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.calendar_today_outlined,
                          title: dateLabel,
                          value: _formatDate(entry.dateCreation),
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.shopping_cart_outlined,
                          title: "Qté entrée",
                          value: "${entry.quantiteM} $unit",
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 3.h),
                  if (isRetour)
                    _buildDeposantCard(
                      label: cardLabel,
                      name: entry.nomDeposant ?? "-",
                      role: entry.fonctionDeposant ?? "-",
                      phone: entry.telDeposant ?? "-",
                    )
                  else
                    _buildLivreurCard(
                      label: cardLabel,
                      name: entry.nomLivreur ?? "-",
                      phone: entry.telLivreur ?? "-",
                      signatureUrl: entry.signatureLivreur,
                    ),
                  if (entry.societe?.isNotEmpty == true) ...[
                    SizedBox(height: 2.h),
                    _buildSupplierCard("Société", entry.societe!, entry.telSociete ?? "-"),
                  ],
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

  Widget _buildDeposantCard({
    required String label,
    required String name,
    required String role,
    required String phone,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.only(bottom: 0.5.h, left: 1.w),
          child: Text(
            label,
            style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Color(0xFF0A84FF),
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5),
          ),
        ),
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(3.7.w),
          decoration: BoxDecoration(
            color: const Color(0xFFF5F5F5),
            borderRadius: BorderRadius.circular(3.w),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(Icons.person_outline, size: 8.w, color: Colors.grey[500]),
              SizedBox(width: 4.5.w),
              Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        name,
                        style: GoogleFonts.montserrat(
                            fontSize: 15.sp,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    SizedBox(width: 2.w),
                    Text(
                      role,
                      style: GoogleFonts.montserrat(
                          fontSize: 13.sp, color: Colors.grey[600]),
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(width: 2.w),
                    Text(
                      phone,
                      style: GoogleFonts.montserrat(
                          fontSize: 12.sp,
                          color: Color(0xFF34C759),
                          fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLivreurCard({
    required String label,
    required String name,
    required String phone,
    String? signatureUrl,
  }) {
    Widget signatureWidget = const SizedBox.shrink();
    if (signatureUrl != null && signatureUrl.isNotEmpty) {
      String effectiveUrl = signatureUrl;
      if (signatureUrl.startsWith('/media')) {
        effectiveUrl = '$backendUrl$signatureUrl';
      }
signatureWidget = Container(
  width: 25.w,
  height: 5.h,
  margin: EdgeInsets.symmetric(horizontal: 3.w),
  padding: EdgeInsets.symmetric(horizontal: 1.w, vertical: 0.4.h), // Ajoute du vide autour de l’image
  decoration: BoxDecoration(
    color: const Color(0x3379B7FF),
    borderRadius: BorderRadius.circular(18),
  ),
  child: ClipRRect(
    borderRadius: BorderRadius.circular(18),
    child: Image.network(
      effectiveUrl,
      fit: BoxFit.contain, // <-- ici "contain" pour ne jamais couper la signature même si elle est + large
      errorBuilder: (c, e, s) => const Icon(Icons.error, size: 28),
    ),
  ),
);
}
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.only(bottom: 0.5.h, left: 1.w),
          child: Text(
            label,
            style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Color(0xFF0A84FF),
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5),
          ),
        ),
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(3.7.w),
          decoration: BoxDecoration(
            color: const Color(0xFFF5F5F5),
            borderRadius: BorderRadius.circular(3.w),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(Icons.person_outline, size: 8.w, color: Colors.grey[500]),
              SizedBox(width: 4.5.w),
              Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        name,
                        style: GoogleFonts.montserrat(
                            fontSize: 15.sp,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (signatureUrl != null && signatureUrl.isNotEmpty)
                      signatureWidget,
                    Text(
                      phone,
                      style: GoogleFonts.montserrat(
                          fontSize: 12.sp,
                          color: Color(0xFF34C759),
                          fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSupplierCard(String label, String supplier, String phone) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.only(bottom: 0.5.h, left: 1.w),
          child: Text(
            label,
            style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Color(0xFF0A84FF),
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5),
          ),
        ),
        Container(
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
                    color: Colors.black),
              ),
              Text(
                phone,
                style: GoogleFonts.montserrat(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black),
              ),
            ],
          ),
        ),
      ],
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
