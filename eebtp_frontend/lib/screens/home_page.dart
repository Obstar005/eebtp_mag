import 'dart:ui';
import 'package:eebtp_frontend/widgets/nav.dart'; // Importez votre NavContainer
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

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
  String _selectedCardType = "Entrée"; // Entrée, Sortie, Retour

  // Données simulées pour les activités
  final List<ActivityItem> _todayActivities = [
    ActivityItem(
      type: ActivityType.reload,
      title: "Rechargement de stock effectué",
      time: "Depuis 2 heures",
      icon: Icons.refresh,
      color: Color(0xFF007AFF),
    ),
    ActivityItem(
      type: ActivityType.gauge,
      title: "Niveau de stock vérifié",
      time: "Depuis 3 heures",
      icon: Icons.speed,
      color: Color(0xFF007AFF),
    ),
    ActivityItem(
      type: ActivityType.entry,
      title: "Nouvelle entrée de produits",
      time: "Depuis 4 heures",
      icon: Icons.login,
      color: Color(0xFF007AFF),
    ),
    ActivityItem(
      type: ActivityType.entry,
      title: "Commande reçue du fournisseur",
      time: "Depuis 5 heures",
      icon: Icons.login,
      color: Color(0xFF007AFF),
    ),
  ];

  final List<ActivityItem> _lastWeekActivities = [
    ActivityItem(
      type: ActivityType.exit,
      title: "Sortie de produits pour vente",
      time: "Il y a 3 jours",
      icon: Icons.logout,
      color: Color(0xFF007AFF),
    ),
    ActivityItem(
      type: ActivityType.entry,
      title: "Réapprovisionnement hebdomadaire",
      time: "Il y a 4 jours",
      icon: Icons.login,
      color: Color(0xFF007AFF),
    ),
    ActivityItem(
      type: ActivityType.other,
      title: "Inventaire hebdomadaire complété",
      time: "Il y a 5 jours",
      icon: Icons.inventory,
      color: Color(0xFF8E8E93),
    ),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // Fonction pour obtenir les données selon le type de carte sélectionné
  Map<String, dynamic> _getCardData() {
    switch (_selectedCardType) {
      case "Entrée":
        return {
          "title": "ENTRÉE",
          "icon": Icons.login,
          "value": "55",
          "color": Color.fromRGBO(67, 58, 75, 1),
        };
      case "Sortie":
        return {
          "title": "SORTIE",
          "icon": Icons.logout,
          "value": "40",
          "color": Color.fromRGBO(67, 58, 75, 1),
        };
      case "Retour":
        return {
          "title": "RETOUR",
          "icon": Icons.undo,
          "value": "8",
          "color": Color.fromRGBO(67, 58, 75, 1),
        };
      default:
        return {
          "title": "ENTRÉE",
          "icon": Icons.login,
          "value": "55",
          "color": Color.fromRGBO(67, 58, 75, 1),
        };
    }
  }

  @override
  Widget build(BuildContext context) {
    final cardData = _getCardData();

    return NavContainer(
      initialIndex: 0, // Index pour "Home"
      body: Scaffold(
        extendBody: true,
        backgroundColor: const Color.fromARGB(255, 255, 255, 255),
        appBar: AppBar(
          backgroundColor: const Color(0xFF007AFF),
          elevation: 0,
          automaticallyImplyLeading: false, // enlève la flèche retour
          toolbarHeight: 95, // AppBar plus haute
          title: Row(
            children: [
              // Photo de profil
              CircleAvatar(
                radius: 29, // un peu plus grand
                backgroundColor: Colors.white,
                child: ClipOval(
                  child: Image.asset("assets/profile.png", fit: BoxFit.cover),
                ),
              ),
              SizedBox(width: 3.w),

              // Infos utilisateur
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment:
                    MainAxisAlignment.center, // bien centré verticalement
                children: [
                  Text(
                    "John Doe",
                    style: GoogleFonts.montserrat(
                      fontSize: 16.sp, // plus grand
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 0.3.h), // petit espacement
                  Text(
                    "Magasinier",
                    style: GoogleFonts.montserrat(
                      fontSize: 14.sp, // plus petit
                      fontWeight: FontWeight.w400,
                      color: Colors.white.withOpacity(0.9),
                    ),
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
                      padding: EdgeInsets.all(2.5.w),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.notifications_outlined,
                        size:
                            6.5.w, // légèrement réduit pour être proportionnel
                        color: Color(0xFF007AFF),
                      ),
                    ),
                  ),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: EdgeInsets.all(1.2.w),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        "3",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14.sp,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Montserrat',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),

        body: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              children: [
                SizedBox(height: 3.h),
                // ----------- Contenu principal -----------
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 6.w),
                  child: Column(
                    children: [
                      // Barre de recherche
                      Container(
                        height: 5.h,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(25),
                          border: Border.all(color: const Color.fromRGBO(214, 214, 214, 1)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: "Rechercher une entrée, sortie...",
                            hintStyle: GoogleFonts.poppins(
                              fontSize: 14.sp,
                              color: Colors.grey[400],
                            ),
                            prefixIcon: Icon(
                              Icons.search,
                              color: const Color.fromARGB(255, 34, 34, 34),
                              size: 6.w,
                            ),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 4.w,
                              vertical: 2.h,
                            ),
                          ),
                        ),
                      ),

                      SizedBox(height: 1.h),

                      // ----------- Cartes Entrée/Sortie/Retour et Stock -----------
                      Column(
                        children: [
                          // Carte Entrée/Sortie/Retour
                          Container(
                            height: 16.5.h, // au lieu de plein
                            decoration: BoxDecoration(
                              color: cardData["color"],
                              borderRadius: BorderRadius.circular(
                                8.w,
                              ), // coins moins grands
                              boxShadow: [
                                BoxShadow(color: Colors.black12, blurRadius: 8),
                              ],
                            ),
                            padding: EdgeInsets.all(6.w),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      cardData["title"],
                                      style: GoogleFonts.montserrat(
                                        fontSize: 14.sp,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white,
                                      ),
                                    ),
                                    GestureDetector(
                                      onTap: _showTimeFilterDialog,
                                      child: _buildChip(_selectedTimeFilter),
                                    ),
                                  ],
                                ),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    // Partie gauche : icône + flèche
                                    Row(
                                      children: [
                                        Icon(
                                          cardData["icon"],
                                          color: Colors.white,
                                          size: 8.w,
                                        ),

                                        GestureDetector(
                                          onTap: _showCardTypeDialog,
                                          child: Icon(
                                            Icons.expand_more,
                                            color: Colors.white,
                                            size: 6.w,
                                          ),
                                        ),
                                        SizedBox(width: 3.w),
                                        Text(
                                          cardData["value"],
                                          style: GoogleFonts.montserrat(
                                            fontSize: 24.sp,
                                            fontWeight: FontWeight.w700,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ],
                                    ),

                                    // Partie droite : chip interactif
                                    GestureDetector(
                                      onTap: _showUnitFilterDialog,
                                      child: _buildChip(_selectedUnit),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          SizedBox(height: 4.w),

                          // Carte Stock
                          Container(
                            height: 16.5.h, // réduit
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [ Color.fromRGBO(150, 124, 253, 1),Color.fromRGBO(49, 119, 255, 1),],
                                /*    begin: Alignment.topLeft,
                                end: Alignment.bottomRight, */
                                begin: Alignment(1.00, 0.50),
                                end: Alignment(-0.00, 0.50),
                              ),
                              borderRadius: BorderRadius.circular(8.w),
                              boxShadow: [
                                BoxShadow(color: Colors.black12, blurRadius: 8),
                              ],
                            ),
                            padding: EdgeInsets.all(8.w),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "STOCK",
                                  style: GoogleFonts.montserrat(
                                    fontSize: 12.sp,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                                const Spacer(),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "100",
                                      style: GoogleFonts.montserrat(
                                        fontSize: 18.sp, // réduit
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
                      ),

                      SizedBox(height: 4.h),

                      // ----------- Section Dernières activités -----------
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Dernières activités",
                            style: GoogleFonts.montserrat(
                              fontSize: 18.sp,
                              fontWeight: FontWeight.w600,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),

                      SizedBox(height: 2.h),

                      // Filtres d'activité
                      Row(
                        children: [
                          _buildActivityFilter(
                            "Aujourd'hui",
                            _selectedActivityFilter == "Aujourd'hui",
                          ),
                          SizedBox(width: 3.w),
                          _buildActivityFilter(
                            "Semaine dernière",
                            _selectedActivityFilter == "Semaine dernière",
                          ),
                        ],
                      ),

                      SizedBox(height: 3.h),

                      // Liste des activités avec moins d'espacement
                      ListView.builder(
                        shrinkWrap: true,
                        physics: NeverScrollableScrollPhysics(),
                        itemCount: _selectedActivityFilter == "Aujourd'hui"
                            ? _todayActivities.length
                            : _lastWeekActivities.length,
                        itemBuilder: (context, index) {
                          final activities =
                              _selectedActivityFilter == "Aujourd'hui"
                              ? _todayActivities
                              : _lastWeekActivities;
                          return _buildActivityItem(
                            activities[index],
                            index,
                            activities.length,
                          );
                        },
                      ),

                      SizedBox(height: 8.h), // Espace pour le FAB
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ------------------- Helpers -------------------
  Widget _buildActivityFilter(String text, bool isSelected) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedActivityFilter = text;
        });
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 1.5.h),
        decoration: BoxDecoration(
          color: isSelected ? Color(0xFF007AFF) : Colors.grey[100],
          borderRadius: BorderRadius.circular(25),
        ),
        child: Text(
          text,
          style: GoogleFonts.poppins(
            fontSize: 13.sp,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : Colors.grey[600],
          ),
        ),
      ),
    );
  }

  Widget _buildActivityItem(ActivityItem activity, int index, int totalItems) {
    return Container(
      margin: EdgeInsets.only(bottom: 1.5.h), // Réduit de 3.h à 1.5.h
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline avec point et ligne
          Column(
            children: [
              Container(
                width: 3.w,
                height: 3.w,
                decoration: BoxDecoration(
                  color: activity.color,
                  shape: BoxShape.circle,
                ),
              ),
              if (index < totalItems - 1)
                Container(
                  width: 2,
                  height: 6.h, // Réduit de 8.h à 6.h
                  color: Colors.grey[300],
                ),
            ],
          ),

          SizedBox(width: 4.w),

          // Contenu de l'activité
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
                          color: activity.color,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          activity.icon,
                          color: Colors.white,
                          size: 4.w,
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              activity.title,
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
                              activity.time,
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
                if (index < totalItems - 1)
                  SizedBox(height: 1.h), // Réduit de 2.h à 1.h
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
              _buildTimeFilterOption("1 Jour"),
              _buildTimeFilterOption("1 Semaine"),
              _buildTimeFilterOption("1 Mois"),
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
              _buildCardTypeOption("Entrée"),
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
              _buildUnitFilterOption("Kilogramme"),
              _buildUnitFilterOption("Gramme"),
              _buildUnitFilterOption("Litre"),
              _buildUnitFilterOption("Pièce"),
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
        borderRadius: BorderRadius.circular(4.w),
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
        Navigator.pop(context);
      },
    );
  }
}

// ----------- Modèles de données -----------
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
