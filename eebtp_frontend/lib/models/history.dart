enum ActionType {
  creation,
  modification,
  suppression,
  validation,
  connexion,
  autre;

  static ActionType fromString(String value) {
    return ActionType.values.firstWhere(
      (e) => e.name == value,
      orElse: () => ActionType.autre,
    );
  }

  String toJson() => name;
}

class HistoriqueAction {
  final int id;
  final String user;
  final ActionType actionType;
  final String description;
  final DateTime dateAction;
  final String? objetConcerne;

  HistoriqueAction({
    required this.id,
    required this.user,
    required this.actionType,
    required this.description,
    required this.dateAction,
    this.objetConcerne,
  });

  factory HistoriqueAction.fromJson(Map<String, dynamic> json) {
    return HistoriqueAction(
      id: json['id'] as int,
      user: json['user'] as String,
      actionType: ActionType.fromString(json['action_type'] as String),
      description: json['description'] as String,
      dateAction: DateTime.parse(json['date_action'] as String),
      objetConcerne: json['objet_concerne'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user': user,
      'action_type': actionType.toJson(),
      'description': description,
      'date_action': dateAction.toIso8601String(),
      'objet_concerne': objetConcerne,
    };
  }
}
