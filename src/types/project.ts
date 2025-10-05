// Types pour la gestion des projets
import type { User } from "./auth";

export interface Projet {
  id: number;
  nom: string; // Nom du projet (correspond à l'API)
  name?: string; // Alias pour compatibilité
  description?: string;
  date_creation: Date;
  date_debut: Date;
  date_fin?: Date; // Optionnel selon l'API
  date_modification: Date; // Nom exact de l'API
  pays: string; // Nom complet du pays selon l'API
  creator: number; // ID du créateur du projet (requis par l'API)
  is_active: boolean; // Statut actif du projet

  // Rôles principaux selon l'API
  chef_projet?: number; // ID du chef de projet (optionnel)
  chef_chantier?: number; // ID du chef de chantier (optionnel)
  magasinier?: number; // ID du magasinier (optionnel)

  // Champs pour compatibilité avec l'ancien système
  chef_projet_user_id?: number;
  directeur_travaux_user_id?: number;
  coordinateur_travaux_user_id?: number;
  chef_equipe_user_id?: number;

  images?: string[]; // URLs des images du projet
  comptes?: number[]; // IDs des comptes associés (selon l'API)

  // Relations
  chefProjet?: User;
  directeurTravaux?: User;
  chefChantier?: User;
  coordinateurTravaux?: User;
  chefEquipe?: User;
  magasins?: Magasin[];
  stockItems?: unknown[]; // TODO: Définir StockItem dans stock.ts
  comptesAssocies?: CompteAssocie[];
}

// Interface pour les comptes associés à un projet
export interface CompteAssocie {
  userId: number;
  userName: string;
  userProfile: string;
  role: ProjetRole;
  actions: string[]; // Actions possibles pour ce compte
}

export const ProjetRole = {
  CHEF_PROJET: "chef_projet",
  DIRECTEUR_TRAVAUX: "directeur_travaux",
  CHEF_CHANTIER: "chef_chantier",
  COORDINATEUR_TRAVAUX: "coordinateur_travaux",
  CHEF_EQUIPE: "chef_equipe",
  MAGASINIER: "magasinier",
} as const;

export type ProjetRole = (typeof ProjetRole)[keyof typeof ProjetRole];

export const ProjetRoleLabels: Record<ProjetRole, string> = {
  chef_projet: "Chef Projet",
  directeur_travaux: "Directeur Travaux",
  chef_chantier: "Chef Chantier",
  coordinateur_travaux: "Coordinateur Travaux",
  chef_equipe: "Chef Équipe",
  magasinier: "Magasinier",
};

// Types pour les magasins associés aux projets
export interface Magasin {
  id: number;
  name: string;
  project_id?: number;
  adresse?: string;
  actions?: string; // JSON des actions possibles

  // Relations
  projet?: Projet;
}

// Types pour les formulaires
export interface CreateProjetData {
  // Champs requis par l'API
  creator: number; // ID du créateur (requis)
  nom: string; // Nom du projet (requis)
  pays: string; // Nom complet du pays (requis)
  date_debut: string; // Format: YYYY-MM-DD (requis)

  // Champs optionnels
  description?: string;
  date_fin?: string; // Format: YYYY-MM-DD (optionnel)
  is_active?: boolean; // Par défaut true

  // Rôles principaux
  chef_projet?: number; // ID du chef de projet
  chef_chantier?: number; // ID du chef de chantier
  magasinier?: number; // ID du magasinier

  // Comptes associés
  comptes?: number[]; // IDs des utilisateurs associés au projet

  // Champs pour compatibilité (seront mappés vers les nouveaux champs)
  name?: string; // Sera mappé vers 'nom'
  chef_projet_user_id?: number; // Sera mappé vers 'chef_projet'
  directeur_travaux_user_id?: number;
  coordinateur_travaux_user_id?: number;
  chef_equipe_user_id?: number;
  chef_chantier_user_id?: number; // Sera mappé vers 'chef_chantier'

  // Champs UI uniquement (non envoyés à l'API)
  magasins?: CreateMagasinData[];
  images?: File[];
  comptes_associes?: (number | string)[];
}

export interface UpdateProjetData extends Partial<CreateProjetData> {
  id: number;
}

export interface CreateMagasinData {
  name: string;
  adresse?: string;
  _id?: number; // ID optionnel pour les magasins existants en mode édition
}

// Types pour les filtres et la recherche
export interface ProjetFilters {
  search?: string;
  pays?: string;
  chef_projet_id?: number;
  date_debut_from?: string;
  date_debut_to?: string;
  date_fin_from?: string;
  date_fin_to?: string;
  status?: ProjetStatus;
  page?: number;
  limit?: number;
}

// Types pour les statuts de projet (dérivé des dates)
export const ProjetStatus = {
  PLANIFIE: "planifie", // date_debut > maintenant
  EN_COURS: "en_cours", // date_debut <= maintenant <= date_fin
  TERMINE: "termine", // date_fin < maintenant
  ANNULE: "annule", // si nécessaire
} as const;

export type ProjetStatus = (typeof ProjetStatus)[keyof typeof ProjetStatus];

export const ProjetStatusLabels: Record<ProjetStatus, string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
};

export const ProjetStatusColors: Record<ProjetStatus, string> = {
  planifie: "bg-blue-100 text-blue-800",
  en_cours: "bg-green-100 text-green-800",
  termine: "bg-gray-100 text-gray-800",
  annule: "bg-red-100 text-red-800",
};

// Interface pour l'affichage de la liste des projets avec relations
export interface ProjetWithDetails {
  id: number;
  name: string;
  description?: string;
  date_debut: string;
  date_fin: string;
  pays: string;
  status: ProjetStatus;
  chefProjet: {
    id: number;
    name: string;
  };
  directeurTravaux: {
    id: number;
    name: string;
  };
  chefChantier: {
    id: number;
    name: string;
  };
  magasinsCount: number;
  comptesAssociesCount: number;
}

// Types pour les statistiques
export interface ProjetStats {
  total: number;
  planifies: number;
  en_cours: number;
  termines: number;
  annules: number;
  par_pays: Array<{
    pays: string;
    count: number;
  }>;
}

// Types pour la pagination
export interface ProjetListResponse {
  data: ProjetWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
