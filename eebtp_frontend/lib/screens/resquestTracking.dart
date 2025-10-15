import 'package:eebtp_frontend/models/demande.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:eebtp_frontend/screens/RequestDetail.dart';
import 'package:eebtp_frontend/services/demandeService.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:sizer/sizer.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:toastification/toastification.dart';

class RequestsTrackingScreen extends StatefulWidget {
  const RequestsTrackingScreen({super.key});

  @override
  State<RequestsTrackingScreen> createState() => _RequestsTrackingScreenState();
}

class _RequestsTrackingScreenState extends State<RequestsTrackingScreen> {
  List<Demande> _demandes = [];
  List<Demande> _filteredDemandes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        Provider.of<AuthProvider>(context, listen: false).checkTokenExpiry(context);
        _fetchDemandes();
      }
    });
  }

 Future<void> _fetchDemandes() async {
  final token = Provider.of<AuthProvider>(context, listen: false).token;
  if (token == null) {
    setState(() { _isLoading = false; });
    return;
  }

  try {
    final demandeService = DemandeService();
    final demandes = await demandeService.getDemandesEmises(token);
    
    setState(() {
      _demandes = demandes; // Maintenant List<Demande>
      _filteredDemandes = demandes;
      _isLoading = false;
    });
  } catch (e) {
    setState(() { _isLoading = false; });
    print("Erreur chargement demandes: $e");
    _showToast(message: 'Erreur lors du chargement des demandes', type: ToastificationType.error);
  }
}
  void _showToast({required String message, required ToastificationType type}) {
    toastification.show(
      context: context,
      type: type,
      style: ToastificationStyle.flatColored,
      title: Text(message, style: GoogleFonts.poppins(
        fontSize: 13.sp,
        fontWeight: FontWeight.w500
      )),
      autoCloseDuration: const Duration(seconds: 4),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 300),
      borderRadius: BorderRadius.circular(12),
      showProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      dragToClose: true,
      applyBlurEffect: true,
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'validée':
      case 'livrée':
        return const Color.fromRGBO(38, 161, 90, 1); // Vert
      case 'confirmée':
      case 'approuvée':
        return const Color.fromRGBO(0, 122, 255, 1); // Bleu
      case 'emise':
        return const Color.fromRGBO(218, 164, 0, 1); // Orange
      case 'rejetée':
        return const Color.fromRGBO(206, 0, 0, 1); // Rouge
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'validée':
      case 'livrée':
        return Icons.check_circle;
      case 'confirmée':
      case 'approuvée':
        return Icons.verified;
      case 'emise':
        return Icons.pending;
      case 'rejetée':
        return Icons.cancel;
      default:
        return Icons.help;
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

  DateTime? _getProcessDate(Demande demande) {
    // Retourne la date la plus récente selon le statut
    if (demande.dateRejet != null) return demande.dateRejet;
    if (demande.dateValidation != null) return demande.dateValidation;
    if (demande.dateApprobation != null) return demande.dateApprobation;
    if (demande.dateConfirmation != null) return demande.dateConfirmation;
    if (demande.dateEmission != null) return demande.dateEmission;
    return null;
  }

  void _navigateToRequestDetail(Demande demande) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => RequestDetailScreen(demande: demande),
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
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: CircleAvatar(
                backgroundColor: Colors.white,
                child: Icon(Icons.arrow_back_ios_new, color: Color(0xFF007AFF), size: 18.sp),
              ),
            ),
            SizedBox(width: 3.w),
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

  Widget _buildRequestCard(Demande demande) {
    final processDate = _getProcessDate(demande);
    final displayStatus = _getDisplayStatus(demande.statut);

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
        onTap: () => _navigateToRequestDetail(demande),
        borderRadius: BorderRadius.circular(15),
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
                        demande.stockItemName ?? 'Demande sans nom',
                        style: GoogleFonts.poppins(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: const Color.fromRGBO(13, 13, 13,1),
                        ),
                      ),
                      SizedBox(height: 1.h),
                      Text(
                        "N° ${demande.number}",
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
                    color: _getStatusColor(demande.statut),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _getStatusIcon(demande.statut),
                        color: Colors.white,
                        size: 13.sp,
                      ),
                      SizedBox(width: 1.w),
                      Flexible(
                        child: Text(
                          displayStatus,
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
            Row(
              children: [
                Expanded(
                  child: Text(
                    "Émit le ${demande.dateCreation.day.toString().padLeft(2, '0')}/${demande.dateCreation.month.toString().padLeft(2, '0')}/${demande.dateCreation.year}",
                    style: GoogleFonts.poppins(
                      fontSize: 12.sp,
                      color: const Color.fromRGBO(67, 69, 69, 1),
                    ),
                  ),
                ),
                if (processDate != null)
                  Expanded(
                    child: Text(
                      "Traitée le ${processDate.day.toString().padLeft(2, '0')}/${processDate.month.toString().padLeft(2, '0')}/${processDate.year}",
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

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: Color(0xFF007AFF)),
          SizedBox(height: 2.h),
          Text(
            "Chargement des demandes...",
            style: GoogleFonts.poppins(
              fontSize: 14.sp,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_outlined, size: 50.sp, color: Colors.grey[400]),
          SizedBox(height: 2.h),
          Text(
            "Aucune demande trouvée",
            style: GoogleFonts.poppins(
              fontSize: 16.sp,
              color: Colors.grey[600],
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 1.h),
          Text(
            "Vos demandes d'approvisionnement apparaîtront ici",
            style: GoogleFonts.poppins(
              fontSize: 12.sp,
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
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
          _buildAppBar(),
          Expanded(
            child: _isLoading
                ? _buildLoadingState()
                : _demandes.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: EdgeInsets.symmetric(vertical: 2.h),
                        itemCount: _demandes.length,
                        itemBuilder: (context, index) {
                          return _buildRequestCard(_demandes[index]);
                        },
                      ),
          ),
        ],
      ),
    );
  }
}