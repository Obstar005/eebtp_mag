/**
 * Types pour l'API des demandes (EEBTP_MAG v3.7)
 * Basés sur la documentation API /Demandes/*
 */

// ==================== TYPES API DEMANDES ====================

export interface ApiDemande {
  id: number;
  // Champs calculés (readOnly)
  magasin_name: string;
  stock_item_name: string;
  stock_item_unite?: string; // Unité du stock item
  emis_par_name: string;
  confirme_par_name?: string;
  approve_par_name?: string;
  valide_par_name?: string;
  rejete_par_name?: string;
  number: string; // Numéro de la demande

  // Champs requis pour création
  quantite_dem: number; // Quantité demandée
  raison: string;
  stock_item: number; // ID du stock item
  magasin: number; // ID du magasin

  // Statut et dates
  statut: ApiDemandeStatut;
  date_creation: string; // ISO date
  date_emission?: string;
  date_confirmation?: string;
  date_approbation?: string;
  date_validation?: string;
  date_rejet?: string;

  // Commentaires à chaque étape
  commentaire_confirmation?: string;
  commentaire_approbation?: string;
  commentaire_validation?: string;

  // Quantités ajustées à chaque étape
  quantite_approuv?: number;
  quantite_valid?: number;

  // Autres champs
  cout_total_approx?: number;
  is_valide?: boolean;

  // Motif de rejet
  motif_rejet?: string;

  // IDs des acteurs (readOnly)
  emis_par?: number;
  confirme_par?: number;
  approve_par?: number;
  valide_par?: number;
  rejete_par?: number;
}

// Statuts API (différents des statuts frontend)
export type ApiDemandeStatut =
  | "Emise"
  | "Confirmée"
  | "Approuvée"
  | "Validée"
  | "Rejetée"
  | "Livrée";

// ==================== TYPES POUR CRÉATION/MODIFICATION ====================

export interface ApiCreateDemandeRequest {
  quantite_dem: number;
  raison: string;
  stock_item: number;
  magasin: number;
}

export interface ApiUpdateDemandeRequest {
  quantite_dem?: number;
  raison?: string;
  stock_item?: number;
  magasin?: number;
}

// ==================== TYPES POUR ACTIONS ====================

export interface ApiApprouverDemandeRequest {
  // Les données à envoyer pour approuver une demande
  commentaire_approbation?: string;
  quantite_approuv?: number;
}

export interface ApiConfirmerDemandeRequest {
  // Les données à envoyer pour confirmer une demande
  commentaire_confirmation?: string;
}

export interface ApiValiderDemandeRequest {
  // Les données à envoyer pour valider une demande
  commentaire_validation?: string;
  quantite_valid?: number;
  cout_total_approx?: number;
}

export interface ApiRejeterDemandeRequest {
  // Les données à envoyer pour rejeter une demande
  rejected: boolean;
  motif_rejet: string;
}

// ==================== TYPES DE RÉPONSES ====================

export interface ApiDemandeResponse {
  // Réponse pour une demande unique
  data: ApiDemande;
}

export interface ApiDemandesListResponse {
  // Réponse pour la liste des demandes
  data: ApiDemande[];
  count?: number;
  next?: string;
  previous?: string;
}

// ==================== TYPES POUR STATISTIQUES ====================

export interface ApiDemandeStats {
  total_demandes: number;
  demandes_emises: number;
  demandes_confirmees: number;
  demandes_approuvees: number;
  demandes_validees: number;
  demandes_rejetees: number;
  demandes_livrees: number;
  demandes_en_attente_validation?: number;
  demandes_traitées?: number;
  taux_variation?: {
    total?: number;
    emises?: number;
    confirmees?: number;
    approuvees?: number;
    validees?: number;
    rejetees?: number;
    livrees?: number;
    en_attente?: number;
  };
}

// ==================== MAPPING STATUTS API ↔ FRONTEND ====================

export const API_TO_FRONTEND_STATUS: Record<ApiDemandeStatut, string> = {
  Emise: "emis",
  Confirmée: "confirme",
  Approuvée: "approuve",
  Validée: "valide",
  Rejetée: "refuse",
  Livrée: "livre",
};

export const FRONTEND_TO_API_STATUS: Record<string, ApiDemandeStatut> = {
  emis: "Emise",
  confirme: "Confirmée",
  approuve: "Approuvée",
  valide: "Validée",
  refuse: "Rejetée",
  livre: "Livrée",
};
