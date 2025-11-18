import 'dart:convert';
import 'dart:ui';
import 'package:eebtp_frontend/models/entry_item.dart';
import 'package:eebtp_frontend/models/exit_item.dart';
import 'package:eebtp_frontend/models/stockitem.dart';
import 'package:eebtp_frontend/models/article.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:provider/provider.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:eebtp_frontend/services/stockservice.dart';
import 'package:eebtp_frontend/services/mouvement_service.dart';

class StockPage extends StatefulWidget {
  const StockPage({super.key});

  @override
  _StockPageState createState() => _StockPageState();
}

class _StockPageState extends State<StockPage> {
  int _stockTabIndex = 0;
  int _entreeSubTabIndex = 0;

  late StockService _stockService;
  late MouvementsService _mouvementsService;

  List<StockItem> _stockItems = [];
  List<Entree> _entrees = [];
  List<Sortie> _sorties = [];

  Map<int, ArticleStock> _articlesCache = {};

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        Provider.of<AuthProvider>(
          context,
          listen: false,
        ).checkTokenExpiry(context);
      }

      _initializeServices();
    });
  }

  void _initializeServices() {
    final token = context.read<AuthProvider>().token;
    final storeId = context.read<AuthProvider>().storeId;

    if (token != null) {
      _stockService = StockService(token: token);
      _mouvementsService = MouvementsService(token: token);
      _loadAllData(storeId);
    }
  }

  Future<void> _loadAllData(int? storeId) async {
    if (storeId == null) return;

    setState(() => _isLoading = true);

    try {
      final futures = await Future.wait([
        _loadStockItems(storeId),
        _loadEntrees(storeId),
        _loadSorties(storeId),
      ]);

      setState(() {
        _stockItems = futures[0] as List<StockItem>;
        _entrees = futures[1] as List<Entree>;
        _sorties = futures[2] as List<Sortie>;
        _isLoading = false;
      });

      await _loadArticlesForStockItems();
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorSnackBar("Erreur lors du chargement des données: $e");
    }
  }

  Future<List<StockItem>> _loadStockItems(int storeId) async {
    try {
      return await _stockService.getStockItemsByMagasin(storeId);
    } catch (e) {
      print("Erreur chargement stock items: $e");
      return [];
    }
  }

  Future<List<Entree>> _loadEntrees(int storeId) async {
    try {
      final response = await _mouvementsService.getEntreesByMagasin(storeId);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.body is String
            ? jsonDecode(response.body)
            : response.body;

        return data.map((json) => Entree.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print("Erreur chargement entrées: $e");
      return [];
    }
  }

  Future<List<Sortie>> _loadSorties(int storeId) async {
    try {
      final response = await _mouvementsService.getSortiesByMagasin(storeId);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.body is String
            ? jsonDecode(response.body)
            : response.body;

        return data.map((json) => Sortie.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print("Erreur chargement sorties: $e");
      return [];
    }
  }

  Future<void> _loadArticlesForStockItems() async {
    for (final stockItem in _stockItems) {
      if (!_articlesCache.containsKey(stockItem.produit)) {
        try {
          final article = await _stockService.getArticleDetail(
            stockItem.produit,
          );
          if (!mounted) return;
          setState(() {
            _articlesCache[stockItem.produit] = article;
          });
        } catch (e) {
          if (!mounted) return;
          print("Erreur chargement article ${stockItem.produit}: $e");
        }
      }
    }
  }

  ArticleStock? _getArticleForStockItem(int produitId) {
    return _articlesCache[produitId];
  }

  Future<void> _refreshData() async {
    final storeId = context.read<AuthProvider>().storeId;
    _articlesCache.clear();
    await _loadAllData(storeId);
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        action: SnackBarAction(
          label: 'Réessayer',
          textColor: Colors.white,
          onPressed: _refreshData,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final storeId = context.watch<AuthProvider>().storeId;
    final token = context.watch<AuthProvider>().token;
    final magasinName = _stockItems.isNotEmpty
        ? _stockItems[0].magasinName
        : null;

    if (token == null || storeId == null) {
      return NavContainer(
        initialIndex: 1,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 20.w, color: Colors.grey),
              SizedBox(height: 2.h),
              Text(
                "Veuillez vous connecter et sélectionner un magasin",
                style: GoogleFonts.montserrat(
                  fontSize: 16.sp,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return NavContainer(
      initialIndex: 1,
      body: Column(
        children: [
          // ✅ Header NON-SCROLLABLE
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF007AFF), Color(0xFF0056CC)],
              ),
            ),
            child: SafeArea(
              bottom: false,
              child: Column(
                children: [
                  Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: 6.w,
                      vertical: 2.h,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Stocks",
                              style: GoogleFonts.montserrat(
                                fontSize: 18.sp,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              magasinName != null ? magasinName : "Magasin",
                              style: GoogleFonts.montserrat(
                                fontSize: 12.sp,
                                fontWeight: FontWeight.w400,
                                color: Colors.white.withOpacity(0.8),
                              ),
                            ),
                          ],
                        ),
                        // ✅ ICÔNE REFRESH SUPPRIMÉE - Seulement notifications
                        Stack(
                          children: [
                            GestureDetector(
                              onTap: () => Navigator.pushNamed(
                                context,
                                '/notifications',
                              ),
                              child: Container(
                                padding: EdgeInsets.all(2.w),
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.notifications_outlined,
                                  size: 6.w,
                                  color: const Color(0xFF007AFF),
                                ),
                              ),
                            ),
                            Positioned(
                              right: 0,
                              top: 0,
                              child: Container(
                                padding: EdgeInsets.all(1.w),
                                decoration: const BoxDecoration(
                                  color: Colors.red,
                                  shape: BoxShape.circle,
                                ),
                                child: Text(
                                  "3",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10.sp,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 2.h),
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 6.w),
                    padding: EdgeInsets.symmetric(
                      horizontal: 4.w,
                      vertical: 1.5.h,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10.w),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.search, color: Colors.grey, size: 6.w),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: Text(
                            "Recherche un produit, entrée ou sortie...",
                            style: GoogleFonts.montserrat(
                              color: Colors.grey,
                              fontSize: 14.sp,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 3.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildMainTab("Stock", 0),
                      _buildMainTab("Entrée", 1),
                      _buildMainTab("Sortie", 2),
                    ],
                  ),
                  SizedBox(height: 2.h),
                ],
              ),
            ),
          ),
          // ✅ CONTENU SCROLLABLE avec RefreshIndicator
          Expanded(
            child: Container(
              color: const Color(0xFFF8F9FA),
              child: _isLoading
                  ? _buildLoadingState()
                  : RefreshIndicator(
                      onRefresh: _refreshData,
                      color: const Color(0xFF007AFF),
                      backgroundColor: Colors.white,
                      displacement: 40,
                      strokeWidth: 2.5,
                      child: _buildTabContent(storeId),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: const Color(0xFF007AFF)),
          SizedBox(height: 2.h),
          Text(
            "Chargement des données...",
            style: GoogleFonts.montserrat(fontSize: 16.sp, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildMainTab(String title, int index) {
    bool isSelected = _stockTabIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _stockTabIndex = index),
      child: Column(
        children: [
          Text(
            title,
            style: GoogleFonts.montserrat(
              fontSize: 16.sp,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 1.h),
          Container(
            height: 2,
            width: title.length * 8.0,
            decoration: BoxDecoration(
              color: isSelected ? Colors.white : Colors.transparent,
              borderRadius: BorderRadius.circular(1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabContent(int storeId) {
    switch (_stockTabIndex) {
      case 0:
        if (_stockItems.isEmpty) {
          return _buildEmptyState("Aucun article en stock", Icons.inventory_2);
        }
        return ListView.builder(
          padding: EdgeInsets.all(4.w),
          physics: const AlwaysScrollableScrollPhysics(), // ✅ Ajouté
          itemCount: _stockItems.length,
          itemBuilder: (context, index) {
            return _buildStockItemCard(_stockItems[index]);
          },
        );
      case 1:
        return Column(
          children: [
            Container(
              color: const Color(0xFFF8F9FA),
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
              child: Row(
                children: [
                  _buildSubTab("Livraison", 0),
                  SizedBox(width: 4.w),
                  _buildSubTab("Retour", 1),
                ],
              ),
            ),
            Expanded(
              child: _entreeSubTabIndex == 0
                  ? _buildEntreeList("Livraison")
                  : _buildEntreeList("Retour"),
            ),
          ],
        );
      case 2:
        if (_sorties.isEmpty) {
          return _buildEmptyState(
            "Aucune sortie enregistrée",
            Icons.exit_to_app,
          );
        }
        return ListView.builder(
          padding: EdgeInsets.all(4.w),
          physics: const AlwaysScrollableScrollPhysics(), // ✅ Ajouté
          itemCount: _sorties.length,
          itemBuilder: (context, index) {
            return _buildExitCard(_sorties[index]);
          },
        );
      default:
        return _buildTabContent(storeId);
    }
  }

  Widget _buildSubTab(String title, int index) {
    bool isSelected = _entreeSubTabIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _entreeSubTabIndex = index),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 1.5.h),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF007AFF) : Colors.white,
          borderRadius: BorderRadius.circular(6.w),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF007AFF)
                : Colors.grey.withOpacity(0.3),
          ),
        ),
        child: Text(
          title,
          style: GoogleFonts.montserrat(
            fontSize: 14.sp,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : Colors.grey[600],
          ),
        ),
      ),
    );
  }

  Widget _buildEntreeList(String type) {
    final filteredEntrees = _entrees
        .where((entree) => entree.type == type)
        .toList();

    if (filteredEntrees.isEmpty) {
      return _buildEmptyState(
        "Aucune ${type == 'Livraison' ? 'Livraison' : 'Retour'} enregistrée",
        type == 'Livraison' ? Icons.local_shipping : Icons.keyboard_return,
      );
    }

    return ListView.builder(
      padding: EdgeInsets.all(4.w),
      physics: const AlwaysScrollableScrollPhysics(), // ✅ Ajouté
      itemCount: filteredEntrees.length,
      itemBuilder: (context, index) {
        return _buildEntryCard(filteredEntrees[index]);
      },
    );
  }

  Widget _buildEmptyState(String message, IconData icon) {
    // ✅ MODIFIÉ : Envelopper dans ListView pour le pull-to-refresh
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(height: 20.h), // Espace pour centrer visuellement
        Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 20.w, color: Colors.grey.withOpacity(0.5)),
              SizedBox(height: 2.h),
              Text(
                message,
                style: GoogleFonts.montserrat(
                  fontSize: 16.sp,
                  color: Colors.grey,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 2.h),
              ElevatedButton(
                onPressed: _refreshData,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF007AFF),
                ),
                child: Text(
                  "Actualiser",
                  style: GoogleFonts.montserrat(color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStockItemCard(StockItem stockItem) {
    final quantiteActuelle = double.tryParse(stockItem.quantite) ?? 0.0;
    final seuil = double.tryParse(stockItem.quantiteSeuil) ?? 0.0;
    final isLowStock = quantiteActuelle <= seuil && seuil > 0;

    final article = _getArticleForStockItem(stockItem.produit);

    return GestureDetector(
      onTap: () => _navigateToStockItemDetail(stockItem),
      child: Container(
        margin: EdgeInsets.only(bottom: 2.h),
        padding: EdgeInsets.all(4.w),
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(4.w),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "${stockItem.produitName ?? article?.designation ?? 'Produit #${stockItem.produit}'}"
                        .toUpperCase(),
                    style: GoogleFonts.montserrat(
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.black87,
                      letterSpacing: 0.3,
                    ),
                  ),
                  SizedBox(height: 0.5.h),
                  Text(
                    "PRD-${stockItem.produit.toString().padLeft(3, '0')}-${stockItem.id.toString().padLeft(2, '0')}",
                    style: GoogleFonts.montserrat(
                      fontSize: 14.sp,
                      color: const Color.fromRGBO(147, 147, 147, 1),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: 1.h),
                  Text(
                    article?.type ?? 'Matériel',
                    style: GoogleFonts.montserrat(
                      fontSize: 14.sp,
                      color: const Color.fromRGBO(147, 147, 147, 1),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(width: 3.w),
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 3.5.w,
                    vertical: 0.8.h,
                  ),
                  decoration: BoxDecoration(
                    color: isLowStock
                        ? const Color(0xFFFFE5E5)
                        : const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(5.w),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        "Seuil",
                        style: GoogleFonts.montserrat(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w600,
                          color: isLowStock
                              ? const Color(0xFFD32F2F)
                              : const Color(0xFF388E3C),
                        ),
                      ),
                      SizedBox(width: 1.w),
                      Icon(
                        isLowStock ? Icons.south_east : Icons.north_east,
                        color: isLowStock
                            ? const Color(0xFFD32F2F)
                            : const Color(0xFF388E3C),
                        size: 16.sp,
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 2.h),
                SizedBox(
                  width: 120,
                  child: Text(
                    "Quantité actuelle: ${quantiteActuelle.toStringAsFixed(2)} ${article?.unite ?? 't'}",
                    textAlign: TextAlign.right,
                    style: GoogleFonts.montserrat(
                      fontSize: 12.sp,
                      color: const Color.fromRGBO(147, 147, 147, 1),
                      fontWeight: FontWeight.w500,
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

  Widget _buildEntryCard(Entree entry) {
    final article = _getArticleForStockItem(entry.stockItem);
    String typeArticle = article?.type ?? "";
    String uniteArticle = article?.unite ?? "";

    String typeLabel = entry.type.toLowerCase() == "livraison"
        ? "Livré le"
        : (entry.type.toLowerCase() == "retour" ? "Retourné le" : "Entrée le");
    String dateAffiche = _formatShortDateHeure(entry.dateCreation);

    return GestureDetector(
      onTap: () => _navigateToEntryDetail(entry),
      child: Container(
        margin: EdgeInsets.only(bottom: 2.5.h),
        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 3.h),
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(4.w),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "${entry.stockItemName ?? 'StockItem #${entry.stockItem}'}"
                        .toUpperCase(),
                    style: GoogleFonts.montserrat(
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.black87,
                      letterSpacing: 0.3,
                    ),
                  ),
                  SizedBox(height: 0.5.h),
                  Text(
                    entry.stockItemType ?? '',
                    style: GoogleFonts.montserrat(
                      fontSize: 13.sp,
                      color: Colors.grey[500],
                    ),
                  ),
                  SizedBox(height: 2.2.h),
                  Text(
                    "PRD-${entry.stockItem.toString().padLeft(3, '0')}",
                    style: GoogleFonts.montserrat(
                      fontSize: 13.sp,
                      color: const Color.fromRGBO(147, 147, 147, 1),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(width: 3.w),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  "$typeLabel : $dateAffiche",
                  style: GoogleFonts.montserrat(
                    fontSize: 13.sp,
                    color: const Color.fromRGBO(147, 147, 147, 1),
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.right,
                ),
                SizedBox(height: 1.5.h),
                Text(
                  "Quantité : ${entry.quantiteM ?? '-'} $uniteArticle",
                  style: GoogleFonts.montserrat(
                    fontSize: 15.sp,
                    color: const Color.fromARGB(255, 18, 18, 18),
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.right,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExitCard(Sortie exit) {
    final article = _getArticleForStockItem(exit.stockItem);
    String typeArticle = article?.type ?? "";
    String uniteArticle = article?.unite ?? "";
    String dateAffiche = _formatShortDateHeure(exit.dateCreation);

    return GestureDetector(
      onTap: () => _navigateToExitDetail(exit),
      child: Container(
        margin: EdgeInsets.only(bottom: 2.5.h),
        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 3.h),
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(4.w),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "${exit.stockItemName ?? 'StockItem #${exit.stockItem}'}"
                        .toUpperCase(),
                    style: GoogleFonts.montserrat(
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.black87,
                      letterSpacing: 0.3,
                    ),
                  ),
                  SizedBox(height: 0.5.h),
                  Text(
                    exit.stockItemType ?? '',
                    style: GoogleFonts.montserrat(
                      fontSize: 13.sp,
                      color: Colors.grey[500],
                    ),
                  ),
                  SizedBox(height: 2.2.h),
                  Text(
                    "PRD-${exit.stockItem.toString().padLeft(3, '0')}",
                    style: GoogleFonts.montserrat(
                      fontSize: 13.sp,
                      color: const Color.fromRGBO(147, 147, 147, 1),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(width: 3.w),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  "Sortie le : $dateAffiche",
                  style: GoogleFonts.montserrat(
                    fontSize: 13.sp,
                    color: const Color.fromRGBO(147, 147, 147, 1),
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.right,
                ),
                SizedBox(height: 1.5.h),
                Text(
                  "Quantité : ${exit.quantiteM ?? '-'} $uniteArticle",
                  style: GoogleFonts.montserrat(
                    fontSize: 15.sp,
                    color: const Color.fromARGB(255, 18, 18, 18),
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.right,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatShortDate(String? dateString) {
    if (dateString == null || dateString.isEmpty) return "-";
    try {
      final date = DateTime.parse(dateString);
      return "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year.toString().substring(2)}";
    } catch (e) {
      return dateString.split(' ').first;
    }
  }

  String _formatShortDateHeure(String? dateString) {
    if (dateString == null || dateString.isEmpty) return "-";
    try {
      final date = DateTime.parse(dateString);
      final h = date.hour.toString().padLeft(2, '0');
      final min = date.minute.toString().padLeft(2, '0');
      return "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year.toString()} à $h:$min";
    } catch (e) {
      return dateString;
    }
  }

  void _navigateToStockItemDetail(StockItem stockItem) {
    Navigator.pushNamed(context, '/product-detail', arguments: stockItem);
  }

  void _navigateToEntryDetail(Entree entry) {
    Navigator.pushNamed(context, '/entry-detail', arguments: entry);
  }

  void _navigateToExitDetail(Sortie exit) {
    Navigator.pushNamed(context, '/exit-detail', arguments: exit);
  }
}