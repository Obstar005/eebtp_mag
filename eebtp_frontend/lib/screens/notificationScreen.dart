import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  String searchQuery = '';
  bool isSearchMode = false;

  // Données factices
  final List<NotificationItem> notifications = [
    NotificationItem(
      id: 'DEM-008',
      userName: 'Lex Murphy',
      userAvatar: 'assets/avatars/lex.jpg',
      message: 'a valider votre demande d\'approvisionnement de ciment',
      timestamp: 'Aujourd\'hui à 9:42',
      isRead: false,
      type: NotificationType.validation,
    ),
    NotificationItem(
      id: 'DEM-004',
      userName: 'Lex Murphy',
      userAvatar: 'assets/avatars/lex2.jpg',
      message: 'a valider votre demande d\'approvisionnement de ciment',
      timestamp: 'Hier à 9:42',
      isRead: false,
      type: NotificationType.validation,
    ),
    NotificationItem(
      id: 'DEM-005',
      userName: 'Lex Murphy',
      userAvatar: 'assets/avatars/lex3.jpg',
      message: 'a valider votre demande d\'approvisionnement de ciment',
      timestamp: 'Hier à 9:42',
      isRead: true,
      type: NotificationType.validation,
    ),
    NotificationItem(
      id: 'DEM-005',
      userName: 'Lex Murphy',
      userAvatar: 'assets/avatars/lex4.jpg',
      message: 'a alider votre demande d\'approvisionnement de ciment',
      timestamp: 'Hier à 9:42',
      isRead: true,
      type: NotificationType.validation,
    ),
    NotificationItem(
      id: 'DEM-006',
      userName: 'Ray Arnold',
      userAvatar: 'assets/avatars/ray.jpg',
      message: 'a refuser votre demande d\'approvisionnement de couteaux',
      timestamp: 'Hier à 9:42',
      isRead: false,
      type: NotificationType.refusal,
    ),
  ];

  List<NotificationItem> get filteredNotifications {
    if (searchQuery.isEmpty) {
      return notifications;
    }
    return notifications.where((notification) {
      return notification.userName.toLowerCase().contains(searchQuery.toLowerCase()) ||
             notification.message.toLowerCase().contains(searchQuery.toLowerCase()) ||
             notification.id.toLowerCase().contains(searchQuery.toLowerCase());
    }).toList();
  }

  void _toggleSearchMode() {
    setState(() {
      isSearchMode = !isSearchMode;
      if (!isSearchMode) {
        _searchController.clear();
        searchQuery = '';
        _searchFocusNode.unfocus();
      } else {
        _searchFocusNode.requestFocus();
      }
    });
  }

  Widget _buildNormalAppBar() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
      decoration: const BoxDecoration(
        color: Color(0xFF007AFF),
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(20),
        ),
      ),
      child: Column(
        children: [
          SizedBox(height: 2.h),
          Row(
            children: [
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: EdgeInsets.all(2.w),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.arrow_back_ios_new,
                    color: Color(0xFF007AFF),
                    size: 5.w,
                  ),
                ),
              ),
              Expanded(
                child: Center(
                  child: Text(
                    "Notifications",
                    style: GoogleFonts.poppins(
                      fontSize: 18.sp,
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              Container(
                padding: EdgeInsets.all(2.5.w),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: Stack(
                  children: [
                    Icon(
                      Icons.notifications_outlined,
                      size: 6.w,
                      color: Color(0xFF007AFF),
                    ),
                    Positioned(
                      right: -1,
                      top: -1,
                      child: Container(
                        padding: EdgeInsets.all(0.8.w),
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          "3",
                          style: GoogleFonts.poppins(
                            fontSize: 8.sp,
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAppBar() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
      decoration: const BoxDecoration(
        color: Color(0xFF007AFF),
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(20),
        ),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: _toggleSearchMode,
            child: Container(
              padding: EdgeInsets.all(2.w),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.arrow_back,
                color: Color(0xFF007AFF),
                size: 5.w,
              ),
            ),
          ),
          SizedBox(width: 4.w),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(25),
              ),
              child: TextField(
                controller: _searchController,
                focusNode: _searchFocusNode,
                onChanged: (value) {
                  setState(() {
                    searchQuery = value;
                  });
                },
                decoration: InputDecoration(
                  hintText: "Rechercher",
                  hintStyle: TextStyle(
                    color: Colors.grey[400],
                    fontSize: 14.sp,
                  ),
                  prefixIcon: Icon(
                    Icons.search,
                    color: Colors.grey[400],
                    size: 6.w,
                  ),
                  suffixIcon: searchQuery.isNotEmpty
                      ? GestureDetector(
                          onTap: () {
                            _searchController.clear();
                            setState(() {
                              searchQuery = '';
                            });
                          },
                          child: Container(
                            margin: EdgeInsets.all(2.w),
                            decoration: BoxDecoration(
                              color: Colors.grey[300],
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.close,
                              color: Colors.grey[600],
                              size: 4.w,
                            ),
                          ),
                        )
                      : null,
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: 4.w,
                    vertical: 1.5.h,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBarBelow() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
      child: GestureDetector(
        onTap: _toggleSearchMode,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(25),
          ),
          child: Row(
            children: [
              Padding(
                padding: EdgeInsets.only(left: 4.w),
                child: Icon(
                  Icons.search,
                  color: Colors.grey[400],
                  size: 6.w,
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 2.h),
                  child: Text(
                    "Rechercher",
                    style: TextStyle(
                      color: Colors.grey[400],
                      fontSize: 14.sp,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationItem(NotificationItem notification) {
    return Container(
      margin: EdgeInsets.only(bottom: 1.h),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 5,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
        leading: Stack(
          children: [
            CircleAvatar(
              radius: 6.w,
              backgroundColor: Colors.grey[300],
              child: Icon(
                Icons.person,
                color: Colors.grey[600],
                size: 6.w,
              ),
            ),
            if (!notification.isRead)
              Positioned(
                left: 0,
                top: 0,
                child: Container(
                  width: 3.w,
                  height: 3.w,
                  decoration: const BoxDecoration(
                    color: Color(0xFF007AFF),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
          ],
        ),
        title: RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: notification.userName,
                style: GoogleFonts.poppins(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
              ),
              TextSpan(
                text: ' ${notification.message}',
                style: GoogleFonts.poppins(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w400,
                  color: Colors.black,
                ),
              ),
            ],
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 0.5.h),
            Text(
              'N° ${notification.id}',
              style: GoogleFonts.poppins(
                fontSize: 12.sp,
                fontWeight: FontWeight.w500,
                color: Colors.black87,
              ),
            ),
            SizedBox(height: 0.5.h),
            Text(
              notification.timestamp,
              style: GoogleFonts.poppins(
                fontSize: 11.sp,
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
        onTap: () {
          setState(() {
            notification.isRead = true;
          });
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_off_outlined,
            size: 20.w,
            color: Colors.grey[400],
          ),
          SizedBox(height: 3.h),
          Text(
            "Vous n'avez aucune notification",
            style: GoogleFonts.poppins(
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          SizedBox(height: 1.h),
          Text(
            "Toutes vos notifications s'afficheront ici",
            style: GoogleFonts.poppins(
              fontSize: 14.sp,
              color: Colors.grey[600],
            ),
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
          isSearchMode ? _buildSearchAppBar() : _buildNormalAppBar(),
          if (!isSearchMode) _buildSearchBarBelow(),
          Expanded(
            child: filteredNotifications.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    padding: EdgeInsets.all(4.w),
                    itemCount: filteredNotifications.length,
                    itemBuilder: (context, index) {
                      return _buildNotificationItem(filteredNotifications[index]);
                    },
                  ),
          ),
        ],
      ), initialIndex: 6,
 
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }
}

// Modèles de données et autres classes restent inchangés
class NotificationItem {
  final String id;
  final String userName;
  final String userAvatar;
  final String message;
  final String timestamp;
  bool isRead;
  final NotificationType type;

  NotificationItem({
    required this.id,
    required this.userName,
    required this.userAvatar,
    required this.message,
    required this.timestamp,
    required this.isRead,
    required this.type,
  });
}

enum NotificationType {
  validation,
  refusal,
  info,
}

