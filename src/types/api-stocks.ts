// Types pour l'API Stocks (endpoints /Stocks/*)

// Modèle Produit de l'API
export interface ApiProduit {
  id: number;
  nom_magasin: string; // Lecture seule
  designation: string;
  type: "materiel" | "materiau";
  date_creation: string; // ISO date-time, lecture seule
  date_modif: string; // ISO date-time, lecture seule
  unite: "litre" | "kg" | "m3" | "unite" | "m" | "autre";
  is_active: boolean;
}

// Type pour créer un produit (sans les champs en lecture seule)
export interface ApiCreateProduitRequest {
  designation: string;
  type: "materiel" | "materiau";
  unite: "litre" | "kg" | "m3" | "unite" | "m" | "autre";
  is_active: boolean;
}

// Type pour mettre à jour un produit (tous les champs optionnels sauf les requis)
export interface ApiUpdateProduitRequest {
  designation?: string;
  type?: "materiel" | "materiau";
  unite?: "litre" | "kg" | "m3" | "unite" | "m" | "autre";
  is_active?: boolean;
}

// Réponse de la liste des produits
export type ApiProduitsListResponse = ApiProduit[];

// Réponse d'un produit individuel
export type ApiProduitResponse = ApiProduit;

// Types d'unités disponibles
export const UNITE_OPTIONS = [
  { value: "litre", label: "Litre" },
  { value: "kg", label: "Kilogramme" },
  { value: "m3", label: "Mètre cube" },
  { value: "unite", label: "Unité" },
  { value: "m", label: "Mètre" },
  { value: "autre", label: "Autre" },
] as const;

// Types de produits disponibles
export const TYPE_PRODUIT_OPTIONS = [
  { value: "materiel", label: "Matériel" },
  { value: "materiau", label: "Matériau" },
] as const;

export type ApiUniteType = ApiProduit["unite"];
export type ApiTypeProduit = ApiProduit["type"];
