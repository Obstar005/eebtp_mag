import 'dart:ui';
import 'package:eebtp_frontend/models/exit_item.dart';
import 'package:eebtp_frontend/models/article.dart';
import 'package:eebtp_frontend/services/stockservice.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart'; // Pour le token
import 'package:sizer/sizer.dart';
import 'package:url_launcher/url_launcher.dart';
import '../widgets/nav.dart';
import '../providers/auth_provider.dart'; // Pour accéder au token

class ExitDetailPage extends StatefulWidget {
  final Sortie sortie;
  const ExitDetailPage({super.key, required this.sortie});

  @override
  State<ExitDetailPage> createState() => _ExitDetailPageState();
}

class _ExitDetailPageState extends State<ExitDetailPage> {
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
      // On récupère le token depuis le Provider
      final token = context.read<AuthProvider>().token;
      final fetched =
          await StockService(token: token).getArticleDetail(widget.sortie.stockItem);
      setState(() {
        article = fetched;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isError = true;
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
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
                      Text('Erreur lors du chargement de l\'article.',
                          style: GoogleFonts.montserrat(
                              fontSize: 16, color: Colors.red)),
                      SizedBox(height: 2.h),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue),
                        onPressed: _loadArticle,
                        child: Text('Réessayer'),
                      ),
                    ],
                  ),
                )
              : _ExitDetailContent(sortie: widget.sortie, article: article),
    );
  }
}

class _ExitDetailContent extends StatelessWidget {
  final Sortie sortie;
  final ArticleStock? article;
  const _ExitDetailContent({required this.sortie, required this.article});
   
   void _callPhone(String phone) async {
  final uri = Uri(scheme: 'tel', path: phone);
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri);
  }
}
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
                  _buildProductImage(),
                  SizedBox(height: 3.h),
                  // INFO produit/article
                  Text(
                    (article?.designation ?? "Produit lié ID #${sortie.stockItem}").toUpperCase(),
                    style: GoogleFonts.montserrat(
                      fontSize: 22.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                      letterSpacing: 0.5,
                    ),
                  ),
                  SizedBox(height: 1.h),
              /*     Text(
                    article != null ? "Article ID : ${article!.id}" : "",
                    style: GoogleFonts.montserrat(
                      fontSize: 15.sp,
                      color: Colors.grey[500],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Text(
                    "StockID: ${sortie.stockItem}",
                    style: GoogleFonts.montserrat(
                      fontSize: 13.sp,
                      color: Colors.blue[300],
                      fontWeight: FontWeight.w500,
                    ),
                  ), */
                  SizedBox(height: 3.h),
                  // GRID informations
                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.grid_view,
                          title: "Type",
                          value: article?.type ?? "-",
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.calendar_today_outlined,
                          title: "Sortie le",
                          value: _formatDate(sortie.dateCreation),
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: _buildInfoCard(
                          icon: Icons.shopping_cart_outlined,
                          title: "Qté sortie",
                          value: "${sortie.quantiteM} ${article?.unite ?? ''}",
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 3.h),
                  _buildReceiverCard(),
                  SizedBox(height: 3.h),
                  Text(
                    "Objet de la sortie",
                    style: GoogleFonts.montserrat(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(height: 1.5.h),
                  Text(
                    sortie.objet ?? "-",
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
                  child: Icon(Icons.arrow_back_ios_new,
                      size: 5.w, color: Color(0xFF0A84FF)),
                ),
              ),
              Text(
                "Détail sortie",
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

  Widget _buildInfoCard({required IconData icon, required String title, required String value}) {
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
          Container(
            width: 16.w,
            height: 16.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.grey[300],
            ),
            child: Icon(Icons.person, size: 10.w, color: Colors.white),
          ),
          SizedBox(width: 4.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  sortie.nomReceveur ?? "-",
                  style: GoogleFonts.montserrat(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w700,
                    color: Colors.black,
                  ),
                ),
                SizedBox(height: 0.3.h),
                Text(
                  sortie.fonctionReceveur ?? "-",
                  style: GoogleFonts.montserrat(
                    fontSize: 14.sp,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => _callPhone(sortie.telReceveur ?? "-"),
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(2.w),
              ),
              child: Text(
                sortie.telReceveur ?? "-",
                style: GoogleFonts.montserrat(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF34C759),
                ),
              ),
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
