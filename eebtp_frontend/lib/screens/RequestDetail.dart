import 'package:eebtp_frontend/models/article.dart';
import 'package:eebtp_frontend/models/demande.dart';
import 'package:eebtp_frontend/services/stockservice.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:sizer/sizer.dart';
import '../providers/auth_provider.dart';

class RequestDetailScreen extends StatefulWidget {
  final Demande demande;

  const RequestDetailScreen({Key? key, required this.demande}) : super(key: key);

  @override
  State<RequestDetailScreen> createState() => _RequestDetailScreenState();
}

class _RequestDetailScreenState extends State<RequestDetailScreen> {
  String? _unite;
  bool _loadingUnite = false;

  @override
  void initState() {
    super.initState();
    _fetchUnite();
  }

  Future<void> _fetchUnite() async {
    setState(() => _loadingUnite = true);
    try {
      final token = Provider.of<AuthProvider>(context, listen: false).token;
      final stockItemId = widget.demande.stockItem ?? widget.demande.stockItem ?? widget.demande.stockItem;
      if (token != null && stockItemId != null) {
        final service = StockService(token: token);
        final article = await service.getArticleDetail(stockItemId);
        setState(() {
          _unite = article?.unite ?? "unités";
          _loadingUnite = false;
        });
      } else {
        setState(() { _unite = "unités"; _loadingUnite = false; });
      }
    } catch (e) {
      setState(() { _unite = "unités"; _loadingUnite = false; });
      debugPrint('Erreur unité: $e');
    }
  }

  Color get primaryBlue => const Color(0xFF007AFF);

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'validée':
      case 'livrée':
        return const Color(0xFF2ECC71);
      case 'confirmée':
      case 'approuvée':
        return primaryBlue;
      case 'emise':
        return const Color(0xFFF59E42);
      case 'rejetée':
        return const Color(0xFFFF4D4D);
      default:
        return const Color(0xFF6C63FF);
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'validée':
      case 'livrée':
        return Icons.verified;
      case 'confirmée':
      case 'approuvée':
        return Icons.thumb_up_alt_rounded;
      case 'emise':
        return Icons.timelapse;
      case 'rejetée':
        return Icons.cancel_rounded;
      default:
        return Icons.info_outline_rounded;
    }
  }

  String _getDisplayStatus(String status) {
    switch (status.toLowerCase()) {
      case 'emise': return 'Emise';
      case 'confirmee': return 'Confirmée';
      case 'approuvee': return 'Approuvée';
      case 'validee': return 'Validée';
      case 'rejetee': return 'Rejetée';
      case 'livree': return 'Livrée';
      default: return status;
    }
  }

  Widget _buildAppBar(BuildContext context) {
    return Material(
      elevation: 0,
      color: primaryBlue,
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.4.h),
        child: Row(
          children: [
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                padding: EdgeInsets.all(2.2.w),
                child: Icon(Icons.arrow_back_ios_new, color: primaryBlue, size: 21),
              ),
            ),
            SizedBox(width: 3.w),
            Expanded(
              child: Text(
                "Détail de la demande",
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.bold,
                  fontSize: 17.sp,
                  color: Colors.white,
                  letterSpacing: 0.16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final color = _getStatusColor(widget.demande.statut);
    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: EdgeInsets.only(top: 2.8.h, bottom: 2.h),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(_getStatusIcon(widget.demande.statut), color: color, size: 21),
              SizedBox(width: 2.w),
              Text(
                _getDisplayStatus(widget.demande.statut),
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.bold,
                  fontSize: 13.7.sp,
                  color: color,
                ),
              ),
            ],
          ),
          SizedBox(height: 1.7.h),
          Text(
            widget.demande.stockItemName ?? 'Demande sans nom',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontWeight: FontWeight.bold,
              fontSize: 19.5.sp,
              color: Colors.black87,
            ),
          ),
          SizedBox(height: 0.8.h),
          Text(
            "N° ${widget.demande.number}",
            style: GoogleFonts.poppins(
              fontSize: 12.8.sp,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow({required IconData icon, required String label, required String value, Color? color}) {
    return Padding(
      padding: EdgeInsets.only(bottom: 1.4.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(icon, color: color ?? primaryBlue, size: 18),
          SizedBox(width: 3.w),
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 12.5.sp,
                color: Colors.grey[800],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          SizedBox(width: 2.w),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: GoogleFonts.poppins(
                fontSize: 13.2.sp,
                color: Colors.black87,
                fontWeight: FontWeight.w600,
                height: 1.1,
              ),
              overflow: TextOverflow.ellipsis,
              maxLines: 2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection() {
    final d = widget.demande;
    return Container(
      width: double.infinity,
      margin: EdgeInsets.symmetric(vertical: 2.4.h),
      padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.5.h),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey[100]!),
        borderRadius: BorderRadius.circular(7),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoRow(
            icon: Icons.event_note,
            label: "Date d'émission",
            value: "${d.dateCreation.day.toString().padLeft(2, '0')}/${d.dateCreation.month.toString().padLeft(2, '0')}/${d.dateCreation.year}",
          ),
          if (d.dateEmission != null)
            _buildInfoRow(
              icon: Icons.send_rounded,
              label: "Date d'envoi",
              value: "${d.dateEmission!.day.toString().padLeft(2, '0')}/${d.dateEmission!.month.toString().padLeft(2, '0')}/${d.dateEmission!.year}",
            ),
          if (d.dateConfirmation != null)
            _buildInfoRow(
              icon: Icons.verified_rounded,
              label: "Date de confirmation",
              value: "${d.dateConfirmation!.day.toString().padLeft(2, '0')}/${d.dateConfirmation!.month.toString().padLeft(2, '0')}/${d.dateConfirmation!.year}",
            ),
          if (d.dateApprobation != null)
            _buildInfoRow(
              icon: Icons.thumb_up_rounded,
              label: "Date d'approbation",
              value: "${d.dateApprobation!.day.toString().padLeft(2, '0')}/${d.dateApprobation!.month.toString().padLeft(2, '0')}/${d.dateApprobation!.year}",
            ),
          if (d.dateValidation != null)
            _buildInfoRow(
              icon: Icons.check_circle_rounded,
              label: "Date de validation",
              value: "${d.dateValidation!.day.toString().padLeft(2, '0')}/${d.dateValidation!.month.toString().padLeft(2, '0')}/${d.dateValidation!.year}",
            ),
          if (d.dateRejet != null)
            _buildInfoRow(
              icon: Icons.cancel_rounded,
              label: "Date de rejet",
              value: "${d.dateRejet!.day.toString().padLeft(2, '0')}/${d.dateRejet!.month.toString().padLeft(2, '0')}/${d.dateRejet!.year}",
              color: Colors.red
            ),
          _buildInfoRow(
            icon: Icons.scale_rounded,
            label: "Quantité demandée",
            value: _loadingUnite
              ? "..."
              : "${d.quantite} ${_unite ?? "unités"}",
          ),
        ],
      ),
    );
  }

  Widget _buildPeopleSection() {
    final d = widget.demande;
    final lines = <Widget>[
      if (d.emisParName.isNotEmpty)
        _buildInfoRow(
          icon: Icons.person_rounded,
          label: "Émis par",
          value: d.emisParName,
        ),
      if (d.confirmeParName.isNotEmpty)
        _buildInfoRow(
          icon: Icons.verified_user_rounded,
          label: "Confirmé par",
          value: d.confirmeParName,
        ),
      if (d.approveParName.isNotEmpty)
        _buildInfoRow(
          icon: Icons.engineering_rounded,
          label: "Approuvé par",
          value: d.approveParName,
        ),
      if (d.valideParName.isNotEmpty)
        _buildInfoRow(
          icon: Icons.admin_panel_settings_rounded,
          label: "Validé par",
          value: d.valideParName,
        ),
      if (d.rejeteParName.isNotEmpty)
        _buildInfoRow(
          icon: Icons.do_not_disturb_rounded,
          label: "Rejeté par",
          value: d.rejeteParName,
          color: Colors.red,
        ),
    ];
    if (lines.isEmpty) return const SizedBox();
    return Container(
      width: double.infinity,
      margin: EdgeInsets.only(bottom: 2.4.h),
      padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.2.h),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FB),
        border: Border.all(color: Colors.grey[100]!),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: lines,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      initialIndex: 2,
      body: Container(
        color: const Color(0xFFF5F6FA),
        child: Column(
          children: [
            _buildAppBar(context),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildHeader(),
                    Divider(color: Colors.grey[50], thickness: 8, height: 0),
                    _buildInfoSection(),
                    _buildPeopleSection(),
                    SizedBox(height: 2.5.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
