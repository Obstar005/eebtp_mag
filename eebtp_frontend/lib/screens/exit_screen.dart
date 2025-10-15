import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:sizer/sizer.dart';
import 'package:toastification/toastification.dart';
import '../widgets/button.dart';
import '../widgets/nav.dart';
import '../providers/auth_provider.dart';
import '../services/stockservice.dart';
import '../services/mouvement_service.dart';

class StockExitScreen extends StatefulWidget {
  const StockExitScreen({super.key});

  @override
  State<StockExitScreen> createState() => _StockExitScreenState();
}

class _StockExitScreenState extends State<StockExitScreen> {
  final _quantityController = TextEditingController();
  final _motifController = TextEditingController();
  final _receiverNameController = TextEditingController();
  final _functionController = TextEditingController();

  String? _selectedProductName;
  bool _isProductDropdownOpen = false;
  List<Map<String, dynamic>> _products = [];
  List<Map<String, dynamic>> _filteredProducts = [];
  String _productSearchQuery = '';
  bool _isLoadingProducts = true;

  String _phone = '';
  String? _phoneError;
  final TextEditingController _phoneController = TextEditingController();
  PhoneNumber _initialPhone = PhoneNumber(isoCode: 'TG');

    @override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (mounted) {
      Provider.of<AuthProvider>(context, listen: false).checkTokenExpiry(context);
    }
  });

    _fetchProductsWithUnits();
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
      autoCloseDuration: const Duration(seconds: 4),
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

  Future<void> _fetchProductsWithUnits() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final storeId = Provider.of<AuthProvider>(context, listen: false).storeId;
    if (token == null || storeId == null) {
      setState(() {
        _isLoadingProducts = false;
      });
      return;
    }
    try {
      final service = StockService(token: token);
      final items = await service.getStockItemsByMagasin(storeId);
      List<Map<String, dynamic>> productsWithUnits = [];
      for (final item in items) {
        try {
          final article = await service.getArticleDetail(item.produit);
          productsWithUnits.add({
            "id": item.id,
            "produitName": item.produitName ?? "Produit #${item.produit}",
            "quantite": item.quantite,
            "unite": article.unite ?? "unité",
            "stockItem": item.produit
          });
        } catch (e) {
          productsWithUnits.add({
            "id": item.id,
            "produitName": item.produitName ?? "Produit #${item.produit}",
            "quantite": item.quantite,
            "unite": "unité",
            "stockItem": item.produit
          });
        }
      }
      setState(() {
        _products = productsWithUnits;
        _filteredProducts = _products;
        _isLoadingProducts = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingProducts = false;
      });
      _showToast(
        message: "Erreur lors du chargement des produits",
        type: ToastificationType.error,
      );
    }
  }

  void _filterProducts(String query) {
    setState(() {
      _productSearchQuery = query;
      _filteredProducts = query.isEmpty
          ? _products
          : _products
              .where((p) =>
                  p['produitName']
                      .toString()
                      .toLowerCase()
                      .contains(query.toLowerCase()))
              .toList();
    });
  }

  String _formatPhone(String phone) {
    if (phone.startsWith('+')) {
      return phone.replaceFirst('+', '00');
    }
    return phone;
  }

  Future<void> _submitForm() async {
    String? error;
    if (_selectedProductName == null) {
      error = "Sélectionne un produit";
    } else if (_quantityController.text.trim().isEmpty) {
      error = "La quantité est requise";
    } else if (_motifController.text.trim().isEmpty) {
      error = "Le motif est requis";
    } else if (_receiverNameController.text.trim().isEmpty) {
      error = "Le nom du receveur est requis";
    } else if (_functionController.text.trim().isEmpty) {
      error = "La fonction du receveur est requise";
    } else if (_phone.isEmpty || _phone.length < 8) {
      error = "Veuillez entrer un numéro de téléphone valide";
    }

    if (error != null) {
      setState(() {
        if (error != null && error.contains("téléphone")) {
          _phoneError = error;
        } else {
          _phoneError = null;
        }
      });

      _showToast(
        message: error,
        type: ToastificationType.warning,
      );
      return;
    }
    setState(() {
      _phoneError = null;
    });

    final selectedIndex =
        _products.indexWhere((p) => p['produitName'] == _selectedProductName);
    final selectedProduct = _products[selectedIndex];
    final stockItemId = selectedProduct['id'];
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final magasinId = authProvider.storeId;
    final token = authProvider.token;

    if (token == null || token.isEmpty) {
      _showToast(
        message: "Erreur : utilisateur non connecté",
        type: ToastificationType.error,
      );
      return;
    }

    final data = {
      'magasin': magasinId,
      'stock_item': stockItemId,
      'quantite_m': _quantityController.text.trim(),
      'objet': _motifController.text.trim(),
      'nom_receveur': _receiverNameController.text.trim(),
      'tel_receveur': _formatPhone(_phone),
      'fonction_receveur': _functionController.text.trim(),
      'is_active': true,
    };

    try {
      final mouvementsService = MouvementsService(token: token);
      final response = await mouvementsService.createSortie(data);

      if (response.statusCode == 201) {
        _showToast(
          message: "Sortie enregistrée avec succès!",
          type: ToastificationType.success,
        );
        Navigator.pop(context);
      } else {
        _showToast(
          message: "Erreur lors de l'enregistrement",
          type: ToastificationType.error,
        );
      }
    } catch (e) {
      _showToast(
        message: "Erreur lors de l'enregistrement",
        type: ToastificationType.error,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return NavContainer(
      initialIndex: 1,
      body: SafeArea(
        child: GestureDetector(
          onTap: () => setState(() => _isProductDropdownOpen = false),
          child: Column(
            children: [
              _buildAppBar(),
              Expanded(
                child: _isLoadingProducts
                    ? Center(child: CircularProgressIndicator())
                    : SingleChildScrollView(
                        padding: EdgeInsets.symmetric(
                          horizontal: 5.w,
                          vertical: 2.h,
                        ),
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
                              hintText: "Motif",
                              labelText: "Motif",
                              maxLines: 5,
                            ),
                            SizedBox(height: 3.h),
                            _buildSectionHeader("Receveur", isLeftAligned: true),
                            SizedBox(height: 2.h),
                            _buildBasicInputField(
                              controller: _receiverNameController,
                              hintText: "Renseigner le nom du receveur",
                            ),
                            SizedBox(height: 2.h),
                            _buildPhoneInputField(),
                            if (_phoneError != null)
                              Padding(
                                padding: EdgeInsets.only(left: 2.w, top: 1.h),
                                child: Text(
                                  _phoneError!,
                                  style: GoogleFonts.poppins(
                                    fontSize: 12.sp.clamp(10, 14),
                                    color: Colors.red,
                                  ),
                                ),
                              ),
                            SizedBox(height: 2.h),
                            _buildBasicInputField(
                              controller: _functionController,
                              hintText: "Renseigner la fonction du receveur",
                            ),
                            SizedBox(height: 4.h),
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
        ),
      ),
    );
  }

  Widget _buildAppBar() {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 5.w,
        vertical: 2.h,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF007AFF),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: CircleAvatar(
              backgroundColor: Colors.white,
              radius: 20,
              child: Icon(
                Icons.arrow_back_ios_new,
                color: Color(0xFF007AFF),
                size: 18,
              ),
            ),
          ),
          Expanded(
            child: Center(
              child: Text(
                "Déclarer une\nsortie en stock",
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  fontSize: 16.sp.clamp(14, 20),
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  height: 1.2,
                ),
              ),
            ),
          ),
          SizedBox(width: 40),
        ],
      ),
    );
  }

 Widget _buildSectionHeader(String title, {bool isLeftAligned = true}) {
  return Row(
    crossAxisAlignment: CrossAxisAlignment.center,
    children: isLeftAligned
        ? [
            // Texte aligné à gauche
            Flexible(
              flex: 0,
              child: Text(
                title,
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  fontSize: 14.sp,
                  color: Colors.black87,
                ),
              ),
            ),
            SizedBox(width: 2.w), // petit espace entre le texte et la ligne
            Expanded(
              child: Container(
                height: 2,
                color: const Color(0xFF007AFF),
              ),
            ),
          ]
        : [
            // Ligne alignée à gauche
            Expanded(
              child: Container(
                height: 2,
                color: const Color(0xFF007AFF),
              ),
            ),
            SizedBox(width: 2.w), // petit espace entre la ligne et le texte
            Flexible(
              flex: 0,
              child: Text(
                title,
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  fontSize: 14.sp,
                  color: Colors.black87,
                ),
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
        style: GoogleFonts.poppins(fontSize: 14.sp.clamp(12, 16)),
        decoration: InputDecoration(
          border: InputBorder.none,
          hintText: hintText,
          labelText: labelText,
          hintStyle: GoogleFonts.poppins(
            fontSize: 14.sp.clamp(12, 16),
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

  Widget _buildPhoneInputField() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.5.h),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(
          color: _phoneError != null
              ? Colors.red
              : const Color.fromRGBO(226, 232, 240, 1),
          width: 1.2,
        ),
      ),
      child: InternationalPhoneNumberInput(
        onInputChanged: (PhoneNumber num) {
          setState(() {
            _phone = num.phoneNumber ?? '';
            _initialPhone = num;
          });
        },
        onInputValidated: (_) {},
        initialValue: _initialPhone,
        textFieldController: _phoneController,
        selectorConfig: const SelectorConfig(
          selectorType: PhoneInputSelectorType.DROPDOWN,
          showFlags: true,
          setSelectorButtonAsPrefixIcon: true,
        ),
        ignoreBlank: false,
        autoValidateMode: AutovalidateMode.disabled,
        selectorTextStyle: GoogleFonts.poppins(
          color: Colors.black,
          fontSize: 14.sp.clamp(12, 16),
        ),
        textStyle: GoogleFonts.poppins(fontSize: 14.sp.clamp(12, 16)),
        formatInput: true,
        keyboardType: const TextInputType.numberWithOptions(
          signed: false,
          decimal: false,
        ),
        inputDecoration: InputDecoration(
          isDense: true,
          border: InputBorder.none,
          hintText: 'Numéro de téléphone',
          hintStyle: GoogleFonts.poppins(
            fontSize: 14.sp.clamp(12, 16),
            color: Colors.grey[600],
          ),
          contentPadding: EdgeInsets.symmetric(
            horizontal: 2.w,
            vertical: 1.5.h,
          ),
        ),
        spaceBetweenSelectorAndTextField: 10,
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
                    _selectedProductName ?? "Sélectionner le produit",
                    style: GoogleFonts.poppins(
                      fontSize: 14.sp.clamp(12, 16),
                      color: _selectedProductName != null
                          ? Colors.black87
                          : Colors.grey[600],
                    ),
                    overflow: TextOverflow.ellipsis,
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
                      color: const Color.fromARGB(255, 250, 250, 250),
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: TextFormField(
                      onChanged: _filterProducts,
                      style: GoogleFonts.poppins(fontSize: 14.sp.clamp(12, 16)),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: "Rechercher",
                        prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
                        hintStyle: GoogleFonts.poppins(
                          fontSize: 14.sp.clamp(12, 16),
                          color: Colors.grey[600],
                        ),
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
                      ),
                    ),
                  ),
                ),
                Container(
                  constraints: BoxConstraints(
                    maxHeight: 30.h,
                  ),
                  child: _filteredProducts.isEmpty
                      ? Padding(
                          padding: EdgeInsets.all(4.w),
                          child: Center(
                            child: Text(
                              "Aucun produit trouvé",
                              style: GoogleFonts.poppins(
                                fontSize: 13.sp,
                                color: Colors.grey[600],
                              ),
                            ),
                          ),
                        )
                      : ListView.builder(
                          shrinkWrap: true,
                          itemCount: _filteredProducts.length,
                          itemBuilder: (context, index) {
                            final product = _filteredProducts[index];
                            return ListTile(
                              title: Text(
                                product['produitName'],
                                style: GoogleFonts.poppins(
                                  fontSize: 14.sp.clamp(12, 16),
                                ),
                                overflow: TextOverflow.ellipsis,
                                maxLines: 2,
                              ),
                              trailing: Container(
                                padding: EdgeInsets.symmetric(
                                  horizontal: 2.w,
                                  vertical: 0.5.h,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color.fromARGB(255, 70, 158, 252),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '${product['quantite']} ${product['unite']}',
                                  style: GoogleFonts.poppins(
                                    fontSize: 12.sp.clamp(10, 14),
                                    color: Colors.white,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                              onTap: () {
                                setState(() {
                                  _selectedProductName = product['produitName'];
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
    _functionController.dispose();
    _phoneController.dispose();
    super.dispose();
  }
}