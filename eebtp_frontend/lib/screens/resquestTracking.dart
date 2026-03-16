import 'package:eebtp_frontend/models/demande.dart';
import 'package:eebtp_frontend/models/utilisateur.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:eebtp_frontend/screens/RequestDetail.dart';
import 'package:eebtp_frontend/services/auth.dart';
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

  bool _hasPermissionError = false;
  String _permissionErrorMessage = '';

  bool _isCheckingRole = true;
  bool _isMagasinier = false;
  Utilisateur? _currentUser;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return; // ✅
      Provider.of<AuthProvider>(context, listen: false).checkTokenExpiry(context);
      _checkUserRole();
    });
  }

  Future<void> _checkUserRole() async {
    if (!mounted) return; // ✅

    final token = Provider.of<AuthProvider>(context, listen: false).token;
    if (token == null) {
      if (!mounted) return; // ✅
      setState(() => _isCheckingRole = false);
      return;
    }

    try {
      final userService = UserService();
      final user = await userService.getUserInfo(token);

      if (!mounted) return; // ✅ after first await
      setState(() => _currentUser = user);

      if (user.profil == null) {
        if (!mounted) return; // ✅
        setState(() {
          _isMagasinier = false;
          _isCheckingRole = false;
        });
        _showNotMagasinierDialog();
        return;
      }

      final profilDetail = await userService.getProfilDetail(user.profil!, token);

      if (!mounted) return; // ✅ after second await

      final libelle = profilDetail['libelle']?.toString().toLowerCase() ?? '';
      final isMagasinier = libelle == 'magasinier';

      setState(() {
        _isMagasinier = isMagasinier;
        _isCheckingRole = false;
      });

      if (!_isMagasinier) {
        _showNotMagasinierDialog();
      } else {
        _fetchDemandes();
      }
    } catch (e) {
      if (!mounted) return; // ✅ after catch

      setState(() {
        _isMagasinier = false;
        _isCheckingRole = false;
      });

      debugPrint("Erreur vérification rôle: $e");

      final errorString = e.toString();
      if (errorString.contains('permissions insuffisantes') ||
          errorString.contains('Accès refusé') ||
          errorString.contains('403')) {
        _showNotMagasinierDialog();
      } else {
        _fetchDemandes();
      }
    }
  }

  void _showNotMagasinierDialog() {
    if (!mounted) return; // ✅
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            children: [
              Icon(Icons.block, color: Color(0xFFFF5252), size: 28),
              SizedBox(width: 2.w),
              Expanded(
                child: Text(
                  "Accès non autorisé",
                  style: GoogleFonts.poppins(
                    fontSize: 17.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Seuls les magasiniers peuvent consulter le suivi des demandes d'approvisionnement.",
                style: GoogleFonts.poppins(
                  fontSize: 13.sp,
                  color: Colors.black87,
                  height: 1.4,
                ),
              ),
              SizedBox(height: 2.h),
              Container(
                padding: EdgeInsets.all(3.w),
                decoration: BoxDecoration(
                  color: Color.fromARGB(255, 253, 227, 227),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                      color: Color.fromARGB(255, 255, 0, 4).withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline,
                        color: Color.fromARGB(255, 255, 0, 0), size: 20),
                    SizedBox(width: 3.w),
                    Expanded(
                      child: Text(
                        "Contactez l'administrateur pour obtenir les privilèges de magasinier.",
                        style: GoogleFonts.poppins(
                          fontSize: 11.sp,
                          color: Color.fromARGB(255, 6, 6, 6),
                          height: 1.3,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).pop();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color.fromARGB(255, 255, 0, 0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                "Retour",
                style: GoogleFonts.poppins(
                  fontSize: 14.sp,
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _fetchDemandes() async {
    if (!mounted) return; // ✅

    final token = Provider.of<AuthProvider>(context, listen: false).token;
    if (token == null) {
      if (!mounted) return; // ✅
      setState(() => _isLoading = false);
      return;
    }

    try {
      final demandeService = DemandeService();
      final demandes = await demandeService.getDemandesEmises(token);

      if (!mounted) return; // ✅ after await

      setState(() {
        _demandes = demandes;
        _filteredDemandes = demandes;
        _isLoading = false;
        _hasPermissionError = false;
      });
    } catch (e) {
      if (!mounted) return; // ✅ after catch

      setState(() => _isLoading = false);
      debugPrint("Erreur chargement demandes: $e");

      final errorString = e.toString();
      if (errorString.contains('permissions insuffisantes') ||
          errorString.contains('Accès refusé') ||
          errorString.contains('403')) {
        setState(() {
          _hasPermissionError = true;
          _permissionErrorMessage =
              "Vous n'avez pas les permissions nécessaires pour accéder aux demandes. Contactez l'administrateur pour mettre à jour votre rôle.";
        });
        _showPermissionDialog();
      } else {
        _showToast(
            message: 'Erreur lors du chargement des demandes',
            type: ToastificationType.error);
      }
    }
  }

  Future<void> _refreshData() async {
    if (!mounted) return; // ✅
    setState(() {
      _isCheckingRole = true;
      _hasPermissionError = false;
    });
    await _checkUserRole();
  }

  void _showPermissionDialog() {
    if (!mounted) return; // ✅
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            children: [
              Icon(Icons.lock_outline, color: Color(0xFFFF9800), size: 28),
              SizedBox(width: 2.w),
              Expanded(
                child: Text(
                  "Accès restreint",
                  style: GoogleFonts.poppins(
                    fontSize: 17.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
              ),
            ],
          ),
          content: Text(
            "Vous n'avez pas les permissions nécessaires pour suivre vos demandes d'approvisionnement.\n\nVeuillez contacter l'administrateur pour mettre à jour votre rôle et obtenir les accès appropriés.",
            style: GoogleFonts.poppins(
              fontSize: 13.sp,
              color: Colors.black87,
              height: 1.4,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).pop();
              },
              child: Text(
                "Retour",
                style: GoogleFonts.poppins(
                  fontSize: 14.sp,
                  color: Colors.grey[600],
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF007AFF),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                "J'ai compris",
                style: GoogleFonts.poppins(
                  fontSize: 14.sp,
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  void _showToast(
      {required String message, required ToastificationType type}) {
    if (!mounted) return; // ✅
    toastification.show(
      context: context,
      type: type,
      style: ToastificationStyle.flatColored,
      title: Text(
          message,
          style: GoogleFonts.poppins(
              fontSize: 13.sp, fontWeight: FontWeight.w500)),
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
        return const Color.fromRGBO(38, 161, 90, 1);
      case 'confirmée':
      case 'approuvée':
        return const Color.fromRGBO(0, 122, 255, 1);
      case 'emise':
        return const Color.fromRGBO(218, 164, 0, 1);
      case 'rejetée':
        return const Color.fromRGBO(206, 0, 0, 1);
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
    if (demande.dateRejet != null) return demande.dateRejet;
    if (demande.dateValidation != null) return demande.dateValidation;
    if (demande.dateApprobation != null) return demande.dateApprobation;
    if (demande.dateConfirmation != null) return demande.dateConfirmation;
    return null;
  }

  void _navigateToRequestDetail(Demande demande) {
    if (!mounted) return; // ✅
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
                child: Icon(Icons.arrow_back_ios_new,
                    color: Color(0xFF007AFF), size: 18.sp),
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
                    constraints:
                        const BoxConstraints(minWidth: 19, minHeight: 19),
                    child: Text(
                      "3",
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: 13.sp,
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
                          color: const Color.fromRGBO(13, 13, 13, 1),
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
                  padding:
                      EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.8.h),
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
            _isCheckingRole
                ? "Vérification des permissions..."
                : "Chargement des demandes...",
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
    Widget content;

    if (!_isMagasinier && !_isCheckingRole) {
      content = Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: EdgeInsets.all(4.w),
            decoration: BoxDecoration(
              color: Color(0xFFFFEBEE),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.block, size: 50.sp, color: Color(0xFFFF5252)),
          ),
          SizedBox(height: 3.h),
          Text(
            "Accès non autorisé",
            style: GoogleFonts.poppins(
              fontSize: 18.sp,
              color: Colors.black87,
              fontWeight: FontWeight.w700,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 1.5.h),
          Text(
            "Seuls les magasiniers peuvent consulter le suivi des demandes d'approvisionnement.",
            style: GoogleFonts.poppins(
              fontSize: 14.sp,
              color: Colors.grey[700],
              height: 1.4,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 2.h),
          Container(
            padding: EdgeInsets.all(3.w),
            decoration: BoxDecoration(
              color: Color.fromARGB(255, 253, 227, 227),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                  color: Color.fromARGB(255, 255, 0, 0).withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline,
                    color: Color.fromARGB(255, 255, 0, 0), size: 24),
                SizedBox(width: 3.w),
                Expanded(
                  child: Text(
                    "Contactez l'administrateur pour obtenir les privilèges de magasinier.",
                    style: GoogleFonts.poppins(
                      fontSize: 12.sp,
                      color: Color.fromARGB(255, 8, 8, 8),
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 4.h),
          ElevatedButton.icon(
            onPressed: () => Navigator.of(context).pop(),
            icon: Icon(Icons.arrow_back, size: 20),
            label: Text(
              "Retour",
              style: GoogleFonts.poppins(
                  fontSize: 14.sp, fontWeight: FontWeight.w500),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Color(0xFF007AFF),
              foregroundColor: Colors.white,
              padding:
                  EdgeInsets.symmetric(horizontal: 8.w, vertical: 1.8.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      );
    } else if (_hasPermissionError) {
      content = Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: EdgeInsets.all(4.w),
            decoration: BoxDecoration(
              color: Color(0xFFFFF3E0),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.lock_outline,
                size: 50.sp, color: Color(0xFFFF9800)),
          ),
          SizedBox(height: 3.h),
          Text(
            "Accès restreint",
            style: GoogleFonts.poppins(
              fontSize: 18.sp,
              color: Colors.black87,
              fontWeight: FontWeight.w700,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 1.5.h),
          Text(
            "Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.",
            style: GoogleFonts.poppins(
              fontSize: 14.sp,
              color: Colors.grey[700],
              height: 1.4,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 2.h),
          Container(
            padding: EdgeInsets.all(3.w),
            decoration: BoxDecoration(
              color: Color(0xFFE3F2FD),
              borderRadius: BorderRadius.circular(12),
              border:
                  Border.all(color: Color(0xFF007AFF).withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline,
                    color: Color(0xFF007AFF), size: 24),
                SizedBox(width: 3.w),
                Expanded(
                  child: Text(
                    "Contactez l'administrateur pour mettre à jour votre rôle et obtenir les accès appropriés.",
                    style: GoogleFonts.poppins(
                      fontSize: 12.sp,
                      color: Color(0xFF1565C0),
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 4.h),
          ElevatedButton.icon(
            onPressed: () => Navigator.of(context).pop(),
            icon: Icon(Icons.arrow_back, size: 20),
            label: Text(
              "Retour",
              style: GoogleFonts.poppins(
                  fontSize: 14.sp, fontWeight: FontWeight.w500),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Color(0xFF007AFF),
              foregroundColor: Colors.white,
              padding:
                  EdgeInsets.symmetric(horizontal: 8.w, vertical: 1.8.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      );
    } else {
      content = Column(
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
      );
    }

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(height: 20.h),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 8.w),
          child: content,
        ),
      ],
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
            child: (_isLoading || _isCheckingRole)
                ? _buildLoadingState()
                : RefreshIndicator(
                    onRefresh: _refreshData,
                    color: const Color(0xFF007AFF),
                    backgroundColor: Colors.white,
                    displacement: 40,
                    strokeWidth: 2.5,
                    child: (!_isMagasinier || _demandes.isEmpty)
                        ? _buildEmptyState()
                        : ListView.builder(
                            padding: EdgeInsets.symmetric(vertical: 2.h),
                            physics: const AlwaysScrollableScrollPhysics(),
                            itemCount: _demandes.length,
                            itemBuilder: (context, index) {
                              return _buildRequestCard(_demandes[index]);
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }
}