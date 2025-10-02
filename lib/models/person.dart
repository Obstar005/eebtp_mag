class Person {
  final String name;
  final String role;
  final String phone;
  final String? signature;

  Person({
    required this.name,
    required this.role,
    required this.phone,
    this.signature,
  });

  factory Person.fromJson(Map<String, dynamic> json) {
    return Person(
      name: json['name'],
      role: json['role'],
      phone: json['phone'],
      signature: json['signature'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'role': role,
      'phone': phone,
      'signature': signature,
    };
  }
}
