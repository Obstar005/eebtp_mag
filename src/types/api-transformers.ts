// Fonctions utilitaires pour transformer les données entre API et Frontend
import type { Account, Profile, AccountType } from "./account";
import type { User } from "./auth";
import type {
  Product,
  ProductCategory,
  Supplier,
  CreateProductData,
  UpdateProductData,
  ProductUnit,
} from "./product";
import type {
  ApiCustomUser,
  ApiProfil,
  ApiCreateUserRequest,
  ApiCreateProfilRequest,
} from "./api-users";
import type {
  ApiProduit,
  ApiCreateProduitRequest,
  ApiUpdateProduitRequest,
} from "./api-stocks";
import { UserProfil } from "./auth";
import { mapProfilLibelleToUserProfil } from "../utils/permissions";
import { apiClient } from "../services/api/client";

export async function apiUserToAccount(
  apiUser: ApiCustomUser
): Promise<Account> {
  try {
    // Récupérer les détails du profil depuis l'API
    const response = await apiClient.get<ApiProfil>(
      `/Users/profil-detail/${apiUser.profil}`
    );
    const apiProfil = response.data;

    // Transformer l'ApiProfil en Profile
    const profile: Profile = {
      id: apiProfil.id.toString(),
      nom: apiProfil.libelle,
      description: apiProfil.description,
    };

    return {
      id: apiUser.id.toString(),
      code: `CPT-${apiUser.id.toString().padStart(3, "0")}`, // Générer un code
      nom: apiUser.last_name,
      prenoms: apiUser.first_name,
      nom_utilisateur: apiUser.username,
      date_naissance: apiUser.birth_date || "",
      nationalite: apiUser.nationality, // TODO: Convertir nom pays → code pays
      mot_de_passe: "", // Ne pas exposer
      type: apiUser.type as AccountType,
      telephone: apiUser.telephone,
      photo_profil: apiUser.photo_profil,
      is_active: apiUser.is_active,
      date_creation: apiUser.date_creation,
      date_modification: apiUser.date_modif,
      derniere_connexion: apiUser.last_login,
      profile_id: apiUser.profil.toString(),
      profile: profile,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du profil pour le compte:",
      error
    );

    // Fallback avec un profil par défaut
    const defaultProfile: Profile = {
      id: apiUser.profil.toString(),
      nom: "Profil non trouvé",
      description: "Profil non disponible",
    };

    return {
      id: apiUser.id.toString(),
      code: `CPT-${apiUser.id.toString().padStart(3, "0")}`,
      nom: apiUser.last_name,
      prenoms: apiUser.first_name,
      nom_utilisateur: apiUser.username,
      date_naissance: apiUser.birth_date || "",
      nationalite: apiUser.nationality,
      mot_de_passe: "",
      type: apiUser.type as AccountType,
      telephone: apiUser.telephone,
      photo_profil: apiUser.photo_profil,
      is_active: apiUser.is_active,
      date_creation: apiUser.date_creation,
      date_modification: apiUser.date_modif,
      derniere_connexion: apiUser.last_login,
      profile_id: apiUser.profil.toString(),
      profile: defaultProfile,
    };
  }
}

export async function apiUserToUser(apiUser: ApiCustomUser): Promise<User> {
  try {
    // Récupérer les détails du profil depuis l'API directement
    const response = await apiClient.get<ApiProfil>(
      `/Users/profil-detail/${apiUser.profil}`
    );
    const apiProfil = response.data;

    // Mapper le libellé du profil vers un profil EEBTP
    const userProfil = mapProfilLibelleToUserProfil(apiProfil.libelle);

    // Fallback vers 'magasinier' si le mapping échoue
    const finalProfil = userProfil || UserProfil.MAGASINIER;

    return {
      id: apiUser.id.toString(),
      email: apiUser.email,
      phone: apiUser.telephone,
      firstName: apiUser.first_name,
      lastName: apiUser.last_name,
      profil: finalProfil, // Profil EEBTP mappé depuis l'API
      profileId: apiUser.profil, // ID du profil EEBTP
      isActive: apiUser.is_active,
      isPhoneVerified: true, // Assumer vérifié si dans l'API
      isEmailVerified: !!apiUser.email,
      hasCompletedSetup: true,
      createdAt: apiUser.date_creation,
      updatedAt: apiUser.date_modif,
    };
  } catch (error) {

    // Fallback en cas d'erreur
    return {
      id: apiUser.id.toString(),
      email: apiUser.email,
      phone: apiUser.telephone,
      firstName: apiUser.first_name,
      lastName: apiUser.last_name,
      profil: UserProfil.MAGASINIER, // Profil par défaut en cas d'erreur
      profileId: apiUser.profil,
      isActive: apiUser.is_active,
      isPhoneVerified: true,
      isEmailVerified: !!apiUser.email,
      hasCompletedSetup: true,
      createdAt: apiUser.date_creation,
      updatedAt: apiUser.date_modif,
    };
  }
}

export function apiProfilToProfile(apiProfil: ApiProfil): Profile {
  return {
    id: apiProfil.id.toString(),
    nom: apiProfil.libelle,
    description: apiProfil.description,
  };
}

export function accountToApiUser(
  account: Account
): Partial<ApiCreateUserRequest> {
  return {
    username: account.nom_utilisateur,
    first_name: account.prenoms,
    last_name: account.nom,
    surname: account.nom, // Utiliser nom comme surname
    email: undefined, // À définir si nécessaire
    birth_date: account.date_naissance,
    nationality: account.nationalite, // TODO: Convertir code pays → nom pays
    type: account.type,
    telephone: account.telephone,
    titre: "", // À définir selon la logique métier
    poste: "", // À définir selon la logique métier
    id_profil: account.profile_id ? parseInt(account.profile_id) : undefined,
  };
}

export function profileToApiProfil(profile: Profile): ApiCreateProfilRequest {
  return {
    libelle: profile.nom,
    description: profile.description || "",
  };
}

// ====================
// TRANSFORMERS STOCKS
// ====================

// Mapping des unités API vers Frontend
const UNITE_MAPPING: Record<string, ProductUnit> = {
  litre: "liter",
  kg: "kg",
  m3: "meter", // Approximation pour m3
  unite: "piece",
  m: "meter",
  autre: "piece", // Valeur par défaut
};

// Mapping inverse Frontend vers API
const UNITE_REVERSE_MAPPING: Record<
  ProductUnit,
  "litre" | "kg" | "m3" | "unite" | "m" | "autre"
> = {
  liter: "litre",
  kg: "kg",
  meter: "m",
  piece: "unite",
  box: "unite",
  pack: "unite",
};

// Transformer un produit API vers Product frontend
export function apiProduitToProduct(apiProduit: ApiProduit): Product {
  // Créer des objets par défaut pour category et supplier
  const defaultCategory: ProductCategory = {
    id: "default-category",
    name: "Catégorie générale",
    isActive: true,
  };

  const defaultSupplier: Supplier = {
    id: "default-supplier",
    name: "Fournisseur non spécifié",
    isActive: true,
  };

  return {
    id: apiProduit.id.toString(),
    name: apiProduit.designation,
    description: `Type: ${apiProduit.type} | Magasin: ${apiProduit.nom_magasin}`,
    sku: `SKU-${apiProduit.id}`,
    category: defaultCategory,
    supplier: defaultSupplier,
    unitPrice: 0, // L'API ne fournit pas ces informations
    costPrice: 0, // L'API ne fournit pas ces informations
    minStockLevel: 0, // L'API ne fournit pas ces informations
    maxStockLevel: 100, // Valeur par défaut
    currentStock: 0, // L'API ne fournit pas ces informations
    unit: UNITE_MAPPING[apiProduit.unite] || "piece",
    isActive: apiProduit.is_active,
    createdAt: apiProduit.date_creation,
    updatedAt: apiProduit.date_modif,
  };
}

// Transformer un CreateProductData frontend vers API
export function productToApiCreateProduit(
  product: CreateProductData
): ApiCreateProduitRequest {
  return {
    designation: product.name,
    type: "materiel", // Valeur par défaut, pourrait être paramétrable
    unite: UNITE_REVERSE_MAPPING[product.unit] || "unite",
    is_active: true,
  };
}

// Transformer un UpdateProductData frontend vers API
export function productToApiUpdateProduit(
  product: UpdateProductData
): ApiUpdateProduitRequest {
  const updates: ApiUpdateProduitRequest = {};

  if (product.name !== undefined) {
    updates.designation = product.name;
  }

  if (product.unit !== undefined) {
    updates.unite = UNITE_REVERSE_MAPPING[product.unit] || "unite";
  }

  // Pour le moment, nous ne pouvons pas mettre à jour le type depuis le frontend
  // car l'API l'exige mais le frontend n'a pas cette information

  return updates;
}
