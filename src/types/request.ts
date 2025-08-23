// Types pour les demandes de matériel basé sur le schéma de base de données
export interface Demande {
  id: number;
  number: number; // Numéro de la demande
  stock_item_id: number; // ID de l'article en stock
  magasin_id: number; // ID du magasin
  quantite: number; // Quantité demandée (float)
  statut: DemandeStatut; // Statut de la demande (Enum)
  date_creation: Date; // Date de création
  emis_par: number; // ID utilisateur qui a émis la demande
  date_emission: Date; // Date d'émission
  confirme_par?: number; // ID utilisateur qui a confirmé (optionnel)
  date_confirmation?: Date; // Date de confirmation (optionnel)
  date_modif: Date; // Date de modification
  approuve_par?: number; // ID utilisateur qui a approuvé (optionnel)
  date_approbation?: Date; // Date d'approbation (optionnel)
  valide_par?: number; // ID utilisateur qui a validé (optionnel)
  date_validation?: Date; // Date de validation (optionnel)
}

// Interface avec les relations pour l'affichage
export interface DemandeWithRelations extends Demande {
  stock_item?: {
    id: number;
    name: string;
    description?: string;
  };
  magasin?: {
    id: number;
    name: string;
  };
  emetteur?: {
    id: number;
    name: string;
    profil: string;
  };
  confirmateur?: {
    id: number;
    name: string;
  };
  approbateur?: {
    id: number;
    name: string;
  };
  validateur?: {
    id: number;
    name: string;
  };
}

export const DemandeStatut = {
  EMIS: "emis",
  CONFIRME: "confirme",
  APPROUVE: "approuve",
  VALIDE: "valide",
  LIVRE: "livre",
} as const;

export type DemandeStatut = (typeof DemandeStatut)[keyof typeof DemandeStatut];

// Pour la compatibilité avec l'interface existante
export const RequestStatus = {
  TOUS: "tous",
  ...DemandeStatut,
} as const;

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

// Labels en français pour les statuts
export const RequestStatusLabels: Record<RequestStatus, string> = {
  tous: "Tous",
  emis: "Émis",
  confirme: "Confirmé",
  approuve: "Approuvé",
  valide: "Validé",
  livre: "Livré",
};

// Couleurs pour les statuts
export const RequestStatusColors: Record<RequestStatus, string> = {
  tous: "text-gray-600",
  emis: "text-blue-600",
  confirme: "text-yellow-600",
  approuve: "text-green-600",
  valide: "text-purple-600",
  livre: "text-orange-600",
};

// Interface pour compatibilité avec le code existant (à migrer progressivement)
export interface MaterialRequest {
  id: string;
  demande: string; // Nom du matériel demandé
  nomMagasinier: string; // Nom du magasinier
  quantiteDemandee: number; // Quantité demandée
  profil: string; // Profil du demandeur
  status: RequestStatus;
  dateDemande: string;
  userId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
