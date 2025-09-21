import 'package:eebtp_frontend/screens/RequestDetail.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import 'package:eebtp_frontend/widgets/nav.dart'; // Importez votre NavContainer

// Model pour les demandes
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
  
  // Données factices
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
        return Colors.green;
      case 'en cours':
        return Colors.orange;
      case 'refusée':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'acceptée':
        return Icons.check;
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
          Text(
            "Suivre\nmes demandes",
            style: GoogleFonts.poppins(
              fontSize: 16.sp,
              color: Colors.white,
              fontWeight: FontWeight.w600,
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

  Widget _buildRequestCard(SupplyRequest request) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 5,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => _navigateToRequestDetail(request),
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        request.title,
                        style: GoogleFonts.poppins(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
                      SizedBox(height: 0.5.h),
                      Text(
                        "N° ${request.id}",
                        style: GoogleFonts.poppins(
                          fontSize: 12.sp,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
                  decoration: BoxDecoration(
                    color: _getStatusColor(request.status),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _getStatusIcon(request.status),
                        color: Colors.white,
                        size: 16,
                      ),
                      SizedBox(width: 1.w),
                      Text(
                        request.status,
                        style: GoogleFonts.poppins(
                          fontSize: 12.sp,
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 2.h),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Émit le ${request.emissionDate.day.toString().padLeft(2, '0')}/${request.emissionDate.month.toString().padLeft(2, '0')}/${request.emissionDate.year}",
                        style: GoogleFonts.poppins(
                          fontSize: 12.sp,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                if (request.processDate != null)
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          "Traiter le ${request.processDate!.day.toString().padLeft(2, '0')}/${request.processDate!.month.toString().padLeft(2, '0')}/${request.processDate!.year}",
          style: GoogleFonts.poppins(
            fontSize: 12.sp,
            color: Colors.grey[600],
          ),
        ),
      ],
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
      initialIndex: 2, // Index pour "Demande"
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

