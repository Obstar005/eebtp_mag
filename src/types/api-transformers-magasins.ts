// Transformateurs pour convertir entre les types API et les types frontend

import type {
  ApiMagasinResponse,
  ApiCreateMagasinRequest,
  ApiUpdateMagasinRequest,
  ApiStockItem,
  ApiCreateStockItemRequest,
  ApiUpdateStockItemRequest,
} from "./api-magasins";

import type {
  Magasin,
  CreateMagasinData,
  UpdateMagasinData,
  StockArticle,
  CreateStockArticleData,
  UpdateStockArticleData,
  ArticleEtat,
  ArticleType,
} from "./magasin";

// ===== UTILITAIRES =====

/**
 * Extrait les données paginées d'une réponse API
 * Gère les différents formats de réponse possibles
 */
export const extractPaginatedData = <T>(
  response: unknown
): { data: T[]; total: number } => {
  // Si c'est déjà un tableau
  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
    };
  }

  // Si c'est un objet avec results (format DRF/Django)
  if (response && typeof response === "object" && "results" in response) {
    const obj = response as { results?: T[]; count?: number };
    if (Array.isArray(obj.results)) {
      return {
        data: obj.results,
        total: obj.count || obj.results.length,
      };
    }
  }

  // Si c'est un objet avec data (format personnalisé)
  if (response && typeof response === "object" && "data" in response) {
    const obj = response as { data?: T[]; total?: number; count?: number };
    if (Array.isArray(obj.data)) {
      return {
        data: obj.data,
        total: obj.total || obj.count || obj.data.length,
      };
    }
    // Si response.data n'est pas un tableau, réessayer récursivement
    return extractPaginatedData<T>(obj.data);
  }

  // Si rien ne correspond, retourner un tableau vide
  console.warn("Format de réponse API non reconnu:", response);
  return {
    data: [],
    total: 0,
  };
};

// ===== TRANSFORMATEURS MAGASIN =====

export const apiMagasinToMagasin = (
  apiMagasin: ApiMagasinResponse
): Magasin => {
  return {
    id: apiMagasin.id,
    name: apiMagasin.name || apiMagasin.nom || `Magasin ${apiMagasin.id}`,
    description: apiMagasin.description || "",
    adresse: apiMagasin.adresse,
    project_id: apiMagasin.project_id || apiMagasin.projet,
    actions: apiMagasin.actions,

    // Dates - conversion string vers Date si nécessaire
    date_creation: apiMagasin.date_creation
      ? new Date(apiMagasin.date_creation)
      : undefined,
    date_mise_a_jour: apiMagasin.date_modif
      ? new Date(apiMagasin.date_modif)
      : undefined,

    // Relations optionnelles
    projet:
      apiMagasin.project_id || apiMagasin.projet
        ? {
            id: apiMagasin.project_id || apiMagasin.projet || 0,
            name: `Projet ${apiMagasin.project_id || apiMagasin.projet}`,
          }
        : undefined,
  };
};

export const createMagasinDataToApiRequest = (
  data: CreateMagasinData
): ApiCreateMagasinRequest => {
  return {
    name: data.name,
    nom: data.name, // Support des deux formats
    adresse: data.adresse,
    project_id: data.project_id,
    projet: data.project_id,
  };
};

export const updateMagasinDataToApiRequest = (
  data: UpdateMagasinData
): ApiUpdateMagasinRequest => {
  return {
    id: data.id,
    name: data.name,
    nom: data.name,
    adresse: data.adresse,
  };
};

// ===== TRANSFORMATEURS STOCK ARTICLE =====

export const apiStockItemToStockArticle = (
  apiItem: ApiStockItem
): StockArticle => {
  return {
    id: apiItem.id,
    name: apiItem.produit_name || `Article ${apiItem.id}`, // Utilise produit_name de l'API
    description: apiItem.description || "",
    quantite: apiItem.quantite,
    quantite_seuil: apiItem.quantite_seuil,
    etat: mapApiEtatToFrontend(apiItem.etat),
    type_enum: mapApiTypeToFrontend(apiItem.type_enum),
    prix_unitaire: apiItem.prix_unitaire || 0,
    magasin_id: apiItem.magasin, // L'API utilise 'magasin' (ID)
    project_id: undefined, // Pas disponible dans cette API
    user_id: apiItem.add_by_user || 0,
    date_creation: new Date(apiItem.date_ajout),
    date_modif: new Date(apiItem.date_modification),

    // Relations optionnelles
    magasin: apiItem.magasin_name
      ? {
          id: apiItem.magasin,
          name: apiItem.magasin_name,
          project_id: undefined,
          adresse: undefined,
          description: undefined,
          actions: undefined,
          date_creation: undefined,
          date_mise_a_jour: undefined,
        }
      : undefined,

    user: apiItem.user
      ? {
          id: apiItem.user.id,
          name:
            apiItem.user.name ||
            `${apiItem.user.nom || ""} ${apiItem.user.prenoms || ""}`.trim() ||
            apiItem.user.surname,
          surname: apiItem.user.surname,
        }
      : undefined,
  };
};

export const stockArticleToApiRequest = (
  article: StockArticle
): ApiCreateStockItemRequest => {
  return {
    produit: 1, // Valeur par défaut - à améliorer selon le contexte
    magasin: article.magasin_id,
    quantite: article.quantite,
    quantite_seuil: article.quantite_seuil,
    etat: article.etat,
    type_enum: article.type_enum,
    prix_unitaire: article.prix_unitaire,
    description: article.description,
    add_by_user: article.user_id,
  };
};

export const stockArticleToApiUpdateRequest = (
  article: Partial<StockArticle>
): ApiUpdateStockItemRequest => {
  return {
    id: article.id,
    produit: 1, // Valeur par défaut - à améliorer
    magasin: article.magasin_id,
    quantite: article.quantite,
    quantite_seuil: article.quantite_seuil,
    etat: article.etat,
    type_enum: article.type_enum,
    prix_unitaire: article.prix_unitaire,
    description: article.description,
    updated_by: article.user_id,
  };
};

export const createStockArticleDataToApiRequest = (
  data: CreateStockArticleData
): ApiCreateStockItemRequest => {
  return {
    produit: data.article_id || 1,
    magasin: data.magasin_id,
    quantite: data.quantite,
    quantite_seuil: data.quantite_seuil,
    etat: mapFrontendEtatToApi(data.etat),
    type_enum: mapFrontendTypeToApi(data.type_enum || "matiere_premiere"),
    prix_unitaire: data.prix_unitaire,
    description: data.description,
  };
};

export const updateStockArticleDataToApiRequest = (
  data: UpdateStockArticleData
): ApiUpdateStockItemRequest => {
  return {
    id: data.id,
    produit: data.article_id,
    magasin: data.magasin_id,
    quantite: data.quantite,
    quantite_seuil: data.quantite_seuil,
    etat: data.etat ? mapFrontendEtatToApi(data.etat) : undefined,
    type_enum: data.type_enum
      ? mapFrontendTypeToApi(data.type_enum)
      : undefined,
    prix_unitaire: data.prix_unitaire,
    description: data.description,
  };
};

// Mappages des états
function mapApiEtatToFrontend(etat?: string): ArticleEtat {
  switch (etat) {
    case "neuf":
      return "Neuf";
    case "usagé":
    case "usage":
      return "Usagé";
    case "endommagé":
    case "endommage":
      return "Endommagé";
    default:
      return "Neuf";
  }
}

function mapFrontendEtatToApi(etat: ArticleEtat): string {
  switch (etat) {
    case "Neuf":
      return "neuf";
    case "Usagé":
      return "usagé";
    case "Endommagé":
      return "endommagé";
    default:
      return "neuf";
  }
}

// Mappages des types
function mapApiTypeToFrontend(type?: string): ArticleType {
  switch (type) {
    case "matiere_premiere":
      return "matiere_premiere";
    case "produit_fini":
      return "produit_fini";
    case "consommable":
      return "consommable";
    case "equipement":
      return "equipement";
    default:
      return "matiere_premiere";
  }
}

function mapFrontendTypeToApi(type: ArticleType): string {
  return type; // Les valeurs sont déjà compatibles
}
