class Utilisateur {
  final int id;
  final String username;
  final String firstName;
  final String lastName;
  final String email;
  final String telephone;
  final String nationality;
  final String surname;
  final String? birthDate;
  final String type;
  final String titre;
  final String poste;
  final String? photoProfil;
  final bool isActive;
  final bool isStaff;
  final bool isSuperuser;
  final DateTime? lastLogin;
  final DateTime dateJoined;
  final DateTime dateCreation;
  final DateTime dateModif;
  final bool firstLogin;
  final int? profil;
  final List<int> projets;
  final List<int> groups;
  final List<int> userPermissions;
  final String? password; // Attention, à ne jamais exposer côté client si api safe

  Utilisateur({
    required this.id,
    required this.username,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.telephone,
    required this.nationality,
    required this.surname,
    this.birthDate,
    required this.type,
    required this.titre,
    required this.poste,
    this.photoProfil,
    required this.isActive,
    required this.isStaff,
    required this.isSuperuser,
    this.lastLogin,
    required this.dateJoined,
    required this.dateCreation,
    required this.dateModif,
    required this.firstLogin,
    this.profil,
   required this.projets,
    required this.groups,
    required this.userPermissions,
    this.password,
  });

  factory Utilisateur.fromJson(Map<String, dynamic> json) => Utilisateur(
    id: json['id'],
    username: json['username'] ?? '',
    firstName: json['first_name'] ?? '',
    lastName: json['last_name'] ?? '',
    email: json['email'] ?? '',
    telephone: json['telephone'] ?? '',
    nationality: json['nationality'] ?? '',
    surname: json['surname'] ?? '',
    birthDate: json['birth_date'],
    type: json['type'] ?? '',
    titre: json['titre'] ?? '',
    poste: json['poste'] ?? '',
    photoProfil: json['photo_profil'],
    isActive: json['is_active'] ?? false,
    isStaff: json['is_staff'] ?? false,
    isSuperuser: json['is_superuser'] ?? false,
    lastLogin: json['last_login'] != null ? DateTime.tryParse(json['last_login']) : null,
    dateJoined: DateTime.parse(json['date_joined']),
    dateCreation: DateTime.parse(json['date_creation']),
    dateModif: DateTime.parse(json['date_modif']),
    firstLogin: json['first_login'] ?? true,
    profil: json['profil'],
    projets: (json['projets'] as List<dynamic>).map((e) => int.parse(e.toString())).toList(),
    groups: json['groups'] != null ? List<int>.from(json['groups']) : [],
    userPermissions: json['user_permissions'] != null ? List<int>.from(json['user_permissions']) : [],
    password: json['password'], // attention ici, généralement non envoyé côté client
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'first_name': firstName,
    'last_name': lastName,
    'email': email,
    'telephone': telephone,
    'nationality': nationality,
    'surname': surname,
    'birth_date': birthDate,
    'type': type,
    'titre': titre,
    'poste': poste,
    'photo_profil': photoProfil,
    'is_active': isActive,
    'is_staff': isStaff,
    'is_superuser': isSuperuser,
    'last_login': lastLogin?.toIso8601String(),
    'date_joined': dateJoined.toIso8601String(),
    'date_creation': dateCreation.toIso8601String(),
    'date_modif': dateModif.toIso8601String(),
    'first_login': firstLogin,
    'profil': profil,
    'projets': projets,
    'groups': groups,
    'user_permissions': userPermissions,
    'password': password,
  };
// Ne renvoie que les champs attendus pour le PUT profil utilisateur
Map<String, dynamic> toUpdateJson() => {
  'id': id,
    'username': username,
'first_name': firstName,
'last_name': lastName,
    'email': email,
    'telephone': telephone,
    'nationality': nationality,
    'surname': surname,
    'type': type,
    'titre': titre,
    'poste': poste,
 
};

  Utilisateur copyWith({
    int? id,
    String? username,
    String? firstName,
    String? lastName,
    String? email,
    String? telephone,
    String? nationality,
    String? surname,
    String? birthDate,
    String? type,
    String? titre,
    String? poste,
    String? photoProfil,
    bool? isActive,
    bool? isStaff,
    bool? isSuperuser,
    DateTime? lastLogin,
    DateTime? dateJoined,
    DateTime? dateCreation,
    DateTime? dateModif,
    bool? firstLogin,
    int? profil,
    String? magasin,
    List<int>? projets,
    List<int>? groups,
    List<int>? userPermissions,
    String? password,
  }) {
    return Utilisateur(
      id: id ?? this.id,
      username: username ?? this.username,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      telephone: telephone ?? this.telephone,
      nationality: nationality ?? this.nationality,
      surname: surname ?? this.surname,
      birthDate: birthDate ?? this.birthDate,
      type: type ?? this.type,
      titre: titre ?? this.titre,
      poste: poste ?? this.poste,
      photoProfil: photoProfil ?? this.photoProfil,
      isActive: isActive ?? this.isActive,
      isStaff: isStaff ?? this.isStaff,
      isSuperuser: isSuperuser ?? this.isSuperuser,
      lastLogin: lastLogin ?? this.lastLogin,
      dateJoined: dateJoined ?? this.dateJoined,
      dateCreation: dateCreation ?? this.dateCreation,
      dateModif: dateModif ?? this.dateModif,
      firstLogin: firstLogin ?? this.firstLogin,
      profil: profil ?? this.profil,
      projets: projets ?? this.projets,
      groups: groups ?? this.groups,
      userPermissions: userPermissions ?? this.userPermissions,
      password: password ?? this.password,
    );
  }
}
