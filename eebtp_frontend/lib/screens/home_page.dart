import 'dart:convert';
import 'package:eebtp_frontend/services/notification_service.dart';
import 'package:eebtp_frontend/services/statsService.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:sizer/sizer.dart';
import 'package:toastification/toastification.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:eebtp_frontend/models/history.dart';
import 'package:eebtp_frontend/models/statistiques.dart';
import 'package:eebtp_frontend/models/utilisateur.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:eebtp_frontend/services/auth.dart';
import 'package:eebtp_frontend/services/historiqueService.dart';
import 'package:eebtp_frontend/widgets/nav.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  static const String backendUrl = 'http://38.242.139.218:8000';
  
  final TextEditingController _searchController = TextEditingController();

  String _selectedActivityFilter = "Aujourd'hui";
  String _selectedTimeFilter = "jour";
  String _selectedUnit = "kg";
  String _selectedCardType = "Livraison";

  Utilisateur? _user;
  List<HistoriqueAction> _allHistory = [];
  bool _loadingUser = true;
  bool _loadingHistory = true;

  int _displayedCount = 20;

  final HistoryService _historyService = HistoryService();
  final UserService _userService = UserService();
  StatsService? _statsService;
  Statistiques? _mouvementsStats;
  StockStats? _stocksStats;
  bool _loadingStats = true;
  bool _loadingStockStats = true;
int _unreadNotifCount = 0;

// Dans initState, après les autres appels :


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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = context.read<AuthProvider>().token;
      _statsService = StatsService(token: token);
      _loadUserAndHistory();
      _loadStats();
      _loadStockStats();
      _fetchUnreadCount();
    });
  }

  String? _getProfilePhotoUrl(String? photoPath) {
    if (photoPath == null || photoPath.isEmpty) return null;
    
    if (photoPath.startsWith('/media')) {
      return '$backendUrl$photoPath';
    }
    
    return photoPath;
  }

  void _showToast({
    required String message,
    required ToastificationType type,
  }) {
    toastification.show(
      context: context,
      type: type,
      style: ToastificationStyle.flatColored,
      title: Text(
        message,
        style: GoogleFonts.poppins(
          fontSize: 13.sp,
          fontWeight: FontWeight.w500,
        ),
      ),
      autoCloseDuration: const Duration(seconds: 3),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 300),
      animationBuilder: (context, animation, alignment, child) {
        return ScaleTransition(
          scale: animation,
          child: child,
        );
      },
      borderRadius: BorderRadius.circular(12),
      boxShadow: const [
        BoxShadow(
          color: Color(0x07000000),
          blurRadius: 16,
          offset: Offset(0, 16),
          spreadRadius: 0,
        )
      ],
      showProgressBar: true,
      closeButtonShowType: CloseButtonShowType.onHover,
      closeOnClick: false,
      pauseOnHover: true,
      dragToClose: true,
      applyBlurEffect: true,
    );
  }

  String _apiPeriodValue(String label) {
    switch (label) {
      case "Aujourd'hui":
        return "jour";
      case "Semaine dernière":
        return "semaine";
      default:
        return "total";
    }
  }

  Future<void> _loadUserAndHistory() async {
    try {
      final token = context.read<AuthProvider>().token;
      if (token == null) {
        _showToast(
          message: "Session expirée, veuillez vous reconnecter",
          type: ToastificationType.error,
        );
        return;
      }
      setState(() {
        _loadingUser = true;
        _loadingHistory = true;
        _displayedCount = 20;
      });

      final fetchedUser = await _userService.getUserInfo(token);
      final fetchedHistory = await _historyService.getHistoriqueUser(
        token,
        _apiPeriodValue(_selectedActivityFilter),
      );

      setState(() {
        _user = fetchedUser;
        _allHistory = fetchedHistory;
        _loadingUser = false;
        _loadingHistory = false;
      });
    } catch (e) {
      setState(() {
        _loadingUser = false;
        _loadingHistory = false;
      });
      _showToast(
        message: "Erreur de chargement des données",
        type: ToastificationType.error,
      );
    }
  }

  Future<void> _loadStats() async {
    setState(() {
      _loadingStats = true;
    });
    try {
      final storeId = context.read<AuthProvider>().storeId;
      if (storeId == null) {
        setState(() {
          _loadingStats = false;
        });
        _showToast(
          message: "Magasin non défini",
          type: ToastificationType.error,
        );
        return;
      }
      final stats = await _statsService?.getMouvementsStats(storeId, _selectedTimeFilter);
      setState(() {
        _mouvementsStats = stats;
        _loadingStats = false;
      });
    } catch (e) {
      setState(() {
        _loadingStats = false;
      });
      _showToast(
        message: "Erreur de chargement des statistiques",
        type: ToastificationType.error,
      );
    }
  }

  Future<void> _loadStockStats() async {
    setState(() {
      _loadingStockStats = true;
    });
    try {
      final storeId = context.read<AuthProvider>().storeId;
      if (storeId == null) {
        setState(() {
          _loadingStockStats = false;
        });
        _showToast(
          message: "Magasin non défini",
          type: ToastificationType.error,
        );
        return;
      }
      final stats = await _statsService?.getStocksStats(
        storeId,
        _selectedUnit.toLowerCase(),
      );
      setState(() {
        _stocksStats = stats;
        _loadingStockStats = false;
      });
    } catch (e) {
      setState(() {
        _loadingStockStats = false;
      });
      _showToast(
        message: "Erreur de chargement des statistiques stock",
        type: ToastificationType.error,
      );
    }
  }

  void _loadMoreHistory() {
    setState(() {
      _displayedCount += 20;
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Map<String, dynamic> _getCardData() {
    String valeur = "-";
    if (_mouvementsStats != null) {
      switch (_selectedCardType) {
        case "Livraison":
          valeur = _mouvementsStats?.livraisons?.toString() ?? "-";
          break;
        case "Sortie":
          valeur = _mouvementsStats?.sorties?.toString() ?? "-";
          break;
        case "Retour":
          valeur = _mouvementsStats?.retours?.toString() ?? "-";
          break;
      }
    }
    return {
      "title": _selectedCardType.toUpperCase(),
      "icon": _selectedCardType == "Livraison"
          ? Icons.login
          : _selectedCardType == "Sortie"
          ? Icons.logout
          : Icons.undo,
      "value": valeur,
      "color": Color.fromRGBO(67, 58, 75, 1),
    };
  }

  String _getDisplayPoste(String? poste) {
    if (poste == null || poste.isEmpty || poste.toLowerCase() == 'string') {
      return 'Sans poste';
    }
    return poste;
  }

  @override
  Widget build(BuildContext context) {
    final cardData = _getCardData();
    final visibleHistory = _allHistory.take(_displayedCount).toList();
    final hasMore = _allHistory.length > _displayedCount;
    
    final photoUrl = _getProfilePhotoUrl(_user?.photoProfil);
    
    return NavContainer(
      initialIndex: 0,
      body: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          elevation: 0,
          backgroundColor: const Color(0xFF007AFF),
          toolbarHeight: 85,
          automaticallyImplyLeading: false,
          titleSpacing: 0,
          title: Row(
            children: [
              SizedBox(width: 3.w),
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  border: Border.all(
                    color: Colors.white,
                    width: 2,
                  ),
                ),
                child: ClipOval(
                  child: _loadingUser
                      ? Container(
                          color: Colors.grey[200],
                          child: Center(
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Color(0xFF007AFF),
                              ),
                            ),
                          ),
                        )
                      : photoUrl != null
                          ? CachedNetworkImage(
                              imageUrl: photoUrl,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Container(
                                color: Colors.grey[200],
                                child: Center(
                                  child: SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Color(0xFF007AFF),
                                    ),
                                  ),
                                ),
                              ),
                              errorWidget: (context, url, error) => Image.asset(
                                "assets/profile.png",
                                fit: BoxFit.cover,
                              ),
                            )
                          : Image.asset(
                              "assets/profile.png",
                              fit: BoxFit.cover,
                            ),
                ),
              ),
              SizedBox(width: 2.w),
              // ✅ CORRECTION : Envelopper la Column dans Expanded pour éviter l'overflow
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _loadingUser
                        ? Container(
                            width: 80,
                            height: 14,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          )
                        : Text(
                            "${_user?.firstName ?? ""} ${_user?.lastName ?? ""}",
                            style: GoogleFonts.montserrat(
                              fontSize: 19,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                            maxLines: 1, // ✅ Limiter à 1 ligne
                            overflow: TextOverflow.ellipsis, // ✅ Ajouter ellipsis
                          ),
                    SizedBox(height: 2),
                    _loadingUser
                        ? Container(
                            width: 60,
                            height: 12,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          )
                        : Text(
                            _getDisplayPoste(_user?.poste),
                            style: GoogleFonts.montserrat(
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                              color: Colors.white.withOpacity(0.9),
                            ),
                            maxLines: 1, // ✅ Limiter à 1 ligne
                            overflow: TextOverflow.ellipsis, // ✅ Ajouter ellipsis
                          ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            Padding(
              padding: EdgeInsets.only(right: 4.w),
              child: Stack(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pushNamed(context, '/notifications'),
                    child: Container(
                      padding: EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.notifications_outlined,
                        size: 27,
                        color: Color(0xFF007AFF),
                      ),
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
  ), ],
              ),
            ),
          ],
        ),
        body: SafeArea(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: 6.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: 2.h),
                Container(
                  height: 52,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(25),
                    border: Border.all(color: Color.fromRGBO(214, 214, 214, 1)),
                  ),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: "Rechercher une entrée, sortie...",
                      hintStyle: GoogleFonts.poppins(
                        fontSize: 13.sp,
                        color: Colors.grey[400],
                      ),
                      prefixIcon: Icon(
                        Icons.search,
                        color: Colors.black54,
                        size: 23,
                      ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 10,
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 16),
                LayoutBuilder(
                  builder: (context, constraints) {
                    double cardHeight = constraints.maxWidth > 340 ? 18.h : 120;
                    return Column(
                      children: [
                        Container(
                          constraints: BoxConstraints(
                            minHeight: 110,
                            maxHeight: cardHeight,
                            minWidth: double.infinity,
                          ),
                          decoration: BoxDecoration(
                            color: cardData["color"],
                            borderRadius: BorderRadius.circular(32),
                          ),
                          padding: EdgeInsets.all(6.w),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    cardData["title"],
                                    style: GoogleFonts.montserrat(
                                      fontSize: 15.sp,
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: _showTimeFilterDialog,
                                    child: _buildChip(_selectedTimeFilter),
                                  ),
                                ],
                              ),
                              SizedBox(height: 12),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Icon(
                                        cardData["icon"],
                                        color: Colors.white,
                                        size: 34,
                                      ),
                                      GestureDetector(
                                        onTap: _showCardTypeDialog,
                                        child: Icon(
                                          Icons.expand_more,
                                          color: Colors.white,
                                          size: 24,
                                        ),
                                      ),
                                      SizedBox(width: 14),
                                      _loadingStats
                                          ? SizedBox(
                                              width: 24,
                                              height: 24,
                                              child: CircularProgressIndicator(
                                                color: Colors.white,
                                                strokeWidth: 2,
                                              ),
                                            )
                                          : Text(
                                              cardData["value"],
                                              style: GoogleFonts.montserrat(
                                                fontSize: 20.sp,
                                                fontWeight: FontWeight.w700,
                                                color: Colors.white,
                                              ),
                                            ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: 19),
                        Container(
                          constraints: BoxConstraints(
                            minHeight: 110,
                            maxHeight: cardHeight,
                            minWidth: double.infinity,
                          ),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Color(0xFF3177FF), Color(0xFF967CFD)],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                            borderRadius: BorderRadius.circular(32),
                          ),
                          padding: EdgeInsets.all(6.w),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "STOCK",
                                style: GoogleFonts.montserrat(
                                  fontSize: 15.sp,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                              Spacer(),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  _loadingStockStats
                                      ? SizedBox(
                                          width: 24,
                                          height: 24,
                                          child: CircularProgressIndicator(
                                            color: Colors.white,
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : Text(
                                          _stocksStats?.totalArticles
                                                  .toString() ??
                                              "-",
                                          style: GoogleFonts.montserrat(
                                            fontSize: 19.sp,
                                            fontWeight: FontWeight.w700,
                                            color: Colors.white,
                                          ),
                                        ),
                                  GestureDetector(
                                    onTap: _showUnitFilterDialog,
                                    child: _buildChip(_selectedUnit),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    );
                  },
                ),
                SizedBox(height: 21),
                Text(
                  "Dernières activités",
                  style: GoogleFonts.montserrat(
                    fontSize: 17.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                SizedBox(height: 11),
                Row(
                  children: [
                    _buildActivityFilter(
                      "Aujourd'hui",
                      _selectedActivityFilter == "Aujourd'hui",
                    ),
                    SizedBox(width: 8),
                    _buildActivityFilter(
                      "Semaine dernière",
                      _selectedActivityFilter == "Semaine dernière",
                    ),
                  ],
                ),
                SizedBox(height: 17),
                if (_loadingHistory)
                  Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 4.h),
                      child: CircularProgressIndicator(
                        color: Color(0xFF007AFF),
                      ),
                    ),
                  )
                else if (visibleHistory.isEmpty)
                  Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 4.h),
                      child: Text(
                        "Aucun historique récent",
                        style: GoogleFonts.poppins(
                          fontSize: 13.sp,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: visibleHistory.length + (hasMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == visibleHistory.length && hasMore) {
                        return Center(
                          child: TextButton(
                            onPressed: _loadMoreHistory,
                            child: Text(
                              "Voir plus",
                              style: TextStyle(color: Color(0xFF007AFF)),
                            ),
                          ),
                        );
                      }
                      final action = visibleHistory[index];
                      return _buildHistoryActionItem(
                        action,
                        index,
                        visibleHistory.length,
                      );
                    },
                  ),
                SizedBox(height: 38),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActivityFilter(String text, bool isSelected) {
    return GestureDetector(
      onTap: () async {
        setState(() {
          _selectedActivityFilter = text;
          _loadingHistory = true;
        });
        await _loadUserAndHistory();
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 1.7.h),
        decoration: BoxDecoration(
          color: isSelected ? Color(0xFF007AFF) : Colors.grey[100],
          borderRadius: BorderRadius.circular(26),
        ),
        child: Text(
          text,
          style: GoogleFonts.poppins(
            fontSize: 14.sp,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : Colors.grey[600],
          ),
        ),
      ),
    );
  }

  Widget _buildHistoryActionItem(
    HistoriqueAction action,
    int index,
    int total,
  ) {
    final Map<ActionType, IconData> icons = {
      ActionType.creation: Icons.add_circle_outline,
      ActionType.modification: Icons.edit,
      ActionType.suppression: Icons.delete_outline,
      ActionType.validation: Icons.check_circle_outline,
      ActionType.connexion: Icons.login,
      ActionType.autre: Icons.help_outline,
    };
    final Map<ActionType, Color> colors = {
      ActionType.creation: Color(0xFF007AFF),
      ActionType.modification: Color(0xFF007AFF),
      ActionType.suppression: Color(0xFF007AFF),
      ActionType.validation: Color(0xFF007AFF),
      ActionType.connexion: Color(0xFF007AFF),
      ActionType.autre: Color(0xFF007AFF),
    };

    final icon = icons[action.actionType] ?? Icons.history;
    final color = colors[action.actionType] ?? Colors.grey;
    String dateStr =
        "${action.dateAction.day.toString().padLeft(2, '0')}/${action.dateAction.month.toString().padLeft(2, '0')}/${action.dateAction.year} - ${action.dateAction.hour.toString().padLeft(2, '0')}:${action.dateAction.minute.toString().padLeft(2, '0')}";

    return Container(
      margin: EdgeInsets.only(bottom: 1.7.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 3.w,
                height: 3.w,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              ),
              if (index < total - 1)
                Container(width: 2, height: 6.h, color: Colors.grey[300]),
            ],
          ),
          SizedBox(width: 4.w),
          Expanded(
            child: Column(
              children: [
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 2.w),
                  child: Row(
                    children: [
                      Container(
                        padding: EdgeInsets.all(2.w),
                        decoration: BoxDecoration(
                          color: color,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(icon, color: Colors.white, size: 4.w),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              action.description,
                              style: GoogleFonts.poppins(
                                fontSize: 13.sp,
                                fontWeight: FontWeight.w500,
                                color: Colors.black87,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            SizedBox(height: 0.5.h),
                            Text(
                              dateStr,
                              style: GoogleFonts.poppins(
                                fontSize: 11.sp,
                                color: Colors.grey[500],
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (index < total - 1) SizedBox(height: 1.h),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showTimeFilterDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Choisir la période", style: GoogleFonts.montserrat()),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildTimeFilterOption("jour"),
              _buildTimeFilterOption("semaine"),
              _buildTimeFilterOption("mois"),
              _buildTimeFilterOption("total")
            ],
          ),
        );
      },
    );
  }

  Widget _buildTimeFilterOption(String option) {
    return ListTile(
      title: Text(option, style: GoogleFonts.poppins()),
      trailing: _selectedTimeFilter == option
          ? Icon(Icons.check, color: Color(0xFF007AFF))
          : null,
      onTap: () {
        setState(() {
          _selectedTimeFilter = option;
        });
        Navigator.pop(context);
        _loadStats();
      },
    );
  }

  void _showCardTypeDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Choisir le type", style: GoogleFonts.montserrat()),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildCardTypeOption("Livraison"),
              _buildCardTypeOption("Sortie"),
              _buildCardTypeOption("Retour"),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCardTypeOption(String option) {
    return ListTile(
      title: Text(option, style: GoogleFonts.poppins()),
      trailing: _selectedCardType == option
          ? Icon(Icons.check, color: Color(0xFF007AFF))
          : null,
      onTap: () {
        setState(() {
          _selectedCardType = option;
        });
        Navigator.pop(context);
      },
    );
  }

  void _showUnitFilterDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Choisir l'unité", style: GoogleFonts.montserrat()),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildUnitFilterOption("m3"),
              _buildUnitFilterOption("m"),
              _buildUnitFilterOption("autre"),
              _buildUnitFilterOption("kg"),
              _buildUnitFilterOption("litre"),
              _buildUnitFilterOption("unite"),
            ],
          ),
        );
      },
    );
  }

  Widget _buildChip(String text) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Text(
            text,
            style: GoogleFonts.poppins(fontSize: 12.sp, color: Colors.white),
          ),
          SizedBox(width: 1.w),
          Icon(Icons.keyboard_arrow_down, color: Colors.white, size: 4.w),
        ],
      ),
    );
  }

  Widget _buildUnitFilterOption(String option) {
    return ListTile(
      title: Text(option, style: GoogleFonts.poppins()),
      trailing: _selectedUnit == option
          ? Icon(Icons.check, color: Color(0xFF007AFF))
          : null,
      onTap: () {
        setState(() {
          _selectedUnit = option;
        });
        print("Unité sélectionnée : $option");
        Navigator.pop(context);
        _loadStockStats();
      },
    );
  }
}