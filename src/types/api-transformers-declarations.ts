import type {
  ApiEntree,
  ApiSortie,
  ApiCreateEntreeRequest,
  ApiCreateSortieRequest,
  ApiEntreeListResponse,
  ApiSortieListResponse,
} from "./api-declarations";
import type {
  Declaration,
  CreateDeclarationData,
  UpdateDeclarationData,
  DeclarationType,
} from "./declaration";

/**
 * Union type pour les déclarations API
 */
export type ApiDeclaration = ApiEntree | ApiSortie;

/**
 * Transformateur : API Entrée → Frontend Declaration
 */
export function apiEntreeToDeclaration(apiEntree: ApiEntree): Declaration {
  return {
    id: apiEntree.id,
    type_enum: mapApiTypeToDeclarationType(apiEntree.type),
    stock_item_id: apiEntree.stock_item,
    quantite_float: parseFloat(apiEntree.quantite_m),
    date_creation: new Date(apiEntree.date_creation),
    date_modif: new Date(apiEntree.date_modif),
    user_id: apiEntree.make_by || 0,
    magasin_id: apiEntree.magasin,

    // Relations extraites des données API
    stockItem: {
      id: apiEntree.stock_item,
      name: apiEntree.stock_item_name,
      description: apiEntree.stock_item_type,
    },

    // Informations spécifiques aux entrées
    fournisseur: {
      id: 0, // Non disponible dans l'API
      name: apiEntree.societe,
      telephone: apiEntree.tel_societe,
    },

    deposant: {
      name: apiEntree.nom_deposant,
      fonction: apiEntree.fonction_deposant,
      telephone: apiEntree.tel_deposant,
    },

    // Pour les livraisons, le livreur peut être considéré comme le déposant
    ...(apiEntree.type === "Livraison" && {
      motif: `Livraison par ${apiEntree.nom_livreur} (${apiEntree.tel_livreur})`,
    }),
  };
}

/**
 * Transformateur : API Sortie → Frontend Declaration
 */
export function apiSortieToDeclaration(apiSortie: ApiSortie): Declaration {
  return {
    id: apiSortie.id,
    type_enum: "sortie",
    stock_item_id: apiSortie.stock_item,
    quantite_float: parseFloat(apiSortie.quantite_m),
    date_creation: new Date(apiSortie.date_creation),
    date_modif: new Date(apiSortie.date_modif),
    user_id: apiSortie.make_by || 0,
    magasin_id: apiSortie.magasin,
    motif: apiSortie.objet,

    // Relations extraites des données API
    stockItem: {
      id: apiSortie.stock_item,
      name: apiSortie.stock_item_name,
      description: apiSortie.stock_item_type,
    },

    receveur: {
      name: apiSortie.nom_receveur,
      fonction: apiSortie.fonction_receveur,
      telephone: apiSortie.tel_receveur,
    },
  };
}

/**
 * Transformateur générique : API Declaration → Frontend Declaration
 */
export function apiDeclarationToDeclaration(
  apiDeclaration: ApiDeclaration
): Declaration {
  // Déterminer le type de déclaration
  if ("type" in apiDeclaration) {
    // C'est une entrée
    return apiEntreeToDeclaration(apiDeclaration as ApiEntree);
  } else {
    // C'est une sortie
    return apiSortieToDeclaration(apiDeclaration as ApiSortie);
  }
}

/**
 * Transformateur : Frontend CreateDeclarationData → API Request
 */
export function createDeclarationDataToApiRequest(
  data: CreateDeclarationData
): ApiCreateEntreeRequest | ApiCreateSortieRequest {
  if (data.type_enum === "entree") {
    // Créer une entrée
    const request: ApiCreateEntreeRequest = {
      magasin: data.magasin_id,
      stock_item: data.stock_item_id,
      type: "Livraison", // Par défaut
      quantite_m: data.quantite_float.toString(),
      nom_deposant: data.deposant?.name || "",
      tel_deposant: data.deposant?.telephone || "",
      fonction_deposant: data.deposant?.fonction || "",
      societe: data.fournisseur?.name || "",
      tel_societe: data.fournisseur?.telephone || "",
      nom_livreur: data.deposant?.name || "", // Utiliser le déposant comme livreur par défaut
      tel_livreur: data.deposant?.telephone || "",
      is_active: true,
    };
    return request;
  } else if (data.type_enum === "sortie") {
    // Créer une sortie
    const request: ApiCreateSortieRequest = {
      magasin: data.magasin_id,
      stock_item: data.stock_item_id,
      quantite_m: data.quantite_float.toString(),
      objet: data.motif || "",
      nom_receveur: data.receveur?.name || "",
      tel_receveur: data.receveur?.telephone || "",
      fonction_receveur: data.receveur?.fonction || "",
      is_active: true,
    };
    return request;
  } else {
    throw new Error(`Type de déclaration non supporté: ${data.type_enum}`);
  }
}

/**
 * Utilitaire pour extraire les données paginées de différents formats de réponse API
 */
export function extractPaginatedDeclarationData(response: unknown): {
  data: ApiDeclaration[];
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
  console.warn(
    "Format de réponse API inattendu pour les déclarations:",
    response
  );
  return { data: [], total: 0 };
}

// ==================== MAPPAGES ====================

/**
 * Mappe le type API vers le type frontend
 */
function mapApiTypeToDeclarationType(
  apiType: "Livraison" | "Retour"
): DeclarationType {
  switch (apiType) {
    case "Livraison":
      return "entree";
    case "Retour":
      return "retour";
    default:
      return "entree";
  }
}

/**
 * Mappe le type frontend vers le type API pour les entrées
 */
export function mapDeclarationTypeToApiType(
  type: DeclarationType
): "Livraison" | "Retour" {
  switch (type) {
    case "entree":
      return "Livraison";
    case "retour":
      return "Retour";
    default:
      return "Livraison";
  }
}
