/**
 * Types API pour la gestion des produits/articles
 * Basés sur l'endpoint /Stocks/liste-articles de l'API EEBTP_MAG v3.7
 */

export interface ApiProduit {
  id: number;
  nom_magasin?: string; // ReadOnly
  designation: string;
  type: "materiel" | "materiau";
  date_creation?: string; // ReadOnly - format date-time
  date_modif?: string; // ReadOnly - format date-time
  unite: "litre" | "kg" | "m3" | "unite" | "m" | "autre";
  is_active?: boolean;
}

export interface ApiProductListResponse {
  results?: ApiProduit[];
  data?: ApiProduit[];
  count?: number;
  total?: number;
  next?: string;
  previous?: string;
}

export interface ApiCreateProductRequest {
  designation: string;
  type: "materiel" | "materiau";
  unite: "litre" | "kg" | "m3" | "unite" | "m" | "autre";
  is_active?: boolean;
}

export interface ApiUpdateProductRequest
  extends Partial<ApiCreateProductRequest> {
  id: number;
}
