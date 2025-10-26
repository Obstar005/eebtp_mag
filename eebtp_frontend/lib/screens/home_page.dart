import 'package:eebtp_frontend/models/history.dart';
import 'package:eebtp_frontend/services/historiqueService.dart';
import 'package:eebtp_frontend/models/utilisateur.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:eebtp_frontend/services/auth.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:sizer/sizer.dart';

enum ActivityType { reload, gauge, entry, exit, other }

class ActivityItem {
  final ActivityType type;
  final String title;
  final String time;
  final IconData icon;
  final Color color;

  ActivityItem({
    required this.type,
    required this.title,
    required this.time,
    required this.icon,
    required this.color,
  });
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedActivityFilter = "Aujourd'hui";
  String _selectedTimeFilter = "1 Jour";
  String _selectedUnit = "Kilogramme";
  String _selectedCardType = "Entrée";

  Utilisateur? _user;
  List<HistoriqueAction> _allHistory = [];
  bool _loadingUser = true;
  bool _loadingHistory = true;

  final HistoryService _historyService = HistoryService();
  final UserService _userService = UserService();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadUserAndHistory());
  }

  Future<void> _loadUserAndHistory() async {
    try {
      final token = context.read<AuthProvider>().token;
      if (token == null) return;

      setState(() {
        _loadingUser = true;
        _loadingHistory = true;
      });

      final fetchedUser = await _userService.getUserInfo(token);
      final fetchedHistory = await _historyService.getHistoriqueUser(token);

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
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Map<String, dynamic> _getCardData() {
    switch (_selectedCardType) {
      case "Entrée":
        return {"title": "ENTRÉE", "icon": Icons.login, "value": "55", "color": Color.fromRGBO(67, 58, 75, 1)};
      case "Sortie":
        return {"title": "SORTIE", "icon": Icons.logout, "value": "40", "color": Color.fromRGBO(67, 58, 75, 1)};
      case "Retour":
        return {"title": "RETOUR", "icon": Icons.undo, "value": "8", "color": Color.fromRGBO(67, 58, 75, 1)};
      default:
        return {"title": "ENTRÉE", "icon": Icons.login, "value": "55", "color": Color.fromRGBO(67, 58, 75, 1)};
    }
  }

  @override
  Widget build(BuildContext context) {
    final cardData = _getCardData();
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
                decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white),
                child: ClipOval(
                  child: _loadingUser
                      ? Container(color: Colors.white)
                      : _user != null && _user!.photoProfil != null
                        ? Image.network(_user!.photoProfil!, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Image.asset("assets/profile.png", fit: BoxFit.cover))
                        : Image.asset("assets/profile.png", fit: BoxFit.cover),
                ),
              ),
              SizedBox(width: 2.w),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _loadingUser
                      ? Container(width: 80, height: 14, color: Colors.white.withOpacity(0.3))
                      : Text(
                          "${_user?.firstName ?? ""} ${_user?.lastName ?? ""}",
                          style: GoogleFonts.montserrat(
                              fontSize: 19, fontWeight: FontWeight.w600, color: Colors.white),
                        ),
                  SizedBox(height: 2),
                  _loadingUser
                      ? Container(width: 60, height: 12, color: Colors.white.withOpacity(0.3))
                      : Text(
                          _user?.poste ?? "",
                          style: GoogleFonts.montserrat(
                              fontSize: 14, fontWeight: FontWeight.w400, color: Colors.white.withOpacity(0.9)),
                        ),
                ],
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
                      decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                      child: Icon(Icons.notifications_outlined, size: 27, color: Color(0xFF007AFF)),
                    ),
                  ),
                  Positioned(
                    right: 0, top: 0,
                    child: Container(
                      padding: EdgeInsets.all(5),
                      decoration: BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                      child: Text("3", style: TextStyle(color: Colors.white, fontSize: 14.sp, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
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
                      hintStyle: GoogleFonts.poppins(fontSize: 13.sp, color: Colors.grey[400]),
                      prefixIcon: Icon(Icons.search, color: Colors.black54, size: 23),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                    ),
                  ),
                ),
                SizedBox(height: 16),
                LayoutBuilder(builder: (context, constraints) {
                  double cardHeight = constraints.maxWidth > 340 ? 18.h : 120;
                  return Column(children: [
                    Container(
                      constraints: BoxConstraints(minHeight: 110, maxHeight: cardHeight, minWidth: double.infinity),
                      decoration: BoxDecoration(color: cardData["color"], borderRadius: BorderRadius.circular(32)),
                      padding: EdgeInsets.all(6.w),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(cardData["title"], style: GoogleFonts.montserrat(fontSize: 15.sp, color: Colors.white, fontWeight: FontWeight.w600)),
                              GestureDetector(onTap: _showTimeFilterDialog, child: _buildChip(_selectedTimeFilter)),
                            ],
                          ),
                          SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(cardData["icon"], color: Colors.white, size: 34),
                                  GestureDetector(onTap: _showCardTypeDialog, child: Icon(Icons.expand_more, color: Colors.white, size: 24)),
                                  SizedBox(width: 14),
                                  Text(cardData["value"], style: GoogleFonts.montserrat(fontSize: 20.sp, fontWeight: FontWeight.w700, color: Colors.white)),
                                ],
                              ),
                              GestureDetector(onTap: _showUnitFilterDialog, child: _buildChip(_selectedUnit)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 19),
                    Container(
                      constraints: BoxConstraints(minHeight: 110, maxHeight: cardHeight, minWidth: double.infinity),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: [ Color(0xFF3177FF),Color(0xFF967CFD)], begin: Alignment.centerLeft, end: Alignment.centerRight),
                        borderRadius: BorderRadius.circular(32),
                      ),
                      padding: EdgeInsets.all(6.w),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("STOCK", style: GoogleFonts.montserrat(fontSize: 15.sp, fontWeight: FontWeight.w600, color: Colors.white)),
                          Spacer(),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text("100", style: GoogleFonts.montserrat(fontSize: 19.sp, fontWeight: FontWeight.w700, color: Colors.white)),
                              GestureDetector(onTap: _showUnitFilterDialog, child: _buildChip(_selectedUnit)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ]);
                }),
                SizedBox(height: 21),
                Text("Dernières activités", style: GoogleFonts.montserrat(fontSize: 17.sp, fontWeight: FontWeight.w600, color: Colors.black87)),
                SizedBox(height: 11),
                Row(
                  children: [
                    _buildActivityFilter("Aujourd'hui", _selectedActivityFilter == "Aujourd'hui"),
                    SizedBox(width: 8),
                    _buildActivityFilter("Semaine dernière", _selectedActivityFilter == "Semaine dernière"),
                  ],
                ),
                SizedBox(height: 17),
                if (_loadingHistory)
                  Center(child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 4.h),
                    child: CircularProgressIndicator(color: Color(0xFF007AFF)),
                  ))
                else if (_allHistory.isEmpty)
                  Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 4.h),
                      child: Text("Aucun historique récent", style: GoogleFonts.poppins(fontSize: 13.sp, color: Colors.grey)),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: _allHistory.length,
                    itemBuilder: (context, index) {
                      final action = _allHistory[index];
                      return _buildHistoryActionItem(action, index, _allHistory.length);
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
      onTap: () { setState(() { _selectedActivityFilter = text; }); },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 1.7.h),
        decoration: BoxDecoration(color: isSelected ? Color(0xFF007AFF) : Colors.grey[100], borderRadius: BorderRadius.circular(26)),
        child: Text(text, style: GoogleFonts.poppins(fontSize: 14.sp, fontWeight: FontWeight.w500, color: isSelected ? Colors.white : Colors.grey[600])),
      ),
    );
  }

  Widget _buildHistoryActionItem(HistoriqueAction action, int index, int total) {
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
      ActionType.suppression:Color(0xFF007AFF),
      ActionType.validation: Color(0xFF007AFF),
      ActionType.connexion: Color(0xFF007AFF),
      ActionType.autre: Color(0xFF007AFF)
    };

    final icon = icons[action.actionType] ?? Icons.history;
    final color = colors[action.actionType] ?? Colors.grey;
    String dateStr = "${action.dateAction.day.toString().padLeft(2, '0')}/${action.dateAction.month.toString().padLeft(2, '0')}/${action.dateAction.year} - ${action.dateAction.hour.toString().padLeft(2, '0')}:${action.dateAction.minute.toString().padLeft(2, '0')}";

    return Container(
      margin: EdgeInsets.only(bottom: 1.7.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(width: 3.w, height: 3.w, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
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
                        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                        child: Icon(icon, color: Colors.white, size: 4.w),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              action.description,
                              style: GoogleFonts.poppins(fontSize: 13.sp, fontWeight: FontWeight.w500, color: Colors.black87),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            SizedBox(height: 0.5.h),
                            Text(dateStr, style: GoogleFonts.poppins(fontSize: 11.sp, color: Colors.grey[500], fontStyle: FontStyle.italic)),
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
    showDialog(context: context, builder: (BuildContext context) {
      return AlertDialog(
        title: Text("Choisir la période", style: GoogleFonts.montserrat()),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          _buildTimeFilterOption("1 Jour"),
          _buildTimeFilterOption("1 Semaine"),
          _buildTimeFilterOption("1 Mois"),
        ]),
      );
    });
  }
  Widget _buildTimeFilterOption(String option) {
    return ListTile(
      title: Text(option, style: GoogleFonts.poppins()),
      trailing: _selectedTimeFilter == option ? Icon(Icons.check, color: Color(0xFF007AFF)) : null,
      onTap: () { setState(() { _selectedTimeFilter = option; }); Navigator.pop(context); },
    );
  }
  void _showCardTypeDialog() {
    showDialog(context: context, builder: (BuildContext context) {
      return AlertDialog(
        title: Text("Choisir le type", style: GoogleFonts.montserrat()),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          _buildCardTypeOption("Entrée"),
          _buildCardTypeOption("Sortie"),
          _buildCardTypeOption("Retour"),
        ]),
      );
    });
  }
  Widget _buildCardTypeOption(String option) {
    return ListTile(
      title: Text(option, style: GoogleFonts.poppins()),
      trailing: _selectedCardType == option ? Icon(Icons.check, color: Color(0xFF007AFF)) : null,
      onTap: () { setState(() { _selectedCardType = option; }); Navigator.pop(context); },
    );
  }
  void _showUnitFilterDialog() {
    showDialog(context: context, builder: (BuildContext context) {
      return AlertDialog(
        title: Text("Choisir l'unité", style: GoogleFonts.montserrat()),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          _buildUnitFilterOption("Kilogramme"),
          _buildUnitFilterOption("Gramme"),
          _buildUnitFilterOption("Litre"),
          _buildUnitFilterOption("Pièce"),
        ]),
      );
    });
  }
  Widget _buildChip(String text) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
      child: Row(children: [
        Text(text, style: GoogleFonts.poppins(fontSize: 12.sp, color: Colors.white)),
        SizedBox(width: 1.w),
        Icon(Icons.keyboard_arrow_down, color: Colors.white, size: 4.w),
      ]),
    );
  }
  Widget _buildUnitFilterOption(String option) {
    return ListTile(
      title: Text(option, style: GoogleFonts.poppins()),
      trailing: _selectedUnit == option ? Icon(Icons.check, color: Color(0xFF007AFF)) : null,
      onTap: () { setState(() { _selectedUnit = option; }); Navigator.pop(context); },
    );
  }
}
