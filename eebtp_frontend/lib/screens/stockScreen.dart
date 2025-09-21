import 'dart:ui';
import 'package:eebtp_frontend/models/entry_item.dart';
import 'package:eebtp_frontend/models/exit_item.dart';
import 'package:eebtp_frontend/models/person.dart';
import 'package:eebtp_frontend/models/return_item.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import 'package:eebtp_frontend/models/product.dart';
import 'package:eebtp_frontend/widgets/nav.dart'; // Importez votre NavContainer

class StockPage extends StatefulWidget {
  const StockPage({super.key});

  @override
  _StockPageState createState() => _StockPageState();
}

class _StockPageState extends State<StockPage> {
  int _stockTabIndex = 0; // 0: Stock, 1: Entrée, 2: Sortie
  int _entreeSubTabIndex = 0; // 0: Livraison, 1: Retour

  // Données factices pour les produits
  final List<Product> products = [
    Product(
      name: "CIMENT",
      code: "PRD-502-25",
      category: "Matériaux",
      currentQuantity: 100,
      threshold: 10,
      description: "Meet Whiskers, the embodiment of joy and cuddles! With his mesmerizing green eyes and soft fur, this playful 3-year-old Domestic Shorthair is eagerly seeking a temporary foster home in the bustling city of Los Angeles, California.",
      addedDate: DateTime(2024, 2, 3),
    ),
    Product(
      name: "FER À BETON",
      code: "PRD-503-25",
      category: "Matériel",
      currentQuantity: 5,
      threshold: 10,
      description: "High quality construction steel for reinforcement.",
      addedDate: DateTime(2024, 2, 3),
    ),
  ];

  // Données factices pour les entrées/livraisons
  final List<EntryItem> entries = [
    EntryItem(
      product: Product(name: "CIMENT", code: "PRD-502-25", category: "Matériaux", currentQuantity: 10, threshold: 10, description: "", addedDate: DateTime.now()),
      date: DateTime(2025, 5, 12, 13, 0),
      quantity: 10,
      deliveryPerson: Person(name: "Kasim Ahmad", role: "Livreur", phone: "90909090", signature: "Signature"),
      supplier: "CIMTOGO",
      supplierPhone: "+228 90909090",
    ),
    EntryItem(
      product: Product(name: "FER À BETON", code: "PRD-503-25", category: "Matériel", currentQuantity: 100, threshold: 10, description: "", addedDate: DateTime.now()),
      date: DateTime(2025, 5, 12, 13, 0),
      quantity: 100,
      deliveryPerson: Person(name: "Kasim Ahmad", role: "Livreur", phone: "90909090", signature: "Signature"),
      supplier: "CIMTOGO",
      supplierPhone: "+228 90909090",
    ),
  ];

  // Données factices pour les retours
  final List<ReturnItem> returns = [
    ReturnItem(
      product: Product(name: "CIMENT", code: "PRD-502-25", category: "Matériaux", currentQuantity: 10, threshold: 10, description: "", addedDate: DateTime.now()),
      date: DateTime(2025, 5, 12, 13, 0),
      quantity: 10,
      depositor: Person(name: "Kasim Ahmad", role: "Déposant / Plombier", phone: "90909090"),
    ),
  ];

  // Données factices pour les sorties
  final List<ExitItem> exits = [
    ExitItem(
      product: Product(name: "CIMENT", code: "PRD-502-25", category: "Matériaux", currentQuantity: 10, threshold: 10, description: "", addedDate: DateTime.now()),
      date: DateTime(2025, 5, 12, 13, 0),
      quantity: 10,
      receiver: Person(name: "Kasim Ahmad", role: "Receveur / Plombier", phone: "90909090"),
      reason: "Meet Whiskers, the embodiment of joy and cuddles! With his mesmerizing green eyes and soft fur, this playful 3-",
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      initialIndex: 1, // Index pour "Stock"
      body: Column(
        children: [
          // Header avec dégradé bleu
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
                  // Header avec titre et notifications
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "Stocks",
                          style: GoogleFonts.montserrat(
                            fontSize: 18.sp,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        Stack(
                          children: [
                            GestureDetector(
                              onTap: () => Navigator.pushNamed(context, '/notifications'),
                              child: Container(
                                padding: EdgeInsets.all(2.w),
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.notifications_outlined,
                                  size: 10.w,
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
                                    fontSize: 14.sp,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'Montserrat',
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
                  
                  // Barre de recherche
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 6.w),
                    padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10.w),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.search,
                          color: Colors.grey,
                          size: 6.w,
                        ),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: Text(
                            "Recherche une entrée ou sortie...",
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
                  
                  // Tabs principaux
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
          
          // Contenu selon le tab sélectionné
          Expanded(
            child: Container(
              color: const Color(0xFFF8F9FA),
              child: _buildTabContent(),
            ),
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

  Widget _buildTabContent() {
    switch (_stockTabIndex) {
      case 0:
        return _buildStockTab();
      case 1:
        return _buildEntreeTab();
      case 2:
        return _buildSortieTab();
      default:
        return _buildStockTab();
    }
  }

  Widget _buildStockTab() {
    return ListView.builder(
      padding: EdgeInsets.all(4.w),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];
        return _buildProductCard(product);
      },
    );
  }

  Widget _buildEntreeTab() {
    return Column(
      children: [
        // Sub-tabs pour Livraison/Retour
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
        
        // Contenu selon le sub-tab
        Expanded(
          child: _entreeSubTabIndex == 0 ? _buildLivraisonContent() : _buildRetourContent(),
        ),
      ],
    );
  }

  Widget _buildSortieTab() {
    return ListView.builder(
      padding: EdgeInsets.all(4.w),
      itemCount: exits.length,
      itemBuilder: (context, index) {
        final exit = exits[index];
        return _buildExitCard(exit);
      },
    );
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
            color: isSelected ? const Color(0xFF007AFF) : Colors.grey.withOpacity(0.3),
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

  Widget _buildLivraisonContent() {
    return ListView.builder(
      padding: EdgeInsets.all(4.w),
      itemCount: entries.length,
      itemBuilder: (context, index) {
        final entry = entries[index];
        return _buildEntryCard(entry);
      },
    );
  }

  Widget _buildRetourContent() {
    return ListView.builder(
      padding: EdgeInsets.all(4.w),
      itemCount: returns.length,
      itemBuilder: (context, index) {
        final returnItem = returns[index];
        return _buildReturnCard(returnItem);
      },
    );
  }

  Widget _buildProductCard(Product product) {
    bool isLowStock = product.currentQuantity <= product.threshold;
    
    return GestureDetector(
      onTap: () => _navigateToProductDetail(product),
      child: Container(
        margin: EdgeInsets.only(bottom: 3.h),
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(3.w),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
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
                        product.name,
                        style: GoogleFonts.montserrat(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w700,
                          color: Colors.black,
                        ),
                      ),
                      Text(
                        product.code,
                        style: GoogleFonts.montserrat(
                          fontSize: 14.sp,
                          color: Colors.grey[600],
                        ),
                      ),
                      SizedBox(height: 1.h),
                      Text(
                        product.category,
                        style: GoogleFonts.montserrat(
                          fontSize: 14.sp,
                          color: Colors.grey[500],
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
                  decoration: BoxDecoration(
                    color: isLowStock ? const Color(0xFFFF3B30) : const Color(0xFF34C759),
                    borderRadius: BorderRadius.circular(5.w),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        "Seuil",
                        style: GoogleFonts.montserrat(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w500,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(width: 1.w),
                      Icon(
                        isLowStock ? Icons.keyboard_arrow_down : Icons.keyboard_arrow_up,
                        color: Colors.white,
                        size: 4.w,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 2.h),
            Text(
              "Quantité actuelle: ${product.currentQuantity} t",
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEntryCard(EntryItem entry) {
    return GestureDetector(
      onTap: () => _navigateToEntryDetail(entry),
      child: Container(
        margin: EdgeInsets.only(bottom: 3.h),
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(3.w),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              entry.product.name,
              style: GoogleFonts.montserrat(
                fontSize: 16.sp,
                fontWeight: FontWeight.w700,
                color: Colors.black,
              ),
            ),
            Text(
              entry.product.code,
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              entry.product.category,
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[500],
              ),
            ),
            SizedBox(height: 2.h),
            Text(
              "Entrée le: ${_formatDate(entry.date)}",
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              "Quantité: ${entry.quantity} t",
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReturnCard(ReturnItem returnItem) {
    return GestureDetector(
      onTap: () => _navigateToReturnDetail(returnItem),
      child: Container(
        margin: EdgeInsets.only(bottom: 3.h),
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(3.w),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              returnItem.product.name,
              style: GoogleFonts.montserrat(
                fontSize: 16.sp,
                fontWeight: FontWeight.w700,
                color: Colors.black,
              ),
            ),
            Text(
              returnItem.product.code,
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              returnItem.product.category,
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[500],
              ),
            ),
            SizedBox(height: 2.h),
            Text(
              "Retourner le: ${_formatDate(returnItem.date)}",
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              "Quantité: ${returnItem.quantity} t",
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExitCard(ExitItem exit) {
    return GestureDetector(
      onTap: () => _navigateToExitDetail(exit),
      child: Container(
        margin: EdgeInsets.only(bottom: 3.h),
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(3.w),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              exit.product.name,
              style: GoogleFonts.montserrat(
                fontSize: 16.sp,
                fontWeight: FontWeight.w700,
                color: Colors.black,
              ),
            ),
            Text(
              exit.product.code,
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              exit.product.category,
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[500],
              ),
            ),
            SizedBox(height: 2.h),
            Text(
              "Sortie le: ${_formatDate(exit.date)}",
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              "Quantité: ${exit.quantity} t",
              style: GoogleFonts.montserrat(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year} à ${date.hour.toString().padLeft(2, '0')}h${date.minute.toString().padLeft(2, '0')}";
  }

  void _navigateToProductDetail(Product product) {
    Navigator.pushNamed(context, '/product-detail', arguments: product);
  }

  void _navigateToEntryDetail(EntryItem entry) {
    Navigator.pushNamed(context, '/entry-detail', arguments: entry);
  }

  void _navigateToReturnDetail(ReturnItem returnItem) {
    Navigator.pushNamed(context, '/return-detail', arguments: returnItem);
  }

  void _navigateToExitDetail(ExitItem exit) {
    Navigator.pushNamed(context, '/exit-detail', arguments: exit);
  }
}