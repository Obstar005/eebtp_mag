class Product {
  final String name;
  final String code;
  final String unit;
  final String category;
  final int currentQuantity;
  final int threshold;
  final String description;
  final DateTime addedDate;

  Product({
    required this.name,
    required this.code,
    required this.unit,
    required this.category,
    required this.currentQuantity,
    required this.threshold,
    required this.description,
    required this.addedDate,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      name: json['name'],
      code: json['code'],
      unit: json['unit'],
      category: json['category'],
      currentQuantity: json['currentQuantity'],
      threshold: json['threshold'],
      description: json['description'],
      addedDate: DateTime.parse(json['addedDate']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'code': code,
      'unit': unit,
      'category': category,
      'currentQuantity': currentQuantity,
      'threshold': threshold,
      'description': description,
      'addedDate': addedDate.toIso8601String(),
    };
  }
}
