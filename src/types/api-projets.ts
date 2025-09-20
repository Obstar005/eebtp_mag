// Types API pour les projets - basés sur api-docs.json
export interface ApiProjet {
  id: number;
  nom: string;
  description?: string;
  date_creation: string;
  date_debut: string;
  date_fin: string;
  date_modif: string;
  date_mise_a_jour: string;
  pays: string;
  chef_projet_user_id: number;
  directeur_travaux_user_id: number;
  chef_chantier_user_id: number;
  coordinateur_travaux_user_id: number;
  chef_equipe_user_id: number;
  server_boolean: boolean;
  creator: number;
  images?: string[];
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
  nom: string;
  description?: string;
  date_debut: string; // Format: YYYY-MM-DD
  date_fin: string; // Format: YYYY-MM-DD
  pays: string;
  chef_projet_user_id: number;
  directeur_travaux_user_id: number;
  chef_chantier_user_id: number;
  coordinateur_travaux_user_id: number;
  chef_equipe_user_id: number;
  images?: File[];
}

export interface ApiUpdateProjetRequest
  extends Partial<ApiCreateProjetRequest> {
  id: number;
}

export interface ApiCreateMagasinRequest {
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
