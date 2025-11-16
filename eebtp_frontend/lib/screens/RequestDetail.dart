import 'package:eebtp_frontend/models/article.dart';
import 'package:eebtp_frontend/models/demande.dart';
import 'package:eebtp_frontend/services/stockservice.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:sizer/sizer.dart';
import '../providers/auth_provider.dart';

class RequestDetailScreen extends StatefulWidget {
  final Demande demande;

  const RequestDetailScreen({Key? key, required this.demande}) : super(key: key);

  @override
  State<RequestDetailScreen> createState() => _RequestDetailScreenState();
}

class _RequestDetailScreenState extends State<RequestDetailScreen> with SingleTickerProviderStateMixin {
  String? _unite;
  bool _loadingUnite = false;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _slideAnimation;

  // Couleurs modernes 2025
  final Color _primaryBlue = const Color(0xFF0066FF);
  final Color _surfaceColor = const Color(0xFFF8FAFF);
  final Color _onSurface = const Color(0xFF1A1D21);
  final Color _secondaryText = const Color(0xFF64748B);
  final Color _successColor = const Color(0xFF10B981);
  final Color _warningColor = const Color(0xFFF59E0B);
  final Color _errorColor = const Color(0xFFEF4444);

  @override
  void initState() {
    super.initState();
    _fetchUnite();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );
    _slideAnimation = Tween<double>(begin: 30, end: 0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _fetchUnite() async {
    setState(() => _loadingUnite = true);
    try {
      final token = Provider.of<AuthProvider>(context, listen: false).token;
      final stockItemId = widget.demande.stockItem ?? widget.demande.stockItem ?? widget.demande.stockItem;
      if (token != null && stockItemId != null) {
        final service = StockService(token: token);
        final article = await service.getArticleDetail(stockItemId);
        setState(() {
          _unite = article?.unite ?? "unités";
          _loadingUnite = false;
        });
      } else {
        setState(() { _unite = "unités"; _loadingUnite = false; });
      }
    } catch (e) {
      setState(() { _unite = "unités"; _loadingUnite = false; });
      debugPrint('Erreur unité: $e');
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'validée':
      case 'livrée':
        return _successColor;
      case 'confirmée':
      case 'approuvée':
        return _primaryBlue;
      case 'emise':
        return _warningColor;
      case 'rejetée':
        return _errorColor;
      default:
        return const Color(0xFF8B5CF6);
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'validée':
      case 'livrée':
        return Icons.verified_rounded;
      case 'confirmée':
      case 'approuvée':
        return Icons.thumb_up_alt_rounded;
      case 'emise':
        return Icons.pending_actions_rounded;
      case 'rejetée':
        return Icons.cancel_rounded;
      default:
        return Icons.info_outline_rounded;
    }
  }

  String _getDisplayStatus(String status) {
    switch (status.toLowerCase()) {
      case 'emise': return 'En attente';
      case 'confirmee': return 'Confirmée';
      case 'approuvee': return 'Approuvée';
      case 'validee': return 'Validée';
      case 'rejetee': return 'Rejetée';
      case 'livree': return 'Livrée';
      default: return status;
    }
  }

  Widget _buildAppBar(BuildContext context) {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _slideAnimation.value),
          child: Opacity(
            opacity: _fadeAnimation.value,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    _primaryBlue.withOpacity(0.95),
                    _primaryBlue.withOpacity(0.85),
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: _primaryBlue.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
                  child: Row(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: Icon(Icons.arrow_back_ios_new_rounded, 
                              color: Colors.white, size: 18),
                          splashRadius: 20,
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: Text(
                          "Détails de la demande",
                          style: GoogleFonts.poppins(
                            fontWeight: FontWeight.w600,
                            fontSize: 18.sp,
                            color: Colors.white,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: IconButton(
                          onPressed: () {},
                          icon: Icon(Icons.share_rounded, 
                              color: Colors.white, size: 20),
                          splashRadius: 20,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatusChip() {
    final color = _getStatusColor(widget.demande.statut);
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _slideAnimation.value),
          child: Opacity(
            opacity: _fadeAnimation.value,
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.2.h),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: color.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(_getStatusIcon(widget.demande.statut), 
                      color: color, size: 18),
                  SizedBox(width: 2.w),
                  Text(
                    _getDisplayStatus(widget.demande.statut),
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w600,
                      fontSize: 12.sp,
                      color: color,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildHeader() {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _slideAnimation.value),
          child: Opacity(
            opacity: _fadeAnimation.value,
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 3.h),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    _surfaceColor,
                    _surfaceColor.withOpacity(0.8),
                  ],
                ),
              ),
              child: Column(
                children: [
                  _buildStatusChip(),
                  SizedBox(height: 2.h),
                  Text(
                    widget.demande.stockItemName ?? 'Demande sans nom',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w700,
                      fontSize: 22.sp,
                      color: _onSurface,
                      height: 1.2,
                      letterSpacing: -0.5,
                    ),
                  ),
                  SizedBox(height: 1.h),
                  Text(
                    "Référence • ${widget.demande.number}",
                    style: GoogleFonts.poppins(
                      fontSize: 13.sp,
                      color: _secondaryText,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoCard({required String title, required List<Widget> children}) {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _slideAnimation.value),
          child: Opacity(
            opacity: _fadeAnimation.value,
            child: Container(
              width: double.infinity,
              margin: EdgeInsets.only(bottom: 2.h),
              padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.5.h),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w600,
                      fontSize: 15.sp,
                      color: _onSurface,
                      letterSpacing: -0.2,
                    ),
                  ),
                  SizedBox(height: 2.h),
                  ...children,
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String label,
    required String value,
    Color? iconColor,
    bool isLast = false,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: isLast ? 0 : 2.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: (iconColor ?? _primaryBlue).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconColor ?? _primaryBlue, size: 18),
          ),
          SizedBox(width: 4.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.poppins(
                    fontSize: 12.sp,
                    color: _secondaryText,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                SizedBox(height: 0.5.h),
                Text(
                  value,
                  style: GoogleFonts.poppins(
                    fontSize: 14.sp,
                    color: _onSurface,
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

  Widget _buildTimelineSection() {
    final d = widget.demande;
    final events = <Map<String, dynamic>>[];

    events.add({
      'icon': Icons.create_rounded,
      'label': "Créée",
      'date': d.dateCreation,
      'color': _primaryBlue,
    });

    if (d.dateEmission != null) {
      events.add({
        'icon': Icons.send_rounded,
        'label': "Envoyée",
        'date': d.dateEmission!,
        'color': _primaryBlue,
      });
    }

    if (d.dateConfirmation != null) {
      events.add({
        'icon': Icons.verified_rounded,
        'label': "Confirmée",
        'date': d.dateConfirmation!,
        'color': _successColor,
      });
    }

    if (d.dateApprobation != null) {
      events.add({
        'icon': Icons.thumb_up_rounded,
        'label': "Approuvée",
        'date': d.dateApprobation!,
        'color': _successColor,
      });
    }

    if (d.dateValidation != null) {
      events.add({
        'icon': Icons.check_circle_rounded,
        'label': "Validée",
        'date': d.dateValidation!,
        'color': _successColor,
      });
    }

    if (d.dateRejet != null) {
      events.add({
        'icon': Icons.cancel_rounded,
        'label': "Rejetée",
        'date': d.dateRejet!,
        'color': _errorColor,
      });
    }

    return _buildInfoCard(
      title: "Historique de la demande",
      children: [
        Column(
          children: events.asMap().entries.map((entry) {
            final index = entry.key;
            final event = entry.value;
            final isLast = index == events.length - 1;
            
            return Container(
              margin: EdgeInsets.only(bottom: isLast ? 0 : 2.h),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: event['color'].withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(event['icon'], 
                            color: event['color'], size: 18),
                      ),
                      if (!isLast)
                        Container(
                          width: 2,
                          height: 2.h,
                          margin: EdgeInsets.symmetric(vertical: 0.5.h),
                          color: _secondaryText.withOpacity(0.2),
                        ),
                    ],
                  ),
                  SizedBox(width: 4.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          event['label'],
                          style: GoogleFonts.poppins(
                            fontSize: 14.sp,
                            color: _onSurface,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: 0.3.h),
                        Text(
                          "${event['date'].day.toString().padLeft(2, '0')}/${event['date'].month.toString().padLeft(2, '0')}/${event['date'].year}",
                          style: GoogleFonts.poppins(
                            fontSize: 12.sp,
                            color: _secondaryText,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
        SizedBox(height: 1.h),
        _buildInfoItem(
          icon: Icons.scale_rounded,
          label: "Quantité demandée",
          value: _loadingUnite
              ? "Chargement..."
              : "${d.quantite} ${_unite ?? "unités"}",
          isLast: true,
        ),
      ],
    );
  }

  Widget _buildPeopleSection() {
    final d = widget.demande;
    final people = <Map<String, dynamic>>[];

    if (d.emisParName.isNotEmpty) {
      people.add({
        'icon': Icons.person_rounded,
        'label': "Émis par",
        'value': d.emisParName,
        'color': _primaryBlue,
      });
    }

    if (d.confirmeParName.isNotEmpty) {
      people.add({
        'icon': Icons.verified_user_rounded,
        'label': "Confirmé par",
        'value': d.confirmeParName,
        'color': _successColor,
      });
    }

    if (d.approveParName.isNotEmpty) {
      people.add({
        'icon': Icons.engineering_rounded,
        'label': "Approuvé par",
        'value': d.approveParName,
        'color': _successColor,
      });
    }

    if (d.valideParName.isNotEmpty) {
      people.add({
        'icon': Icons.admin_panel_settings_rounded,
        'label': "Validé par",
        'value': d.valideParName,
        'color': _successColor,
      });
    }

    if (d.rejeteParName.isNotEmpty) {
      people.add({
        'icon': Icons.do_not_disturb_rounded,
        'label': "Rejeté par",
        'value': d.rejeteParName,
        'color': _errorColor,
      });
    }

    if (people.isEmpty) return const SizedBox();

    return _buildInfoCard(
      title: "Intervenants",
      children: people.map((person) => _buildInfoItem(
        icon: person['icon'],
        label: person['label'],
        value: person['value'],
        iconColor: person['color'],
        isLast: person == people.last,
      )).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      initialIndex: 2,
      body: Container(
        color: _surfaceColor,
        child: Column(
          children: [
            _buildAppBar(context),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: EdgeInsets.only(bottom: 2.h),
                child: Column(
                  children: [
                    _buildHeader(),
                    SizedBox(height: 1.h),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 4.w),
                      child: Column(
                        children: [
                          _buildTimelineSection(),
                          _buildPeopleSection(),
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