import 'package:eebtp_frontend/models/product.dart';
import 'package:eebtp_frontend/models/person.dart';

class EntryItem {
  final Product product;
  final DateTime date;
  final int quantity;
  final Person deliveryPerson;
  final String supplier;
  final String supplierPhone;

  EntryItem({
    required this.product,
    required this.date,
    required this.quantity,
    required this.deliveryPerson,
    required this.supplier,
    required this.supplierPhone,
  });

  factory EntryItem.fromJson(Map<String, dynamic> json) {
    return EntryItem(
      product: Product.fromJson(json['product']),
      date: DateTime.parse(json['date']),
      quantity: json['quantity'],
      deliveryPerson: Person.fromJson(json['deliveryPerson']),
      supplier: json['supplier'],
      supplierPhone: json['supplierPhone'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product': product.toJson(),
      'date': date.toIso8601String(),
      'quantity': quantity,
      'deliveryPerson': deliveryPerson.toJson(),
      'supplier': supplier,
      'supplierPhone': supplierPhone,
    };
  }
}
