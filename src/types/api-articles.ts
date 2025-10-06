/**
 * Types pour l'API Articles/Produits - Endpoints /Stocks/article-*
 * Basé sur la documentation API EEBTP_MAG v3.7
 */

// Modèle Produit de l'API (tel que défini dans la documentation)
export interface ApiProduit {
  id: number;
  nom_magasin: string; // Lecture seule
  designation: string; // Nom/titre du produit
  type: "materiel" | "materiau"; // Type de produit
  date_creation: string; // ISO date-time, lecture seule
  date_modif: string; // ISO date-time, lecture seule
  unite: "litre" | "kg" | "m3" | "unite" | "m" | "autre"; // Unité de mesure
  is_active: boolean; // Statut actif/inactif
}

// Type pour créer un produit (champs requis selon la documentation)
export interface ApiCreateProduitRequest {
  designation: string; // Requis
  type: "materiel" | "materiau"; // Requis
  unite: "litre" | "kg" | "m3" | "unite" | "m" | "autre"; // Requis
  is_active?: boolean; // Optionnel, défaut à true
}

// Type pour mettre à jour un produit
export interface ApiUpdateProduitRequest {
  designation?: string;
  type?: "materiel" | "materiau";
  unite?: "litre" | "kg" | "m3" | "unite" | "m" | "autre";
  is_active?: boolean;
}

// Réponses de l'API
export type ApiProduitsListResponse = ApiProduit[];
export type ApiProduitResponse = ApiProduit;

// Constantes pour les options disponibles
export const API_UNITE_OPTIONS = [
  { value: "litre", label: "Litre" },
  { value: "kg", label: "Kilogramme" },
  { value: "m3", label: "Mètre cube" },
  { value: "unite", label: "Unité" },
  { value: "m", label: "Mètre" },
  { value: "autre", label: "Autre" },
] as const;

export const API_TYPE_PRODUIT_OPTIONS = [
  { value: "materiel", label: "Matériel" },
  { value: "materiau", label: "Matériau" },
] as const;

export type ApiUniteType = ApiProduit["unite"];
export type ApiTypeProduit = ApiProduit["type"];
