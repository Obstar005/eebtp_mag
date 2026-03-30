// Types pour le système de notifications basé sur l'historique des actions

export interface HistoriqueAction {
  id: number;
  user: string;
  action_type: string;
  description: string;
  date_action: string;
  objet_concerne: string;
}

// Type pour les notifications de l'historique (profil)
export interface Notification extends HistoriqueAction {
  // Champs additionnels pour l'interface utilisateur
  isRead?: boolean;
  priority?: "low" | "medium" | "high";
  category?: string; // Type plus flexible pour s'adapter à tous les types d'actions de l'API
}

// Type pour les vraies notifications de l'API (barre de navigation)
export interface ApiNotification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: string;
  user?: number;
}

export interface NotificationFilters {
  action_type?: string;
  user?: string;
  isRead?: boolean;
  priority?: "low" | "medium" | "high";
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationListResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byActionType: Record<string, number>;
  byUser: Record<string, number>;
  recent: number; // Notifications des dernières 24h
}

// Mapping des types d'actions vers des catégories plus lisibles
export const ACTION_TYPE_CATEGORIES: Record<string, string> = {
  connexion: "Connexions",
  creation: "Créations",
  modification: "Modifications",
  suppression: "Suppressions",
  consultation: "Consultations",
  validation: "Validations",
  approbation: "Approbations",
  rejet: "Rejets",
  confirmation: "Confirmations",
};

// Mapping des types d'actions vers des priorités
export const ACTION_TYPE_PRIORITIES: Record<string, "low" | "medium" | "high"> =
  {
    connexion: "low",
    consultation: "low",
    creation: "medium",
    modification: "medium",
    validation: "high",
    approbation: "high",
    rejet: "high",
    confirmation: "high",
    suppression: "high",
  };

// Mapping des types d'actions vers des icônes (classes CSS ou noms d'icônes)
export const ACTION_TYPE_ICONS: Record<string, string> = {
  connexion: "user-check",
  creation: "plus-circle",
  modification: "edit",
  suppression: "trash-2",
  consultation: "eye",
  validation: "check-circle",
  approbation: "thumbs-up",
  rejet: "thumbs-down",
  confirmation: "check-square",
};

// Mapping des types d'actions vers des couleurs
export const ACTION_TYPE_COLORS: Record<string, string> = {
  connexion: "text-blue-600 bg-blue-50",
  creation: "text-green-600 bg-green-50",
  modification: "text-yellow-600 bg-yellow-50",
  suppression: "text-red-600 bg-red-50",
  consultation: "text-gray-600 bg-gray-50",
  validation: "text-emerald-600 bg-emerald-50",
  approbation: "text-emerald-600 bg-emerald-50",
  rejet: "text-red-600 bg-red-50",
  confirmation: "text-blue-600 bg-blue-50",
};
