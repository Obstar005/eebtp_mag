import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:sizer/sizer.dart';
import 'package:eebtp_frontend/widgets/nav.dart';

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

  final List<ActivityItem> _todayActivities = [
    ActivityItem(type: ActivityType.reload, title: "Rechargement de stock effectué", time: "Depuis 2 heures", icon: Icons.refresh, color: Color(0xFF007AFF)),
    ActivityItem(type: ActivityType.gauge, title: "Niveau de stock vérifié", time: "Depuis 3 heures", icon: Icons.speed, color: Color(0xFF007AFF)),
    ActivityItem(type: ActivityType.entry, title: "Nouvelle entrée de produits", time: "Depuis 4 heures", icon: Icons.login, color: Color(0xFF007AFF)),
    ActivityItem(type: ActivityType.entry, title: "Commande reçue du fournisseur", time: "Depuis 5 heures", icon: Icons.login, color: Color(0xFF007AFF)),
  ];
  final List<ActivityItem> _lastWeekActivities = [
    ActivityItem(type: ActivityType.exit, title: "Sortie de produits pour vente", time: "Il y a 3 jours", icon: Icons.logout, color: Color(0xFF007AFF)),
    ActivityItem(type: ActivityType.entry, title: "Réapprovisionnement hebdomadaire", time: "Il y a 4 jours", icon: Icons.login, color: Color(0xFF007AFF)),
    ActivityItem(type: ActivityType.other, title: "Inventaire hebdomadaire complété", time: "Il y a 5 jours", icon: Icons.inventory, color: Color(0xFF8E8E93)),
  ];
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (mounted) {
      Provider.of<AuthProvider>(context, listen: false).checkTokenExpiry(context);
    }
  });
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
                width: 54, height: 54,
                decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white),
                child: ClipOval(child: Image.asset("assets/profile.png", fit: BoxFit.cover)),
              ),
              SizedBox(width: 2.w),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text("John Doe", style: GoogleFonts.montserrat(fontSize: 19, fontWeight: FontWeight.w600, color: Colors.white)),
                  SizedBox(height: 2),
                  Text("Magasinier", style: GoogleFonts.montserrat(fontSize: 14, fontWeight: FontWeight.w400, color: Colors.white.withOpacity(0.9))),
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
                ListView.builder(
                  shrinkWrap: true,
                  physics: NeverScrollableScrollPhysics(),
                  itemCount: _selectedActivityFilter == "Aujourd'hui" ? _todayActivities.length : _lastWeekActivities.length,
                  itemBuilder: (context, index) {
                    final activities = _selectedActivityFilter == "Aujourd'hui" ? _todayActivities : _lastWeekActivities;
                    return _buildActivityItem(activities[index], index, activities.length);
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
  Widget _buildActivityItem(ActivityItem activity, int index, int totalItems) {
    return Container(
      margin: EdgeInsets.only(bottom: 1.7.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(width: 3.w, height: 3.w, decoration: BoxDecoration(color: activity.color, shape: BoxShape.circle)),
              if (index < totalItems - 1) Container(width: 2, height: 6.h, color: Colors.grey[300]),
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
                        decoration: BoxDecoration(color: activity.color, shape: BoxShape.circle),
                        child: Icon(activity.icon, color: Colors.white, size: 4.w),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(activity.title, style: GoogleFonts.poppins(fontSize: 13.sp, fontWeight: FontWeight.w500, color: Colors.black87), maxLines: 2, overflow: TextOverflow.ellipsis),
                            SizedBox(height: 0.5.h),
                            Text(activity.time, style: GoogleFonts.poppins(fontSize: 11.sp, color: Colors.grey[500], fontStyle: FontStyle.italic)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (index < totalItems - 1) SizedBox(height: 1.h),
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
