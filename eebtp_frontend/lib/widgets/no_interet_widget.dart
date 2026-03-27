import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class NoInternetWidget extends StatelessWidget {
  final VoidCallback onRetry;
  final String? message;

  const NoInternetWidget({
    super.key,
    required this.onRetry,
    this.message,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 10.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.wifi_off_rounded,
              size: 20.w,
              color: Colors.grey[300],
            ),
            SizedBox(height: 3.h),
            Text(
              "Pas de connexion",
              style: GoogleFonts.montserrat(
                fontSize: 16.sp,
                fontWeight: FontWeight.w700,
                color: Colors.black87,
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              message ?? "Vérifiez votre connexion internet et réessayez.",
              style: GoogleFonts.montserrat(
                fontSize: 12.sp,
                color: Colors.grey[500],
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 4.h),
            GestureDetector(
              onTap: onRetry,
              child: Container(
                padding: EdgeInsets.symmetric(
                    horizontal: 8.w, vertical: 1.5.h),
                decoration: BoxDecoration(
                  color: const Color(0xFF007AFF),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.refresh_rounded,
                        color: Colors.white, size: 5.w),
                    SizedBox(width: 2.w),
                    Text(
                      "Réessayer",
                      style: GoogleFonts.montserrat(
                        fontSize: 13.sp,
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}