import 'package:eebtp_frontend/screens/resquestTracking.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class RequestDetailScreen extends StatelessWidget {
  final SupplyRequest request;

  const RequestDetailScreen({Key? key, required this.request})
      : super(key: key);

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'acceptée':
        return const Color(0xFF00C897); // Vert moderne
      case 'en cours':
        return const Color(0xFFFFA41B); // Orange vif
      case 'refusée':
        return const Color(0xFFFF4D4D); // Rouge moderne
      default:
        return const Color(0xFF6C63FF); // Violet par défaut
    }
  }

  Color _getStatusBackgroundColor(String status) {
    switch (status.toLowerCase()) {
      case 'acceptée':
        return const Color(0xFFE6F7F2);
      case 'en cours':
        return const Color(0xFFFFF4E6);
      case 'refusée':
        return const Color(0xFFFFE6E6);
      default:
        return const Color(0xFFF0EFFF);
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'acceptée':
        return Icons.verified_rounded;
      case 'en cours':
        return Icons.autorenew_rounded;
      case 'refusée':
        return Icons.cancel_rounded;
      default:
        return Icons.help_rounded;
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
                  color: _getStatusBackgroundColor(request.status),
                  shape: BoxShape.circle,
                ),
                child: Icon(_getStatusIcon(request.status),
                    size: 18.sp, color: _getStatusColor(request.status)),
              ),
              SizedBox(width: 4.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "N° ${request.id}",
                      style: GoogleFonts.poppins(
                        fontSize: 13.sp,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 0.5.h),
                    Text(
                      request.title.replaceFirst("Demande d'appro de ", "Approvisionnement de "),
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
              color: _getStatusBackgroundColor(request.status),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: _getStatusColor(request.status).withOpacity(0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(_getStatusIcon(request.status),
                    size: 16.sp, color: _getStatusColor(request.status)),
                SizedBox(width: 2.w),
                Text(
                  request.status.toUpperCase(),
                  style: GoogleFonts.poppins(
                    fontSize: 14.sp,
                    color: _getStatusColor(request.status),
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
            "${request.emissionDate.day.toString().padLeft(2, '0')}/${request.emissionDate.month.toString().padLeft(2, '0')}/${request.emissionDate.year}",
            const Color(0xFF00C897),
          ),
          if (request.processDate != null)
            _buildInfoTile(
              Icons.verified_rounded,
              "Date de traitement",
              "${request.processDate!.day.toString().padLeft(2, '0')}/${request.processDate!.month.toString().padLeft(2, '0')}/${request.processDate!.year}",
              const Color(0xFF6C63FF),
            ),
          _buildInfoTile(
            Icons.person_rounded,
            "Responsable",
            request.responsiblePerson,
            const Color(0xFFFFA41B),
          ),
          _buildInfoTile(
            Icons.scale_rounded,
            "Quantité demandée",
            "${request.requestedQuantity.toInt()} tonnes",
            const Color(0xFF007AFF),
          ),
          if (request.approvedQuantity != null)
            _buildInfoTile(
              Icons.check_circle_rounded,
              "Quantité approuvée",
              "${request.approvedQuantity!.toInt()} tonnes",
              const Color(0xFF00C897),
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
              content,
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
                  _buildTextCard("Motif", request.motif, const Color(0xFF00C897)),
                  _buildTextCard("Observation", request.observation, const Color(0xFF6C63FF)),
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