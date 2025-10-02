import 'package:eebtp_frontend/models/product.dart';
import 'package:eebtp_frontend/models/person.dart';

class ReturnItem {
  final Product product;
  final DateTime date;
  final int quantity;
  final Person depositor;

  ReturnItem({
    required this.product,
    required this.date,
    required this.quantity,
    required this.depositor,
  });

  factory ReturnItem.fromJson(Map<String, dynamic> json) {
    return ReturnItem(
      product: Product.fromJson(json['product']),
      date: DateTime.parse(json['date']),
      quantity: json['quantity'],
      depositor: Person.fromJson(json['depositor']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product': product.toJson(),
      'date': date.toIso8601String(),
      'quantity': quantity,
      'depositor': depositor.toJson(),
    };
  }
}
