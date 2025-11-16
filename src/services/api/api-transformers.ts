// Fonctions de transformation API ↔ Frontend
import type {
  Account,
  Profile,
  AccountType,
  CreateAccountData,
  UpdateAccountData,
} from "../../types/account";
import type { User, AuthResponse } from "../../types/auth";
import { UserProfil } from "../../types/auth";
import { mapProfilLibelleToUserProfil } from "../../utils/permissions";
import { apiClient } from "./client";
import type {
  Projet,
  ProjetWithDetails,
  CreateProjetData,
  UpdateProjetData,
  ProjetListResponse,
  ProjetStats,
  ProjetStatus,
  Magasin,
  CreateMagasinData,
  CompteAssocie,
} from "../../types/project";
import type {
  ApiCustomUser,
  ApiProfil,
  ApiCreateUserRequest,
  ApiUpdateUserRequest,
  ApiCreateProfilRequest,
  ApiLoginByPhoneResponse,
} from "../../types/api-users";

// Fonction utilitaire pour convertir les codes de pays en noms complets
// Cette fonction devrait être améliorée pour utiliser une liste complète des pays
function convertCountryCodeToName(countryCode: string | undefined): string {
  if (!countryCode) return "";

  const countryMap: Record<string, string> = {
    TG: "Togo",
    FR: "France",
    US: "United States",
    CI: "Côte d'Ivoire",
    BJ: "Bénin",
    GH: "Ghana",
    NG: "Nigeria",
    SN: "Sénégal",
    CM: "Cameroun",
    ML: "Mali",
    BF: "Burkina Faso",
    NE: "Niger",
    CA: "Canada",
    GB: "United Kingdom",
    // Ajouter d'autres pays selon les besoins
  };

  return countryMap[countryCode] || countryCode;
}
import type {
  ApiProjet,
  ApiMagasin,
  ApiCreateProjetRequest,
  ApiUpdateProjetRequest,
  ApiCreateMagasinRequest,
  ApiProjetListResponse,
  ApiProjetStatsResponse,
} from "../../types/api-projets";

// Fonction utilitaire pour convertir les noms de pays en codes
function convertCountryNameToCode(countryName: string | undefined): string {
  if (!countryName) return "TG"; // Par défaut Togo

  // Table de conversion inverse de noms de pays vers codes
  const reverseCountryMap: Record<string, string> = {
    Togo: "TG",
    France: "FR",
    "United States": "US",
    "Côte d'Ivoire": "CI",
    Bénin: "BJ",
    Ghana: "GH",
    Nigeria: "NG",
    Sénégal: "SN",
    Cameroun: "CM",
    Mali: "ML",
    "Burkina Faso": "BF",
    Niger: "NE",
    Canada: "CA",
    "United Kingdom": "GB",
    // Ajouter d'autres pays selon les besoins
  };

  return reverseCountryMap[countryName] || "TG"; // Par défaut Togo si non trouvé
}

export async function apiUserToAccount(
  apiUser: ApiCustomUser
): Promise<Account> {
  // Convertir le nom de pays en code
  const countryCode = convertCountryNameToCode(apiUser.nationality);

  // Vérifier si le profil existe avant de faire la requête
  if (!apiUser.profil) {
    console.warn(
      "⚠️ apiUserToAccount: Aucun profil défini pour l'utilisateur",
      apiUser.id
    );

    // Vérifier que l'ID de l'utilisateur existe
    if (!apiUser.id) {
      console.error(
        "❌ apiUserToAccount: ID de l'utilisateur manquant",
        apiUser
      );
      throw new Error("Impossible de créer un compte sans ID d'utilisateur");
    }

    // Fallback avec un profil par défaut
    const defaultProfile: Profile = {
      id: "0",
      nom: "Profil non défini",
      description: "Aucun profil assigné",
    };

    const account: Account = {
      id: apiUser.id.toString(),
      code: `CPT-${apiUser.id.toString().padStart(3, "0")}`,
      nom: apiUser.last_name,
      prenoms: apiUser.first_name,
      nom_utilisateur: apiUser.username,
      date_naissance: apiUser.birth_date || "",
      nationalite: countryCode,
      mot_de_passe: "",
      type: apiUser.type as AccountType,
      telephone: apiUser.telephone,
      photo_profil: apiUser.photo_profil,
      is_active: apiUser.is_active,
      date_creation: apiUser.date_creation,
      date_modification: apiUser.date_modif,
      derniere_connexion: apiUser.last_login,
      profile_id: "0",
      profile: defaultProfile,
    };

    return account;
  }

  // Vérifier que l'ID de l'utilisateur existe avant de continuer
  if (!apiUser.id) {
    console.error("❌ apiUserToAccount: ID de l'utilisateur manquant", apiUser);
    throw new Error("Impossible de créer un compte sans ID d'utilisateur");
  }

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

    const account: Account = {
      id: apiUser.id.toString(),
      code: `CPT-${apiUser.id.toString().padStart(3, "0")}`, // Générer un code
      nom: apiUser.last_name,
      prenoms: apiUser.first_name,
      nom_utilisateur: apiUser.username,
      date_naissance: apiUser.birth_date || "",
      nationalite: countryCode, // Convertir le nom complet du pays en code
      mot_de_passe: "", // Ne pas exposer
      type: apiUser.type as AccountType,
      telephone: apiUser.telephone,
      photo_profil: apiUser.photo_profil,
      is_active: apiUser.is_active,
      date_creation: apiUser.date_creation,
      date_modification: apiUser.date_modif,
      derniere_connexion: apiUser.last_login,
      profile_id: apiUser.profil ? apiUser.profil.toString() : "0",
      profile: profile, // Inclure l'objet profile complet
    };

    return account;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du profil pour le compte:",
      error
    );

    // Vérifier que l'ID de l'utilisateur existe avant le fallback
    if (!apiUser.id) {
      console.error(
        "❌ apiUserToAccount (fallback): ID de l'utilisateur manquant",
        apiUser
      );
      throw new Error("Impossible de créer un compte sans ID d'utilisateur");
    }

    // Fallback avec un profil par défaut
    const defaultProfile: Profile = {
      id: apiUser.profil ? apiUser.profil.toString() : "0",
      nom: "Profil non trouvé",
      description: "Profil non disponible",
    };

    const account: Account = {
      id: apiUser.id.toString(),
      code: `CPT-${apiUser.id.toString().padStart(3, "0")}`,
      nom: apiUser.last_name,
      prenoms: apiUser.first_name,
      nom_utilisateur: apiUser.username,
      date_naissance: apiUser.birth_date || "",
      nationalite: countryCode,
      mot_de_passe: "",
      type: apiUser.type as AccountType,
      telephone: apiUser.telephone,
      photo_profil: apiUser.photo_profil,
      is_active: apiUser.is_active,
      date_creation: apiUser.date_creation,
      date_modification: apiUser.date_modif,
      derniere_connexion: apiUser.last_login,
      profile_id: apiUser.profil ? apiUser.profil.toString() : "0",
      profile: defaultProfile,
    };

    return account;
  }
}

export async function apiUserToUser(apiUser: ApiCustomUser): Promise<User> {
  // Vérifier si le profil existe avant de faire la requête
  if (!apiUser.profil) {
    console.warn(
      "⚠️ apiUserToUser: Aucun profil défini pour l'utilisateur",
      apiUser.id
    );

    // Fallback vers 'magasinier' si aucun profil n'est défini
    const finalProfil = UserProfil.MAGASINIER;

    return {
      id: apiUser.id.toString(),
      email: apiUser.email,
      phone: apiUser.telephone,
      firstName:
        apiUser.first_name === "ADMIN" ? apiUser.surname : apiUser.first_name,
      lastName:
        apiUser.first_name === "ADMIN" ? apiUser.username : apiUser.last_name,
      profil: finalProfil,
      profileId: 0, // ID par défaut
      isActive: apiUser.is_active || false,
      isPhoneVerified: true, // Assumé vrai si l'utilisateur existe
      isEmailVerified: false, // Par défaut
      hasCompletedSetup: !!apiUser.last_login, // Si l'utilisateur s'est déjà connecté, il a terminé la configuration
      createdAt: apiUser.date_creation || new Date().toISOString(),
      updatedAt: apiUser.date_modif || new Date().toISOString(),
    };
  }

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
      // Utiliser surname comme prénom si first_name est "ADMIN", sinon garder first_name
      firstName:
        apiUser.first_name === "ADMIN" ? apiUser.surname : apiUser.first_name,
      // Si first_name était "ADMIN", utiliser username comme nom de famille, sinon garder last_name
      lastName:
        apiUser.first_name === "ADMIN" ? apiUser.username : apiUser.last_name,
      profil: finalProfil, // Profil EEBTP mappé depuis l'API
      profileId: apiUser.profil, // ID du profil EEBTP (provient de profil dans l'API)
      isActive: apiUser.is_active,
      isPhoneVerified: true, // Assumer vérifié si dans l'API
      isEmailVerified: !!apiUser.email,
      hasCompletedSetup: true,
      createdAt: apiUser.date_creation,
      updatedAt: apiUser.date_modif,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);

    // Fallback en cas d'erreur - utiliser profil magasinier par défaut
    return {
      id: apiUser.id.toString(),
      email: apiUser.email,
      phone: apiUser.telephone,
      firstName: apiUser.first_name,
      lastName: apiUser.last_name,
      profil: UserProfil.MAGASINIER, // Profil par défaut en cas d'erreur
      profileId: apiUser.profil || 0, // ID par défaut si undefined
      isActive: apiUser.is_active,
      isPhoneVerified: true,
      isEmailVerified: !!apiUser.email,
      hasCompletedSetup: !!apiUser.last_login, // Si l'utilisateur s'est déjà connecté
      createdAt: apiUser.date_creation,
      updatedAt: apiUser.date_modif,
    };
  }
}

// Fonction pour transformer la réponse de login API vers AuthResponse
export async function apiLoginResponseToAuthResponse(
  apiResponse: ApiLoginByPhoneResponse
): Promise<AuthResponse> {
  // Pour l'instant, créer un utilisateur temporaire car l'API ne retourne que le token
  const tempUser: User = {
    id: "temp_user",
    email: "",
    phone: "",
    firstName: "Utilisateur",
    lastName: "Connecté",
    profil: "magasinier", // Profil par défaut sécurisé
    isActive: true,
    isPhoneVerified: true,
    isEmailVerified: false,
    hasCompletedSetup: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    user: apiResponse.user ? await apiUserToUser(apiResponse.user) : tempUser,
    token: apiResponse.access_token || "",
    refreshToken: apiResponse.refresh_token || "",
    requiresSetup: apiResponse.is_firstlogin || false,
  };
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

export function createAccountDataToApiUser(
  data: CreateAccountData
): ApiCreateUserRequest {
  console.log("🔄 Transformation des données de compte pour l'API:", {
    nom_utilisateur: data.nom_utilisateur,
    prenoms: data.prenoms,
    nom: data.nom,
    date_naissance: data.date_naissance,
    nationalite: data.nationalite,
    type: data.type,
    telephone: data.telephone,
    titre: data.titre,
    profile_id: data.profile_id,
    has_photo: !!data.photo_profil,
  });

  // Vérifier si profile_id est une chaîne ou un nombre et la convertir en nombre
  let profileId: number | undefined;
  if (data.profile_id) {
    profileId = parseInt(data.profile_id);
    if (isNaN(profileId)) {
      console.error(
        "🛑 Erreur: profile_id n'est pas un nombre valide:",
        data.profile_id
      );
      profileId = undefined;
    }
  }

  // Convertir le code pays en nom complet pour l'API
  const countryName = convertCountryCodeToName(data.nationalite || "TG");

  const apiUser = {
    username: data.nom_utilisateur,
    first_name: data.prenoms,
    last_name: data.nom,
    surname: data.nom,
    email: undefined, // CreateAccountData n'a pas d'email
    birth_date: data.date_naissance,
    nationality: countryName, // Nom complet du pays au lieu du code
    type: data.type,
    telephone: data.telephone,
    titre: data.titre,
    poste: data.titre, // Utiliser titre comme poste
    password: data.mot_de_passe,
    id_profil: profileId,
  };

  console.log("✅ Données transformées pour l'API:", apiUser);

  return apiUser;
}

export function updateAccountDataToApiUser(
  data: UpdateAccountData & { id: string }
): Partial<ApiUpdateUserRequest> {
  // Convertir le code pays en nom complet pour l'API
  const countryName = convertCountryCodeToName(data.nationalite || "TG");

  return {
    id: parseInt(data.id),
    username: data.nom_utilisateur,
    first_name: data.prenoms,
    last_name: data.nom,
    surname: data.nom,
    email: undefined, // UpdateAccountData n'a pas d'email
    birth_date: data.date_naissance,
    nationality: countryName, // Nom complet du pays au lieu du code
    type: data.type,
    telephone: data.telephone,
    titre: data.titre,
    poste: data.titre, // Utiliser titre comme poste
    id_profil: data.profile_id ? parseInt(data.profile_id) : undefined,
  };
}

export function profileToApiProfil(profile: Profile): ApiCreateProfilRequest {
  return {
    libelle: profile.nom,
    description: profile.description || "",
  };
}

// ===== TRANSFORMATEURS POUR LES PROJETS =====

// Fonction pour déterminer le statut d'un projet basé sur les dates
function getProjetStatus(dateDebut: string, dateFin: string): ProjetStatus {
  const now = new Date();
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);

  if (debut > now) return "planifie";
  if (fin < now) return "termine";
  return "en_cours";
}

// API → Frontend : Transformer ApiProjet vers Projet
export function apiProjetToProjet(apiProjet: ApiProjet): Projet {
  console.log("🔄 Transformation de ApiProjet vers Projet:", apiProjet);

  // Les comptes associés sont maintenant gérés par getProjetComptes dans projetApiService
  // qui utilise userApiService pour récupérer les informations détaillées des utilisateurs
  // Nous ne générons plus de données simplifiées ici pour éviter la duplication
  const comptesAssocies: CompteAssocie[] = [];

  return {
    id: apiProjet.id,
    nom: apiProjet.nom, // Nom principal selon l'API
    name: apiProjet.nom, // Alias pour compatibilité
    description: apiProjet.description || "",
    date_creation: new Date(apiProjet.date_creation),
    date_debut: new Date(apiProjet.date_debut),
    date_fin: apiProjet.date_fin ? new Date(apiProjet.date_fin) : undefined, // Optionnel selon l'API
    date_modification: new Date(apiProjet.date_modification), // Nom exact de l'API
    pays: apiProjet.pays,
    creator: apiProjet.creator, // ID du créateur selon l'API
    is_active: apiProjet.is_active,

    // Rôles principaux selon l'API (peuvent être undefined)
    chef_projet: undefined, // À définir si l'API les fournit
    chef_chantier: undefined,
    magasinier: undefined,

    // Champs pour compatibilité avec l'ancien système
    chef_projet_user_id: apiProjet.creator, // Utiliser le creator comme chef de projet par défaut
    directeur_travaux_user_id: apiProjet.creator, // Valeur par défaut
    coordinateur_travaux_user_id: apiProjet.creator, // Valeur par défaut
    chef_equipe_user_id: apiProjet.creator, // Valeur par défaut

    images: [], // L'API simple ne gère pas les images
    comptes: apiProjet.comptes, // IDs des comptes associés selon l'API
    comptesAssocies: comptesAssocies, // Détails des comptes (chargés séparément)
  };
}

// API → Frontend : Transformer ApiProjet vers ProjetWithDetails
export function apiProjetToProjetWithDetails(
  apiProjet: ApiProjet,
  options: {
    chefProjet?: { id: number; name: string };
    directeurTravaux?: { id: number; name: string };
    chefChantier?: { id: number; name: string };
    magasinsCount?: number;
    comptesAssociesCount?: number;
  } = {}
): ProjetWithDetails {
  return {
    id: apiProjet.id,
    name: apiProjet.nom,
    description: apiProjet.description || "",
    date_debut: apiProjet.date_debut,
    date_fin: apiProjet.date_fin || apiProjet.date_debut, // Fallback si pas de date_fin
    pays: apiProjet.pays,
    status: getProjetStatus(
      apiProjet.date_debut,
      apiProjet.date_fin || apiProjet.date_debut
    ),
    chefProjet: options.chefProjet || {
      id: apiProjet.creator,
      name: "N/A",
    },
    directeurTravaux: options.directeurTravaux || {
      id: apiProjet.creator,
      name: "N/A",
    },
    chefChantier: options.chefChantier || {
      id: apiProjet.creator,
      name: "N/A",
    },
    magasinsCount: options.magasinsCount || 0,
    comptesAssociesCount:
      options.comptesAssociesCount || apiProjet.comptes?.length || 0,
  };
}

// API → Frontend : Transformer ApiMagasin vers Magasin
export function apiMagasinToMagasin(apiMagasin: ApiMagasin): Magasin {
  return {
    id: apiMagasin.id,
    name: apiMagasin.nom,
    project_id: apiMagasin.projet,
    adresse: apiMagasin.adresse,
    actions: apiMagasin.actions,
  };
}

// Frontend → API : Transformer CreateProjetData vers ApiCreateProjetRequest
export function createProjetDataToApiCreateProjet(
  data: CreateProjetData
): ApiCreateProjetRequest {
  console.log(
    "🔄 Transformation de CreateProjetData vers ApiCreateProjetRequest:",
    data
  );

  // Collecter tous les IDs d'utilisateurs associés au projet
  const userIds: number[] = [];

  // Ajouter les rôles principaux selon la nouvelle structure API
  if (data.chef_projet || data.chef_projet_user_id) {
    const chefProjetId = data.chef_projet || data.chef_projet_user_id;
    if (chefProjetId && !userIds.includes(chefProjetId)) {
      userIds.push(chefProjetId);
    }
  }

  if (data.chef_chantier || data.chef_chantier_user_id) {
    const chefChantierId = data.chef_chantier || data.chef_chantier_user_id;
    if (chefChantierId && !userIds.includes(chefChantierId)) {
      userIds.push(chefChantierId);
    }
  }

  if (data.magasinier) {
    if (!userIds.includes(data.magasinier)) {
      userIds.push(data.magasinier);
    }
  }

  // Ajouter les autres rôles pour compatibilité
  if (
    data.directeur_travaux_user_id &&
    !userIds.includes(data.directeur_travaux_user_id)
  ) {
    userIds.push(data.directeur_travaux_user_id);
  }

  if (
    data.coordinateur_travaux_user_id &&
    !userIds.includes(data.coordinateur_travaux_user_id)
  ) {
    userIds.push(data.coordinateur_travaux_user_id);
  }

  if (data.chef_equipe_user_id && !userIds.includes(data.chef_equipe_user_id)) {
    userIds.push(data.chef_equipe_user_id);
  }

  // Ajouter les utilisateurs supplémentaires
  if (data.comptes?.length) {
    data.comptes.forEach((userId) => {
      if (!userIds.includes(userId)) {
        userIds.push(userId);
      }
    });
  }

  if (data.comptes_associes?.length) {
    data.comptes_associes.forEach((userId) => {
      const id = parseInt(userId.toString());
      if (!isNaN(id) && !userIds.includes(id)) {
        userIds.push(id);
      }
    });
  }

  console.log("👥 Utilisateurs associés au projet:", userIds);

  // Construire l'objet API avec tous les champs requis et optionnels
  const apiData: ApiCreateProjetRequest = {
    creator: data.creator || data.chef_projet_user_id || data.chef_projet || 1, // Créateur requis
    nom: data.nom || data.name || "", // Nom requis
    pays: data.pays || "", // Pays requis
    date_debut: data.date_debut || "", // Date de début requise
    description: data.description,
    date_fin: data.date_fin,
    is_active: data.is_active !== undefined ? data.is_active : true,
    comptes: userIds,
  };

  // Ajouter les données du premier magasin pour création automatique
  if (data.magasins && data.magasins.length > 0) {
    const premierMagasin = data.magasins[0];
    apiData.nom_magasin = premierMagasin.name;
    apiData.adresse_magasin = premierMagasin.adresse || "";
    console.log("🏪 Magasin ajouté à la requête de création:", {
      nom_magasin: apiData.nom_magasin,
      adresse_magasin: apiData.adresse_magasin,
    });
  }

  console.log("✨ Données API transformées:", apiData);
  return apiData;
}

// Frontend → API : Transformer UpdateProjetData vers ApiUpdateProjetRequest
export function updateProjetDataToApiUpdateProjet(
  data: UpdateProjetData
): ApiUpdateProjetRequest {
  console.log(
    "🔄 Transformation de UpdateProjetData vers ApiUpdateProjetRequest:",
    data
  );

  // Collecter tous les IDs d'utilisateurs associés au projet
  const userIds: number[] = [];

  // Ajouter l'ID du chef de projet s'il existe
  if (data.chef_projet_user_id) {
    userIds.push(data.chef_projet_user_id);
  }

  // Ajouter les autres rôles s'ils existent et sont différents
  if (
    data.directeur_travaux_user_id &&
    !userIds.includes(data.directeur_travaux_user_id)
  ) {
    userIds.push(data.directeur_travaux_user_id);
  }

  if (
    data.chef_chantier_user_id &&
    !userIds.includes(data.chef_chantier_user_id)
  ) {
    userIds.push(data.chef_chantier_user_id);
  }

  if (
    data.coordinateur_travaux_user_id &&
    !userIds.includes(data.coordinateur_travaux_user_id)
  ) {
    userIds.push(data.coordinateur_travaux_user_id);
  }

  if (data.chef_equipe_user_id && !userIds.includes(data.chef_equipe_user_id)) {
    userIds.push(data.chef_equipe_user_id);
  }

  // Ajouter les utilisateurs supplémentaires s'il y en a
  if (data.comptes_associes?.length) {
    data.comptes_associes.forEach((userId) => {
      const id = parseInt(userId.toString());
      if (!isNaN(id) && !userIds.includes(id)) {
        userIds.push(id);
      }
    });
  }

  console.log("👥 Utilisateurs associés au projet:", userIds);

  const apiData: ApiUpdateProjetRequest = {
    id: data.id,
    creator: data.chef_projet_user_id,
    nom: data.name,
    description: data.description,
    date_debut: data.date_debut,
    date_fin: data.date_fin,
    pays: data.pays,
    comptes: userIds, // Liste de tous les IDs d'utilisateurs associés
    is_active: true,
  };

  // Ajouter les données du premier magasin pour mise à jour
  if (data.magasins && data.magasins.length > 0) {
    const premierMagasin = data.magasins[0];
    apiData.nom_magasin = premierMagasin.name;
    apiData.adresse_magasin = premierMagasin.adresse || "";
    console.log("🏪 Magasin ajouté à la requête de mise à jour:", {
      nom_magasin: apiData.nom_magasin,
      adresse_magasin: apiData.adresse_magasin,
    });
  }

  return apiData;
}

// Frontend → API : Transformer CreateMagasinData vers ApiCreateMagasinRequest
export function createMagasinDataToApiCreateMagasin(
  data: CreateMagasinData,
  projetId: number,
  creatorId?: number
): ApiCreateMagasinRequest {
  return {
    creator: creatorId || 1, // Utiliser l'ID du créateur ou 1 par défaut
    nom: data.name,
    adresse: data.adresse,
    projet: projetId,
  };
}

// API → Frontend : Transformer ApiProjetListResponse vers ProjetListResponse
export function apiProjetListResponseToProjetListResponse(
  apiResponse: ApiProjetListResponse,
  page: number = 1,
  limit: number = 10
): ProjetListResponse {
  const totalPages = Math.ceil(apiResponse.count / limit);

  return {
    data: apiResponse.results.map((projet) =>
      apiProjetToProjetWithDetails(projet)
    ),
    total: apiResponse.count,
    page,
    limit,
    totalPages,
  };
}

// API → Frontend : Transformer un tableau de ApiProjet vers ProjetListResponse
export function apiProjetsArrayToProjetListResponse(
  apiProjets: ApiProjet[],
  users: ApiCustomUser[],
  page: number = 1,
  limit: number = 10
): ProjetListResponse {
  // Simuler la pagination côté client
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = apiProjets.slice(startIndex, endIndex);
  const totalPages = Math.ceil(apiProjets.length / limit);

  return {
    data: paginatedData.map((projet) => {
      // Créer un map des utilisateurs pour un accès rapide
      const userMap = new Map(users.map((user) => [user.id, user]));

      // Fonction pour obtenir le nom d'un utilisateur
      const getUserName = (userId: number): string => {
        const user = userMap.get(userId);
        return user
          ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
          : "N/A";
      };

      // Déterminer les rôles à partir des comptes du projet
      // Pour simplifier, on va assigner le créateur comme chef de projet
      const chefProjet = {
        id: projet.creator,
        name: getUserName(projet.creator),
      };

      // Pour les autres rôles, on utilise les premiers comptes associés
      const comptes = projet.comptes || [];
      const directeurTravaux =
        comptes.length > 0
          ? {
              id: comptes[0],
              name: getUserName(comptes[0]),
            }
          : { id: projet.creator, name: getUserName(projet.creator) };

      const chefChantier =
        comptes.length > 1
          ? {
              id: comptes[1],
              name: getUserName(comptes[1]),
            }
          : { id: projet.creator, name: getUserName(projet.creator) };

      return apiProjetToProjetWithDetails(projet, {
        chefProjet,
        directeurTravaux,
        chefChantier,
        comptesAssociesCount: comptes.length,
      });
    }),
    total: apiProjets.length,
    page,
    limit,
    totalPages,
  };
}

// API → Frontend : Transformer ApiProjetStatsResponse vers ProjetStats
export function apiProjetStatsResponseToProjetStats(
  apiResponse: ApiProjetStatsResponse
): ProjetStats {
  return {
    total: apiResponse.total,
    planifies: apiResponse.planifies,
    en_cours: apiResponse.en_cours,
    termines: apiResponse.termines,
    annules: apiResponse.annules || 0, // Valeur par défaut si l'API ne le fournit pas
    par_pays: apiResponse.par_pays,
  };
}

// ==================== TRANSFORMATEURS DEMANDES ====================

import type {
  MaterialRequest,
  RequestTreatment,
  DemandeStatut,
} from "../../types/request";
import type { ApiDemande } from "../../types/api-demandes";
import { API_TO_FRONTEND_STATUS } from "../../types/api-demandes";
/**
 * Convertir ApiDemande vers MaterialRequest (frontend)
 */
export function apiDemandeToMaterialRequest(
  apiDemande: ApiDemande
): MaterialRequest {
  // Vérification de sécurité pour l'ID
  if (!apiDemande.id) {
    console.warn("⚠️ apiDemande.id est undefined:", apiDemande);
    throw new Error("ID de demande manquant dans la réponse API");
  }

  return {
    id: apiDemande.id.toString(),
    demande: apiDemande.stock_item_name,
    nomMagasinier: apiDemande.emis_par_name,
    quantiteDemandee: apiDemande.quantite,
    profil: "Magasinier", // À adapter selon les données disponibles
    status: (API_TO_FRONTEND_STATUS[apiDemande.statut] ||
      "emis") as DemandeStatut,
    dateDemande: formatApiDate(apiDemande.date_creation),
    userId: apiDemande.emis_par?.toString(),
    notes: apiDemande.raison,
    createdAt: apiDemande.date_creation,
    updatedAt: apiDemande.date_creation, // À adapter si date de modification disponible

    // Champs additionnels pour le détail
    nomMagasin: apiDemande.magasin_name,
    nomProjet: "N/A", // À compléter si disponible dans l'API
    adresseMagasin: "N/A", // À compléter si disponible dans l'API
    donneurOrdre: apiDemande.emis_par_name,
    quantiteValidee: undefined, // À adapter selon les besoins
    motif: apiDemande.raison,
    observation: apiDemande.motif_rejet,
    traitements: generateTreatmentsFromApiDemande(apiDemande),
  };
}

/**
 * Générer les traitements basés sur les données de l'API
 */
function generateTreatmentsFromApiDemande(
  apiDemande: ApiDemande
): RequestTreatment[] {
  const treatments: RequestTreatment[] = [];

  // Vérification de sécurité pour l'ID
  if (!apiDemande.id) {
    console.warn(
      "⚠️ apiDemande.id manquant pour générer les traitements:",
      apiDemande
    );
    return treatments;
  }

  // Émission
  if (apiDemande.emis_par_name && apiDemande.date_emission) {
    treatments.push({
      id: `emission_${apiDemande.id}`,
      nom: apiDemande.emis_par_name,
      profil: "Magasinier",
      action: "emis",
      date: apiDemande.date_emission,
    });
  }

  // Confirmation
  if (apiDemande.confirme_par_name && apiDemande.date_confirmation) {
    treatments.push({
      id: `confirmation_${apiDemande.id}`,
      nom: apiDemande.confirme_par_name,
      profil: "Chef Appro",
      action: "confirme",
      date: apiDemande.date_confirmation,
    });
  }

  // Approbation
  if (apiDemande.approve_par_name && apiDemande.date_approbation) {
    treatments.push({
      id: `approbation_${apiDemande.id}`,
      nom: apiDemande.approve_par_name,
      profil: "Directeur Technique",
      action: "approuve",
      date: apiDemande.date_approbation,
    });
  }

  // Validation
  if (apiDemande.valide_par_name && apiDemande.date_validation) {
    treatments.push({
      id: `validation_${apiDemande.id}`,
      nom: apiDemande.valide_par_name,
      profil: "Directeur",
      action: "valide",
      date: apiDemande.date_validation,
    });
  }

  // Rejet
  if (apiDemande.rejete_par_name && apiDemande.date_rejet) {
    treatments.push({
      id: `rejet_${apiDemande.id}`,
      nom: apiDemande.rejete_par_name,
      profil: "Directeur",
      action: "refuse",
      date: apiDemande.date_rejet,
    });
  }

  return treatments;
}

/**
 * Formater une date API pour l'affichage
 */
function formatApiDate(apiDate: string): string {
  try {
    const date = new Date(apiDate);
    return date
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", " à");
  } catch {
    return apiDate;
  }
}
