import 'dart:io';

bool isNetworkError(dynamic error) {
  final msg = error.toString().toLowerCase();
  return error is SocketException ||
      msg.contains('socketexception') ||
      msg.contains('connection refused') ||
      msg.contains('network is unreachable') ||
      msg.contains('failed host lookup') ||
      msg.contains('connection timed out') ||
      msg.contains('no address associated');
}