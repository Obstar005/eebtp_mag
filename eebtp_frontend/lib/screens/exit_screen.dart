import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:sizer/sizer.dart';

import '../widgets/button.dart';
import '../widgets/nav.dart'; // <-- ton NavContainer + ImprovedFAB + ImprovedBottomNavigation

class StockExitScreen extends StatelessWidget {
  const StockExitScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return NavContainer(
     
      body: _StockExitForm(), initialIndex: 1,
    );
  }
}

class _StockExitForm extends StatefulWidget {
  @override
  State<_StockExitForm> createState() => _StockExitFormState();
}

class _StockExitFormState extends State<_StockExitForm> {
  // Controllers
  final _quantityController = TextEditingController();
  final _motifController = TextEditingController();
  final _receiverNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _functionController = TextEditingController();

  PhoneNumber _initialPhone = PhoneNumber(isoCode: 'TG');

  // Dropdown
  String? _selectedProduct;
  bool _isProductDropdownOpen = false;

  // Sample data produits
  final List<Map<String, dynamic>> _products = [
    {'name': 'Produit A', 'quantity': 150},
    {'name': 'Produit B', 'quantity': 75},
    {'name': 'Produit C', 'quantity': 200},
    {'name': 'Ordinateur portable', 'quantity': 25},
    {'name': 'Souris optique', 'quantity': 300},
  ];

  List<Map<String, dynamic>> _filteredProducts = [];
  String _productSearchQuery = '';

  @override
  void initState() {
    super.initState();
    _filteredProducts = _products;
  }

  void _filterProducts(String query) {
    setState(() {
      _productSearchQuery = query;
      _filteredProducts = query.isEmpty
          ? _products
          : _products
              .where((p) =>
                  p['name'].toString().toLowerCase().contains(query.toLowerCase()))
              .toList();
    });
  }

  void _submitForm() {
    debugPrint("Produit: $_selectedProduct");
    debugPrint("Quantité: ${_quantityController.text}");
    debugPrint("Motif: ${_motifController.text}");
    debugPrint("Nom receveur: ${_receiverNameController.text}");
    debugPrint("Téléphone: ${_phoneController.text}");
    debugPrint("Fonction: ${_functionController.text}");
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _isProductDropdownOpen = false),
      child: Column(
        children: [
          _buildAppBar(context),
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(5.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader("Produit"),
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
                    hintText: "Motif",
                    maxLines: 4,
                  ),
                  SizedBox(height: 3.h),
                  _buildSectionHeader("Receveur"),
                  SizedBox(height: 2.h),
                  _buildBasicInputField(
                    controller: _receiverNameController,
                    hintText: "Renseigner le nom du receveur",
                  ),
                  SizedBox(height: 2.h),
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(50),
                    ),
                    child: InternationalPhoneNumberInput(
                      onInputChanged: (PhoneNumber num) {
                        _initialPhone = num;
                      },
                      initialValue: _initialPhone,
                      textFieldController: _phoneController,
                      selectorConfig: const SelectorConfig(
                        selectorType: PhoneInputSelectorType.DROPDOWN,
                        showFlags: true,
                      ),
                      inputDecoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: 'Numéro de téléphone',
                        hintStyle: GoogleFonts.poppins(
                          fontSize: 14.sp,
                          color: Colors.grey[600],
                        ),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 4.w,
                          vertical: 1.8.h,
                        ),
                      ),
                      spaceBetweenSelectorAndTextField: 0,
                      autoValidateMode: AutovalidateMode.onUserInteraction,
                    ),
                  ),
                  SizedBox(height: 2.h),
                  _buildBasicInputField(
                    controller: _functionController,
                    hintText: "Renseigner la fonction du receveur",
                  ),
                  SizedBox(height: 8.h),
                  Center(
                    child: CustomElevatedButton(
                      text: 'Enregistrer',
                      backgroundColor: const Color(0xFF007AFF),
                      textColor: Colors.white,
                      onPressed: _submitForm,
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
    );
  }

  // ------- Widgets -------
  Widget _buildAppBar(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
      decoration: const BoxDecoration(
        color: Color(0xFF007AFF),
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(20),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: const CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(Icons.arrow_back_ios_new, color: Color(0xFF007AFF)),
            ),
          ),
          Text(
            "Déclarer une\nsortie en stock",
            style: GoogleFonts.poppins(
              fontSize: 16.sp,
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          Stack(
            children: [
              Container(
                padding: EdgeInsets.all(2.5.w),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.notifications_outlined,
                    size: 7.w, color: Color(0xFF007AFF)),
              ),
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: EdgeInsets.all(1.w),
                  decoration: const BoxDecoration(
                      color: Colors.red, shape: BoxShape.circle),
                  child: Text(
                    "3",
                    style: GoogleFonts.poppins(
                      fontSize: 9.sp,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Row(
      children: [
        Container(
          height: 2,
          width: 45.w,
          color: const Color(0xFF007AFF),
        ),
        SizedBox(width: 3.w),
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
    int maxLines = 1,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(maxLines > 1 ? 12 : 50),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        style: GoogleFonts.poppins(fontSize: 14.sp),
        decoration: InputDecoration(
          border: InputBorder.none,
          hintText: hintText,
          hintStyle: GoogleFonts.poppins(
            fontSize: 14.sp,
            color: Colors.grey[600],
          ),
          contentPadding: EdgeInsets.symmetric(
            horizontal: 4.w,
            vertical: maxLines > 1 ? 2.h : 1.8.h,
          ),
        ),
      ),
    );
  }

  Widget _buildProductDropdown() {
    return Column(
      children: [
        GestureDetector(
          onTap: () => setState(() => _isProductDropdownOpen = !_isProductDropdownOpen),
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
                      color: _selectedProduct != null
                          ? Colors.black87
                          : Colors.grey[600],
                    ),
                  ),
                ),
                Icon(
                  _isProductDropdownOpen
                      ? Icons.keyboard_arrow_up
                      : Icons.keyboard_arrow_down,
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
                      color: const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: TextFormField(
                      onChanged: _filterProducts,
                      style: GoogleFonts.poppins(fontSize: 14.sp),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: "Rechercher un produit...",
                        prefixIcon:
                            Icon(Icons.search, color: Colors.grey[600]),
                        hintStyle: GoogleFonts.poppins(
                          fontSize: 14.sp,
                          color: Colors.grey[600],
                        ),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 4.w,
                          vertical: 1.5.h,
                        ),
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
                          padding: EdgeInsets.symmetric(
                              horizontal: 2.w, vertical: 0.5.h),
                          decoration: BoxDecoration(
                            color: const Color(0xFF007AFF),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            product['quantity'].toString(),
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

  @override
  void dispose() {
    _quantityController.dispose();
    _motifController.dispose();
    _receiverNameController.dispose();
    _phoneController.dispose();
    _functionController.dispose();
    super.dispose();
  }
}
