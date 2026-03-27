import 'package:eebtp_frontend/models/demande.dart';
import 'package:eebtp_frontend/services/demandeService.dart';
import 'package:eebtp_frontend/services/notification_service.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:sizer/sizer.dart';
import '../providers/auth_provider.dart';

// ─── Palette alignée sur RequestsTrackingScreen ───────────────────────────────
const Color _blue = Color(0xFF007AFF);
const Color _green = Color(0xFF26A15A);
const Color _amber = Color(0xFFDAA400);
const Color _red = Color(0xFFCE0000);
const Color _bgPage = Color(0xFFF2F5FB);
const Color _onSurf = Color(0xFF0D0F12);
const Color _hint = Color(0xFF8A94A6);

class RequestDetailScreen extends StatefulWidget {
  final Demande demande;
  const RequestDetailScreen({Key? key, required this.demande})
    : super(key: key);

  @override
  State<RequestDetailScreen> createState() => _RequestDetailScreenState();
}

class _RequestDetailScreenState extends State<RequestDetailScreen> {
  late Demande _demande;
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
  @override
  void initState() {
    super.initState();
    _demande = widget.demande;
    _fetchUnreadCount();
  }

  // ─── Normalisation ────────────────────────────────────────────────────────────
  String _norm(String s) => s
      .toLowerCase()
      .replaceAll('é', 'e')
      .replaceAll('è', 'e')
      .replaceAll('ê', 'e')
      .replaceAll('ë', 'e')
      .replaceAll('à', 'a')
      .replaceAll('â', 'a')
      .replaceAll('ä', 'a')
      .replaceAll('î', 'i')
      .replaceAll('ï', 'i')
      .replaceAll('ô', 'o')
      .replaceAll('ö', 'o')
      .replaceAll('û', 'u')
      .replaceAll('ù', 'u')
      .replaceAll('ü', 'u')
      .trim();

  Color _statusColor(String s) {
    switch (_norm(s)) {
      case 'validee':
      case 'livree':
        return _green;
      case 'confirmee':
      case 'approuvee':
        return _blue;
      case 'emise':
        return _amber;
      case 'rejetee':
        return _red;
      default:
        return _hint;
    }
  }

  IconData _statusIcon(String s) {
    switch (_norm(s)) {
      case 'validee':
      case 'livree':
        return Icons.check_circle_rounded;
      case 'confirmee':
        return Icons.verified_rounded;
      case 'approuvee':
        return Icons.thumb_up_rounded;
      case 'emise':
        return Icons.schedule_rounded;
      case 'rejetee':
        return Icons.do_disturb_on_rounded;
      default:
        return Icons.help_outline_rounded;
    }
  }

  String _displayStatus(String s) {
    switch (_norm(s)) {
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
        return s;
    }
  }

  bool get _isRejected => _norm(_demande.statut) == 'rejetee';

  // La demande a déjà été rejetée si elle a une date de rejet,
  // même si elle a été resoumise (statut emise maintenant)
  bool get _wasRejected =>
      _demande.dateRejet != null || _norm(_demande.statut) == 'rejetee';

  // ─── Ouvre le modal de modification (même que RequestsTrackingScreen) ─────────
  void _showEditModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _EditDemandeModal(
        demande: _demande,
        onSuccess: (updatedDemande) {
          // Après modification, on met à jour localement
          // Le statut rejeté devient "emise" côté API
          setState(() {
            // On reconstruit la demande avec le nouveau statut
            // (l'API retourne la demande mise à jour)
            _demande = updatedDemande;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                "Demande resoumise avec succès",
                style: GoogleFonts.poppins(fontSize: 13.sp),
              ),
              backgroundColor: _green,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              margin: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
            ),
          );
        },
      ),
    );
  }

  // ─── AppBar identique à RequestsTrackingScreen ────────────────────────────────
  Widget _buildAppBar() {
    return SafeArea(
      bottom: false,
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.only(left: 5.w, right: 5.w, top: 2.h, bottom: 2.h),
        decoration: BoxDecoration(
          color: _blue,
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
                child: Icon(
                  Icons.arrow_back_ios_new,
                  color: _blue,
                  size: 18.sp,
                ),
              ),
            ),
            SizedBox(width: 3.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Détails",
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.poppins(
                      fontSize: 16.sp,
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      height: 1.1,
                    ),
                  ),
                  Text(
                    _demande.stockItemName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.poppins(
                      fontSize: 11.sp,
                      color: Colors.white.withOpacity(0.75),
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
            // Cloche notification — identique à RequestsTrackingScreen
            Stack(
              children: [
                Container(
                  padding: EdgeInsets.all(2.2.w),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.notifications_outlined,
                    size: 6.5.w,
                    color: _blue,
                  ),
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
  ),],
            ),
          ],
        ),
      ),
    );
  }

  // ─── Hero header ─────────────────────────────────────────────────────────────
  Widget _buildHeroHeader() {
    final color = _statusColor(_demande.statut);

    return Container(
      color: Colors.white,
      child: Stack(
        children: [
          // Accent coloré haut droite
          Positioned(
            top: 0,
            right: 0,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: color.withOpacity(0.07),
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(80),
                ),
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 3.h),
            child: Column(
              children: [
                // ── Pill statut ───────────────────────────────────────────────
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.10),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: color.withOpacity(0.25)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (_isRejected)
                        Stack(
                          alignment: Alignment.center,
                          children: [
                            Icon(Icons.circle, color: color, size: 13),
                            const Icon(
                              Icons.close_rounded,
                              color: Colors.white,
                              size: 8,
                            ),
                          ],
                        )
                      else
                        Icon(
                          _statusIcon(_demande.statut),
                          color: color,
                          size: 13,
                        ),
                      const SizedBox(width: 6),
                      Text(
                        _displayStatus(_demande.statut),
                        style: GoogleFonts.poppins(
                          fontSize: 11.sp,
                          color: color,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),

                // ── Badge "Déjà rejetée" si resoumise après rejet ────────────
                if (_wasRejected && !_isRejected) ...[
                  SizedBox(height: 1.h),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _red.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: _red.withOpacity(0.2)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.history_rounded,
                          size: 11.sp,
                          color: _red.withOpacity(0.7),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          "Anciennement rejetée",
                          style: GoogleFonts.poppins(
                            fontSize: 10.sp,
                            color: _red.withOpacity(0.75),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                SizedBox(height: 1.8.h),

                // ── Nom article ───────────────────────────────────────────────
                Text(
                  _demande.stockItemName,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: 20.sp,
                    fontWeight: FontWeight.w800,
                    color: _onSurf,
                    height: 1.2,
                    letterSpacing: -0.4,
                  ),
                ),
                SizedBox(height: 0.8.h),

                // ── Référence + magasin ───────────────────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.tag_rounded, size: 12.sp, color: _hint),
                    SizedBox(width: 1.w),
                    Text(
                      _demande.number,
                      style: GoogleFonts.poppins(
                        fontSize: 12.sp,
                        color: _hint,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Container(
                      margin: EdgeInsets.symmetric(horizontal: 2.w),
                      width: 3,
                      height: 3,
                      decoration: BoxDecoration(
                        color: _hint,
                        shape: BoxShape.circle,
                      ),
                    ),
                    Icon(
                      Icons.store_mall_directory_outlined,
                      size: 12.sp,
                      color: _hint,
                    ),
                    SizedBox(width: 1.w),
                    Flexible(
                      child: Text(
                        _demande.magasinName,
                        style: GoogleFonts.poppins(
                          fontSize: 12.sp,
                          color: _hint,
                          fontWeight: FontWeight.w500,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),

                // ── Bannière rejet avec bouton modifier ───────────────────────
                if (_isRejected) ...[
                  SizedBox(height: 2.h),
                  Container(
                    width: double.infinity,
                    padding: EdgeInsets.symmetric(
                      horizontal: 4.w,
                      vertical: 1.5.h,
                    ),
                    decoration: BoxDecoration(
                      color: _red.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: _red.withOpacity(0.2)),
                    ),
                    child: Row(
                      children: [
                        Stack(
                          alignment: Alignment.center,
                          children: [
                            Icon(Icons.circle, color: _red, size: 28),
                            const Icon(
                              Icons.close_rounded,
                              color: Colors.white,
                              size: 16,
                            ),
                          ],
                        ),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Demande rejetée",
                                style: GoogleFonts.poppins(
                                  fontSize: 13.sp,
                                  fontWeight: FontWeight.w700,
                                  color: _red,
                                ),
                              ),
                              Text(
                                "Modifiez et resoumettez votre demande",
                                style: GoogleFonts.poppins(
                                  fontSize: 11.sp,
                                  color: _red.withOpacity(0.7),
                                ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(width: 2.w),
                        GestureDetector(
                          onTap: _showEditModal,
                          child: Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: 3.w,
                              vertical: 0.9.h,
                            ),
                            decoration: BoxDecoration(
                              color: _red,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.edit_rounded,
                                  color: Colors.white,
                                  size: 13,
                                ),
                                SizedBox(width: 1.w),
                                Text(
                                  "Modifier",
                                  style: GoogleFonts.poppins(
                                    fontSize: 11.sp,
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── Section card sans icônes dans les titres ─────────────────────────────────
  Widget _sectionCard({required String title, required List<Widget> children}) {
    return Container(
      width: double.infinity,
      margin: EdgeInsets.only(bottom: 2.h),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(4.w, 2.h, 4.w, 1.2.h),
            child: Text(
              title,
              style: GoogleFonts.poppins(
                fontSize: 13.sp,
                fontWeight: FontWeight.w700,
                color: _onSurf,
                letterSpacing: -0.1,
              ),
            ),
          ),
          Divider(height: 1, color: Colors.grey[100]),
          Padding(
            padding: EdgeInsets.fromLTRB(4.w, 1.8.h, 4.w, 2.h),
            child: Column(children: children),
          ),
        ],
      ),
    );
  }

  // ─── Row info ────────────────────────────────────────────────────────────────
  Widget _infoRow({
    required IconData icon,
    required String label,
    required String value,
    Color? color,
    bool isLast = false,
  }) {
    final c = color ?? _blue;
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 2.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: c.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: c, size: 17),
          ),
          SizedBox(width: 3.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.poppins(
                    fontSize: 11.sp,
                    color: _hint,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                SizedBox(height: 0.3.h),
                Text(
                  value,
                  style: GoogleFonts.poppins(
                    fontSize: 13.sp,
                    color: _onSurf,
                    fontWeight: FontWeight.w600,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── Bulle commentaire ────────────────────────────────────────────────────────
  Widget _commentBubble({
    required String label,
    required String comment,
    required Color color,
    required IconData icon,
    bool isLast = false,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 1.5.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: color.withOpacity(0.10),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 16),
          ),
          SizedBox(width: 3.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.poppins(
                    fontSize: 10.sp,
                    color: color,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                  ),
                ),
                SizedBox(height: 0.4.h),
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: color.withOpacity(0.15)),
                  ),
                  child: Text(
                    comment,
                    style: GoogleFonts.poppins(
                      fontSize: 12.sp,
                      color: _onSurf,
                      height: 1.45,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── Sections ────────────────────────────────────────────────────────────────
  Widget _buildQuantities() {
    final d = _demande;
    final unite = d.stockItemUnite.isNotEmpty ? d.stockItemUnite : "unités";
    final rows = <Widget>[];

    rows.add(
      _infoRow(
        icon: Icons.shopping_cart_outlined,
        label: "Quantité demandée",
        value: "${d.quantiteDem} $unite",
        color: _blue,
      ),
    );
    if (d.quantiteApprouv != null)
      rows.add(
        _infoRow(
          icon: Icons.thumb_up_outlined,
          label: "Quantité approuvée",
          value: "${d.quantiteApprouv} $unite",
          color: _green,
        ),
      );
    if (d.quantiteValid != null)
      rows.add(
        _infoRow(
          icon: Icons.check_circle_outline,
          label: "Quantité validée",
          value: "${d.quantiteValid} $unite",
          color: _green,
        ),
      );
    if (d.raison.isNotEmpty)
      rows.add(
        _infoRow(
          icon: Icons.notes_rounded,
          label: "Raison",
          value: d.raison,
          color: _hint,
          isLast: true,
        ),
      );
    else if (rows.isNotEmpty) {
      // Marquer le dernier isLast
      final last = rows.removeLast();
      rows.add(Padding(padding: EdgeInsets.only(bottom: 0), child: last));
    }

    return _sectionCard(title: "Quantités & raison", children: rows);
  }

  Widget _buildComments() {
    final d = _demande;
    final items = <Widget>[];

    if (d.commentaireConfirmation?.isNotEmpty == true)
      items.add(
        _commentBubble(
          label: "CONFIRMATION",
          comment: d.commentaireConfirmation!,
          color: _blue,
          icon: Icons.verified_rounded,
        ),
      );
    if (d.commentaireApprobation?.isNotEmpty == true)
      items.add(
        _commentBubble(
          label: "APPROBATION",
          comment: d.commentaireApprobation!,
          color: _green,
          icon: Icons.thumb_up_rounded,
        ),
      );
    if (d.commentaireValidation?.isNotEmpty == true)
      items.add(
        _commentBubble(
          label: "VALIDATION",
          comment: d.commentaireValidation!,
          color: _green,
          icon: Icons.check_circle_rounded,
          isLast: true,
        ),
      );

    if (items.isEmpty) return const SizedBox.shrink();
    return _sectionCard(title: "Commentaires", children: items);
  }

  Widget _buildTimeline() {
    final d = _demande;
    final events = <Map<String, dynamic>>[];

    events.add({
      'icon': Icons.add_circle_outline_rounded,
      'label': "Créée",
      'date': d.dateCreation,
      'color': _hint,
    });
    if (d.dateEmission != null)
      events.add({
        'icon': Icons.send_rounded,
        'label': "Emise",
        'date': d.dateEmission!,
        'color': _amber,
      });
    if (d.dateConfirmation != null)
      events.add({
        'icon': Icons.verified_rounded,
        'label': "Confirmée",
        'date': d.dateConfirmation!,
        'color': _blue,
      });
    if (d.dateApprobation != null)
      events.add({
        'icon': Icons.thumb_up_rounded,
        'label': "Approuvée",
        'date': d.dateApprobation!,
        'color': _blue,
      });
    if (d.dateValidation != null)
      events.add({
        'icon': Icons.check_circle_rounded,
        'label': "Validée",
        'date': d.dateValidation!,
        'color': _green,
      });
    if (d.dateRejet != null)
      events.add({
        'icon': Icons.do_disturb_on_rounded,
        'label': "Rejetée",
        'date': d.dateRejet!,
        'color': _red,
      });

    return _sectionCard(
      title: "Historique",
      children: events.asMap().entries.map((entry) {
        final i = entry.key;
        final ev = entry.value;
        final isLast = i == events.length - 1;
        final Color c = ev['color'] as Color;
        final bool isReject = ev['label'] == 'Rejetée';
        final DateTime date = ev['date'] as DateTime;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 36,
              child: Column(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: c.withOpacity(0.10),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: isReject
                        ? Stack(
                            alignment: Alignment.center,
                            children: [
                              Icon(Icons.circle, color: c, size: 22),
                              const Icon(
                                Icons.close_rounded,
                                color: Colors.white,
                                size: 14,
                              ),
                            ],
                          )
                        : Icon(ev['icon'] as IconData, color: c, size: 17),
                  ),
                  if (!isLast)
                    Container(
                      width: 2,
                      height: 2.5.h,
                      margin: EdgeInsets.symmetric(vertical: 0.4.h),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(1),
                      ),
                    ),
                ],
              ),
            ),
            SizedBox(width: 3.w),
            Expanded(
              child: Padding(
                padding: EdgeInsets.only(
                  top: 0.4.h,
                  bottom: isLast ? 0 : 0.5.h,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ev['label'] as String,
                      style: GoogleFonts.poppins(
                        fontSize: 13.sp,
                        color: isReject ? c : _onSurf,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}",
                      style: GoogleFonts.poppins(fontSize: 11.sp, color: _hint),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      }).toList(),
    );
  }

  Widget _buildPeople() {
    final d = _demande;
    final people = <Map<String, dynamic>>[];

    if (d.emisParName.isNotEmpty)
      people.add({
        'icon': Icons.person_rounded,
        'label': "Émis par",
        'value': d.emisParName,
        'color': _blue,
      });
    if (d.confirmeParName.isNotEmpty)
      people.add({
        'icon': Icons.verified_user_rounded,
        'label': "Confirmé par",
        'value': d.confirmeParName,
        'color': _blue,
      });
    if (d.approveParName.isNotEmpty)
      people.add({
        'icon': Icons.engineering_rounded,
        'label': "Approuvé par",
        'value': d.approveParName,
        'color': _green,
      });
    if (d.valideParName.isNotEmpty)
      people.add({
        'icon': Icons.admin_panel_settings_rounded,
        'label': "Validé par",
        'value': d.valideParName,
        'color': _green,
      });
    if (d.rejeteParName.isNotEmpty)
      people.add({
        'icon': Icons.do_not_disturb_rounded,
        'label': "Rejeté par",
        'value': d.rejeteParName,
        'color': _red,
      });

    if (people.isEmpty) return const SizedBox.shrink();

    return _sectionCard(
      title: "Intervenants",
      children: people
          .asMap()
          .entries
          .map(
            (e) => _infoRow(
              icon: e.value['icon'] as IconData,
              label: e.value['label'] as String,
              value: e.value['value'] as String,
              color: e.value['color'] as Color,
              isLast: e.key == people.length - 1,
            ),
          )
          .toList(),
    );
  }

  Widget _dashedDivider() => LayoutBuilder(
    builder: (_, c) {
      const dw = 4.0, gap = 4.0;
      final count = (c.maxWidth / (dw + gap)).floor();
      return Row(
        children: List.generate(
          count,
          (_) => Container(
            width: dw,
            height: 1,
            margin: const EdgeInsets.only(right: gap),
            color: Colors.grey[200],
          ),
        ),
      );
    },
  );

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      initialIndex: 2,
      body: Container(
        color: _bgPage,
        child: Column(
          children: [
            _buildAppBar(),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  children: [
                    _buildHeroHeader(),
                    _dashedDivider(),
                    SizedBox(height: 2.h),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 4.w),
                      child: Column(
                        children: [
                          _buildQuantities(),
                          _buildComments(),
                          _buildTimeline(),
                          _buildPeople(),
                          SizedBox(height: 4.h),
                        ],
                      ),
                    ),
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

// ─────────────────────────────────────────────────────────────────────────────
// Modal de modification — identique à celui de RequestsTrackingScreen
// ─────────────────────────────────────────────────────────────────────────────
class _EditDemandeModal extends StatefulWidget {
  final Demande demande;
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
    _quantiteCtrl = TextEditingController(
      text: widget.demande.quantiteDem.toString(),
    );
    _raisonCtrl = TextEditingController(text: widget.demande.raison);
  }

  @override
  void dispose() {
    _quantiteCtrl.dispose();
    _raisonCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);
    try {
      final token = Provider.of<AuthProvider>(context, listen: false).token;
      if (token == null) throw Exception('Token manquant');

      // updateDemandeRejetee retourne maintenant la Demande avec statut forcé "Emise"
      final updated = await DemandeService().updateDemandeRejetee(
        id: widget.demande.id,
        quantiteDem: int.parse(_quantiteCtrl.text.trim()),
        raison: _raisonCtrl.text.trim(),
        stockItem: widget.demande.stockItem,
        magasin: widget.demande.magasin,
        token: token,
      );

      if (!mounted) return;
      Navigator.of(context).pop();
      widget.onSuccess(updated); // ← passe la demande mise à jour
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e.toString().replaceAll('Exception: ', ''),
            style: GoogleFonts.poppins(fontSize: 13.sp),
          ),
          backgroundColor: const Color(0xFFCE0000),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          margin: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
        ),
      );
    }
  }

  InputDecoration _dec({
    required String hint,
    required IconData icon,
    String? suffix,
    bool multiline = false,
  }) => InputDecoration(
    hintText: hint,
    hintStyle: GoogleFonts.poppins(fontSize: 13.sp, color: Colors.grey[400]),
    prefixIcon: multiline
        ? Padding(
            padding: const EdgeInsets.only(bottom: 44),
            child: Icon(icon, color: _blue, size: 20),
          )
        : Icon(icon, color: _blue, size: 20),
    suffixText: suffix,
    suffixStyle: GoogleFonts.poppins(fontSize: 12.sp, color: _hint),
    filled: true,
    fillColor: _bgPage,
    contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.8.h),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: BorderSide(color: Colors.grey[200]!),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: BorderSide(color: Colors.grey[200]!),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: _blue, width: 1.5),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: _red),
    ),
    focusedErrorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: _red, width: 1.5),
    ),
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
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 15),
          ),
          SizedBox(width: 3.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.poppins(
                    fontSize: 9.sp,
                    color: color,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                  ),
                ),
                SizedBox(height: 0.3.h),
                Text(
                  value,
                  style: GoogleFonts.poppins(
                    fontSize: 13.sp,
                    color: _onSurf,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final d = widget.demande;
    final hasComments =
        (d.commentaireConfirmation?.isNotEmpty == true) ||
        (d.commentaireApprobation?.isNotEmpty == true) ||
        (d.commentaireValidation?.isNotEmpty == true);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Poignée
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      margin: EdgeInsets.only(bottom: 2.h),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),

                  // En-tête
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: _red.withOpacity(0.10),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.edit_rounded,
                          color: _red,
                          size: 22,
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Modifier la demande",
                              style: GoogleFonts.poppins(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w700,
                                color: _onSurf,
                                letterSpacing: -0.3,
                              ),
                            ),
                            Text(
                              "${d.number} • ${d.stockItemName}",
                              style: GoogleFonts.poppins(
                                fontSize: 11.sp,
                                color: _hint,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: _red.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(color: _red.withOpacity(0.2)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Stack(
                              alignment: Alignment.center,
                              children: [
                                Icon(Icons.circle, color: _red, size: 11),
                                const Icon(
                                  Icons.close_rounded,
                                  color: Colors.white,
                                  size: 7,
                                ),
                              ],
                            ),
                            const SizedBox(width: 4),
                            Text(
                              "Rejetée",
                              style: GoogleFonts.poppins(
                                fontSize: 10.sp,
                                color: _red,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 2.h),
                  Divider(color: Colors.grey[100]),
                  SizedBox(height: 2.h),

                  // Commentaires reçus
                  if (hasComments) ...[
                    Row(
                      children: [
                        Icon(Icons.forum_outlined, size: 14.sp, color: _hint),
                        SizedBox(width: 1.5.w),
                        Text(
                          "Commentaires reçus",
                          style: GoogleFonts.poppins(
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w700,
                            color: _onSurf,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 1.2.h),
                    _commentBubble(
                      label: "CONFIRMATION",
                      value: d.commentaireConfirmation,
                      color: _blue,
                      icon: Icons.verified_rounded,
                    ),
                    _commentBubble(
                      label: "APPROBATION",
                      value: d.commentaireApprobation,
                      color: _green,
                      icon: Icons.thumb_up_rounded,
                    ),
                    _commentBubble(
                      label: "VALIDATION",
                      value: d.commentaireValidation,
                      color: _green,
                      icon: Icons.check_circle_rounded,
                    ),
                    SizedBox(height: 1.h),
                    Divider(color: Colors.grey[100]),
                    SizedBox(height: 2.h),
                  ],

                  // Champs
                  Row(
                    children: [
                      Icon(Icons.edit_note_rounded, size: 14.sp, color: _hint),
                      SizedBox(width: 1.5.w),
                      Text(
                        "Votre correction",
                        style: GoogleFonts.poppins(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w700,
                          color: _onSurf,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 1.5.h),

                  Text(
                    "Quantité",
                    style: GoogleFonts.poppins(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w600,
                      color: _onSurf,
                    ),
                  ),
                  SizedBox(height: 0.8.h),
                  TextFormField(
                    controller: _quantiteCtrl,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    style: GoogleFonts.poppins(
                      fontSize: 14.sp,
                      color: _onSurf,
                      fontWeight: FontWeight.w500,
                    ),
                    decoration: _dec(
                      hint: "Ex : 10",
                      icon: Icons.scale_rounded,
                      suffix: d.stockItemUnite.isNotEmpty
                          ? d.stockItemUnite
                          : "unités",
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty)
                        return 'La quantité est obligatoire';
                      final n = int.tryParse(v.trim());
                      if (n == null || n <= 0)
                        return 'Entrez un nombre valide > 0';
                      return null;
                    },
                  ),

                  SizedBox(height: 1.8.h),

                  Text(
                    "Raison",
                    style: GoogleFonts.poppins(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w600,
                      color: _onSurf,
                    ),
                  ),
                  SizedBox(height: 0.8.h),
                  TextFormField(
                    controller: _raisonCtrl,
                    maxLines: 3,
                    style: GoogleFonts.poppins(fontSize: 13.sp, color: _onSurf),
                    decoration: _dec(
                      hint: "Expliquez la raison...",
                      icon: Icons.notes_rounded,
                      multiline: true,
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty)
                        return 'La raison est obligatoire';
                      if (v.trim().length < 5) return 'Min. 5 caractères';
                      return null;
                    },
                  ),

                  SizedBox(height: 3.h),

                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _isSubmitting
                              ? null
                              : () => Navigator.of(context).pop(),
                          style: OutlinedButton.styleFrom(
                            padding: EdgeInsets.symmetric(vertical: 1.8.h),
                            side: BorderSide(color: Colors.grey[300]!),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: Text(
                            "Annuler",
                            style: GoogleFonts.poppins(
                              fontSize: 14.sp,
                              color: _hint,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton(
                          onPressed: _isSubmitting ? null : _submit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _blue,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            padding: EdgeInsets.symmetric(vertical: 1.8.h),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: _isSubmitting
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.send_rounded, size: 16),
                                    SizedBox(width: 2.w),
                                    Text(
                                      "Resoumettre",
                                      style: GoogleFonts.poppins(
                                        fontSize: 14.sp,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
