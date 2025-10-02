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
      decoration: const BoxDecoration(
        color: Color(0xFF0A84FF),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: EdgeInsets.all(3.w),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.arrow_back_ios_new,
                    size: 5.w,
                    color: const Color(0xFF0A84FF),
                  ),
                ),
              ),
              Text(
                "Notifications",
                style: GoogleFonts.montserrat(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              Stack(
                children: [
                  Container(
                    padding: EdgeInsets.all(3.w),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.notifications_outlined,
                      size: 6.w,
                      color: const Color(0xFF0A84FF),
                    ),
                  ),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 1.5.w, vertical: 0.3.h),
                      constraints: BoxConstraints(minWidth: 5.w, minHeight: 2.h),
                      decoration: const BoxDecoration(
                        color: Color(0xFFFF3B30),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          "3",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10.sp,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Montserrat',
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchAppBar() {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0A84FF),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
          child: Row(
            children: [
              GestureDetector(
                onTap: _toggleSearchMode,
                child: Container(
                  padding: EdgeInsets.all(3.w),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.arrow_back_ios_new,
                    size: 5.w,
                    color: const Color(0xFF0A84FF),
                  ),
                ),
              ),
              SizedBox(width: 4.w),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: TextField(
                    controller: _searchController,
                    focusNode: _searchFocusNode,
                    onChanged: (value) {
                      setState(() {
                        searchQuery = value;
                      });
                    },
                    style: GoogleFonts.montserrat(
                      fontSize: 14.sp,
                      color: Colors.black,
                    ),
                    decoration: InputDecoration(
                      hintText: "Rechercher",
                      hintStyle: GoogleFonts.montserrat(
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
                        vertical: 1.8.h,
                      ),
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

  Widget _buildSearchBarBelow() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
      child: GestureDetector(
        onTap: _toggleSearchMode,
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF5F5F5),
            borderRadius: BorderRadius.circular(30),
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
                    style: GoogleFonts.montserrat(
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
      margin: EdgeInsets.only(bottom: 1.5.h),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: notification.isRead 
          ? Colors.white 
          : const Color(0xFFE3F2FD),
        borderRadius: BorderRadius.circular(3.w),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              Container(
                width: 12.w,
                height: 12.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey[300],
                  image: const DecorationImage(
                    image: NetworkImage('https://via.placeholder.com/150'),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              if (!notification.isRead)
                Positioned(
                  left: 0,
                  top: 0,
                  child: Container(
                    width: 2.5.w,
                    height: 2.5.w,
                    decoration: const BoxDecoration(
                      color: Color(0xFF0A84FF),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
          SizedBox(width: 3.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: notification.userName,
                        style: GoogleFonts.montserrat(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w700,
                          color: Colors.black,
                        ),
                      ),
                      TextSpan(
                        text: ' ${notification.message}',
                        style: GoogleFonts.montserrat(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w400,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 0.5.h),
                Text(
                  'N° ${notification.id}',
                  style: GoogleFonts.montserrat(
                    fontSize: 13.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                SizedBox(height: 0.3.h),
                Text(
                  notification.timestamp,
                  style: GoogleFonts.montserrat(
                    fontSize: 12.sp,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none_outlined,
            size: 30.w,
            color: Colors.grey[400],
          ),
          SizedBox(height: 3.h),
          Text(
            "Vous n'avez aucune notification",
            style: GoogleFonts.montserrat(
              fontSize: 18.sp,
              fontWeight: FontWeight.w700,
              color: Colors.black,
            ),
          ),
          SizedBox(height: 1.h),
          Text(
            "Toutes vos notifications s'afficheront ici",
            style: GoogleFonts.montserrat(
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
      body: Container(
        color: Colors.white,
        child: Column(
          children: [
            isSearchMode ? _buildSearchAppBar() : _buildNormalAppBar(),
            if (!isSearchMode) _buildSearchBarBelow(),
            Expanded(
              child: filteredNotifications.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 1.h),
                      itemCount: filteredNotifications.length,
                      itemBuilder: (context, index) {
                        return _buildNotificationItem(filteredNotifications[index]);
                      },
                    ),
            ),
          ],
        ),
      ),
      initialIndex: 6,
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }
}

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