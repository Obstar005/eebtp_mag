import 'package:eebtp_frontend/models/article.dart';
import 'package:eebtp_frontend/models/demande.dart';
import 'package:eebtp_frontend/models/stockitem.dart';
import 'package:eebtp_frontend/models/utilisateur.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:eebtp_frontend/services/auth.dart';
import 'package:eebtp_frontend/services/demandeService.dart';
import 'package:eebtp_frontend/services/stockservice.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:sizer/sizer.dart';
import '../widgets/button.dart';
import 'package:toastification/toastification.dart';

class SupplyRequestScreen extends StatefulWidget {
  const SupplyRequestScreen({super.key});

  @override
  State<SupplyRequestScreen> createState() => _SupplyRequestScreenState();
}

class _SupplyRequestScreenState extends State<SupplyRequestScreen> {
  final _quantityController = TextEditingController();
  final _motifController = TextEditingController();

  StockItem? _selectedProduct;
  Utilisateur? _selectedResponsible;
  bool _isProductDropdownOpen = false;
  bool _isResponsibleDropdownOpen = false;

  // Données dynamiques
  List<StockItem> _products = [];
  List<Utilisateur> _users = [];
  List<StockItem> _filteredProducts = [];
  List<Utilisateur> _filteredUsers = [];
  
  // États de chargement
  bool _isLoadingProducts = true;
  bool _isLoadingUsers = true;
  bool _isCheckingRole = true; // ✅ Nouveau
  
  // Gestion des permissions
  bool _hasPermissionError = false;
  String _permissionErrorMessage = '';
  
  // Vérification du rôle Magasinier
  bool _isMagasinier = false; // ✅ Nouveau
  Utilisateur? _currentUser; // ✅ Nouveau

  // Cache pour les articles
  Map<int, ArticleStock?> _articleCache = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        Provider.of<AuthProvider>(context, listen: false).checkTokenExpiry(context);
        _checkUserRole(); // ✅ Vérifier le rôle en premier
        _fetchProducts();
        _fetchUsers();
      }
    });
  }

  // ✅ NOUVELLE MÉTHODE : Vérifier le rôle de l'utilisateur
  Future<void> _checkUserRole() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    if (token == null) {
      setState(() { _isCheckingRole = false; });
      return;
    }

    try {
      final userService = UserService();
      final user = await userService.getUserInfo(token);
      
      setState(() {
        _currentUser = user;
        // Vérifier si le poste contient "magasinier" (insensible à la casse)
        _isMagasinier = (user.poste?.toLowerCase().contains('magasinier') ?? false);
        _isCheckingRole = false;
      });

      // Si l'utilisateur n'est pas magasinier, afficher la boîte de dialogue
      if (!_isMagasinier && mounted) {
        _showNotMagasinierDialog();
      }
    } catch (e) {
      setState(() { _isCheckingRole = false; });
      print("Erreur vérification rôle: $e");
    }
  }

  // ✅ NOUVELLE MÉTHODE : Boîte de dialogue pour non-magasinier
  void _showNotMagasinierDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            children: [
              Icon(Icons.block, color: Color(0xFFFF5252), size: 28),
              SizedBox(width: 2.w),
              Expanded(
                child: Text(
                  "Accès non autorisé",
                  style: GoogleFonts.poppins(
                    fontSize: 17.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Seuls les magasiniers peuvent créer des demandes d'approvisionnement.",
                style: GoogleFonts.poppins(
                  fontSize: 13.sp,
                  color: Colors.black87,
                  height: 1.4,
                ),
              ),
              SizedBox(height: 2.h),
              Container(
                padding: EdgeInsets.all(3.w),
                decoration: BoxDecoration(
                  color: Color.fromARGB(255, 204, 97, 97),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Color.fromARGB(255, 245, 64, 64).withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: Color.fromARGB(255, 254, 6, 6), size: 20),
                    SizedBox(width: 3.w),
                    Expanded(
                      child: Text(
                        "Contactez l'administrateur pour obtenir les privilèges de magasinier.",
                        style: GoogleFonts.poppins(
                          fontSize: 12.sp,
                          color: Color.fromARGB(255, 6, 6, 6),
                          height: 1.3,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop(); // Fermer la boîte de dialogue
              //  Navigator.of(context).pop(); // Retourner à l'écran précédent
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF007AFF),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                "Ok",
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

  // ✅ NOUVELLE MÉTHODE : Afficher message quand l'utilisateur essaie de taper
  void _showCannotEditMessage() {
    _showToast(
      message: 'Vous devez être magasinier pour créer une demande', 
      type: ToastificationType.warning
    );
  }

  Future<void> _fetchProducts() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final storeId = Provider.of<AuthProvider>(context, listen: false).storeId;
    
    if (token == null || storeId == null) {
      setState(() { _isLoadingProducts = false; });
      return;
    }

    try {
      final stockService = StockService(token: token);
      final response = await stockService.getStockItemsByMagasin(storeId);
      
      List<StockItem> productsList = [];
      
      if (response is List<StockItem>) {
        productsList = response;
      } else if (response is List) {
        productsList = response.map((item) {
          if (item is StockItem) {
            return item;
          } else if (item is Map<String, dynamic>) {
            return StockItem.fromJson(item as Map<String, dynamic>);
          } else {
            throw Exception('Type d\'élément non supporté: ${item.runtimeType}');
          }
        }).toList();
      }
      
      setState(() {
        _products = productsList;
        _filteredProducts = _products;
        _isLoadingProducts = false;
      });
    } catch (e) {
      setState(() { _isLoadingProducts = false; });
      print("Erreur détaillée chargement produits: $e");
      _showToast(message: 'Erreur lors du chargement des produits', type: ToastificationType.error);
    }
  }

  Future<void> _fetchUsers() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    if (token == null) {
      setState(() { _isLoadingUsers = false; });
      return;
    }

    try {
      final userService = UserService();
      final users = await userService.getAllUsers(token);
      
      setState(() {
        _users = users;
        _filteredUsers = users;
        _isLoadingUsers = false;
        _hasPermissionError = false;
      });
    } catch (e) {
      setState(() { _isLoadingUsers = false; });
      
      print("Erreur détaillée chargement utilisateurs: $e");
      
      String errorString = e.toString();
      if (errorString.contains('permissions insuffisantes') || 
          errorString.contains('Accès refusé') ||
          errorString.contains('403')) {
        setState(() {
          _hasPermissionError = true;
          _permissionErrorMessage = "Vous n'avez pas les permissions nécessaires pour voir la liste des responsables. Contactez l'administrateur pour mettre à jour votre rôle.";
        });
        
        _showPermissionDialog();
      } 
    }
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            children: [
              Icon(Icons.info_outline, color: Color(0xFFFF9800), size: 28),
              SizedBox(width: 2.w),
              Expanded(
                child: Text(
                  "Permissions limitées",
                  style: GoogleFonts.poppins(
                    fontSize: 17.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
              ),
            ],
          ),
          content: Text(
            "Vous n'avez pas les permissions nécessaires pour accéder à la liste des responsables.\n\nVeuillez contacter l'administrateur pour mettre à jour votre rôle si vous avez besoin de cette fonctionnalité.\n\nVous pouvez continuer sans sélectionner de responsable.",
            style: GoogleFonts.poppins(
              fontSize: 13.sp,
              color: Colors.black87,
              height: 1.4,
            ),
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF007AFF),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                "J'ai compris",
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

  Future<ArticleStock?> _fetchArticle(int articleId) async {
    if (_articleCache.containsKey(articleId)) return _articleCache[articleId];
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    try {
      final article = await StockService(token: token).getArticleDetail(articleId);
      _articleCache[articleId] = article;
      return article;
    } catch (e) {
      print("Erreur chargement article: $e");
      return null;
    }
  }

  void _filterProducts(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredProducts = _products;
      } else {
        _filteredProducts = _products
            .where((product) => (product.produitName ?? '')
                .toLowerCase()
                .contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  void _filterUsers(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredUsers = _users;
      } else {
        _filteredUsers = _users
            .where((user) => 
                (user.firstName + ' ' + user.lastName)
                    .toLowerCase()
                    .contains(query.toLowerCase()) ||
                (user.poste ?? '')
                    .toLowerCase()
                    .contains(query.toLowerCase()) ||
                (user.username)
                    .toLowerCase()
                    .contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  void _showToast({required String message, required ToastificationType type}) {
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

  void _showConfirmationDialog() {
    // ✅ Vérifier si l'utilisateur est magasinier
    if (!_isMagasinier) {
      _showNotMagasinierDialog();
      return;
    }

    // Validation
    if (_selectedProduct == null) {
      _showToast(message: 'Veuillez sélectionner un produit', type: ToastificationType.warning);
      return;
    }
    if (_quantityController.text.trim().isEmpty) {
      _showToast(message: 'Veuillez saisir la quantité', type: ToastificationType.warning);
      return;
    }
    if (_motifController.text.trim().isEmpty) {
      _showToast(message: 'Veuillez saisir le motif', type: ToastificationType.warning);
      return;
    }

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

  Future<void> _submitForm() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final storeId = Provider.of<AuthProvider>(context, listen: false).storeId;

    if (token == null || storeId == null) {
      _showToast(message: 'Erreur d\'authentification', type: ToastificationType.error);
      return;
    }

    try {
      final quantite = int.tryParse(_quantityController.text.trim());
      final motif = _motifController.text.trim();

      if (quantite == null || motif.isEmpty || _selectedProduct == null) {
        _showToast(message: 'Veuillez remplir tous les champs correctement', type: ToastificationType.warning);
        return;
      }

      final demandeService = DemandeService();
      await demandeService.emettreDemande(
        quantite: quantite,
        raison: motif,
        stockItem: _selectedProduct!.id,
        magasin: storeId,
        token: token,
      );

      _showToast(message: 'Demande enregistrée avec succès!', type: ToastificationType.success);
      Navigator.pop(context);
    } catch (e) {
      print("Erreur soumission demande: $e");
      
      // ✅ Gérer spécifiquement le 403
      String errorString = e.toString();
      if (errorString.contains('403') || errorString.contains('Forbidden')) {
        _showNotMagasinierDialog();
      } else {
        _showToast(
          message: e.toString(),
          type: ToastificationType.error,
        );
      }
    }
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
    // ✅ Désactiver les champs si pas magasinier
    final isEnabled = _isMagasinier && !_isCheckingRole;
    
    return GestureDetector(
      onTap: !isEnabled ? _showCannotEditMessage : null, // ✅ Afficher message si désactivé
      child: Container(
        decoration: BoxDecoration(
          color: isEnabled 
              ? const Color.fromARGB(255, 241, 240, 240)
              : const Color(0xFFE0E0E0), // ✅ Grisé si désactivé
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isEnabled ? Color(0xFF007AFF) : Colors.grey.shade400
          ),
        ),
        child: TextFormField(
          controller: controller,
          enabled: isEnabled, // ✅ Désactiver le champ
          maxLines: maxLines,
          style: GoogleFonts.poppins(
            fontSize: 14.sp,
            color: isEnabled ? Colors.black87 : Colors.grey.shade600,
          ),
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
      ),
    );
  }

  Widget _buildProductDropdown() {
    // ✅ Désactiver si pas magasinier
    final isEnabled = _isMagasinier && !_isCheckingRole;
    
    return Column(
      children: [
        GestureDetector(
          onTap: isEnabled ? () {
            setState(() {
              _isProductDropdownOpen = !_isProductDropdownOpen;
              _isResponsibleDropdownOpen = false;
            });
          } : _showCannotEditMessage, // ✅ Afficher message si désactivé
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.8.h),
            decoration: BoxDecoration(
              color: isEnabled ? const Color(0xFFF5F5F5) : const Color(0xFFE0E0E0),
              borderRadius: BorderRadius.circular(50),
              border: Border.all(
                color: isEnabled ? Colors.grey.shade300 : Colors.grey.shade400
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: _isLoadingProducts
                      ? Text(
                          "Chargement des produits...",
                          style: GoogleFonts.poppins(
                            fontSize: 14.sp,
                            color: Colors.grey[600],
                          ),
                        )
                      : Text(
                          _selectedProduct?.produitName ?? 
                              (isEnabled ? "Sélectionner le produit" : "Non disponible (accès restreint)"),
                          style: GoogleFonts.poppins(
                            fontSize: 14.sp,
                            color: isEnabled 
                                ? (_selectedProduct != null ? Colors.black87 : Colors.grey[600])
                                : Colors.grey[500],
                          ),
                        ),
                ),
                if (!_isLoadingProducts && isEnabled)
                  Icon(
                    _isProductDropdownOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                    color: Colors.grey[600],
                  ),
              ],
            ),
          ),
        ),
        if (_isProductDropdownOpen && !_isLoadingProducts && isEnabled)
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
                            return FutureBuilder<ArticleStock?>(
                              future: _fetchArticle(product.produit),
                              builder: (context, snapshot) {
                                final unit = snapshot.data?.unite ?? '';
                                return ListTile(
                                  title: Text(
                                    product.produitName ?? 'Produit sans nom',
                                    style: GoogleFonts.poppins(fontSize: 14.sp),
                                  ),
                                  trailing: Container(
                                    padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
                                    decoration: BoxDecoration(
                                      color: const Color.fromARGB(255, 70, 158, 252),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      '${product.quantite} $unit',
                                      style: GoogleFonts.poppins(
                                        fontSize: 12.sp,
                                        color: Colors.white,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                  onTap: () {
                                    setState(() {
                                      _selectedProduct = product;
                                      _isProductDropdownOpen = false;
                                    });
                                  },
                                );
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
    // ✅ Désactiver si pas magasinier
    final isEnabled = _isMagasinier && !_isCheckingRole && !_hasPermissionError;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GestureDetector(
          onTap: isEnabled ? () {
            setState(() {
              _isResponsibleDropdownOpen = !_isResponsibleDropdownOpen;
              _isProductDropdownOpen = false;
            });
          } : (!_isMagasinier ? _showCannotEditMessage : null),
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.8.h),
            decoration: BoxDecoration(
              color: isEnabled 
                  ? const Color(0xFFF5F5F5)
                  : const Color(0xFFE0E0E0),
              borderRadius: BorderRadius.circular(50),
              border: Border.all(
                color: isEnabled 
                    ? Colors.grey.shade300
                    : Colors.grey.shade400
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: _isLoadingUsers
                      ? Text(
                          "Chargement des responsables...",
                          style: GoogleFonts.poppins(
                            fontSize: 14.sp,
                            color: Colors.grey[600],
                          ),
                        )
                      : Text(
                          _selectedResponsible != null 
                              ? "${_selectedResponsible!.firstName} ${_selectedResponsible!.lastName}"
                              : !_isMagasinier
                                  ? "Non disponible (accès restreint)"
                                  : _hasPermissionError
                                      ? "Non disponible (permissions insuffisantes)"
                                      : "Sélectionner celui qui a ordonné (optionnel)",
                          style: GoogleFonts.poppins(
                            fontSize: 14.sp,
                            color: isEnabled 
                                ? (_selectedResponsible != null ? Colors.black87 : Colors.grey[600])
                                : Colors.grey[500],
                          ),
                        ),
                ),
                if (!_isLoadingUsers && isEnabled)
                  Icon(
                    _isResponsibleDropdownOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                    color: Colors.grey[600],
                  ),
              ],
            ),
          ),
        ),
        if (_hasPermissionError && _isMagasinier) ...[
          SizedBox(height: 1.h),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.5.h),
            decoration: BoxDecoration(
              color: Color(0xFFFFF3E0),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Color(0xFFFF9800).withOpacity(0.3)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline, color: Color(0xFFFF9800), size: 20),
                SizedBox(width: 2.w),
                Expanded(
                  child: Text(
                    "Vous n'avez pas les permissions pour accéder à cette liste. Contactez l'administrateur si nécessaire.",
                    style: GoogleFonts.poppins(
                      fontSize: 11.sp,
                      color: Color(0xFFE65100),
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
        if (_isResponsibleDropdownOpen && !_isLoadingUsers && isEnabled)
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
                      onChanged: _filterUsers,
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
                  child: _filteredUsers.isEmpty
                      ? Padding(
                          padding: EdgeInsets.all(4.w),
                          child: Center(
                            child: Text(
                              "Aucun responsable trouvé",
                              style: GoogleFonts.poppins(
                                fontSize: 13.sp,
                                color: Colors.grey[600],
                              ),
                            ),
                          ),
                        )
                      : ListView.builder(
                          shrinkWrap: true,
                          itemCount: _filteredUsers.length,
                          itemBuilder: (context, index) {
                            final user = _filteredUsers[index];
                            return ListTile(
                              title: Text(
                                "${user.firstName} ${user.lastName}",
                                style: GoogleFonts.poppins(fontSize: 14.sp),
                              ),
                              subtitle: Text(
                                user.username,
                                style: GoogleFonts.poppins(
                                  fontSize: 12.sp,
                                  color: Colors.grey[600],
                                ),
                              ),
                              trailing: Container(
                                padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF007AFF),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  user.poste ?? 'Sans poste',
                                  style: GoogleFonts.poppins(
                                    fontSize: 10.sp,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              onTap: () {
                                setState(() {
                                  _selectedResponsible = user;
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
            // ✅ Afficher un indicateur de chargement pendant la vérification du rôle
            if (_isCheckingRole)
              Expanded(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(color: Color(0xFF007AFF)),
                      SizedBox(height: 2.h),
                      Text(
                        "Vérification des permissions...",
                        style: GoogleFonts.poppins(
                          fontSize: 14.sp,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              Expanded(
                child: SingleChildScrollView(
                  padding: EdgeInsets.all(5.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ✅ Afficher un bandeau d'avertissement si pas magasinier
                      if (!_isMagasinier) ...[
                        Container(
                          width: double.infinity,
                          padding: EdgeInsets.all(3.w),
                          margin: EdgeInsets.only(bottom: 2.h),
                          decoration: BoxDecoration(
                            color: Color(0xFFFFEBEE),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Color(0xFFFF5252).withOpacity(0.3)),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.block, color: Color(0xFFFF5252), size: 24),
                              SizedBox(width: 3.w),
                              Expanded(
                                child: Text(
                                  "Vous n'êtes pas autorisé à créer des demandes. Seuls les magasiniers ont accès à cette fonctionnalité.",
                                  style: GoogleFonts.poppins(
                                    fontSize: 12.sp,
                                    color: Color(0xFFC62828),
                                    height: 1.3,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
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
                          backgroundColor: _isMagasinier 
                              ? const Color(0xFF007AFF)
                              : Colors.grey.shade400, // ✅ Grisé si pas magasinier
                          textColor: Colors.white,
                          onPressed: _isMagasinier 
                              ? _showConfirmationDialog 
                              : _showCannotEditMessage, // ✅ Message si pas magasinier
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