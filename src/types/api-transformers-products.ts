import type {
  ApiProduit,
  ApiCreateProductRequest,
  ApiUpdateProductRequest,
} from "./api-products";

/**
 * Interface simplifiée pour les produits du catalogue (compatible avec l'API)
 */
export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  type: "materiel" | "materiau";
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transformateur : API Produit → Frontend CatalogProduct
 */
export function apiProduitToCatalogProduct(
  apiProduct: ApiProduit
): CatalogProduct {
  return {
    id: String(apiProduct.id),
    name: apiProduct.designation,
    description: apiProduct.designation,
    type: apiProduct.type,
    unit: mapApiUniteToFrontend(apiProduct.unite),
    isActive: apiProduct.is_active !== false,
    createdAt: apiProduct.date_creation || new Date().toISOString(),
    updatedAt: apiProduct.date_modif || new Date().toISOString(),
  };
}

/**
 * Transformateur : Frontend CreateProductData → API Request
 */
export function createProductDataToApiRequest(data: {
  name: string;
  type: "materiel" | "materiau";
  unit: string;
  isActive?: boolean;
}): ApiCreateProductRequest {
  return {
    designation: data.name,
    type: data.type,
    unite: mapFrontendUnitToApi(data.unit),
    is_active: data.isActive !== false,
  };
}

/**
 * Transformateur : Frontend UpdateProductData → API Request
 */
export function updateProductDataToApiRequest(data: {
  id: string;
  name?: string;
  type?: "materiel" | "materiau";
  unit?: string;
  isActive?: boolean;
}): ApiUpdateProductRequest {
  return {
    id: Number(data.id),
    ...(data.name && { designation: data.name }),
    ...(data.type && { type: data.type }),
    ...(data.unit && { unite: mapFrontendUnitToApi(data.unit) }),
    ...(data.isActive !== undefined && { is_active: data.isActive }),
  };
}

/**
 * Utilitaire pour extraire les données paginées de différents formats de réponse API
 */
export function extractPaginatedProductData(response: unknown): {
  data: ApiProduit[];
  total: number;
} {
  // Format 1: Réponse directe avec array
  if (Array.isArray(response)) {
    return { data: response, total: response.length };
  }

  // Format 2: Objet avec propriété 'results' (pagination Django)
  if (response && typeof response === "object" && "results" in response) {
    const results = (response as any).results;
    if (Array.isArray(results)) {
      return {
        data: results,
        total: (response as any).count || results.length,
      };
    }
  }

  // Format 3: Objet avec propriété 'data'
  if (response && typeof response === "object" && "data" in response) {
    const data = (response as any).data;
    if (Array.isArray(data)) {
      return {
        data: data,
        total: (response as any).total || data.length,
      };
    }
  }

  // Fallback : retourner un tableau vide
  console.warn("Format de réponse API inattendu pour les produits:", response);
  return { data: [], total: 0 };
}

// Mappages des unités
function mapApiUniteToFrontend(unite: string): string {
  const mapping: Record<string, string> = {
    litre: "L",
    kg: "kg",
    m3: "m³",
    unite: "unité",
    m: "m",
    autre: "autre",
  };
  return mapping[unite] || unite;
}

function mapFrontendUnitToApi(
  unit: string
): "litre" | "kg" | "m3" | "unite" | "m" | "autre" {
  const mapping: Record<
    string,
    "litre" | "kg" | "m3" | "unite" | "m" | "autre"
  > = {
    L: "litre",
    l: "litre",
    kg: "kg",
    "m³": "m3",
    m3: "m3",
    unité: "unite",
    unite: "unite",
    m: "m",
    autre: "autre",
  };
  return mapping[unit] || "autre";
}
