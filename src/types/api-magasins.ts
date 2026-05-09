// Types API pour les magasins et articles de stock - basés sur api-docs.json

// ==================== MAGASINS ====================

export interface ApiMagasinResponse {
  id: number;
  name: string;
  nom?: string; // Certaines APIs utilisent 'nom' au lieu de 'name'
  adresse?: string;
  description?: string;
  projet?: number;
  project_id?: number;
  creator?: number;
  date_creation?: string;
  date_modif?: string;
  date_mise_a_jour?: string;
  actions?: string; // JSON des actions possibles
}

export interface ApiCreateMagasinRequest {
  name: string;
  nom?: string; // Certaines APIs utilisent 'nom'
  adresse?: string;
  description?: string;
  projet?: number;
  project_id?: number;
  creator?: number;
}

export interface ApiUpdateMagasinRequest {
  id: number;
  name?: string;
  nom?: string;
  adresse?: string;
  description?: string;
  projet?: number;
  project_id?: number;
}

export interface ApiMagasinListResponse {
  results?: ApiMagasinResponse[];
  data?: ApiMagasinResponse[];
  count?: number;
  next?: string;
  previous?: string;
}

// ==================== ARTICLES DE STOCK ====================

export interface ApiStockItem {
  id: number;
  produit: number; // ID du produit
  magasin: number; // ID du magasin
  add_by_user: number; // ID de l'utilisateur qui a ajouté
  magasin_name: string; // Nom du magasin
  produit_name: string; // Nom du produit
  produit_unite?: string; // Unité du produit
  produit_price?: string; // Prix unitaire du produit (decimal string)
  quantite: number;
  quantite_seuil: number;
  etat: string; // "Neuf", "Usagé", "Abandonné"
  date_ajout: string;
  date_modification: string;
  is_active: boolean;
  add_by?: number;
  updated_by?: number;

  // Champs optionnels selon l'endpoint
  type_enum?: string;
  prix_unitaire?: number;
  description?: string;

  // Relations (optionnelles selon l'endpoint)
  user?: {
    id: number;
    name: string;
    surname: string;
    prenoms?: string;
    nom?: string;
  };
}

export interface ApiCreateStockItemRequest {
  produit: number; // ID du produit depuis le catalogue
  magasin: number; // ID du magasin
  quantite: number;
  quantite_seuil: number;
  etat: string;
  add_by_user?: number;
  type_enum?: string;
  prix_unitaire?: number;
  description?: string;
}

export interface ApiUpdateStockItemRequest {
  id?: number;
  produit?: number;
  magasin?: number;
  quantite?: number;
  quantite_seuil?: number;
  etat?: string;
  add_by_user?: number;
  updated_by?: number;
  type_enum?: string;
  prix_unitaire?: number;
  description?: string;
}

export interface ApiStockItemListResponse {
  results?: ApiStockItem[];
  data?: ApiStockItem[];
  count?: number;
  next?: string;
  previous?: string;
}

// ==================== RÉPONSES D'ERREUR ====================

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  non_field_errors?: string[];
}

// ==================== FILTRES ====================

export interface ApiMagasinFilter {
  search?: string;
  project_id?: number;
  page?: number;
  limit?: number;
}

export interface ApiStockItemFilter {
  search?: string;
  etat?: string;
  type_enum?: string;
  magasin_id?: number;
  page?: number;
  limit?: number;
}
