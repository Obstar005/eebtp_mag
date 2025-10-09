import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class CustomInputField extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final bool obscureText;
  final VoidCallback? onToggleVisibility;
  final bool hasError;
  final String? errorText;
  final double? fontSize; // change : accepte un double

  const CustomInputField({
    super.key,
    required this.controller,
    required this.hintText,
    this.obscureText = false,
    this.onToggleVisibility,
    this.hasError = false,
    this.errorText,
    this.fontSize, // modif ici
  });

  @override
  Widget build(BuildContext context) {
    final textFontSize = fontSize ?? 14.sp; // valeur par défaut si non fournie
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: controller,
          obscureText: obscureText,
          decoration: InputDecoration(
            filled: true,
            fillColor: const Color.fromARGB(255, 255, 255, 255),
            hintText: hintText,
            hintStyle: GoogleFonts.poppins(
              fontSize: textFontSize,
              color: Colors.grey[600],
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(50),
              borderSide: BorderSide(
                color: hasError ? Colors.red : const Color.fromRGBO(226, 232, 240, 1),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(50),
              borderSide: BorderSide(
                color: hasError ? Colors.red : const Color.fromRGBO(226, 232, 240, 1),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(50),
              borderSide: BorderSide(
                color: hasError ? Colors.red : const Color.fromRGBO(226, 232, 240, 1),
                width: 1.5,
              ),
            ),
            suffixIcon: onToggleVisibility != null
                ? IconButton(
                    icon: Icon(
                      obscureText ? Icons.visibility_off : Icons.visibility,
                      color: Colors.grey,
                    ),
                    onPressed: onToggleVisibility,
                  )
                : null,
          ),
        ),
        if (hasError && errorText != null) ...[
          SizedBox(height: 0.5.h),
          Row(
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 18),
              SizedBox(width: 1.w),
              Expanded(
                child: Text(
                  errorText!,
                  style: GoogleFonts.poppins(
                    fontSize: 12.sp,
                    color: Colors.red,
                  ),
                ),
              ),
            ],
          )
        ]
      ],
    );
  }
}
