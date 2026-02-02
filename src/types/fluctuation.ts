/**
 * Types pour les données de fluctuation d'entrées et sorties
 */

/**
 * Données d'un point sur la courbe de fluctuation
 */
export interface FluctuationDataPoint {
  date: string; // Format ISO: "2025-11-01"
  quantite_totale: number;
}

/**
 * Réponse API pour la fluctuation d'entrées
 */
export interface FluctuationEntreeResponse {
  projet: string; // Nom du projet
  periode: string; // "jour", "semaine", "mois"
  article: string; // Nom de l'article/produit
  type_entree?: string; // Type d'entrée: "Livraison", "Dépôt", etc.
  donnees: FluctuationDataPoint[];
}

/**
 * Réponse API pour la fluctuation de sorties
 */
export interface FluctuationSortieResponse {
  projet: string; // Nom du projet
  periode: string; // "jour", "semaine", "mois"
  article: string; // Nom de l'article/produit
  unite?: string; // Unité: "Litre", "Kg", etc.
  donnees: FluctuationDataPoint[];
}

/**
 * Données traitées pour affichage dans le graphique
 */
export interface ProcessedFluctuationData {
  labels: string[]; // Dates formatées pour l'affichage (ex: "Jan", "Feb", "31 Jan 2025")
  values: number[]; // Valeurs quantité_totale
  min: number; // Valeur minimale
  max: number; // Valeur maximale
  average: number; // Valeur moyenne
  total: number; // Somme des valeurs
  dataPoints: FluctuationDataPoint[]; // Données brutes pour le hover
}

/**
 * Paramètres pour récupérer les données de fluctuation
 */
export interface FluctuationParams {
  projetId: number;
  produitId: number;
  periode: "jour" | "semaine" | "mois" | "projet";
  typeEntree?: string; // Pour les entrées uniquement
}
