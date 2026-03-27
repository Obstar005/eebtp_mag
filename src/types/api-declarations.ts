/**
 * Types API pour la gestion des mouvements (déclarations)
 * Basés sur l'API EEBTP_MAG v3.7 - endpoints /Mouvements/*
 */

// ==================== ENTRÉES DE STOCK ====================

export interface ApiEntree {
  id: number; // ReadOnly
  magasin: number;
  stock_item: number;
  source?: number; // nullable
  stock_item_name: string; // ReadOnly
  stock_item_type: string; // ReadOnly
  stock_item_unite?: string; // ReadOnly - unité du produit
  type: "Livraison" | "Retour";
  quantite_m: string; // decimal format
  nom_deposant?: string; // nullable
  tel_deposant?: string; // nullable
  fonction_deposant?: string; // nullable
  date_creation: string; // ReadOnly - format date-time
  date_modif: string; // ReadOnly - format date-time
  societe?: string; // nullable
  tel_societe?: string; // nullable
  nom_livreur?: string; // nullable
  tel_livreur?: string; // nullable
  signature_livreur?: string; // ReadOnly - nullable - format uri
  is_active: boolean;
  make_by?: number; // ReadOnly - nullable
  demande_source?: number; // nullable - référence vers une demande
  source_objet?: string;
}

export interface ApiCreateEntreeRequest {
  magasin: number;
  stock_item: number;
  source?: number;
  type: "Livraison" | "Retour";
  quantite_m: string;
  nom_deposant?: string;
  tel_deposant?: string;
  fonction_deposant?: string;
  societe?: string;
  tel_societe?: string;
  nom_livreur?: string;
  tel_livreur?: string;
  is_active?: boolean;
  demande_source?: number;
  source_objet?: string;
}

// ==================== SORTIES DE STOCK ====================

export interface ApiSortie {
  id: number; // ReadOnly
  magasin: number;
  stock_item: number;
  stock_item_name: string; // ReadOnly
  stock_item_type: string; // ReadOnly
  stock_item_unite?: string; // ReadOnly - unité du produit
  quantite_m: string; // decimal format
  date_creation: string; // ReadOnly - format date-time
  date_modif: string; // ReadOnly - format date-time
  objet: string;
  nom_receveur: string;
  tel_receveur: string;
  fonction_receveur: string;
  is_active: boolean;
  make_by?: number; // ReadOnly - nullable
  source_objet?: string;
}

export interface ApiCreateSortieRequest {
  magasin: number;
  stock_item: number;
  quantite_m: string;
  objet: string;
  nom_receveur: string;
  tel_receveur: string;
  fonction_receveur: string;
  is_active?: boolean;
  source_objet?: string;
}

// ==================== RÉPONSES LISTES ====================

export interface ApiEntreeListResponse {
  results?: ApiEntree[];
  data?: ApiEntree[];
  count?: number;
  total?: number;
  next?: string;
  previous?: string;
}

export interface ApiSortieListResponse {
  results?: ApiSortie[];
  data?: ApiSortie[];
  count?: number;
  total?: number;
  next?: string;
  previous?: string;
}

// ==================== FILTRES ====================

export interface ApiDeclarationFilter {
  search?: string;
  magasin_id?: number;
  type?: "Livraison" | "Retour";
  date_start?: string;
  date_end?: string;
}
