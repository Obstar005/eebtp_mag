// Page de détail de demande
import 'package:eebtp_frontend/screens/resquestTracking.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class RequestDetailScreen extends StatelessWidget {
  final SupplyRequest request;

  const RequestDetailScreen({Key? key, required this.request}) : super(key: key);

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'acceptée':
        return Colors.green;
      case 'en cours':
        return Colors.orange;
      case 'refusée':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Widget _buildAppBar(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
      decoration: const BoxDecoration(
        color: Color(0xFF007AFF),
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(20),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: const CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(Icons.arrow_back_ios_new, color: Color(0xFF007AFF)),
            ),
          ),
          Expanded(
            child: Center(
              child: Text(
                "Détails de la demande\nN° ${request.id}",
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  fontSize: 16.sp,
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
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
    );
  }

  Widget _buildDetailSection(String title, String subtitle) {
    return Container(
      margin: EdgeInsets.only(bottom: 4.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 20.sp,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          SizedBox(height: 1.h),
          Text(
            subtitle,
            style: GoogleFonts.poppins(
              fontSize: 14.sp,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {Widget? valueWidget}) {
    return Container(
      margin: EdgeInsets.only(bottom: 2.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 12.sp,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: valueWidget ?? Text(
              value,
              style: GoogleFonts.poppins(
                fontSize: 14.sp,
                color: Colors.black87,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextSection(String title, String content) {
    return Container(
      margin: EdgeInsets.only(bottom: 4.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 14.sp,
              color: Colors.black87,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 1.h),
          Text(
            content,
            style: GoogleFonts.poppins(
              fontSize: 14.sp,
              color: Colors.black87,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      body: Column(
        children: [
          _buildAppBar(context),
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(5.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildDetailSection(
                    "Demande",
                    request.title.replaceFirst("Demande d'appro de ", "D'approvisionnement de "),
                  ),
                  
                  _buildInfoRow(
                    "ÉMIT LE",
                    "${request.emissionDate.day.toString().padLeft(2, '0')} Février, ${request.emissionDate.year}",
                  ),
                  
                  _buildInfoRow(
                    "STATUS",
                    "",
                    valueWidget: Container(
                      padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
                      decoration: BoxDecoration(
                        color: _getStatusColor(request.status),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        request.status,
                        style: GoogleFonts.poppins(
                          fontSize: 12.sp,
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                  
                  if (request.processDate != null)
                    _buildInfoRow(
                      "TRAITER LE",
                      "${request.processDate!.day.toString().padLeft(2, '0')} Février, ${request.processDate!.year}",
                    ),
                  
                  _buildInfoRow(
                    "PAR",
                    request.responsiblePerson,
                  ),
                  
                  _buildInfoRow(
                    "QUANTITÉ DEMANDÉE",
                    "${request.requestedQuantity.toInt()} t",
                  ),
                  
                  if (request.approvedQuantity != null)
                    _buildInfoRow(
                      "QUANTITÉ APPROUVÉE",
                      "${request.approvedQuantity!.toInt()} t",
                    ),
                  
                  SizedBox(height: 2.h),
                  
                  _buildTextSection(
                    "MOTIF",
                    request.motif,
                  ),
                  
                  _buildTextSection(
                    "OBSERVATION",
                    request.observation,
                  ),
                ],
              ),
            ),
          ),
        ],
      ), initialIndex: 2,

    );
  }
}