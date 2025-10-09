import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class CustomElevatedButton extends StatelessWidget {
  final String text;
  final Color backgroundColor;
  final Color textColor;
  final VoidCallback onPressed;
  final double? width;
  final double? height;
  final IconData? icon;
  final Color? iconColor;
  final double? iconSize;
  final bool outlined;

  const CustomElevatedButton({
    super.key,
    required this.text,
    required this.backgroundColor,
    required this.textColor,
    required this.onPressed,
    this.width,
    this.height,
    this.icon,
    this.iconColor,
    this.iconSize,
    this.outlined = false,
  });

  @override
  Widget build(BuildContext context) {
    final double buttonWidth = width != null
        ? width!.clamp(40.0, 100.w) // min 40px pour l'accessibilité
        : 85.w; // Par défaut 85% de la largeur de l'écran
    final double buttonHeight = height ?? 6.5.h;

    return Center(
      child: Container(
        constraints: BoxConstraints(
          maxWidth: 100.w,
          minWidth: 40.0,
          minHeight: 4.8.h,
        ),
        width: buttonWidth,
        height: buttonHeight,
        child: ElevatedButton(
          onPressed: onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: backgroundColor,
            foregroundColor: textColor,
            elevation: 0,
            side: outlined
                ? const BorderSide(color: Color(0xFFE5E5EA), width: 1)
                : BorderSide.none,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8.w),
            ),
            padding: EdgeInsets.symmetric(horizontal: 2.w),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min, // S'arrête à la taille du contenu
            children: [
              if (icon != null)
                Icon(
                  icon,
                  size: iconSize ?? 5.w,
                  color: iconColor ?? textColor,
                ),
              if (icon != null) SizedBox(width: 3.w),
              // Texte troncable et fluide
              Flexible(
                child: Text(
                  text,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                    color: textColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
