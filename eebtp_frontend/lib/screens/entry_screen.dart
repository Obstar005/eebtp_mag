import 'dart:typed_data';
import 'dart:convert';

import 'package:eebtp_frontend/models/article.dart';
import 'package:eebtp_frontend/models/demande.dart';
import 'package:eebtp_frontend/models/stockitem.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:eebtp_frontend/services/stockservice.dart';
import 'package:eebtp_frontend/services/demandeService.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:toastification/toastification.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:signature/signature.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

class StockEntryScreen extends StatefulWidget {
  const StockEntryScreen({super.key});
  @override
  State<StockEntryScreen> createState() => _StockEntryScreenState();
}

class _StockEntryScreenState extends State<StockEntryScreen> {
  final PageController pc = PageController();
  int currentStep = 0;

  // Contrôleurs
  final quantityController = TextEditingController();
  final supplierController = TextEditingController();
  final supplierPhoneController = TextEditingController();
  final companyController = TextEditingController();
  final delivererPhoneController = TextEditingController();
  final SignatureController signatureController = SignatureController(
    penStrokeWidth: 2,
    penColor: Colors.black,
    exportBackgroundColor: Color(0x3379B7FF),
  );

  PhoneNumber initialSupplierPhone = PhoneNumber(isoCode: 'TG');
  PhoneNumber initialDelivererPhone = PhoneNumber(isoCode: 'TG');

  StockItem? selectedProduct;
  ArticleStock? selectedProductArticle;
  Demande? selectedRequest;

  bool isProductDropdownOpen = false;
  bool isRequestDropdownOpen = false;

  List<StockItem> products = [];
  List<StockItem> filteredProducts = [];
  bool isLoadingProducts = true;

  List<Demande> demandes = [];
  List<Demande> filteredDemandes = [];
  bool isLoadingDemandes = true;

  Map<int, ArticleStock?> articleCache = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      fetchProducts();
      fetchDemandes();
    });
  }

  Future<void> fetchProducts() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final storeId = Provider.of<AuthProvider>(context, listen: false).storeId;
    if (token == null || storeId == null) {
      setState(() { isLoadingProducts = false; });
      return;
    }
    try {
      final stockService = StockService(token: token);
      final items = await stockService.getStockItemsByMagasin(storeId);
      setState(() {
        products = items;
        filteredProducts = products;
        isLoadingProducts = false;
      });
    } catch (e) {
      setState(() { isLoadingProducts = false; });
      showToast(message: 'Erreur lors du chargement des produits', type: ToastificationType.error);
      print('Erreur fetchProducts: $e');
    }
  }

  Future<void> fetchDemandes() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    if (token == null) {
      setState(() { isLoadingDemandes = false; });
      return;
    }
    try {
      final demandesService = DemandeService();
      final response = await demandesService.getDemandesValidees(token);
      if (response is List<Demande>) {
        setState(() {
          demandes = response;
          filteredDemandes = demandes;
          isLoadingDemandes = false;
        });
      } else if (response is List) {
        setState(() {
          demandes = response.cast<Map<String, dynamic>>().map((json) => Demande.fromJson(json)).toList();
          filteredDemandes = demandes;
          isLoadingDemandes = false;
        });
      } else {
        throw Exception("Type de réponse inattendu: ${response.runtimeType}");
      }
    } catch (e) {
      setState(() { isLoadingDemandes = false; });
      showToast(message: 'Erreur lors du chargement des demandes', type: ToastificationType.error);
      print('Erreur fetchDemandes: $e');
    }
  }

  void showToast({required String message, required ToastificationType type}) {
    toastification.show(
      context: context,
      type: type,
      style: ToastificationStyle.flatColored,
      title: Text(message, style: GoogleFonts.poppins(fontSize: 13.sp, fontWeight: FontWeight.w500)),
      autoCloseDuration: const Duration(seconds: 4),
      alignment: Alignment.topCenter,
      animationDuration: const Duration(milliseconds: 300),
      borderRadius: BorderRadius.circular(12),
      showProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      dragToClose: true,
      applyBlurEffect: true,
    );
  }

  void filterProducts(String query) {
    setState(() {
      filteredProducts = query.isEmpty
        ? products
        : products.where((p) => (p.produitName ?? '').toLowerCase().contains(query.toLowerCase())).toList();
    });
  }

  void filterDemandes(String query) {
    setState(() {
      filteredDemandes = query.isEmpty
        ? demandes
        : demandes.where((d) => (d.stockItemName ?? '').toLowerCase().contains(query.toLowerCase())).toList();
    });
  }

  Future<ArticleStock?> fetchArticle(int articleId) async {
    if (articleCache.containsKey(articleId)) return articleCache[articleId];
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    try {
      final article = await StockService(token: token).getArticleDetail(articleId);
      articleCache[articleId] = article;
      return article;
    } catch (e) {
      print('Erreur fetchArticle: $e');
      return null;
    }
  }

  void next() {
    if (currentStep == 0) {
      setState(() => currentStep = 1);
      pc.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    } else {
      submitForm();
    }
  }

  void back() {
    if (currentStep == 0) {
      Navigator.pop(context);
    } else {
      setState(() => currentStep = 0);
      pc.previousPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    }
  }

  Future<void> submitForm() async {
    String? error;
    if (selectedProduct == null) error = 'Sélectionne un produit';
    else if (quantityController.text.trim().isEmpty) error = 'La quantité est requise';
    else if (selectedRequest == null) error = 'Sélectionne une demande';
    else if (companyController.text.trim().isEmpty) error = 'Nom livreur requis';
    else if (signatureController.isEmpty) error = 'Signature requise';

    if (error != null) {
      showToast(message: error, type: ToastificationType.warning);
      print('Erreur validation formulaire : $error');
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final magasinId = authProvider.storeId;
    final token = authProvider.token;
    if (token == null || token.isEmpty) {
      showToast(message: 'Erreur utilisateur non connecté', type: ToastificationType.error);
      print("Erreur : token manquant ou vide");
      return;
    }

    try {
      final signatureBytes = await signatureController.toPngBytes();
      if (signatureBytes == null) {
        showToast(message: 'Erreur lors de la génération de la signature', type: ToastificationType.error);
        print("Erreur lors de la génération de signature : Bytes null");
        return;
      }

      // Champs à envoyer SANS la signature (qui part en multipart file)
      final champs = {
        'magasin': magasinId.toString(),
        'stock_item': selectedProduct!.id.toString(),
        'demande_source': selectedRequest!.id.toString(),
        'type': 'Livraison',
        'quantite_m': quantityController.text.trim(),
        'societe': supplierController.text.trim(),
        'tel_societe': supplierPhoneController.text.trim(),
        'nom_livreur': companyController.text.trim(),
        'tel_livreur': delivererPhoneController.text.trim(),
        'is_active': 'true',
        'signature_livreur': 'IMAGE PNG ENVOYEE EN FICHIER'
      };

      print('Données à envoyer :');
      print(jsonEncode(champs));

      final uri = Uri.parse('http://38.242.139.218:8001/Mouvements/entree-create');
      final request = http.MultipartRequest('POST', uri);

      champs.forEach((key, value) {
        if (key != 'signature_livreur') request.fields[key] = value;
      });

      request.files.add(
        http.MultipartFile.fromBytes(
          'signature_livreur',
          signatureBytes,
          filename: 'signature.png',
          contentType: MediaType('image', 'png'),
        ),
      );

      request.headers['Authorization'] = 'Bearer $token';

      http.StreamedResponse streamedResponse;
      http.Response response;

      try {
        streamedResponse = await request.send();
        response = await http.Response.fromStream(streamedResponse);
        print('Statut HTTP : ${response.statusCode}');
        print('Réponse brute : ${response.body}');
      } catch (e) {
        print('Erreur lors de l\'envoi HTTP : $e');
        rethrow;
      }

      if (response.statusCode == 201) {
        showToast(message: 'Livraison enregistrée avec succès!', type: ToastificationType.success);
        Navigator.pop(context);
      } else {
        showToast(message: 'Erreur lors de l\'enregistrement: ${response.body}', type: ToastificationType.error);
      }
    } catch (ex, stack) {
      showToast(message: 'Erreur lors de l\'envoi : $ex', type: ToastificationType.error);
      print('Exception capturée : $ex');
      print(stack);
    }
  }

  @override
  void dispose() {
    quantityController.dispose();
    supplierController.dispose();
    supplierPhoneController.dispose();
    companyController.dispose();
    delivererPhoneController.dispose();
    signatureController.dispose();
    super.dispose();
  }

  Widget buildAppBar() {
    return SafeArea(
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.2.h),
        decoration: const BoxDecoration(color: Color(0xFF007AFF)),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: back,
              child: const CircleAvatar(
                backgroundColor: Colors.white,
                child: Icon(Icons.arrow_back_ios_new, color: Color(0xFF007AFF)),
              ),
            ),
            Expanded(
              child: Text(
                'Déclarer une entrée en stock',
                style: GoogleFonts.poppins(fontSize: 16.sp, color: Colors.white, fontWeight: FontWeight.w600),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 48),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, {bool isLeftAligned = true}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: isLeftAligned
        ? [
            Flexible(
              flex: 0,
              child: Text(
                title,
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  fontSize: 14.sp,
                  color: Colors.black87,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            SizedBox(width: 2.w),
            Expanded(
              child: Container(
                height: 2,
                color: const Color(0xFF007AFF),
              ),
            ),
          ]
        : [
            Expanded(
              child: Container(
                height: 2,
                color: const Color(0xFF007AFF),
              ),
            ),
            SizedBox(width: 2.w),
            Flexible(
              flex: 0,
              child: Text(
                title,
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  fontSize: 14.sp,
                  color: Colors.black87,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
    );
  }

  Widget buildProductDropdown() {
    return Column(
      children: [
        GestureDetector(
          onTap: () => setState(() { isProductDropdownOpen = !isProductDropdownOpen; isRequestDropdownOpen = false; }),
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
                    selectedProduct?.produitName ?? 'Sélectionner le produit',
                    style: GoogleFonts.poppins(
                      fontSize: 14.sp,
                      color: selectedProduct != null ? Colors.black87 : Colors.grey[600],
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Icon(
                  isProductDropdownOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  color: Colors.grey[600],
                ),
              ],
            ),
          ),
        ),
        if (isProductDropdownOpen)
        Container(
          margin: EdgeInsets.only(top: 1.h),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0,2))],
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
                    onChanged: filterProducts,
                    style: GoogleFonts.poppins(fontSize: 14.sp),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      hintText: 'Rechercher',
                      prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
                      hintStyle: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.grey[600]),
                      contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
                    ),
                  ),
                ),
              ),
              Container(
                constraints: BoxConstraints(maxHeight: 30.h),
                child: filteredProducts.isEmpty
                  ? Padding(
                      padding: EdgeInsets.all(4.w),
                      child: Center(child: Text('Aucun produit trouvé', style: GoogleFonts.poppins(fontSize: 13.sp, color: Colors.grey[600]))),
                    )
                  : ListView.builder(
                      shrinkWrap: true,
                      itemCount: filteredProducts.length,
                      itemBuilder: (context, index) {
                        final product = filteredProducts[index];
                        return FutureBuilder<ArticleStock?>(
                          future: fetchArticle(product.produit),
                          builder: (context, snapshot) {
                            final unit = snapshot.data?.unite ?? '';
                            return ListTile(
                              title: Text(
                                product.produitName ?? '',
                                style: GoogleFonts.poppins(fontSize: 14.sp),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              trailing: Container(
                                padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
                                decoration: BoxDecoration(color: Color.fromARGB(255, 70, 158, 252), borderRadius: BorderRadius.circular(8)),
                                child: Text(
                                  "${product.quantite} $unit",
                                  style: GoogleFonts.poppins(fontSize: 12.sp, color: Colors.white, fontWeight: FontWeight.w500),
                                ),
                              ),
                              onTap: () => setState(() {
                                selectedProduct = product;
                                selectedProductArticle = snapshot.data;
                                isProductDropdownOpen = false;
                              }),
                            );
                          },
                        );
                      },
                    ),
              ),
            ],
          ),
        ),
        SizedBox(height: 2.h),
      ],
    );
  }

  Widget buildRequestDropdown() {
    return Column(
      children: [
        GestureDetector(
          onTap: () => setState(() { isRequestDropdownOpen = !isRequestDropdownOpen; isProductDropdownOpen = false; }),
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
                    selectedRequest?.stockItemName ?? 'Sélectionner la demande',
                    style: GoogleFonts.poppins(
                      fontSize: 14.sp,
                      color: selectedRequest != null ? Colors.black87 : Colors.grey[600],
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Icon(
                  isRequestDropdownOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  color: Colors.grey[600],
                ),
              ],
            ),
          ),
        ),
        if (isRequestDropdownOpen)
        Container(
          margin: EdgeInsets.only(top: 1.h),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0,2))],
          ),
          child: Column(
            children: [
              Padding(
                padding: EdgeInsets.all(3.w),
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color.fromARGB(255, 252, 251, 251),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: TextFormField(
                    onChanged: filterDemandes,
                    style: GoogleFonts.poppins(fontSize: 14.sp),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      hintText: 'Rechercher une demande...',
                      prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
                      hintStyle: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.grey[600]),
                      contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
                    ),
                  ),
                ),
              ),
         Container(
  constraints: BoxConstraints(maxHeight: 30.h),
  child: filteredDemandes.isEmpty
      ? Padding(
          padding: EdgeInsets.all(4.w),
          child: Center(
            child: Text(
              'Aucune demande trouvée',
              style: GoogleFonts.poppins(fontSize: 13.sp, color: Colors.grey[600]),
            ),
          ),
        )
      : ListView.builder(
          shrinkWrap: true,
          itemCount: filteredDemandes.length,
          itemBuilder: (context, index) {
            final demande = filteredDemandes[index];
            return GestureDetector(
              onTap: () => setState(() {
                selectedRequest = demande;
                isRequestDropdownOpen = false;
              }),
              child: Container(
                padding: EdgeInsets.symmetric(vertical: 1.3.h, horizontal: 1.2.w),
                child: Row(
                  children: [
                    // Nom de la demande à gauche
                    Expanded(
                      child: Text(
                        demande.stockItemName ?? '',
                        style: GoogleFonts.poppins(
                          fontSize: 14.sp,
                          color: Colors.black87,
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    SizedBox(width: 3.w),
                    // Numéro dans un rectangle rouge à droite
                    if (demande.number != null && demande.number!.isNotEmpty)
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 3.5.w, vertical: 0.9.h),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFF4848),
                          borderRadius: BorderRadius.circular(7),
                        ),
                        child: Text(
                          demande.number!,
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 12.2.sp,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.4,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
)
 ],
          ),
        ),
        SizedBox(height: 2.h),
      ],
    );
  }

  Widget buildBasicInputField({
    required TextEditingController controller,
    required String hintText,
    String? labelText,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 241, 240, 240),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF007AFF)),
      ),
      child: TextFormField(
        controller: controller,
        style: GoogleFonts.poppins(fontSize: 14.sp),
        decoration: InputDecoration(
          border: InputBorder.none,
          hintText: hintText,
          labelText: labelText,
          hintStyle: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.grey[600]),
          contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.8.h),
        ),
      ),
    );
  }

  Widget buildStepperProgress() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(2, (i) => Container(
        margin: EdgeInsets.symmetric(horizontal: 1.w),
        width: i == currentStep ? 12.w : 6.w,
        height: 1.2.h,
        decoration: BoxDecoration(
          color: i == currentStep ? Color(0xFF007AFF) : Colors.grey[300],
          borderRadius: BorderRadius.circular(10),
        ),
      )),
    );
  }

  Widget buildStep1() {
    return NavContainer(
      initialIndex: 3,
      body:  GestureDetector(
        onTap: () => setState(() { isProductDropdownOpen = false; isRequestDropdownOpen = false; }),
        child: SingleChildScrollView(
          padding: EdgeInsets.all(5.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionHeader('Demande', isLeftAligned: true),
              SizedBox(height: 1.h),
              buildRequestDropdown(),
              SizedBox(height: 3.h),
              _buildSectionHeader('Produit', isLeftAligned: true),
              SizedBox(height: 1.h),
              buildProductDropdown(),
              buildBasicInputField(controller: quantityController, hintText: 'Définir la quantité'),
              SizedBox(height: 3.h),
              _buildSectionHeader('Société', isLeftAligned: false),
              SizedBox(height: 1.h),
              buildBasicInputField(controller: supplierController, hintText: 'Nom de la société'),
              SizedBox(height: 2.h),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF5F5F5),
                  borderRadius: BorderRadius.circular(50),
                ),
                child: InternationalPhoneNumberInput(
                  onInputChanged: (PhoneNumber num) { initialSupplierPhone = num; },
                  initialValue: initialSupplierPhone,
                  textFieldController: supplierPhoneController,
                  selectorConfig: const SelectorConfig(selectorType: PhoneInputSelectorType.DROPDOWN, showFlags: true),
                  inputDecoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Numéro de téléphone société',
                    hintStyle: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.grey[600]),
                    contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.8.h),
                  ),
                  spaceBetweenSelectorAndTextField: 0,
                ),
              ),
              SizedBox(height: 6.h),
              buildStepperProgress(),
              SizedBox(height: 2.h),
              Center(
                child: ElevatedButton(
                  child: Text('Suivant', style: GoogleFonts.poppins(color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF007AFF),
                    minimumSize: Size(70.w, 50),
                  ),
                  onPressed: next,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget buildStep2() {
       return NavContainer(
      initialIndex: 3,
      body:SingleChildScrollView(
      padding: EdgeInsets.all(5.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader("Livreur", isLeftAligned: false),
          SizedBox(height: 2.h),
          buildBasicInputField(controller: companyController, hintText: 'Nom du livreur'),
          SizedBox(height: 2.h),
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5),
              borderRadius: BorderRadius.circular(50),
            ),
            child: InternationalPhoneNumberInput(
              onInputChanged: (PhoneNumber num) { initialDelivererPhone = num; },
              initialValue: initialDelivererPhone,
              textFieldController: delivererPhoneController,
              selectorConfig: const SelectorConfig(selectorType: PhoneInputSelectorType.DROPDOWN, showFlags: true),
              inputDecoration: InputDecoration(
                border: InputBorder.none,
                hintText: 'Numéro de téléphone livreur',
                hintStyle: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.grey[600]),
                contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.8.h),
              ),
              spaceBetweenSelectorAndTextField: 0,
            ),
          ),
          SizedBox(height: 3.h),
          Text('Signature', style: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 13.sp, color: Colors.grey[700])),
          SizedBox(height: 1.h),
          Container(
            width: double.infinity,
            height: 180,
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Signature(
              controller: signatureController,
              backgroundColor: Colors.white,
            ),
          ),
          SizedBox(height: 1.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text('Dessiner votre signature', style: GoogleFonts.poppins(fontSize: 12.sp, color: Colors.grey[600]), maxLines: 1, overflow: TextOverflow.ellipsis),
              ),
              GestureDetector(
                onTap: () { signatureController.clear(); },
                child: Text('Effacer', style: GoogleFonts.poppins(fontSize: 12.sp, color: Color(0xFF007AFF), fontWeight: FontWeight.w500)),
              ),
            ],
          ),
          SizedBox(height: 5.h),
          buildStepperProgress(),
          SizedBox(height: 2.h),
          Center(
            child: ElevatedButton(
              child: Text('Enregistrer', style: GoogleFonts.poppins(color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF007AFF),
                minimumSize: Size(70.w, 50),
              ),
              onPressed: next,
            ),
          ),
        ],
      ),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (currentStep == 0) return true;
        back();
        return false;
      },
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              buildAppBar(),
              Expanded(
                child: PageView(
                  controller: pc,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    buildStep1(),
                    buildStep2(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
