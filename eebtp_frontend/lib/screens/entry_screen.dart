import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:sizer/sizer.dart';

import '../widgets/button.dart';
import '../widgets/input.dart';

class StockEntryScreen extends StatefulWidget {
  const StockEntryScreen({super.key});

  @override
  State<StockEntryScreen> createState() => _StockEntryScreenState();
}

class _StockEntryScreenState extends State<StockEntryScreen> {
  final PageController _pc = PageController();
  int _currentStep = 0;

  // Controllers
  final _productController = TextEditingController();
  final _quantityController = TextEditingController();
  final _supplierController = TextEditingController();
  final _phoneController = TextEditingController();
  final _requestController = TextEditingController();

  PhoneNumber _initialPhone = PhoneNumber(isoCode: 'TG');

  void _next() {
    if (_pc.page == 0) {
      _pc.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() => _currentStep = 1);
    } else {
      // TODO: Envoyer le formulaire
      debugPrint("Produit: ${_productController.text}");
      debugPrint("Quantité: ${_quantityController.text}");
      debugPrint("Fournisseur: ${_supplierController.text}");
      debugPrint("Téléphone: ${_phoneController.text}");
      debugPrint("Demande: ${_requestController.text}");
      Navigator.pop(context); // ou afficher une confirmation
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
          // Bouton retour
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: const CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(Icons.arrow_back_ios_new, color: Color(0xFF007AFF)),
            ),
          ),

          // Titre
          Text(
            "Déclarer une\nentrée en stock",
            style: GoogleFonts.poppins(
              fontSize: 16.sp,
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),

          // Icône notification avec badge
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

  Widget _buildStep1() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(5.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Produit",
              style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600, fontSize: 12.sp)),
          SizedBox(height: 1.h),
          CustomInputField(
            controller: _productController,
            hintText: "Sélectionner le produit",
          ),
          SizedBox(height: 2.h),
          CustomInputField(
            controller: _quantityController,
            hintText: "Définir la quantité",
          ),
          SizedBox(height: 3.h),

          Text("Fournisseur",
              style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600, fontSize: 12.sp)),
          SizedBox(height: 1.h),
          CustomInputField(
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
    );
  }

  Widget _buildStep2() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(5.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Demande",
              style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600, fontSize: 12.sp)),
          SizedBox(height: 1.h),
          CustomInputField(
            controller: _requestController,
            hintText: "Sélectionner la demande",
          ),
          SizedBox(height: 40.h),
          Column(
            children: [
              _buildProgressIndicator(),
              SizedBox(height: 2.h),
              CustomElevatedButton(
                text: 'Envoyer',
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
    return Scaffold(
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
    );
  }
}
