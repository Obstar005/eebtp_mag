import 'package:eebtp_frontend/models/product.dart';
import 'package:eebtp_frontend/models/person.dart';

class ExitItem {
  final Product product;
  final DateTime date;
  final int quantity;
  final Person receiver;
  final String reason;

  ExitItem({
    required this.product,
    required this.date,
    required this.quantity,
    required this.receiver,
    required this.reason,
  });

  factory ExitItem.fromJson(Map<String, dynamic> json) {
    return ExitItem(
      product: Product.fromJson(json['product']),
      date: DateTime.parse(json['date']),
      quantity: json['quantity'],
      receiver: Person.fromJson(json['receiver']),
      reason: json['reason'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product': product.toJson(),
      'date': date.toIso8601String(),
      'quantity': quantity,
      'receiver': receiver.toJson(),
      'reason': reason,
    };
  }
}
