import 'package:eebtp_frontend/models/demande.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class RequestDetailScreen extends StatelessWidget {
  final Demande demande;

  const RequestDetailScreen({Key? key, required this.demande})
      : super(key: key);

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'validée':
      case 'livrée':
        return const Color(0xFF00C897); // Vert moderne
      case 'confirmée':
      case 'approuvée':
        return const Color(0xFF007AFF); // Bleu
      case 'emise':
        return const Color(0xFFFFA41B); // Orange vif
      case 'rejetée':
        return const Color(0xFFFF4D4D); // Rouge moderne
      default:
        return const Color(0xFF6C63FF); // Violet par défaut
    }
  }

  Color _getStatusBackgroundColor(String status) {
    switch (status.toLowerCase()) {
      case 'validée':
      case 'livrée':
        return const Color(0xFFE6F7F2);
      case 'confirmée':
      case 'approuvée':
        return const Color(0xFFE6F0FF);
      case 'emise':
        return const Color(0xFFFFF4E6);
      case 'rejetée':
        return const Color(0xFFFFE6E6);
      default:
        return const Color(0xFFF0EFFF);
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'validée':
      case 'livrée':
        return Icons.verified_rounded;
      case 'confirmée':
      case 'approuvée':
        return Icons.thumb_up_rounded;
      case 'emise':
        return Icons.pending_rounded;
      case 'rejetée':
        return Icons.cancel_rounded;
      default:
        return Icons.help_rounded;
    }
  }

  String _getDisplayStatus(String status) {
    switch (status.toLowerCase()) {
      case 'emise':
        return 'Emise';
      case 'confirmee':
        return 'Confirmée';
      case 'approuvee':
        return 'Approuvée';
      case 'validee':
        return 'Validée';
      case 'rejetee':
        return 'Rejetée';
      case 'livree':
        return 'Livrée';
      default:
        return status;
    }
  }

  Widget _buildAppBar(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 2.h),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF007AFF), Color(0xFF6C63FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                padding: EdgeInsets.all(3.w),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.arrow_back_ios_new, 
                    size: 6.w, color: Color(0xFF007AFF)),
              ),
            ),
            Expanded(
              child: Center(
                child: Text(
                  "Détails\n de la demande",
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: 16.sp,
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
            Stack(
              children: [
                Container(
                  padding: EdgeInsets.all(2.5.w),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.notifications_outlined,
                      size: 7.w, color: Color(0xFF007AFF)),
                ),
                Positioned(
                  right: 0,
                  top: 0,
                  child: Container(
                    padding: EdgeInsets.all(1.w),
                    decoration: const BoxDecoration(
                        color: Colors.red, shape: BoxShape.circle),
                    child: Text(
                      "3",
                      style: GoogleFonts.poppins(
                        fontSize: 9.sp,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard() {
    final displayStatus = _getDisplayStatus(demande.statut);

    return Container(
      margin: EdgeInsets.only(bottom: 4.h, top: 3.h),
      padding: EdgeInsets.all(6.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.white, Colors.grey[50]!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(25),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 25,
            offset: const Offset(0, 10),
          ),
        ],
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(3.w),
                decoration: BoxDecoration(
                  color: _getStatusBackgroundColor(demande.statut),
                  shape: BoxShape.circle,
                ),
                child: Icon(_getStatusIcon(demande.statut),
                    size: 18.sp, color: _getStatusColor(demande.statut)),
              ),
              SizedBox(width: 4.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "N° ${demande.number}",
                      style: GoogleFonts.poppins(
                        fontSize: 13.sp,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 0.5.h),
                    Text(
                      demande.stockItemName ?? 'Demande sans nom',
                      style: GoogleFonts.poppins(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w700,
                        color: Colors.black87,
                        height: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
            decoration: BoxDecoration(
              color: _getStatusBackgroundColor(demande.statut),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: _getStatusColor(demande.statut).withOpacity(0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(_getStatusIcon(demande.statut),
                    size: 16.sp, color: _getStatusColor(demande.statut)),
                SizedBox(width: 2.w),
                Text(
                  displayStatus.toUpperCase(),
                  style: GoogleFonts.poppins(
                    fontSize: 14.sp,
                    color: _getStatusColor(demande.statut),
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection() {
    return Container(
      margin: EdgeInsets.only(bottom: 4.h),
      padding: EdgeInsets.all(5.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(25),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "INFORMATIONS PRINCIPALES",
            style: GoogleFonts.poppins(
              fontSize: 13.sp,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF6C63FF),
              letterSpacing: 1.0,
            ),
          ),
          SizedBox(height: 3.h),
          _buildInfoTile(
            Icons.calendar_month_rounded,
            "Date d'émission",
            "${demande.dateCreation.day.toString().padLeft(2, '0')}/${demande.dateCreation.month.toString().padLeft(2, '0')}/${demande.dateCreation.year}",
            const Color(0xFF00C897),
          ),
          if (demande.dateEmission != null)
            _buildInfoTile(
              Icons.send_rounded,
              "Date d'envoi",
              "${demande.dateEmission!.day.toString().padLeft(2, '0')}/${demande.dateEmission!.month.toString().padLeft(2, '0')}/${demande.dateEmission!.year}",
              const Color(0xFFFFA41B),
            ),
          if (demande.dateConfirmation != null)
            _buildInfoTile(
              Icons.verified_rounded,
              "Date de confirmation",
              "${demande.dateConfirmation!.day.toString().padLeft(2, '0')}/${demande.dateConfirmation!.month.toString().padLeft(2, '0')}/${demande.dateConfirmation!.year}",
              const Color(0xFF007AFF),
            ),
          if (demande.dateApprobation != null)
            _buildInfoTile(
              Icons.thumb_up_rounded,
              "Date d'approbation",
              "${demande.dateApprobation!.day.toString().padLeft(2, '0')}/${demande.dateApprobation!.month.toString().padLeft(2, '0')}/${demande.dateApprobation!.year}",
              const Color(0xFF6C63FF),
            ),
          if (demande.dateValidation != null)
            _buildInfoTile(
              Icons.check_circle_rounded,
              "Date de validation",
              "${demande.dateValidation!.day.toString().padLeft(2, '0')}/${demande.dateValidation!.month.toString().padLeft(2, '0')}/${demande.dateValidation!.year}",
              const Color(0xFF00C897),
            ),
          if (demande.dateRejet != null)
            _buildInfoTile(
              Icons.cancel_rounded,
              "Date de rejet",
              "${demande.dateRejet!.day.toString().padLeft(2, '0')}/${demande.dateRejet!.month.toString().padLeft(2, '0')}/${demande.dateRejet!.year}",
              const Color(0xFFFF4D4D),
            ),
          _buildInfoTile(
            Icons.person_rounded,
            "Émis par",
            demande.emisParName,
            const Color(0xFFFFA41B),
          ),
          if (demande.confirmeParName.isNotEmpty)
            _buildInfoTile(
              Icons.verified_user_rounded,
              "Confirmé par",
              demande.confirmeParName,
              const Color(0xFF007AFF),
            ),
          if (demande.approveParName.isNotEmpty)
            _buildInfoTile(
              Icons.engineering_rounded,
              "Approuvé par",
              demande.approveParName,
              const Color(0xFF6C63FF),
            ),
          if (demande.valideParName.isNotEmpty)
            _buildInfoTile(
              Icons.admin_panel_settings_rounded,
              "Validé par",
              demande.valideParName,
              const Color(0xFF00C897),
            ),
          if (demande.rejeteParName.isNotEmpty)
            _buildInfoTile(
              Icons.do_not_disturb_rounded,
              "Rejeté par",
              demande.rejeteParName,
              const Color(0xFFFF4D4D),
            ),
          _buildInfoTile(
            Icons.scale_rounded,
            "Quantité demandée",
            "${demande.quantite} unités",
            const Color(0xFF007AFF),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value, Color color) {
    return Container(
      margin: EdgeInsets.only(bottom: 3.h),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(3.w),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 18.sp),
          ),
          SizedBox(width: 4.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label.toUpperCase(),
                  style: GoogleFonts.poppins(
                    fontSize: 11.sp,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.8,
                  ),
                ),
                SizedBox(height: 0.5.h),
                Text(
                  value,
                  style: GoogleFonts.poppins(
                    fontSize: 15.sp,
                    color: Colors.black87,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextCard(String title, String content, Color color) {
    return Container(
      margin: EdgeInsets.only(bottom: 4.h),
      padding: EdgeInsets.all(5.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(25),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(2.w),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  title == "Motif" ? Icons.description_rounded : Icons.visibility_rounded,
                  color: color,
                  size: 16.sp,
                ),
              ),
              SizedBox(width: 3.w),
              Text(
                title.toUpperCase(),
                style: GoogleFonts.poppins(
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w700,
                  color: color,
                  letterSpacing: 1.0,
                ),
              ),
            ],
          ),
          SizedBox(height: 2.h),
          Container(
            padding: EdgeInsets.all(4.w),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              content.isNotEmpty ? content : "Aucune information",
              style: GoogleFonts.poppins(
                fontSize: 14.sp,
                color: Colors.black87,
                height: 1.6,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      initialIndex: 2,
      body: Column(
        children: [
          _buildAppBar(context),
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(5.w),
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSummaryCard(),
                  _buildInfoSection(),
                  _buildTextCard("Motif", demande.raison, const Color(0xFF00C897)),
                  if (demande.motifRejet != null && demande.motifRejet!.isNotEmpty)
                    _buildTextCard("Motif du rejet", demande.motifRejet!, const Color(0xFFFF4D4D)),
                  SizedBox(height: 2.h),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}