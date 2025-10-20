/**
 * Transformateurs de données pour les Articles/Produits
 * Mappage entre l'API (/Stocks/article-*) et les types frontend
 */

import type {
  ApiProduit,
  ApiCreateProduitRequest,
  ApiUpdateProduitRequest,
} from "./api-articles";
import type {
  StockArticle,
  CreateStockArticleData,
  UpdateStockArticleData,
  ArticleType,
} from "./magasin";

// Mapping des types API vers les types frontend
const TYPE_API_TO_FRONTEND_MAPPING = {
  materiel: "equipement" as ArticleType,
  materiau: "matiere_premiere" as ArticleType,
} as const;

// Mapping inverse (frontend vers API)
const TYPE_FRONTEND_TO_API_MAPPING = {
  equipement: "materiel",
  matiere_premiere: "materiau",
  consommable: "materiau", // Par défaut, mapper vers materiau
  produit_fini: "materiau", // Par défaut, mapper vers materiau
} as const;

/**
 * Convertir un ApiProduit vers StockArticle
 */
export function apiProduitToStockArticle(apiProduit: ApiProduit): StockArticle {
  return {
    id: apiProduit.id,
    name: apiProduit.designation,
    description: apiProduit.designation, // API n'a pas de description séparée
    quantite: 0, // L'API Produit ne contient pas la quantité (c'est dans StockItem)
    quantite_seuil: 0, // L'API Produit ne contient pas le seuil
    type_enum:
      TYPE_API_TO_FRONTEND_MAPPING[apiProduit.type] || "matiere_premiere",
    unite: apiProduit.unite, // Mapper l'unité depuis l'API
    prix_unitaire: 0, // L'API Produit ne contient pas le prix
    date_creation: new Date(apiProduit.date_creation),
    date_modif: new Date(apiProduit.date_modif),
    user_id: 1, // Valeur par défaut, à définir selon le contexte
    magasin_id: 0, // À définir selon le contexte
  };
}

/**
 * Convertir CreateStockArticleData vers ApiCreateProduitRequest
 */
export function createArticleDataToApiRequest(
  data: CreateStockArticleData
): ApiCreateProduitRequest {
  return {
    designation: data.name,
    type:
      TYPE_FRONTEND_TO_API_MAPPING[data.type_enum || "matiere_premiere"] ||
      "materiau",
    unite: data.unite || "unite",
    is_active: true,
  };
}

/**
 * Convertir UpdateStockArticleData vers ApiUpdateProduitRequest
 */
export function updateArticleDataToApiRequest(
  data: UpdateStockArticleData
): ApiUpdateProduitRequest {
  const apiData: ApiUpdateProduitRequest = {};

  if (data.name !== undefined) {
    apiData.designation = data.name;
  }

  if (data.type_enum !== undefined) {
    apiData.type = TYPE_FRONTEND_TO_API_MAPPING[data.type_enum] || "materiau";
  }

  if (data.unite !== undefined) {
    apiData.unite = data.unite;
  }

  // Note: L'API Produit ne gère pas la quantité, état, prix, etc.
  // Ces données sont gérées par les StockItems

  return apiData;
}

/**
 * Extraire les données de réponse paginée pour les articles (si nécessaire)
 */
export function extractArticlesPaginatedData<T>(response: { data: T[] }): T[] {
  return response.data;
}
