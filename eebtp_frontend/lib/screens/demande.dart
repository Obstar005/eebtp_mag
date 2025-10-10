import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import '../widgets/button.dart';

class SupplyRequestScreen extends StatefulWidget {
  const SupplyRequestScreen({super.key});

  @override
  State<SupplyRequestScreen> createState() => _SupplyRequestScreenState();
}

class _SupplyRequestScreenState extends State<SupplyRequestScreen> {
  final _quantityController = TextEditingController();
  final _motifController = TextEditingController();

  String? _selectedProduct;
  String? _selectedResponsible;
  bool _isProductDropdownOpen = false;
  bool _isResponsibleDropdownOpen = false;

  final List<Map<String, dynamic>> _products = [
    {'name': 'Ciment', 'quantity': 150,'unit': 't'},
    {'name': 'Sable', 'quantity': 500,'unit': 'm3'},
    {'name': 'Brique', 'quantity': 1000,'unit': 'piece'},
    {'name': 'Granit', 'quantity': 400,'unit': 'm3'},
    {'name': 'Fer à béton', 'quantity': 250,'unit': 't'},
    {'name': 'Bois', 'quantity': 350,'unit': 'piece'},
    {'name': 'Essence', 'quantity': 75 ,'unit': 'L'},
    {'name': 'Peinture', 'quantity': 120,'unit': 'L'},
    {'name': 'Pinceau', 'quantity': 200, 'unit': 'piece'},
    {'name': 'Eau de chaux', 'quantity': 25, 'unit': 'L'},
    {'name': 'Gravier', 'quantity': 300, 'unit': 'Kg'},
  ];

  final List<Map<String, dynamic>> _responsibles = [
    {'name': 'Jean Dupont', 'role': 'Manager'},
    {'name': 'Marie Martin', 'role': 'Superviseur'},
    {'name': 'Pierre Durand', 'role': 'Chef équipe'},
    {'name': 'Sophie Bernard', 'role': 'Directeur'},
    {'name': 'Paul Moreau', 'role': 'Adjoint'},
  ];

  List<Map<String, dynamic>> _filteredProducts = [];
  List<Map<String, dynamic>> _filteredResponsibles = [];
  String _productSearchQuery = '';
  String _responsibleSearchQuery = '';

  @override
  void initState() {
    super.initState();
    _filteredProducts = _products;
    _filteredResponsibles = _responsibles;
  }

  void _filterProducts(String query) {
    setState(() {
      _productSearchQuery = query;
      if (query.isEmpty) {
        _filteredProducts = _products;
      } else {
        _filteredProducts = _products
            .where((product) => product['name']
                .toString()
                .toLowerCase()
                .contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  void _filterResponsibles(String query) {
    setState(() {
      _responsibleSearchQuery = query;
      if (query.isEmpty) {
        _filteredResponsibles = _responsibles;
      } else {
        _filteredResponsibles = _responsibles
            .where((responsible) => responsible['name']
                .toString()
                .toLowerCase()
                .contains(query.toLowerCase()) ||
                responsible['role']
                .toString()
                .toLowerCase()
                .contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  void _showConfirmationDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Text(
            "Confirmation",
            style: GoogleFonts.poppins(
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          content: Text(
            "Êtes-vous sûr de vouloir enregistrer cette demande d'approvisionnement ?",
            style: GoogleFonts.poppins(
              fontSize: 14.sp,
              color: Colors.black54,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                "Annuler",
                style: GoogleFonts.poppins(
                  fontSize: 14.sp,
                  color: Colors.grey[600],
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                _submitForm();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF007AFF),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                "Confirmer",
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

  void _submitForm() {
    // TODO: Envoyer le formulaire à ton backend ou logique métier
    debugPrint("Produit: $_selectedProduct");
    debugPrint("Quantité: ${_quantityController.text}");
    debugPrint("Motif: ${_motifController.text}");
    debugPrint("Responsable: $_selectedResponsible");
    Navigator.pop(context);
  }

  Widget _buildAppBar() {
    return SafeArea(
      bottom: false,
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.only(
          left: 5.w,
          right: 3.w,
          top: 2.h,
          bottom: 2.h,
        ),
        decoration: BoxDecoration(
          color: const Color(0xFF007AFF),
          borderRadius: BorderRadius.vertical(
            bottom: Radius.circular(20),
          ),
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
                child: Icon(Icons.arrow_back_ios_new, color: Color(0xFF007AFF), size: 18.sp),
              ),
            ),
            SizedBox(width: 3.w),
            Expanded(
              child: Text(
                "Demande\nd'approvisionnement",
                maxLines: 2,
                textAlign: TextAlign.left,
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
                    constraints: const BoxConstraints(minWidth: 19, minHeight: 19),
                    child: Text(
                      "3",
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: 8.sp,
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

  Widget _buildSectionHeader(String title, {bool isLeftAligned = true}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: isLeftAligned
          ? [
              Text(
                title,
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  fontSize: 14.sp,
                  color: Colors.black87,
                ),
              ),
              Container(
                height: 2,
                width: 65.w,
                color: const Color(0xFF007AFF),
              ),
            ]
          : [
              Container(
                height: 2,
                width: 70.w,
                color: const Color(0xFF007AFF),
              ),
              Text(
                title,
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  fontSize: 14.sp,
                  color: Colors.black87,
                ),
              ),
            ],
    );
  }

  Widget _buildBasicInputField({
    required TextEditingController controller,
    required String hintText,
    String? labelText,
    int maxLines = 1,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 241, 240, 240),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Color(0xFF007AFF)),
      ),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        style: GoogleFonts.poppins(fontSize: 14.sp),
        decoration: InputDecoration(
          border: InputBorder.none,
          hintText: hintText,
          labelText: labelText,
          hintStyle: GoogleFonts.poppins(
            fontSize: 14.sp,
            color: Colors.grey[600],
          ),
          contentPadding: EdgeInsets.symmetric(
            horizontal: 4.w,
            vertical: maxLines > 1 ? 2.5.h : 1.8.h,
          ),
        ),
      ),
    );
  }

  Widget _buildProductDropdown() {
    return Column(
      children: [
        GestureDetector(
          onTap: () {
            setState(() {
              _isProductDropdownOpen = !_isProductDropdownOpen;
              _isResponsibleDropdownOpen = false;
            });
          },
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.8.h),
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5),
              borderRadius: BorderRadius.circular(50),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    _selectedProduct ?? "Sélectionner le produit",
                    style: GoogleFonts.poppins(
                      fontSize: 14.sp,
                      color: _selectedProduct != null ? Colors.black87 : Colors.grey[600],
                    ),
                  ),
                ),
                Icon(
                  _isProductDropdownOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  color: Colors.grey[600],
                ),
              ],
            ),
          ),
        ),
        if (_isProductDropdownOpen)
          Container(
            margin: EdgeInsets.only(top: 1.h),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 8,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                Padding(
                  padding: EdgeInsets.all(3.w),
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color.fromARGB(255, 250, 250, 250),
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: TextFormField(
                      onChanged: _filterProducts,
                      style: GoogleFonts.poppins(fontSize: 14.sp),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: "Rechercher",
                        prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
                        hintStyle: GoogleFonts.poppins(
                          fontSize: 14.sp,
                          color: Colors.grey[600],
                        ),
                        contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
                      ),
                    ),
                  ),
                ),
                Container(
                  constraints: BoxConstraints(maxHeight: 200),
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: _filteredProducts.length,
                    itemBuilder: (context, index) {
                      final product = _filteredProducts[index];
                      return ListTile(
                        title: Text(
                          product['name'],
                          style: GoogleFonts.poppins(fontSize: 14.sp),
                        ),
                        trailing: Container(
                          padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
                          decoration: BoxDecoration(
                            color: const Color.fromARGB(255, 70, 158, 252),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${product['quantity']}${product['unit']}',
                            style: GoogleFonts.poppins(
                              fontSize: 12.sp,
                              color: Colors.white,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        onTap: () {
                          setState(() {
                            _selectedProduct = product['name'];
                            _isProductDropdownOpen = false;
                          });
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildResponsibleDropdown() {
    return Column(
      children: [
        GestureDetector(
          onTap: () {
            setState(() {
              _isResponsibleDropdownOpen = !_isResponsibleDropdownOpen;
              _isProductDropdownOpen = false;
            });
          },
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.8.h),
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5),
              borderRadius: BorderRadius.circular(50),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    _selectedResponsible ?? "Sélectionner celui qui a ordonné",
                    style: GoogleFonts.poppins(
                      fontSize: 14.sp,
                      color: _selectedResponsible != null ? Colors.black87 : Colors.grey[600],
                    ),
                  ),
                ),
                Icon(
                  _isResponsibleDropdownOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  color: Colors.grey[600],
                ),
              ],
            ),
          ),
        ),
        if (_isResponsibleDropdownOpen)
          Container(
            margin: EdgeInsets.only(top: 1.h),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 8,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                Padding(
                  padding: EdgeInsets.all(3.w),
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F5F5),
                    ),
                    child: TextFormField(
                      onChanged: _filterResponsibles,
                      style: GoogleFonts.poppins(fontSize: 14.sp),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: "Rechercher un responsable...",
                        prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
                        hintStyle: GoogleFonts.poppins(
                          fontSize: 14.sp,
                          color: Colors.grey[600],
                        ),
                        contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
                      ),
                    ),
                  ),
                ),
                Container(
                  constraints: BoxConstraints(maxHeight: 200),
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: _filteredResponsibles.length,
                    itemBuilder: (context, index) {
                      final responsible = _filteredResponsibles[index];
                      return ListTile(
                        title: Text(
                          responsible['name'],
                          style: GoogleFonts.poppins(fontSize: 14.sp),
                        ),
                        trailing: Container(
                          padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
                          decoration: BoxDecoration(
                            color: const Color(0xFF007AFF),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            responsible['role'],
                            style: GoogleFonts.poppins(
                              fontSize: 12.sp,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        onTap: () {
                          setState(() {
                            _selectedResponsible = responsible['name'];
                            _isResponsibleDropdownOpen = false;
                          });
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      initialIndex: 2,
      body: GestureDetector(
        onTap: () {
          setState(() {
            _isProductDropdownOpen = false;
            _isResponsibleDropdownOpen = false;
          });
        },
        child: Column(
          children: [
            _buildAppBar(),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(5.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader("Produit", isLeftAligned: false),
                    SizedBox(height: 2.h),
                    _buildProductDropdown(),
                    SizedBox(height: 2.h),
                    _buildBasicInputField(
                      controller: _quantityController,
                      hintText: "Définir la quantité",
                    ),
                    SizedBox(height: 2.h),
                    _buildBasicInputField(
                      controller: _motifController,
                      hintText: "Le motif",
                      labelText: "Motif",
                      maxLines: 4,
                    ),
                    SizedBox(height: 3.h),
                    _buildSectionHeader("Responsable", isLeftAligned: true),
                    SizedBox(height: 2.h),
                    _buildResponsibleDropdown(),
                    SizedBox(height: 12.h),
                    Center(
                      child: CustomElevatedButton(
                        text: 'Enregistrer',
                        backgroundColor: const Color(0xFF007AFF),
                        textColor: Colors.white,
                        onPressed: _showConfirmationDialog,
                        width: 80.w,
                      ),
                    ),
                    SizedBox(height: 3.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _motifController.dispose();
    super.dispose();
  }
}
