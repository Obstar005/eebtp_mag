import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:sizer/sizer.dart';
import 'package:signature/signature.dart';

import '../widgets/button.dart';


class StockEntryScreen extends StatefulWidget {
  const StockEntryScreen({super.key});

  @override
  State<StockEntryScreen> createState() => _StockEntryScreenState();
}

class _StockEntryScreenState extends State<StockEntryScreen> {
  final PageController _pc = PageController();
  int _currentStep = 0;

  // Controllers
  final _requestController = TextEditingController();
  final _productController = TextEditingController();
  final _quantityController = TextEditingController();
  final _supplierController = TextEditingController();
  final _phoneController = TextEditingController();
  final _companyController = TextEditingController();
  final SignatureController _signatureController = SignatureController(
    penStrokeWidth: 2,
    penColor: Colors.black,
    exportBackgroundColor: Colors.white,
  );

  PhoneNumber _initialPhone = PhoneNumber(isoCode: 'TG');

  // Dropdown values
  String? _selectedProduct;
  String? _selectedRequest;
  bool _isProductDropdownOpen = false;
  bool _isRequestDropdownOpen = false;

  // Sample data
  final List<Map<String, dynamic>> _products = [
    {'name': 'Produit A', 'quantity': 150},
    {'name': 'Produit B', 'quantity': 75},
    {'name': 'Produit C', 'quantity': 200},
    {'name': 'Ordinateur portable', 'quantity': 25},
    {'name': 'Souris optique', 'quantity': 300},
  ];

  final List<Map<String, dynamic>> _requests = [
    {'name': 'Demande urgente', 'quantity': 10, 'code': 'DEM-001'},
    {'name': 'Réapprovisionnement', 'quantity': 50, 'code': 'DEM-002'},
    {'name': 'Commande client', 'quantity': 25, 'code': 'DEM-003'},
    {'name': 'Stock de sécurité', 'quantity': 100, 'code': 'DEM-004'},
  ];

  List<Map<String, dynamic>> _filteredProducts = [];
  List<Map<String, dynamic>> _filteredRequests = [];
  String _productSearchQuery = '';
  String _requestSearchQuery = '';

  @override
  void initState() {
    super.initState();
    _filteredProducts = _products;
    _filteredRequests = _requests;
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

  void _filterRequests(String query) {
    setState(() {
      _requestSearchQuery = query;
      if (query.isEmpty) {
        _filteredRequests = _requests;
      } else {
        _filteredRequests = _requests
            .where((request) => request['name']
                .toString()
                .toLowerCase()
                .contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  void _next() {
    if (_pc.page == 0) {
      _pc.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() => _currentStep = 1);
    } else {
      // TODO: Envoyer le formulaire
      debugPrint("Produit: $_selectedProduct");
      debugPrint("Quantité: ${_quantityController.text}");
      debugPrint("Fournisseur: ${_supplierController.text}");
      debugPrint("Téléphone: ${_phoneController.text}");
      debugPrint("Demande: $_selectedRequest");
      debugPrint("Société: ${_companyController.text}");
      Navigator.pop(context);
    }
  }

  Widget _buildAppBar() {
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
            "Déclarer une\nentrée en stock",
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

  Widget _buildProgressIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(2, (i) {
        return Container(
          margin: EdgeInsets.symmetric(horizontal: 1.w),
          width: i == _currentStep ? 10.w : 4.w,
          height: 1.h,
          decoration: BoxDecoration(
            color: i == _currentStep ? const Color(0xFF007AFF) : Colors.grey[300],
            borderRadius: BorderRadius.circular(10),
          ),
        );
      }),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Row(
      children: [
        Container(
          height: 2,
          width: 60.w,
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
    String? labelText,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 201, 199, 199),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Color(0xFF007AFF)),
      ),
      child: TextFormField(
        controller: controller,
        style: GoogleFonts.poppins(fontSize: 14.sp),
        decoration: InputDecoration(
          border: InputBorder.none,
          hintText: hintText,
          labelText: labelText,
          hintStyle: GoogleFonts.poppins(
            fontSize: 14.sp,
            color: Colors.grey[600],
          ),
          contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.8.h),
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
              _isRequestDropdownOpen = false;
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
                      color: const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: TextFormField(
                      onChanged: _filterProducts,
                      style: GoogleFonts.poppins(fontSize: 14.sp),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: "Rechercher un produit...",
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

  Widget _buildRequestDropdown() {
    return Column(
      children: [
        GestureDetector(
          onTap: () {
            setState(() {
              _isRequestDropdownOpen = !_isRequestDropdownOpen;
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
                    _selectedRequest ?? "Sélectionner la demande",
                    style: GoogleFonts.poppins(
                      fontSize: 14.sp,
                      color: _selectedRequest != null ? Colors.black87 : Colors.grey[600],
                    ),
                  ),
                ),
                Icon(
                  _isRequestDropdownOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  color: Colors.grey[600],
                ),
              ],
            ),
          ),
        ),
        if (_isRequestDropdownOpen)
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
                      onChanged: _filterRequests,
                      style: GoogleFonts.poppins(fontSize: 14.sp),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: "Rechercher une demande...",
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
                    itemCount: _filteredRequests.length,
                    itemBuilder: (context, index) {
                      final request = _filteredRequests[index];
                      return ListTile(
                        title: Text(
                          request['name'],
                          style: GoogleFonts.poppins(fontSize: 14.sp),
                        ),
                        subtitle: Row(
                          children: [
                            Text(
                              "Quantité: ${request['quantity']}",
                              style: GoogleFonts.poppins(fontSize: 12.sp, color: Colors.grey[600]),
                            ),
                            SizedBox(width: 2.w),
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.3.h),
                              decoration: BoxDecoration(
                                color: Colors.red,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                request['code'],
                                style: GoogleFonts.poppins(
                                  fontSize: 10.sp,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                        onTap: () {
                          setState(() {
                            _selectedRequest = request['name'];
                            _isRequestDropdownOpen = false;
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

  Widget _buildStep1() {
    return GestureDetector(
      onTap: () {
        setState(() {
          _isProductDropdownOpen = false;
          _isRequestDropdownOpen = false;
        });
      },
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
            SizedBox(height: 3.h),
            _buildSectionHeader("Fournisseur"),
            SizedBox(height: 2.h),
            _buildBasicInputField(
              controller: _supplierController,
              hintText: "Renseigner le nom de la société",
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
                      horizontal: 4.w, vertical: 1.8.h),
                ),
                spaceBetweenSelectorAndTextField: 0,
              ),
            ),
            SizedBox(height: 3.h),
            _buildSectionHeader("Demande"),
            SizedBox(height: 2.h),
            _buildRequestDropdown(),
            SizedBox(height: 15.h),
            Column(
              children: [
                _buildProgressIndicator(),
                SizedBox(height: 2.h),
                CustomElevatedButton(
                  text: 'Suivant',
                  backgroundColor: const Color(0xFF007AFF),
                  textColor: Colors.white,
                  onPressed: _next,
                  width: 70.w,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep2() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(5.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader("Livreur"),
          SizedBox(height: 2.h),
          _buildBasicInputField(
            controller: _companyController,
            hintText: "Renseigner le nom de la société",
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
                    horizontal: 4.w, vertical: 1.8.h),
              ),
              spaceBetweenSelectorAndTextField: 0,
            ),
          ),
          SizedBox(height: 3.h),
          Text(
            "Signature",
            style: GoogleFonts.poppins(
              fontWeight: FontWeight.w500,
              fontSize: 12.sp,
              color: Colors.grey[700],
            ),
          ),
          SizedBox(height: 1.h),
          Container(
            width: double.infinity,
            height: 200,
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Signature(
              controller: _signatureController,
              backgroundColor: Colors.white,
            ),
          ),
          SizedBox(height: 1.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Dessiner votre signature",
                style: GoogleFonts.poppins(
                  fontSize: 12.sp,
                  color: Colors.grey[600],
                ),
              ),
              GestureDetector(
                onTap: () {
                  _signatureController.clear();
                },
                child: Text(
                  "Effacer",
                  style: GoogleFonts.poppins(
                    fontSize: 12.sp,
                    color: const Color(0xFF007AFF),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 10.h),
          Column(
            children: [
              _buildProgressIndicator(),
              SizedBox(height: 2.h),
              CustomElevatedButton(
                text: 'Enregistrer',
                backgroundColor: const Color(0xFF007AFF),
                textColor: Colors.white,
                onPressed: _next,
                width: 70.w,
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      body: Column(
        children: [
          _buildAppBar(),
          Expanded(
            child: PageView(
              controller: _pc,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildStep1(),
                _buildStep2(),
              ],
            ),
          ),
        ],
      ),
       initialIndex: 1,);
  }

  @override
  void dispose() {
    _productController.dispose();
    _quantityController.dispose();
    _supplierController.dispose();
    _phoneController.dispose();
    _requestController.dispose();
    _companyController.dispose();
    _signatureController.dispose();
    super.dispose();
  }
}