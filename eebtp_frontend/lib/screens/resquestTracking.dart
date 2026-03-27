import 'package:eebtp_frontend/models/demande.dart';
import 'package:eebtp_frontend/models/utilisateur.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:eebtp_frontend/screens/RequestDetail.dart';
import 'package:eebtp_frontend/services/auth.dart';
import 'package:eebtp_frontend/services/demandeService.dart';
import 'package:eebtp_frontend/services/notification_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:sizer/sizer.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:toastification/toastification.dart';

// ─── Palette ──────────────────────────────────────────────────────────────────
const Color _blue   = Color(0xFF007AFF);
const Color _green  = Color(0xFF26A15A);
const Color _amber  = Color(0xFFDAA400);
const Color _red    = Color(0xFFCE0000);
const Color _bgPage = Color(0xFFF2F5FB);
const Color _onSurf = Color(0xFF0D0F12);
const Color _hint   = Color(0xFF8A94A6);

// ─── Helpers statut ───────────────────────────────────────────────────────────
String _norm(String s) => s
    .toLowerCase()
    .replaceAll('é','e').replaceAll('è','e').replaceAll('ê','e').replaceAll('ë','e')
    .replaceAll('à','a').replaceAll('â','a').replaceAll('ä','a')
    .replaceAll('î','i').replaceAll('ï','i')
    .replaceAll('ô','o').replaceAll('ö','o')
    .replaceAll('û','u').replaceAll('ù','u').replaceAll('ü','u')
    .trim();

Color _statusColor(String s) {
  switch (_norm(s)) {
    case 'validee': case 'livree':      return _green;
    case 'confirmee': case 'approuvee': return _blue;
    case 'emise':                       return _amber;
    case 'rejetee':                     return _red;
    default:                            return _hint;
  }
}

IconData _statusIcon(String s) {
  switch (_norm(s)) {
    case 'validee': case 'livree':  return Icons.check_circle_rounded;
    case 'confirmee':               return Icons.verified_rounded;
    case 'approuvee':               return Icons.thumb_up_rounded;
    case 'emise':                   return Icons.schedule_rounded;
    case 'rejetee':                 return Icons.do_disturb_on_rounded;
    default:                        return Icons.help_outline_rounded;
  }
}

String _displayStatus(String s) {
  switch (_norm(s)) {
    case 'emise':     return 'Emise';
    case 'confirmee': return 'Confirmée';
    case 'approuvee': return 'Approuvée';
    case 'validee':   return 'Validée';
    case 'rejetee':   return 'Rejetée';
    case 'livree':    return 'Livrée';
    default:          return s;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
class RequestsTrackingScreen extends StatefulWidget {
  const RequestsTrackingScreen({super.key});
  @override
  State<RequestsTrackingScreen> createState() => _RequestsTrackingScreenState();
}

class _RequestsTrackingScreenState extends State<RequestsTrackingScreen> {
  List<Demande> _demandes = [];
  bool _isLoading = true;
  bool _hasPermissionError = false;
  bool _isCheckingRole = true;
  bool _isMagasinier = false;
  Utilisateur? _currentUser;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Provider.of<AuthProvider>(context, listen: false).checkTokenExpiry(context);
      _checkUserRole();
      _fetchUnreadCount();
    });
    
  }
int _unreadNotifCount = 0;

Future<void> _fetchUnreadCount() async {
  final token = Provider.of<AuthProvider>(context, listen: false).token;
  if (token == null) return;
  try {
    final data = await NotificationService(token: token).getNotificationsByUser();
    if (!mounted) return;
    setState(() {
      _unreadNotifCount = data.where((n) => !n.isRead).length;
    });
  } catch (e) {
    debugPrint('Erreur fetch unread count: $e');
  }
}
  Future<void> _checkUserRole() async {
    if (!mounted) return;
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    if (token == null) { setState(() => _isCheckingRole = false); return; }
    try {
      final userService = UserService();
      final user = await userService.getUserInfo(token);
      if (!mounted) return;
      setState(() => _currentUser = user);
      if (user.profil == null) {
        setState(() { _isMagasinier = false; _isCheckingRole = false; });
        _showNotMagasinierDialog(); return;
      }
      final profilDetail = await userService.getProfilDetail(user.profil!, token);
      if (!mounted) return;
      final isMag = profilDetail['libelle']?.toString().toLowerCase() == 'magasinier';
      setState(() { _isMagasinier = isMag; _isCheckingRole = false; });
      if (!_isMagasinier) _showNotMagasinierDialog(); else _fetchDemandes();
    } catch (e) {
      if (!mounted) return;
      setState(() { _isMagasinier = false; _isCheckingRole = false; });
      final s = e.toString();
      if (s.contains('403') || s.contains('Accès refusé') || s.contains('permissions insuffisantes'))
        _showNotMagasinierDialog();
      else _fetchDemandes();
    }
  }

  Future<void> _fetchDemandes() async {
    if (!mounted) return;
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    if (token == null) { setState(() => _isLoading = false); return; }
    try {
      final demandes = await DemandeService().getToutesDemandesMagasinier(token);
      if (!mounted) return;
      setState(() { _demandes = demandes; _isLoading = false; _hasPermissionError = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      final s = e.toString();
      if (s.contains('403') || s.contains('Accès refusé') || s.contains('permissions insuffisantes')) {
        setState(() => _hasPermissionError = true);
        _showPermissionDialog();
      } else {
        _showToast('Erreur lors du chargement des demandes', ToastificationType.error);
      }
    }
  }

  Future<void> _refreshData() async {
    if (!mounted) return;
    setState(() { _isCheckingRole = true; _hasPermissionError = false; });
    await _checkUserRole();
  }

  // ─── Dialogs ──────────────────────────────────────────────────────────────────
  void _showNotMagasinierDialog() {
    if (!mounted) return;
    showDialog(
      context: context, barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(children: [
            Icon(Icons.block, color: Color(0xFFFF5252), size: 28),
            SizedBox(width: 2.w),
            Expanded(child: Text("Accès non autorisé",
                style: GoogleFonts.poppins(fontSize: 17.sp, fontWeight: FontWeight.w600, color: Colors.black87))),
          ]),
          content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text("Seuls les magasiniers peuvent consulter le suivi des demandes d'approvisionnement.",
                style: GoogleFonts.poppins(fontSize: 13.sp, color: Colors.black87, height: 1.4)),
            SizedBox(height: 2.h),
            Container(
              padding: EdgeInsets.all(3.w),
              decoration: BoxDecoration(
                color: Color.fromARGB(255, 253, 227, 227),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Color.fromARGB(255, 255, 0, 4).withOpacity(0.3)),
              ),
              child: Row(children: [
                Icon(Icons.info_outline, color: Color.fromARGB(255, 255, 0, 0), size: 20),
                SizedBox(width: 3.w),
                Expanded(child: Text("Contactez l'administrateur pour obtenir les privilèges de magasinier.",
                    style: GoogleFonts.poppins(fontSize: 11.sp, color: Color.fromARGB(255, 6, 6, 6), height: 1.3))),
              ]),
            ),
          ]),
          actions: [
            ElevatedButton(
              onPressed: () { Navigator.of(context).pop(); Navigator.of(context).pop(); },
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color.fromARGB(255, 255, 0, 0),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
              child: Text("Retour", style: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.white, fontWeight: FontWeight.w500)),
            ),
          ],
        );
      },
    );
  }

  void _showPermissionDialog() {
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(children: [
            Icon(Icons.lock_outline, color: Color(0xFFFF9800), size: 28),
            SizedBox(width: 2.w),
            Expanded(child: Text("Accès restreint",
                style: GoogleFonts.poppins(fontSize: 17.sp, fontWeight: FontWeight.w600, color: Colors.black87))),
          ]),
          content: Text(
            "Vous n'avez pas les permissions nécessaires pour suivre vos demandes d'approvisionnement.\n\nVeuillez contacter l'administrateur.",
            style: GoogleFonts.poppins(fontSize: 13.sp, color: Colors.black87, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () { Navigator.of(context).pop(); Navigator.of(context).pop(); },
              child: Text("Retour", style: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.grey[600])),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF007AFF),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
              child: Text("J'ai compris", style: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.white, fontWeight: FontWeight.w500)),
            ),
          ],
        );
      },
    );
  }

  void _showToast(String message, ToastificationType type) {
    if (!mounted) return;
    toastification.show(
      context: context, type: type,
      style: ToastificationStyle.flatColored,
      title: Text(message, style: GoogleFonts.poppins(fontSize: 13.sp, fontWeight: FontWeight.w500)),
      autoCloseDuration: const Duration(seconds: 4),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 300),
      borderRadius: BorderRadius.circular(12),
      showProgressBar: true, closeOnClick: false, pauseOnHover: true,
      dragToClose: true, applyBlurEffect: true,
    );
  }

  // ─── Modal de modification ────────────────────────────────────────────────────
  void _showEditModal(Demande demande) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _EditDemandeModal(
        demande: demande,
        onSuccess: (Demande updated) {
          // Mise à jour locale sans re-fetch réseau
          setState(() {
            final idx = _demandes.indexWhere((d) => d.id == updated.id);
            if (idx != -1) _demandes[idx] = updated;
          });
          _showToast('Demande resoumise avec succès', ToastificationType.success);
        },
      ),
    );
  }

  // ─── AppBar ───────────────────────────────────────────────────────────────────
  Widget _buildAppBar() {
    return SafeArea(
      bottom: false,
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.only(left: 5.w, right: 5.w, top: 2.h, bottom: 2.h),
        decoration: BoxDecoration(
          color: const Color(0xFF007AFF),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 14, offset: const Offset(0, 2))],
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(Icons.arrow_back_ios_new, color: Color(0xFF007AFF), size: 18.sp),
            ),
          ),
          SizedBox(width: 3.w),
          Expanded(child: Text("Mes demandes", maxLines: 2, overflow: TextOverflow.ellipsis,
              style: GoogleFonts.poppins(fontSize: 16.sp, color: Colors.white, fontWeight: FontWeight.w600, height: 1.1))),
          Stack(children: [
            Container(
              padding: EdgeInsets.all(2.2.w),
              decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
              child: Icon(Icons.notifications_outlined, size: 6.5.w, color: Color(0xFF007AFF)),
            ),
            if (_unreadNotifCount > 0)
  Positioned(
    right: 0,
    top: 0,
    child: Container(
      padding: EdgeInsets.all(5),
      decoration: const BoxDecoration(
        color: Colors.red,
        shape: BoxShape.circle,
      ),
      child: Text(
        '$_unreadNotifCount',
        style: TextStyle(
          color: Colors.white,
          fontSize: 14.sp,
          fontWeight: FontWeight.bold,
        ),
      ),
    ),
  ),
          ]),
        ]),
      ),
    );
  }

  // ─── Card ─────────────────────────────────────────────────────────────────────
  Widget _buildCard(Demande demande) {
    final isRejected = _norm(demande.statut) == 'rejetee';
    final color      = _statusColor(demande.statut);
    final label      = _displayStatus(demande.statut);

    final dc = demande.dateCreation;
    final dateStr = "${dc.day.toString().padLeft(2,'0')}/${dc.month.toString().padLeft(2,'0')}/${dc.year}";

    DateTime? processDate;
    if (demande.dateRejet != null)          processDate = demande.dateRejet;
    else if (demande.dateValidation != null) processDate = demande.dateValidation;
    else if (demande.dateApprobation != null) processDate = demande.dateApprobation;
    else if (demande.dateConfirmation != null) processDate = demande.dateConfirmation;

    final card = Padding(
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 0.9.h),
      child: GestureDetector(
        onTap: () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => RequestDetailScreen(demande: demande))),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(color: color.withOpacity(0.08), blurRadius: 18, spreadRadius: 0, offset: const Offset(0, 6)),
              BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 3, offset: const Offset(0, 1)),
            ],
          ),
          child: Stack(children: [
            // Pastille colorée haut droite
            Positioned(top: 0, right: 0,
              child: Container(
                width: 80, height: 80,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.08),
                  borderRadius: const BorderRadius.only(
                    topRight: Radius.circular(20),
                    bottomLeft: Radius.circular(60),
                  ),
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(4.w),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                // Ligne 1 : icône + nom + pill statut
                Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.10),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.inventory_2_outlined, color: color, size: 20),
                  ),
                  SizedBox(width: 3.w),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(demande.stockItemName,
                        style: GoogleFonts.poppins(fontSize: 14.sp, fontWeight: FontWeight.w700,
                            color: _onSurf, letterSpacing: -0.2),
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    SizedBox(height: 0.3.h),
                    Text("N° ${demande.number}",
                        style: GoogleFonts.poppins(fontSize: 11.sp, color: _hint)),
                  ])),
                  SizedBox(width: 2.w),
                  // Pill statut
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.10),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: color.withOpacity(0.25), width: 1),
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      if (isRejected)
                        Stack(alignment: Alignment.center, children: [
                          Icon(Icons.circle, color: color, size: 11),
                          const Icon(Icons.close_rounded, color: Colors.white, size: 7),
                        ])
                      else
                        Icon(_statusIcon(demande.statut), color: color, size: 11),
                      const SizedBox(width: 4),
                      Text(label,
                          style: GoogleFonts.poppins(fontSize: 10.sp, color: color, fontWeight: FontWeight.w700)),
                    ]),
                  ),
                ]),

                SizedBox(height: 2.h),
                _DashedDivider(color: Colors.grey[200]!),
                SizedBox(height: 1.5.h),

                // Ligne 2 : magasin + dates
                Row(children: [
                  Icon(Icons.store_mall_directory_outlined, size: 12.sp, color: _hint),
                  SizedBox(width: 1.w),
                  Expanded(child: Text(demande.magasinName,
                      style: GoogleFonts.poppins(fontSize: 11.sp, color: _hint),
                      overflow: TextOverflow.ellipsis)),
                  Row(children: [
                    Icon(Icons.calendar_today_outlined, size: 11.sp, color: _hint),
                    SizedBox(width: 1.w),
                    Text(dateStr, style: GoogleFonts.poppins(fontSize: 11.sp, color: _hint)),
                    if (processDate != null) ...[
                      Text("  →  ", style: GoogleFonts.poppins(fontSize: 11.sp, color: _hint)),
                      Text(
                        "${processDate.day.toString().padLeft(2,'0')}/${processDate.month.toString().padLeft(2,'0')}/${processDate.year}",
                        style: GoogleFonts.poppins(fontSize: 11.sp, color: color, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ]),
                ]),
              ]),
            ),
          ]),
        ),
      ),
    );

    if (!isRejected) return card;

    // Bouton modifier 3D pour les demandes rejetées
    return Stack(clipBehavior: Clip.none, children: [
      card,
      Positioned(
        top: 0, right: 5.w,
        child: GestureDetector(
          onTap: () => _showEditModal(demande),
          child: Container(
            width: 34, height: 34,
            decoration: BoxDecoration(
              color: _red, shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: _red.withOpacity(0.45), blurRadius: 10, offset: const Offset(0, 5)),
                BoxShadow(color: _red.withOpacity(0.12), blurRadius: 2, offset: const Offset(0, 1)),
              ],
            ),
            child: const Icon(Icons.edit_rounded, color: Colors.white, size: 16),
          ),
        ),
      ),
    ]);
  }

  // ─── États ────────────────────────────────────────────────────────────────────
  Widget _buildLoadingState() {
    return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      CircularProgressIndicator(color: Color(0xFF007AFF)),
      SizedBox(height: 2.h),
      Text(_isCheckingRole ? "Vérification des permissions..." : "Chargement des demandes...",
          style: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.grey[600])),
    ]));
  }

  Widget _buildEmptyState() {
    Widget content;

    if (!_isMagasinier && !_isCheckingRole) {
      content = Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Container(padding: EdgeInsets.all(4.w),
            decoration: BoxDecoration(color: Color(0xFFFFEBEE), shape: BoxShape.circle),
            child: Icon(Icons.block, size: 50.sp, color: Color(0xFFFF5252))),
        SizedBox(height: 3.h),
        Text("Accès non autorisé",
            style: GoogleFonts.poppins(fontSize: 18.sp, color: Colors.black87, fontWeight: FontWeight.w700),
            textAlign: TextAlign.center),
        SizedBox(height: 1.5.h),
        Text("Seuls les magasiniers peuvent consulter le suivi des demandes d'approvisionnement.",
            style: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.grey[700], height: 1.4),
            textAlign: TextAlign.center),
        SizedBox(height: 4.h),
        ElevatedButton.icon(
          onPressed: () => Navigator.of(context).pop(),
          icon: Icon(Icons.arrow_back, size: 20),
          label: Text("Retour", style: GoogleFonts.poppins(fontSize: 14.sp, fontWeight: FontWeight.w500)),
          style: ElevatedButton.styleFrom(backgroundColor: Color(0xFF007AFF), foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 1.8.h),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
        ),
      ]);
    } else if (_hasPermissionError) {
      content = Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Container(padding: EdgeInsets.all(4.w),
            decoration: BoxDecoration(color: Color(0xFFFFF3E0), shape: BoxShape.circle),
            child: Icon(Icons.lock_outline, size: 50.sp, color: Color(0xFFFF9800))),
        SizedBox(height: 3.h),
        Text("Accès restreint",
            style: GoogleFonts.poppins(fontSize: 18.sp, color: Colors.black87, fontWeight: FontWeight.w700),
            textAlign: TextAlign.center),
        SizedBox(height: 4.h),
        ElevatedButton.icon(
          onPressed: () => Navigator.of(context).pop(),
          icon: Icon(Icons.arrow_back, size: 20),
          label: Text("Retour", style: GoogleFonts.poppins(fontSize: 14.sp, fontWeight: FontWeight.w500)),
          style: ElevatedButton.styleFrom(backgroundColor: Color(0xFF007AFF), foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 1.8.h),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
        ),
      ]);
    } else {
      content = Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.inbox_outlined, size: 50.sp, color: Colors.grey[400]),
        SizedBox(height: 2.h),
        Text("Aucune demande trouvée",
            style: GoogleFonts.poppins(fontSize: 16.sp, color: Colors.grey[600], fontWeight: FontWeight.w600)),
        SizedBox(height: 1.h),
        Text("Vos demandes d'approvisionnement apparaîtront ici",
            style: GoogleFonts.poppins(fontSize: 12.sp, color: Colors.grey[500]), textAlign: TextAlign.center),
      ]);
    }

    return ListView(physics: const AlwaysScrollableScrollPhysics(), children: [
      SizedBox(height: 20.h),
      Padding(padding: EdgeInsets.symmetric(horizontal: 8.w), child: content),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      initialIndex: 2,
      body: Container(
        color: _bgPage,
        child: Column(children: [
          _buildAppBar(),
          Expanded(
            child: (_isLoading || _isCheckingRole)
                ? _buildLoadingState()
                : RefreshIndicator(
                    onRefresh: _refreshData,
                    color: const Color(0xFF007AFF),
                    backgroundColor: Colors.white,
                    displacement: 40, strokeWidth: 2.5,
                    child: (!_isMagasinier || _demandes.isEmpty)
                        ? _buildEmptyState()
                        : ListView.builder(
                            padding: EdgeInsets.only(top: 1.5.h, bottom: 6.h),
                            physics: const AlwaysScrollableScrollPhysics(),
                            itemCount: _demandes.length,
                            itemBuilder: (_, i) => _buildCard(_demandes[i]),
                          ),
                  ),
          ),
        ]),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Séparateur pointillé
// ─────────────────────────────────────────────────────────────────────────────
class _DashedDivider extends StatelessWidget {
  final Color color;
  const _DashedDivider({required this.color});
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (_, constraints) {
      const dashW = 4.0, gap = 4.0;
      final count = (constraints.maxWidth / (dashW + gap)).floor();
      return Row(children: List.generate(count, (_) =>
          Container(width: dashW, height: 1, margin: const EdgeInsets.only(right: gap), color: color)));
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal de modification
// ─────────────────────────────────────────────────────────────────────────────
class _EditDemandeModal extends StatefulWidget {
  final Demande demande;
  // Callback avec la Demande mise à jour (statut forcé "Emise" côté client)
  final void Function(Demande updated) onSuccess;

  const _EditDemandeModal({required this.demande, required this.onSuccess});

  @override
  State<_EditDemandeModal> createState() => _EditDemandeModalState();
}

class _EditDemandeModalState extends State<_EditDemandeModal> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _quantiteCtrl;
  late TextEditingController _raisonCtrl;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _quantiteCtrl = TextEditingController(text: widget.demande.quantiteDem.toString());
    _raisonCtrl   = TextEditingController(text: widget.demande.raison);
  }

  @override
  void dispose() {
    _quantiteCtrl.dispose(); _raisonCtrl.dispose(); super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);
    try {
      final token = Provider.of<AuthProvider>(context, listen: false).token;
      if (token == null) throw Exception('Token manquant');

      // updateDemandeRejetee retourne une Demande avec statut forcé "Emise"
      final updated = await DemandeService().updateDemandeRejetee(
        id:          widget.demande.id,
        quantiteDem: int.parse(_quantiteCtrl.text.trim()),
        raison:      _raisonCtrl.text.trim(),
        stockItem:   widget.demande.stockItem,
        magasin:     widget.demande.magasin,
        token:       token,
      );

      if (!mounted) return;
      Navigator.of(context).pop();
      widget.onSuccess(updated);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(e.toString().replaceAll('Exception: ', ''),
            style: GoogleFonts.poppins(fontSize: 13.sp)),
        backgroundColor: _red, behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      ));
    }
  }

  InputDecoration _dec({
    required String hint,
    required IconData icon,
    String? suffix,
    bool multiline = false,
  }) =>
      InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.poppins(fontSize: 13.sp, color: Colors.grey[400]),
        prefixIcon: multiline
            ? Padding(padding: const EdgeInsets.only(bottom: 44), child: Icon(icon, color: _blue, size: 20))
            : Icon(icon, color: _blue, size: 20),
        suffixText: suffix,
        suffixStyle: GoogleFonts.poppins(fontSize: 12.sp, color: _hint),
        filled: true, fillColor: _bgPage,
        contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.8.h),
        border:             OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey[200]!)),
        enabledBorder:      OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey[200]!)),
        focusedBorder:      OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: _blue, width: 1.5)),
        errorBorder:        OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: _red)),
        focusedErrorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: _red, width: 1.5)),
      );

  Widget _commentBubble({
    required String label,
    required String? value,
    required Color color,
    required IconData icon,
  }) {
    if (value == null || value.trim().isEmpty) return const SizedBox.shrink();
    return Container(
      margin: EdgeInsets.only(bottom: 1.5.h),
      padding: EdgeInsets.all(3.5.w),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.18)),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(width: 30, height: 30,
            decoration: BoxDecoration(color: color.withOpacity(0.12), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 15)),
        SizedBox(width: 3.w),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: GoogleFonts.poppins(fontSize: 9.sp, color: color,
              fontWeight: FontWeight.w800, letterSpacing: 0.5)),
          SizedBox(height: 0.3.h),
          Text(value, style: GoogleFonts.poppins(fontSize: 13.sp, color: _onSurf, height: 1.4)),
        ])),
      ]),
    );
  }

  @override
  Widget build(BuildContext context) {
    final d = widget.demande;
    final hasComments = (d.commentaireConfirmation?.isNotEmpty == true) ||
        (d.commentaireApprobation?.isNotEmpty == true) ||
        (d.commentaireValidation?.isNotEmpty == true);

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: EdgeInsets.fromLTRB(5.w, 1.5.h, 5.w, 3.h),
            child: Form(
              key: _formKey,
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

                // Poignée
                Center(child: Container(width: 40, height: 4,
                    margin: EdgeInsets.only(bottom: 2.h),
                    decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(2)))),

                // En-tête
                Row(children: [
                  Container(width: 44, height: 44,
                      decoration: BoxDecoration(
                          color: _red.withOpacity(0.10), borderRadius: BorderRadius.circular(12)),
                      child: const Icon(Icons.edit_rounded, color: _red, size: 22)),
                  SizedBox(width: 3.w),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text("Modifier la demande",
                        style: GoogleFonts.poppins(fontSize: 16.sp, fontWeight: FontWeight.w700,
                            color: _onSurf, letterSpacing: -0.3)),
                    Text("${d.number} • ${d.stockItemName}",
                        style: GoogleFonts.poppins(fontSize: 11.sp, color: _hint),
                        overflow: TextOverflow.ellipsis),
                  ])),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: _red.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: _red.withOpacity(0.2)),
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Stack(alignment: Alignment.center, children: [
                        Icon(Icons.circle, color: _red, size: 11),
                        const Icon(Icons.close_rounded, color: Colors.white, size: 7),
                      ]),
                      const SizedBox(width: 4),
                      Text("Rejetée", style: GoogleFonts.poppins(
                          fontSize: 10.sp, color: _red, fontWeight: FontWeight.w700)),
                    ]),
                  ),
                ]),

                SizedBox(height: 2.h),
                Divider(color: Colors.grey[100]),
                SizedBox(height: 2.h),

                // Commentaires reçus
                if (hasComments) ...[
                  Row(children: [
                    Icon(Icons.forum_outlined, size: 14.sp, color: _hint),
                    SizedBox(width: 1.5.w),
                    Text("Commentaires reçus",
                        style: GoogleFonts.poppins(fontSize: 12.sp, fontWeight: FontWeight.w700, color: _onSurf)),
                  ]),
                  SizedBox(height: 1.2.h),
                  _commentBubble(label: "CONFIRMATION", value: d.commentaireConfirmation,
                      color: _blue, icon: Icons.verified_rounded),
                  _commentBubble(label: "APPROBATION", value: d.commentaireApprobation,
                      color: _green, icon: Icons.thumb_up_rounded),
                  _commentBubble(label: "VALIDATION", value: d.commentaireValidation,
                      color: _green, icon: Icons.check_circle_rounded),
                  SizedBox(height: 1.h),
                  Divider(color: Colors.grey[100]),
                  SizedBox(height: 2.h),
                ],

                // Champs
                Row(children: [
                  Icon(Icons.edit_note_rounded, size: 14.sp, color: _hint),
                  SizedBox(width: 1.5.w),
                  Text("Votre correction",
                      style: GoogleFonts.poppins(fontSize: 12.sp, fontWeight: FontWeight.w700, color: _onSurf)),
                ]),
                SizedBox(height: 1.5.h),

                Text("Quantité",
                    style: GoogleFonts.poppins(fontSize: 12.sp, fontWeight: FontWeight.w600, color: _onSurf)),
                SizedBox(height: 0.8.h),
                TextFormField(
                  controller: _quantiteCtrl,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  style: GoogleFonts.poppins(fontSize: 14.sp, color: _onSurf, fontWeight: FontWeight.w500),
                  decoration: _dec(
                    hint: "Ex : 10", icon: Icons.scale_rounded,
                    suffix: d.stockItemUnite.isNotEmpty ? d.stockItemUnite : "unités",
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'La quantité est obligatoire';
                    final n = int.tryParse(v.trim());
                    if (n == null || n <= 0) return 'Entrez un nombre valide > 0';
                    return null;
                  },
                ),

                SizedBox(height: 1.8.h),

                Text("Raison",
                    style: GoogleFonts.poppins(fontSize: 12.sp, fontWeight: FontWeight.w600, color: _onSurf)),
                SizedBox(height: 0.8.h),
                TextFormField(
                  controller: _raisonCtrl, maxLines: 3,
                  style: GoogleFonts.poppins(fontSize: 13.sp, color: _onSurf),
                  decoration: _dec(hint: "Expliquez la raison...", icon: Icons.notes_rounded, multiline: true),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'La raison est obligatoire';
                    if (v.trim().length < 5) return 'Min. 5 caractères';
                    return null;
                  },
                ),

                SizedBox(height: 3.h),

                Row(children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
                      style: OutlinedButton.styleFrom(
                          padding: EdgeInsets.symmetric(vertical: 1.8.h),
                          side: BorderSide(color: Colors.grey[300]!),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                      child: Text("Annuler",
                          style: GoogleFonts.poppins(fontSize: 14.sp, color: _hint, fontWeight: FontWeight.w500)),
                    ),
                  ),
                  SizedBox(width: 3.w),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submit,
                      style: ElevatedButton.styleFrom(
                          backgroundColor: _blue, foregroundColor: Colors.white, elevation: 0,
                          padding: EdgeInsets.symmetric(vertical: 1.8.h),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                      child: _isSubmitting
                          ? const SizedBox(width: 20, height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                              const Icon(Icons.send_rounded, size: 16),
                              SizedBox(width: 2.w),
                              Text("Resoumettre",
                                  style: GoogleFonts.poppins(fontSize: 14.sp, fontWeight: FontWeight.w600)),
                            ]),
                    ),
                  ),
                ]),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}