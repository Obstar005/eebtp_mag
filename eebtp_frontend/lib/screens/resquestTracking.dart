import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

// Classes de la navbar
class ImprovedBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final bool showFabIndicator;

  const ImprovedBottomNavigation({
    Key? key,
    required this.currentIndex,
    required this.onTap,
    this.showFabIndicator = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 70,
      child: Stack(
        children: [
          CustomPaint(
            size: Size(MediaQuery.of(context).size.width, 70),
            painter: ImprovedBottomNavPainter(showFabIndicator: showFabIndicator),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(Icons.home_outlined, Icons.home, "Accueil", 0),
              _buildNavItem(Icons.inventory_2_outlined, Icons.inventory_2, "Stock", 1),
              SizedBox(width: 60),
              _buildNavItem(Icons.assignment_outlined, Icons.assignment, "Demande", 2),
              _buildNavItem(Icons.person_outline, Icons.person, "Profil", 3),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData outlinedIcon, IconData filledIcon, String label, int index) {
    bool isSelected = currentIndex == index;
    
    return GestureDetector(
      onTap: () => onTap(index),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isSelected ? filledIcon : outlinedIcon,
            size: 22,
            color: Colors.white,
          ),
          SizedBox(height: 2),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 4),
            child: Column(
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white,
                    fontFamily: "Montserrat",
                  ),
                ),
                if (isSelected)
                  Container(
                    margin: EdgeInsets.only(top: 2),
                    height: 2,
                    width: label.length * 8.0,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ImprovedBottomNavPainter extends CustomPainter {
  final bool showFabIndicator;

  ImprovedBottomNavPainter({this.showFabIndicator = false});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF007AFF)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    final double fabRadius = size.width * 0.08;
    final double notchRadius = fabRadius + 8;
    final double notchStartX = size.width / 2 - notchRadius;
    final double notchEndX = size.width / 2 + notchRadius;
    final double smoothFactor = notchRadius * 0.4;

    final path = Path();

    path.moveTo(0, 20);
    path.quadraticBezierTo(0, 0, 20, 0);
    path.lineTo(notchStartX - smoothFactor, 0);
    path.cubicTo(
      notchStartX, 0,
      notchStartX, notchRadius * 0.3,
      size.width / 2 - fabRadius, notchRadius * 0.6,
    );
    path.arcToPoint(
      Offset(size.width / 2 + fabRadius, notchRadius * 0.6),
      radius: Radius.circular(notchRadius),
      clockwise: false,
    );
    path.cubicTo(
      notchEndX, notchRadius * 0.3,
      notchEndX, 0,
      notchEndX + smoothFactor, 0,
    );
    path.lineTo(size.width - 20, 0);
    path.quadraticBezierTo(size.width, 0, size.width, 20);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    canvas.drawShadow(path, Colors.black26, 5, true);
    canvas.drawPath(path, paint);

    if (showFabIndicator) {
      final indicatorPaint = Paint()
        ..color = Colors.white
        ..style = PaintingStyle.fill;

      final indicatorPath = Path();
      final indicatorY = notchRadius * 0.8;
      final indicatorWidth = 30.0;
      final indicatorHeight = 3.0;

      indicatorPath.addRRect(
        RRect.fromLTRBR(
          size.width / 2 - indicatorWidth / 2,
          indicatorY,
          size.width / 2 + indicatorWidth / 2,
          indicatorY + indicatorHeight,
          Radius.circular(1.5),
        ),
      );

      canvas.drawPath(indicatorPath, indicatorPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class ImprovedFAB extends StatelessWidget {
  final bool isExpanded;
  final VoidCallback onToggle;
  final Function(String) onSecondaryPressed;

  const ImprovedFAB({
    Key? key,
    required this.isExpanded,
    required this.onToggle,
    required this.onSecondaryPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 300,
      height: 170,
      child: Stack(
        alignment: Alignment.center,
        children: [
          AnimatedPositioned(
            duration: Duration(milliseconds: 300),
            curve: Curves.easeOut,
            bottom: isExpanded ? 100 : 0,
            left: isExpanded ? 60 : 0,
            child: Transform.scale(
              scale: isExpanded ? 1 : 0,
              child: FloatingActionButton(
                shape: const CircleBorder(),
                mini: true,
                heroTag: "entry",
                backgroundColor: Color(0xFF007AFF),
                onPressed: () => onSecondaryPressed('entry'),
                child: Icon(Icons.arrow_downward, color: Colors.white),
              ),
            ),
          ),
          AnimatedPositioned(
            duration: Duration(milliseconds: 300),
            curve: Curves.easeOut,
            bottom: isExpanded ? 120 : 0,
            child: Transform.scale(
              scale: isExpanded ? 1 : 0,
              child: FloatingActionButton(
                shape: const CircleBorder(),
                mini: true,
                heroTag: "refresh",
                backgroundColor: Color(0xFF007AFF),
                onPressed: () => onSecondaryPressed('refresh'),
                child: Icon(Icons.refresh, color: Colors.white),
              ),
            ),
          ),
          AnimatedPositioned(
            duration: Duration(milliseconds: 300),
            curve: Curves.easeOut,
            bottom: isExpanded ? 100 : 0,
            right: isExpanded ? 60 : 0,
            child: Transform.scale(
              scale: isExpanded ? 1 : 0,
              child: FloatingActionButton(
                shape: const CircleBorder(),
                mini: true,
                heroTag: "exit",
                backgroundColor: Color(0xFF007AFF),
                onPressed: () => onSecondaryPressed('exit'),
                child: Icon(Icons.arrow_upward, color: Colors.white),
              ),
            ),
          ),
          FloatingActionButton(
            heroTag: "main",
            backgroundColor: Color(0xFF007AFF),
            onPressed: onToggle,
            shape: const CircleBorder(),
            child: AnimatedRotation(
              turns: isExpanded ? 0.125 : 0,
              duration: Duration(milliseconds: 300),
              child: Icon(Icons.add, size: 50, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}

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
    return Scaffold(
      backgroundColor: Colors.grey[50],
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
      bottomNavigationBar: ImprovedBottomNavigation(
        currentIndex: 2,
        showFabIndicator: true,
        onTap: (index) {
          debugPrint("Navigation index: $index");
        },
      ),
      floatingActionButton: ImprovedFAB(
        isExpanded: false,
        onToggle: () {
          debugPrint("FAB toggled");
        },
        onSecondaryPressed: (String action) {
          debugPrint("FAB action: $action");
        },
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }
}

// Page de détail de demande
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
    return Scaffold(
      backgroundColor: Colors.grey[50],
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
      ),
      bottomNavigationBar: ImprovedBottomNavigation(
        currentIndex: 2,
        showFabIndicator: true,
        onTap: (index) {
          debugPrint("Navigation index: $index");
        },
      ),
      floatingActionButton: ImprovedFAB(
        isExpanded: false,
        onToggle: () {
          debugPrint("FAB toggled");
        },
        onSecondaryPressed: (String action) {
          debugPrint("FAB action: $action");
        },
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }
}