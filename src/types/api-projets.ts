// Types API pour les projets - basés sur api-docs.json
export interface ApiProjet {
  id: number;
  creator: number;
  comptes?: number[];
  pays: string;
  nom: string;
  date_creation: string;
  date_modification: string;
  description?: string;
  date_debut: string; // Format: YYYY-MM-DD
  date_fin?: string; // Format: YYYY-MM-DD
  is_active: boolean;
}

export interface ApiMagasin {
  id: number;
  nom: string;
  adresse?: string;
  projet: number;
  creator: number;
  date_creation: string;
  date_modif: string;
  actions?: string;
}

export interface ApiProjetPhoto {
  id: number;
  photo: string;
  description?: string;
  projet: number;
  date_creation: string;
  date_modif: string;
}

// Requests pour création/mise à jour
export interface ApiCreateProjetRequest {
  creator: number;
  nom: string;
  description?: string;
  date_debut: string; // Format: YYYY-MM-DD
  date_fin?: string; // Format: YYYY-MM-DD
  pays: string;
  comptes?: number[];
  is_active?: boolean;
}

export interface ApiUpdateProjetRequest {
  id: number;
  creator?: number;
  nom?: string;
  description?: string;
  date_debut?: string; // Format: YYYY-MM-DD
  date_fin?: string; // Format: YYYY-MM-DD
  pays?: string;
  comptes?: number[];
  is_active?: boolean;
}

export interface ApiCreateMagasinRequest {
  creator: number;
  nom: string;
  adresse?: string;
  projet: number;
}

export interface ApiUpdateMagasinRequest
  extends Partial<ApiCreateMagasinRequest> {
  id: number;
}

// Responses
export interface ApiProjetListResponse {
  results: ApiProjet[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ApiProjetDetailResponse extends ApiProjet {
  // Relations chargées
  magasins?: ApiMagasin[];
  photos?: ApiProjetPhoto[];
}

export interface ApiProjetStatsResponse {
  total: number;
  planifies: number;
  en_cours: number;
  termines: number;
  annules?: number; // Optionnel car toutes les APIs pourraient ne pas le fournir
  par_pays: Array<{
    pays: string;
    count: number;
  }>;
}

// Types pour les photos
export interface ApiCreatePhotoRequest {
  photo: File;
  description?: string;
  projet: number;
}

export interface ApiUpdatePhotoRequest {
  id: number;
  photo?: File;
  description?: string;
}
