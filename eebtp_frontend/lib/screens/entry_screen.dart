import 'dart:convert';
import 'package:eebtp_frontend/models/article.dart';
import 'package:eebtp_frontend/models/demande.dart';
import 'package:eebtp_frontend/models/stockitem.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:eebtp_frontend/services/demandeService.dart';
import 'package:eebtp_frontend/services/mouvement_service.dart';
import 'package:eebtp_frontend/services/stockservice.dart';
import 'package:eebtp_frontend/widgets/button.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:sizer/sizer.dart';
import 'package:provider/provider.dart';
import 'package:toastification/toastification.dart';
import 'package:signature/signature.dart';

class StockEntryScreen extends StatefulWidget {
  const StockEntryScreen({super.key});
  @override
  State<StockEntryScreen> createState() => _StockEntryScreenState();
}

class _StockEntryScreenState extends State<StockEntryScreen> {
  final PageController pc = PageController();
  int currentStep = 0;

  // Controllers
  final quantityController = TextEditingController();
  final supplierController = TextEditingController();
  final phoneController = TextEditingController();
  final companyController = TextEditingController();
  final SignatureController signatureController = SignatureController(
    penStrokeWidth: 2,
    penColor: Colors.black,
    exportBackgroundColor: Colors.white,
  );
  PhoneNumber initialPhone = PhoneNumber(isoCode: 'TG');

  // Sélections
  StockItem? selectedProduct;
  ArticleStock? selectedProductArticle;
  Demande? selectedRequest;

  // Dropdown regulators
  bool isProductDropdownOpen = false;
  bool isRequestDropdownOpen = false;

  // Data lists dynamiques
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
      products = items; // Déjà une List<StockItem>
      filteredProducts = products;
      isLoadingProducts = false;
    });
  } catch (e) {
    setState(() { isLoadingProducts = false; });
    print("Erreur fetchProducts: $e");
    showToast(message: 'Erreur lors du chargement des produits', type: ToastificationType.error);
  }
}

// Pour fetchDemandes() avec cast sécurisé
Future<void> fetchDemandes() async {
  final token = Provider.of<AuthProvider>(context, listen: false).token;
  if (token == null) {
    setState(() { isLoadingDemandes = false; });
    return;
  }
  try {
    final demandesService = DemandeService();
    final response = await demandesService.getDemandesEmises(token);
    
    // Vérifier le type et convertir
    if (response is List<Demande>) {
      // Déjà le bon type
      setState(() {
        demandes = response;
        filteredDemandes = demandes;
        isLoadingDemandes = false;
      });
    } else if (response is List) {
      // Convertir List<dynamic> en List<Demande>
      setState(() {
        demandes = response.cast<Map<String, dynamic>>().map((json) => 
          Demande.fromJson(json)
        ).toList();
        filteredDemandes = demandes;
        isLoadingDemandes = false;
      });
    } else {
      throw Exception("Type de réponse inattendu: ${response.runtimeType}");
    }
  } catch (e) {
    print("Erreur fetchDemandes: $e");
    setState(() { isLoadingDemandes = false; });
    showToast(message: 'Erreur lors du chargement des demandes', type: ToastificationType.error);
  }

}  void showToast({required String message, required ToastificationType type}) {
    toastification.show(
      context: context,
      type: type,
      style: ToastificationStyle.flatColored,
      title: Text(message, style: GoogleFonts.poppins(
        fontSize: 13.sp,
        fontWeight: FontWeight.w500
      )),
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
      print(e);
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
    // Ici, tout est validé : on soumet !
    String? error;
    if (selectedProduct == null) error = 'Sélectionne un produit';
    else if (quantityController.text.trim().isEmpty) error = 'La quantité est requise';
    else if (selectedRequest == null) error = 'Sélectionne une demande';
    else if (companyController.text.trim().isEmpty) error = 'Nom livreur requis';
    else if (signatureController.isEmpty) error = 'Signature requise';

    if (error != null) {
      showToast(message: error, type: ToastificationType.warning);
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final magasinId = authProvider.storeId;
    final token = authProvider.token;
    if (token == null || token.isEmpty) {
      showToast(message: 'Erreur utilisateur non connecté', type: ToastificationType.error);
      return;
    }
    // Signature en base64 PNG
    final signatureBytes = await signatureController.toPngBytes();
    final signatureBase64 = signatureBytes != null ? base64Encode(signatureBytes) : null;

    final data = {
      'magasin': magasinId,
      'stockitem': selectedProduct!.id.toString(), // au lieu de int brut

     // 'stockitem': selectedProduct!.id,
      'source': selectedRequest!.id,
      'type': 'Livraison',
      'quantitem': quantityController.text.trim(),
      'societe': supplierController.text.trim(),
      'telsociete': phoneController.text.trim(),
      'nomlivreur': companyController.text.trim(),
      'tellivreur': phoneController.text.trim(),
      'signaturelivreur': signatureBase64,
      'isactive': true,
    };
    print(data);
    try {
      final mouvementsService = MouvementsService(token: token);
      final response = await mouvementsService.createEntree(data);
      if (response.statusCode == 201) {
        showToast(message: 'Livraison enregistrée avec succès!', type: ToastificationType.success);
        Navigator.pop(context);
      } else {
        showToast(message: 'Erreur lors de l’enregistrement.', type: ToastificationType.error);
      }
    } catch (e) {
      showToast(message: 'Erreur lors de l’enregistrement.', type: ToastificationType.error);
    }
  }

  @override
  void dispose() {
    quantityController.dispose();
    supplierController.dispose();
    phoneController.dispose();
    companyController.dispose();
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
          Text(
            'Déclarer une entrée en stock',
            style: GoogleFonts.poppins(fontSize: 16.sp, color: Colors.white, fontWeight: FontWeight.w600),
            textAlign: TextAlign.center,
          ),
          const SizedBox(width: 48),
        ],
      ),
    ));
  }

  // Etape 1

  Widget buildStep1() {
    return GestureDetector(
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
                onInputChanged: (PhoneNumber num) { initialPhone = num; },
                initialValue: initialPhone,
                textFieldController: phoneController,
                selectorConfig: const SelectorConfig(selectorType: PhoneInputSelectorType.DROPDOWN, showFlags: true),
                inputDecoration: InputDecoration(
                  border: InputBorder.none,
                  hintText: 'Numéro de téléphone',
                  hintStyle: GoogleFonts.poppins(fontSize: 14.sp, color: Colors.grey[600]),
                  contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.8.h),
                ),
                spaceBetweenSelectorAndTextField: 0,
              ),
            ),
            SizedBox(height: 6.h),
            buildStepperProgress(),
            SizedBox(height: 2.h),
            CustomElevatedButton(
              text: 'Suivant',
              backgroundColor: Color(0xFF007AFF),
              textColor: Colors.white,
              onPressed: next,
              width: 70.w,
            ),
          ],
        ),
      ),
    );
  }

  // Etape 2
  Widget buildStep2() {
    return SingleChildScrollView(
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
              onInputChanged: (PhoneNumber num) { initialPhone = num; },
              initialValue: initialPhone,
              textFieldController: phoneController,
              selectorConfig: const SelectorConfig(selectorType: PhoneInputSelectorType.DROPDOWN, showFlags: true),
              inputDecoration: InputDecoration(
                border: InputBorder.none,
                hintText: 'Numéro de téléphone',
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
              Text('Dessiner votre signature', style: GoogleFonts.poppins(fontSize: 12.sp, color: Colors.grey[600])),
              GestureDetector(
                onTap: () { signatureController.clear(); },
                child: Text('Effacer', style: GoogleFonts.poppins(fontSize: 12.sp, color: Color(0xFF007AFF), fontWeight: FontWeight.w500)),
              ),
            ],
          ),
          SizedBox(height: 5.h),
          buildStepperProgress(),
          SizedBox(height: 2.h),
          CustomElevatedButton(
            text: 'Enregistrer',
            backgroundColor: Color(0xFF007AFF),
            textColor: Colors.white,
            onPressed: next,
            width: 70.w,
          ),
        ],
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
                          child: Center(child: Text('Aucune demande trouvée', style: GoogleFonts.poppins(fontSize: 13.sp, color: Colors.grey[600]))),
                        )
                      : ListView.builder(
                          shrinkWrap: true,
                          itemCount: filteredDemandes.length,
                          itemBuilder: (context, index) {
                            final demande = filteredDemandes[index];
                            return ListTile(
                              title: Text(
                                demande.stockItemName ?? '',
                                style: GoogleFonts.poppins(fontSize: 14.sp),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              subtitle: Text(
                                demande.number ?? '',
                                style: GoogleFonts.poppins(fontSize: 12.sp, color: Colors.grey[600]),
                              ),
                              onTap: () => setState(() {
                                selectedRequest = demande;
                                isRequestDropdownOpen = false;
                              }),
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

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: () async {
          if (currentStep == 0) return true;
          back();
          return false;
        },
        child: NavContainer(
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
          ), initialIndex: 1,
        ));
  }
}
