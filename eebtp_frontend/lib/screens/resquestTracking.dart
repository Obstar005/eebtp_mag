import 'package:eebtp_frontend/screens/RequestDetail.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import 'package:eebtp_frontend/widgets/nav.dart';

class SupplyRequest {
  final String id;
  final String title;
  final String status;
  final DateTime emissionDate;
  final DateTime? processDate;
  final String responsiblePerson;
  final double requestedQuantity;
  final double? approvedQuantity;
  final String motif;
  final String observation;

  SupplyRequest({
    required this.id,
    required this.title,
    required this.status,
    required this.emissionDate,
    this.processDate,
    required this.responsiblePerson,
    required this.requestedQuantity,
    this.approvedQuantity,
    required this.motif,
    required this.observation,
  });
}

class RequestsTrackingScreen extends StatefulWidget {
  const RequestsTrackingScreen({super.key});

  @override
  State<RequestsTrackingScreen> createState() => _RequestsTrackingScreenState();
}

class _RequestsTrackingScreenState extends State<RequestsTrackingScreen> {
 final List<SupplyRequest> _requests = [
    SupplyRequest(
      id: "DEM-006",
      title: "Demande d'appro de ciment",
      status: "acceptée",
      emissionDate: DateTime(2025, 2, 2),
      processDate: DateTime(2025, 2, 20),
      responsiblePerson: "John Doe",
      requestedQuantity: 20,
      approvedQuantity: 20,
      motif: "Besoin urgent pour le chantier principal. Les travaux de fondation nécessitent du ciment de qualité supérieure.",
      observation: "Approvisionnement validé. Livraison prévue dans les délais. Qualité conforme aux spécifications.",
    ),
    SupplyRequest(
      id: "DEM-005",
      title: "Demande d'appro de fer à...",
      status: "acceptée",
      emissionDate: DateTime(2025, 2, 2),
      processDate: DateTime(2025, 2, 20),
      responsiblePerson: "Marie Martin",
      requestedQuantity: 15,
      approvedQuantity: 15,
      motif: "Armatures nécessaires pour la structure en béton armé du projet résidentiel.",
      observation: "Demande approuvée. Stock suffisant disponible.",
    ),
    SupplyRequest(
      id: "DEM-004",
      title: "Demande d'appro de fer...",
      status: "En cours",
      emissionDate: DateTime(2025, 2, 2),
      responsiblePerson: "Pierre Durand",
      requestedQuantity: 25,
      motif: "Commande de fer pour l'extension du bâtiment industriel.",
      observation: "En cours de validation par le service technique.",
    ),
    SupplyRequest(
      id: "DEM-003",
      title: "Demande d'appro de col...",
      status: "refusée",
      emissionDate: DateTime(2025, 2, 2),
      processDate: DateTime(2025, 2, 20),
      responsiblePerson: "Sophie Bernard",
      requestedQuantity: 10,
      motif: "Colle spéciale pour carrelage de la salle de bain principale.",
      observation: "Budget insuffisant pour ce type de colle. Proposer une alternative moins coûteuse.",
    ),
    SupplyRequest(
      id: "DEM-002",
      title: "Demande d'appro de fer...",
      status: "En cours",
      emissionDate: DateTime(2025, 2, 2),
      responsiblePerson: "Paul Moreau",
      requestedQuantity: 30,
      motif: "Renforcement de la structure métallique existante.",
      observation: "Vérification des spécifications techniques en cours.",
    ),
    SupplyRequest(
      id: "DEM-001",
      title: "Demande d'appro de fer...",
      status: "En cours",
      emissionDate: DateTime(2025, 2, 2),
      responsiblePerson: "Lucie Petit",
      requestedQuantity: 12,
      motif: "Barres d'armature pour les poteaux de soutènement.",
      observation: "Attente de confirmation du fournisseur pour les délais de livraison.",
    ),
  ];

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'acceptée':
        return const Color.fromRGBO(38, 161, 90, 1);
      case 'en cours':
        return const Color.fromRGBO(218, 164, 0, 1);
      case 'refusée':
        return const Color.fromRGBO(206, 0, 0, 1);
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'acceptée':
        return Icons.check_circle;
      case 'en cours':
        return Icons.info;
      case 'refusée':
        return Icons.error;
      default:
        return Icons.help;
    }
  }

  void _navigateToRequestDetail(SupplyRequest request) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => RequestDetailScreen(request: request),
      ),
    );
  }

  Widget _buildAppBar() {
    return SafeArea(
      bottom: false,
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.only(
          left: 5.w,
          right: 5.w,
          top: 2.h,
          bottom: 2.h,
        ),
        decoration: BoxDecoration(
          color: const Color(0xFF007AFF),
          
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 14,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Flèche retour
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: CircleAvatar(
                backgroundColor: Colors.white,
                child: Icon(Icons.arrow_back_ios_new, color: Color(0xFF007AFF), size: 18.sp),
              ),
            ),
            SizedBox(width: 3.w),
            // Titre à côté de la flèche
            Expanded(
              child: Text(
                "Suivre\nmes demandes",
                maxLines: 2,
                textAlign: TextAlign.left,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.poppins(
                  fontSize: 16.sp,
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  height: 1.1,
                ),
              ),
            ),
            // Badge notif à droite (pas centré)
            Stack(
              children: [
                Container(
                  padding: EdgeInsets.all(2.2.w),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.notifications_outlined,
                      size: 6.5.w, color: Color(0xFF007AFF)),
                ),
                Positioned(
                  right: 2,
                  top: 2,
                  child: Container(
                    padding: EdgeInsets.all(.7.w),
                    decoration: const BoxDecoration(
                        color: Colors.red, shape: BoxShape.circle),
                    constraints: const BoxConstraints(minWidth: 19, minHeight: 19),
                    child: Text(
                      "3",
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: 8.sp,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        height: 1,
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

  Widget _buildRequestCard(SupplyRequest request) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: const Color.fromARGB(255, 180, 211, 247).withOpacity(0.8),
            blurRadius: 5,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => _navigateToRequestDetail(request),
        borderRadius: BorderRadius.circular(15),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ligne titre, status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Titre + n°
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        request.title,
                        style: GoogleFonts.poppins(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: const Color.fromRGBO(13, 13, 13,1),
                        ),
                      ),
                      SizedBox(height: 1.h),
                      Text(
                        "N° ${request.id}",
                        style: GoogleFonts.poppins(
                          fontSize: 13.sp,
                          color: const Color.fromRGBO(67, 69, 69, 1),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.8.h),
                  decoration: BoxDecoration(
                    color: _getStatusColor(request.status),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _getStatusIcon(request.status),
                        color: Colors.white,
                        size: 13.sp,
                      ),
                      SizedBox(width: 1.w),
                      Flexible(
                        child: Text(
                          request.status,
                          style: GoogleFonts.poppins(
                            fontSize: 11.sp,
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 2.h),
            // Ligne dates
            Row(
              children: [
                Expanded(
                  child: Text(
                    "Émit le ${request.emissionDate.day.toString().padLeft(2, '0')}/${request.emissionDate.month.toString().padLeft(2, '0')}/${request.emissionDate.year}",
                    style: GoogleFonts.poppins(
                      fontSize: 12.sp,
                      color: const Color.fromRGBO(67, 69, 69, 1),
                    ),
                  ),
                ),
                if (request.processDate != null)
                  Expanded(
                    child: Text(
                      "Traitée le ${request.processDate!.day.toString().padLeft(2, '0')}/${request.processDate!.month.toString().padLeft(2, '0')}/${request.processDate!.year}",
                      textAlign: TextAlign.right,
                      style: GoogleFonts.poppins(
                        fontSize: 12.sp,
                        color: Color.fromRGBO(67, 69, 69, 1),
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

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      initialIndex: 2, // Onglet "Demande"
      body: Column(
        children: [
          _buildAppBar(),
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.symmetric(vertical: 2.h),
              itemCount: _requests.length,
              itemBuilder: (context, index) {
                return _buildRequestCard(_requests[index]);
              },
            ),
          ),
        ],
      ),
    );
  }
}
