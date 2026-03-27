import 'package:eebtp_frontend/providers/auth_provider.dart';
import 'package:eebtp_frontend/services/fcm_service.dart';
import 'package:eebtp_frontend/services/notification_service.dart';
import 'package:eebtp_frontend/widgets/nav.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
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
  bool _isLoading = true;

  List<NotificationItem> notifications = [];

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _fetchNotifications();

      // ✅ Écoute FCM foreground
      FcmService().setupForegroundHandler(
        onMessage: (RemoteMessage message) {
          if (!mounted) return;
          setState(() {
            notifications.insert(
              0,
              NotificationItem(
                id: 0, // pas encore persisté côté backend
                demandeRef: message.data['demande_id'] ?? '-',
                userName: message.notification?.title ?? 'Notification',
                message: message.notification?.body ?? '',
                timestamp: 'À l\'instant',
                isRead: false,
                type: _resolveType(message.data['type']),
              ),
            );
          });
        },
      );
    });
  }

  Future<void> _fetchNotifications() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    final token = Provider.of<AuthProvider>(context, listen: false).token;
    if (token == null) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      final service = NotificationService(token: token);
      final data = await service.getNotificationsByUser();

      if (!mounted) return;
      setState(() {
        notifications = data
            .map((n) => NotificationItem(
                  id: n.id,
                  demandeRef: '-',
                  userName: n.title ?? 'Notification',
                  message: n.message ?? '',
                  timestamp: _formatDate(n.createdAt),
                  isRead: n.isRead,
                  type: _resolveType(n.type),
                )) 
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      debugPrint('Erreur chargement notifications: $e');
    }
  }

  Future<void> _markAsRead(int index) async {
    final notif = filteredNotifications[index];
    if (notif.isRead) return;

    // ✅ Mise à jour locale immédiate
    setState(() => notif.isRead = true);

    // ✅ Sync backend (seulement si id valide — pas les notifs FCM locales)
    if (notif.id == 0) return;
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    if (token == null) return;

    try {
      await NotificationService(token: token).markAsRead(notif.id);
    } catch (e) {
      debugPrint('Erreur mark-as-read: $e');
    }
  }

  Future<void> _markAllAsRead() async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    if (token == null) return;

    final unread = notifications.where((n) => !n.isRead && n.id != 0).toList();

    setState(() {
      for (var n in notifications) {
        n.isRead = true;
      }
    });

    final service = NotificationService(token: token);
    for (final n in unread) {
      try {
        await service.markAsRead(n.id);
      } catch (e) {
        debugPrint('Erreur mark-as-read ${n.id}: $e');
      }
    }
  }

  NotificationType _resolveType(String? raw) {
    switch (raw) {
      case 'validation':
        return NotificationType.validation;
      case 'refusal':
        return NotificationType.refusal;
      default:
        return NotificationType.info;
    }
  }

  String _formatDate(String? raw) {
    if (raw == null || raw.isEmpty) return '-';
    try {
      final date = DateTime.parse(raw).toLocal();
      final now = DateTime.now();
      final diff = now.difference(date);

      if (diff.inMinutes < 1) return 'À l\'instant';
      if (diff.inMinutes < 60) return 'Il y a ${diff.inMinutes} min';
      if (diff.inDays == 0) {
        return 'Aujourd\'hui à ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
      }
      if (diff.inDays == 1) {
        return 'Hier à ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
      }
      return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
    } catch (_) {
      return raw ?? '-';
    }
  }

  int get _unreadCount => notifications.where((n) => !n.isRead).length;

  List<NotificationItem> get filteredNotifications {
    if (searchQuery.isEmpty) return notifications;
    return notifications.where((n) {
      return n.userName.toLowerCase().contains(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().contains(searchQuery.toLowerCase()) ||
          n.demandeRef.toLowerCase().contains(searchQuery.toLowerCase());
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
      decoration: const BoxDecoration(color: Color(0xFF0A84FF)),
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
                      color: Colors.white, shape: BoxShape.circle),
                  child: Icon(Icons.arrow_back_ios_new,
                      size: 5.w, color: const Color(0xFF0A84FF)),
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
                        color: Colors.white, shape: BoxShape.circle),
                    child: Icon(Icons.notifications_outlined,
                        size: 6.w, color: const Color(0xFF0A84FF)),
                  ),
                  if (_unreadCount > 0)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: EdgeInsets.symmetric(
                            horizontal: 1.5.w, vertical: 0.3.h),
                        constraints:
                            BoxConstraints(minWidth: 5.w, minHeight: 2.h),
                        decoration: const BoxDecoration(
                            color: Color(0xFFFF3B30), shape: BoxShape.circle),
                        child: Center(
                          child: Text(
                            '$_unreadCount',
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
      decoration: const BoxDecoration(color: Color(0xFF0A84FF)),
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
                      color: Colors.white, shape: BoxShape.circle),
                  child: Icon(Icons.arrow_back_ios_new,
                      size: 5.w, color: const Color(0xFF0A84FF)),
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
                    onChanged: (value) => setState(() => searchQuery = value),
                    style: GoogleFonts.montserrat(
                        fontSize: 14.sp, color: Colors.black),
                    decoration: InputDecoration(
                      hintText: "Rechercher",
                      hintStyle: GoogleFonts.montserrat(
                          color: Colors.grey[400], fontSize: 14.sp),
                      prefixIcon: Icon(Icons.search,
                          color: Colors.grey[400], size: 6.w),
                      suffixIcon: searchQuery.isNotEmpty
                          ? GestureDetector(
                              onTap: () {
                                _searchController.clear();
                                setState(() => searchQuery = '');
                              },
                              child: Container(
                                margin: EdgeInsets.all(2.w),
                                decoration: BoxDecoration(
                                    color: Colors.grey[300],
                                    shape: BoxShape.circle),
                                child: Icon(Icons.close,
                                    color: Colors.grey[600], size: 4.w),
                              ),
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                          horizontal: 4.w, vertical: 1.8.h),
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
      child: Row(
        children: [
          Expanded(
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
                      child: Icon(Icons.search,
                          color: Colors.grey[400], size: 6.w),
                    ),
                    SizedBox(width: 3.w),
                    Expanded(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 2.h),
                        child: Text(
                          "Rechercher",
                          style: GoogleFonts.montserrat(
                              color: Colors.grey[400], fontSize: 14.sp),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (_unreadCount > 0) ...[
            SizedBox(width: 3.w),
            GestureDetector(
              onTap: _markAllAsRead,
              child: Text(
                "Tout lire",
                style: GoogleFonts.montserrat(
                  fontSize: 13.sp,
                  color: const Color(0xFF0A84FF),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

Widget _buildNotificationItem(NotificationItem notification, int index) {
  return GestureDetector(
    onTap: () => _markAsRead(index),
    child: AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      margin: EdgeInsets.only(bottom: 1.2.h),
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      decoration: BoxDecoration(
        color: notification.isRead
            ? Colors.white
            : const Color(0xFFF0F6FF),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: notification.isRead
              ? Colors.grey.shade100
              : const Color(0xFF0A84FF).withOpacity(0.15),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ✅ Icône app sobre
          Container(
            width: 9.w,
            height: 9.w,
            decoration: BoxDecoration(
              color: notification.isRead
                  ? Colors.grey.shade100
                  : const Color(0xFF0A84FF).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.notifications_outlined,
              size: 4.5.w,
              color: notification.isRead
                  ? Colors.grey.shade400
                  : const Color(0xFF0A84FF),
            ),
          ),
          SizedBox(width: 3.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Titre + point non-lu
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Text(
                        notification.userName,
                        style: GoogleFonts.montserrat(
                          fontSize: 13.sp,
                          fontWeight: notification.isRead
                              ? FontWeight.w500
                              : FontWeight.w700,
                          color: Colors.black87,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (!notification.isRead) ...[
                      SizedBox(width: 2.w),
                      Container(
                        width: 2.w,
                        height: 2.w,
                        decoration: const BoxDecoration(
                          color: Color(0xFF0A84FF),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                  ],
                ),
                SizedBox(height: 0.5.h),
                // Message
                Text(
                  notification.message,
                  style: GoogleFonts.montserrat(
                    fontSize: 12.sp,
                    color: Colors.grey[600],
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: 0.8.h),
                // Timestamp
                Text(
                  notification.timestamp,
                  style: GoogleFonts.montserrat(
                    fontSize: 10.sp,
                    color: Colors.grey[400],
                    letterSpacing: 0.2,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );
} Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.notifications_none_outlined,
              size: 30.w, color: Colors.grey[400]),
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
                fontSize: 14.sp, color: Colors.grey[600]),
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
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                          color: Color(0xFF0A84FF)))
                  : filteredNotifications.isEmpty
                      ? _buildEmptyState()
                      : RefreshIndicator(
                          onRefresh: _fetchNotifications,
                          color: const Color(0xFF0A84FF),
                          child: ListView.builder(
                            padding: EdgeInsets.symmetric(
                                horizontal: 5.w, vertical: 1.h),
                            itemCount: filteredNotifications.length,
                            itemBuilder: (context, index) {
                              return _buildNotificationItem(
                                  filteredNotifications[index], index);
                            },
                          ),
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
  final int id;
  final String demandeRef;
  final String userName;
  final String message;
  final String timestamp;
  bool isRead;
  final NotificationType type;

  NotificationItem({
    required this.id,
    required this.demandeRef,
    required this.userName,
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