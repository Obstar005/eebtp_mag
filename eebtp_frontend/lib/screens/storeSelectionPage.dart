import 'package:eebtp_frontend/services/projetservice.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import 'package:provider/provider.dart';
import 'package:eebtp_frontend/services/auth.dart';
import 'package:eebtp_frontend/models/utilisateur.dart';
import 'package:eebtp_frontend/providers/auth_provider.dart';

class StoreSelectionPage extends StatefulWidget {
  const StoreSelectionPage({super.key});

  @override
  State<StoreSelectionPage> createState() => _StoreSelectionPageState();
}

class _StoreSelectionPageState extends State<StoreSelectionPage> {
  late Future<List<Map<String, dynamic>>> _futureStores;
  late Future<Utilisateur> _futureUser;
  final UserService _userService = UserService();
  final ProjetService _projetService = ProjetService();

  @override
  void initState() {
    super.initState();
    final token = context.read<AuthProvider>().token;

    if (token != null) {
      _futureUser = _userService.getUserInfo(token);
      _futureStores = _loadStores(token);
    } else {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pushReplacementNamed(context, '/login');
      });
    }
  }

  Future<List<Map<String, dynamic>>> _loadStores(String token) async {
    try {
      final Utilisateur user = await _futureUser;

      // Vérification : pas de projet = empty state
      if (user.projets == null || user.projets.isEmpty) {
        return [];
      }

      List<Map<String, dynamic>> stores = [];

      for (var projet in user.projets) {
        final int projetId = int.tryParse(projet.toString()) ?? 0;
        if (projetId == 0) continue;

        try {
          final response = await _projetService.getMagasinsByProjet(projetId, token);
          final List<Map<String, dynamic>> magasins = List<Map<String, dynamic>>.from(response['magasins'] ?? []);

          for (var magasin in magasins) {
            stores.add({
              'id': magasin['id'],
              'name': magasin['nom'] ?? 'Magasin sans nom',
              'projectName': magasin['projet_nom'] ?? response['projet'] ?? 'Projet non spécifié',
              'address': magasin['adresse'] ?? 'Adresse non spécifiée',
              'projetId': projetId,
            });
          }
        } catch (e) {
          print('❌ Erreur pour le projet $projetId: $e');
        }
      }
      return stores;
    } catch (e) {
      throw Exception('Erreur lors du chargement des magasins: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final token = context.watch<AuthProvider>().token;
    if (token == null) {
      return Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFD),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
              decoration: BoxDecoration(
                color: Color(0xFF007AFF),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 15,
                    offset: const Offset(0, 2),
                  ),
                ],
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(20),
                  bottomRight: Radius.circular(20),
                ),
              ),
              child: Row(
                children: [
                  Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Mes Magasins",
                            style: GoogleFonts.montserrat(
                              fontSize: 18.sp,
                              fontWeight: FontWeight.w700,
                              color: const Color.fromARGB(255, 254, 254, 255),
                              letterSpacing: -0.5,
                            ),
                          ),
                          SizedBox(height: 0.5.h),
                          Text(
                            "Sélectionnez un magasin",
                            style: GoogleFonts.montserrat(
                              fontSize: 13.sp,
                              fontWeight: FontWeight.w500,
                              color: const Color.fromARGB(255, 255, 255, 255),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Spacer(),
                  FutureBuilder<Utilisateur>(
                    future: _futureUser,
                    builder: (context, snapshot) {
                      return Container(
                        width: 14.w,
                        height: 14.w,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xFF007AFF).withOpacity(0.2),
                            width: 2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: snapshot.hasData && snapshot.data!.photoProfil != null
                              ? Image.network(
                                  snapshot.data!.photoProfil!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Image.asset(
                                    "assets/profile.png",
                                    fit: BoxFit.cover,
                                  ),
                                )
                              : Image.asset(
                                  "assets/profile.png",
                                  fit: BoxFit.cover,
                                ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
            // Contenu principal
            Expanded(
              child: FutureBuilder<Utilisateur>(
                future: _futureUser,
                builder: (context, userSnapshot) {
                  if (userSnapshot.connectionState == ConnectionState.waiting) {
                    return _buildLoadingState();
                  }

                  // Affiche immédiatement l'empty state si projets nuls ou vides
                  if (userSnapshot.hasData &&
                      (userSnapshot.data!.projets == null ||
                          userSnapshot.data!.projets.isEmpty)) {
                    return _buildEmptyState();
                  }

                  if (userSnapshot.hasData) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      context.read<AuthProvider>().setUser(userSnapshot.data!);
                    });
                  }

                  return FutureBuilder<List<Map<String, dynamic>>>(
                    future: _futureStores,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return _buildLoadingState();
                      } else if (snapshot.hasError) {
                        return _buildErrorState();
                      } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                        return _buildEmptyState();
                      }
                      final stores = snapshot.data!;
                      return CustomScrollView(
                        physics: const BouncingScrollPhysics(),
                        slivers: [
                          SliverToBoxAdapter(
                            child: Container(
                              margin: EdgeInsets.fromLTRB(5.w, 3.h, 5.w, 1.h),
                              padding: EdgeInsets.all(4.w),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [Color(0xFF007AFF), Color(0xFF0056CC)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF007AFF).withOpacity(0.3),
                                    blurRadius: 15,
                                    offset: const Offset(0, 5),
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        RichText(
                                          text: TextSpan(
                                            children: [
                                              TextSpan(
                                                text: "Bonjour ",
                                                style: GoogleFonts.montserrat(
                                                  fontSize: 15.sp,
                                                  color: Colors.white.withOpacity(0.9),
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                              TextSpan(
                                                text: userSnapshot.data?.username ?? "Utilisateur",
                                                style: GoogleFonts.montserrat(
                                                  fontSize: 15.sp,
                                                  fontWeight: FontWeight.w700,
                                                  color: Colors.white,
                                                  letterSpacing: -0.3,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        SizedBox(height: 1.h),
                                        Text(
                                          "Sélectionnez un magasin pour accéder à son espace",
                                          style: GoogleFonts.montserrat(
                                            fontSize: 13.sp,
                                            color: Colors.white.withOpacity(0.8),
                                            fontWeight: FontWeight.w400,
                                            height: 1.4,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  SizedBox(width: 3.w),
                                  Icon(
                                    Icons.storefront_rounded,
                                    size: 10.w,
                                    color: Colors.white.withOpacity(0.9),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          SliverToBoxAdapter(child: _buildStoreHeader(stores.length)),
                          SliverPadding(
                            padding: EdgeInsets.fromLTRB(5.w, 2.h, 5.w, 2.h),
                            sliver: SliverList(
                              delegate: SliverChildBuilderDelegate(
                                (context, index) {
                                  final store = stores[index];
                                  return _buildStoreCard(store);
                                },
                                childCount: stores.length,
                              ),
                            ),
                          ),
                          SliverToBoxAdapter(child: SizedBox(height: 4.h)),
                        ],
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

Widget _buildStoreHeader(int storeCount) {
  return Container(
    margin: EdgeInsets.fromLTRB(5.w, 2.h, 5.w, 2.h), // marge gauche/droite/haut/bas
    padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h), // padding interne
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.03),
          blurRadius: 6,
          offset: const Offset(0, 2),
        ),
      ],
    ),
    child: Row(
      children: [
        Text(
          "Magasins disponibles",
          style: GoogleFonts.montserrat(
            fontSize: 16.sp,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF1D1D1F),
            letterSpacing: -0.3,
          ),
        ),
        const Spacer(),
        Container(
          padding: EdgeInsets.symmetric(
            horizontal: 3.w,
            vertical: 0.8.h,
          ),
          decoration: BoxDecoration(
            color: const Color(0xFF007AFF).withOpacity(0.10),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: const Color(0xFF007AFF).withOpacity(0.18),
              width: 1,
            ),
          ),
          child: Text(
            "$storeCount",
            style: GoogleFonts.montserrat(
              fontSize: 12.sp,
              color: const Color(0xFF007AFF),
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    ),
  );
}

  Widget _buildStoreCard(Map<String, dynamic> store) {
    return Container(
      margin: EdgeInsets.only(bottom: 2.5.h),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: Colors.white.withOpacity(0.8),
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () async {
            await context.read<AuthProvider>().setStoreId(store['id']);
            Navigator.pushNamed(context, '/profile');
          },
          borderRadius: BorderRadius.circular(20),
          splashColor: const Color(0xFF007AFF).withOpacity(0.1),
          highlightColor: const Color(0xFF007AFF).withOpacity(0.05),
          child: Padding(
            padding: EdgeInsets.all(5.w),
            child: Row(
              children: [
                Container(
                  width: 16.w,
                  height: 16.w,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF007AFF), Color(0xFF0056CC)],
                    ),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF007AFF).withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.store_rounded,
                    size: 7.w,
                    color: Colors.white,
                  ),
                ),
                SizedBox(width: 4.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        store['name'],
                        style: GoogleFonts.montserrat(
                          fontSize: 15.sp,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1D1D1F),
                          letterSpacing: -0.2,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 0.8.h),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.5.h),
                        decoration: BoxDecoration(
                          color: const Color(0xFF007AFF).withOpacity(0.08),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          store['projectName'],
                          style: GoogleFonts.montserrat(
                            fontSize: 13.sp,
                            color: const Color(0xFF007AFF),
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      SizedBox(height: 1.2.h),
                      Row(
                        children: [
                          Icon(
                            Icons.location_on_outlined,
                            size: 4.w,
                            color: const Color(0xFF8E8E93),
                          ),
                          SizedBox(width: 1.5.w),
                          Expanded(
                            child: Text(
                              store['address'],
                              style: GoogleFonts.montserrat(
                                fontSize: 13.sp,
                                color: const Color(0xFF8E8E93),
                                fontWeight: FontWeight.w500,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 3.w),
                Container(
                  padding: EdgeInsets.all(2.5.w),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFD),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: Colors.grey.withOpacity(0.1),
                    ),
                  ),
                  child: Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 4.w,
                    color: const Color(0xFF007AFF),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 20.w,
            height: 20.w,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(const Color(0xFF007AFF)),
              backgroundColor: const Color(0xFF007AFF).withOpacity(0.1),
            ),
          ),
          SizedBox(height: 3.h),
          Text(
            "Chargement des magasins...",
            style: GoogleFonts.montserrat(
              fontSize: 14.sp,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF1D1D1F),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(8.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 25.w,
              height: 25.w,
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.error_outline_rounded,
                size: 12.w,
                color: Colors.red,
              ),
            ),
            SizedBox(height: 3.h),
            Text(
              "Oups !",
              style: GoogleFonts.montserrat(
                fontSize: 18.sp,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1D1D1F),
              ),
            ),
            SizedBox(height: 1.5.h),
            Text(
              "Une erreur est survenue lors du chargement des magasins",
              style: GoogleFonts.montserrat(
                fontSize: 13.sp,
                color: const Color(0xFF8E8E93),
                fontWeight: FontWeight.w500,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 3.h),
            ElevatedButton(
              onPressed: () {
                final token = context.read<AuthProvider>().token;
                if (token != null) {
                  setState(() {
                    _futureStores = _loadStores(token);
                  });
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF007AFF),
                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 2.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: Text(
                "Réessayer",
                style: GoogleFonts.montserrat(
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(8.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 25.w,
              height: 25.w,
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFD),
                shape: BoxShape.circle,
                border: Border.all(
                  color: const Color(0xFFE5E5EA),
                  width: 2,
                ),
              ),
              child: Icon(
                Icons.store_mall_directory_outlined,
                size: 12.w,
                color: const Color(0xFF8E8E93),
              ),
            ),
            SizedBox(height: 3.h),
            Text(
              "Aucun magasin",
              style: GoogleFonts.montserrat(
                fontSize: 18.sp,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1D1D1F),
              ),
            ),
            SizedBox(height: 1.5.h),
            Text(
              "Vous n'avez actuellement accès à aucun magasin.\nContactez votre administrateur pour obtenir les droits.",
              style: GoogleFonts.montserrat(
                fontSize: 13.sp,
                color: const Color(0xFF8E8E93),
                fontWeight: FontWeight.w500,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
