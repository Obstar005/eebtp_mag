// Fonctions de transformation API ↔ Frontend
import type {
  Account,
  Profile,
  AccountType,
  CreateAccountData,
  UpdateAccountData,
} from "../../types/account";
import type { User, AuthResponse } from "../../types/auth";
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
  ProjetRole,
} from "../../types/project";
import type {
  ApiCustomUser,
  ApiProfil,
  ApiCreateUserRequest,
  ApiUpdateUserRequest,
  ApiCreateProfilRequest,
  ApiLoginByPhoneResponse,
} from "../../types/api-users";
import type {
  ApiProjet,
  ApiMagasin,
  ApiCreateProjetRequest,
  ApiUpdateProjetRequest,
  ApiCreateMagasinRequest,
  ApiProjetListResponse,
  ApiProjetStatsResponse,
} from "../../types/api-projets";

export function apiUserToAccount(apiUser: ApiCustomUser): Account {
  // Vérifier et tracer les données API
  console.log("🔍 apiUserToAccount: Données API reçues:", {
    id: apiUser.id,
    username: apiUser.username,
    first_name: apiUser.first_name,
    last_name: apiUser.last_name,
    id_profil: apiUser.id_profil,
  });

  const account = {
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
    profile_id: apiUser.id_profil ? apiUser.id_profil.toString() : "",
  };

  // Tracer l'objet compte résultant
  console.log("🔄 apiUserToAccount: Compte transformé:", account);

  return account;
}

export function apiUserToUser(apiUser: ApiCustomUser): User {
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
    role: apiUser.is_superuser ? "admin" : "employee", // Mapper selon la logique métier
    isActive: apiUser.is_active,
    isPhoneVerified: true, // Assumer vérifié si dans l'API
    isEmailVerified: !!apiUser.email,
    hasCompletedSetup: true,
    createdAt: apiUser.date_creation,
    updatedAt: apiUser.date_modif,
  };
}

// Fonction pour transformer la réponse de login API vers AuthResponse
export function apiLoginResponseToAuthResponse(
  apiResponse: ApiLoginByPhoneResponse
): AuthResponse {
  // Pour l'instant, créer un utilisateur temporaire car l'API ne retourne que le token
  const tempUser: User = {
    id: "temp_user",
    email: "",
    phone: "",
    firstName: "Utilisateur",
    lastName: "Connecté",
    role: "employee",
    isActive: true,
    isPhoneVerified: true,
    isEmailVerified: false,
    hasCompletedSetup: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    user: apiResponse.user ? apiUserToUser(apiResponse.user) : tempUser,
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

  const apiUser = {
    username: data.nom_utilisateur,
    first_name: data.prenoms,
    last_name: data.nom,
    surname: data.nom,
    email: undefined, // CreateAccountData n'a pas d'email
    birth_date: data.date_naissance,
    nationality: data.nationalite,
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
  return {
    id: parseInt(data.id),
    username: data.nom_utilisateur,
    first_name: data.prenoms,
    last_name: data.nom,
    surname: data.nom,
    email: undefined, // UpdateAccountData n'a pas d'email
    birth_date: data.date_naissance,
    nationality: data.nationalite,
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

  // Créer un tableau de comptes associés basé sur les IDs d'utilisateurs
  const comptesAssocies: CompteAssocie[] = [];

  if (apiProjet.comptes && apiProjet.comptes.length > 0) {
    console.log("👥 Comptes associés au projet (API):", apiProjet.comptes);

    // Pour l'instant, ajouter des comptes associés simples basés sur les IDs
    // Idéalement, il faudrait récupérer les détails des utilisateurs à partir de userApiService
    apiProjet.comptes.forEach((userId) => {
      // Déterminer le rôle en fonction de l'ID (logique simplifiée)
      let role: ProjetRole = "magasinier"; // Rôle par défaut

      if (userId === apiProjet.creator) {
        role = "chef_projet";
      }

      comptesAssocies.push({
        userId: userId,
        userName: `Utilisateur ${userId}`, // Nom par défaut, à remplacer par le vrai nom
        userProfile: "Profil non chargé", // Profil par défaut
        role: role,
        actions: ["view"], // Actions par défaut
      });
    });
  }

  return {
    id: apiProjet.id,
    name: apiProjet.nom,
    description: apiProjet.description || "",
    date_creation: new Date(apiProjet.date_creation),
    date_debut: new Date(apiProjet.date_debut),
    date_fin: apiProjet.date_fin
      ? new Date(apiProjet.date_fin)
      : new Date(apiProjet.date_debut), // Fallback si pas de date_fin
    date_modif: new Date(apiProjet.date_modification),
    date_mise_a_jour: new Date(apiProjet.date_modification), // Même que date_modif
    pays: apiProjet.pays,
    chef_projet_user_id: apiProjet.creator, // Utiliser le creator comme chef de projet par défaut
    directeur_travaux_user_id: apiProjet.creator, // Valeur par défaut
    chef_chantier_user_id: apiProjet.creator, // Valeur par défaut
    coordinateur_travaux_user_id: apiProjet.creator, // Valeur par défaut
    chef_equipe_user_id: apiProjet.creator, // Valeur par défaut
    server_boolean: apiProjet.is_active,
    images: [], // L'API simple ne gère pas les images
    comptesAssocies: comptesAssocies, // Ajouter les comptes associés
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

  return {
    creator: data.chef_projet_user_id, // Utiliser le chef de projet comme creator
    nom: data.name,
    description: data.description,
    date_debut: data.date_debut,
    date_fin: data.date_fin,
    pays: data.pays,
    comptes: userIds, // Liste de tous les IDs d'utilisateurs associés
    is_active: true,
  };
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

  return {
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
}

// Frontend → API : Transformer CreateMagasinData vers ApiCreateMagasinRequest
export function createMagasinDataToApiCreateMagasin(
  data: CreateMagasinData,
  projetId: number
): ApiCreateMagasinRequest {
  return {
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
  page: number = 1,
  limit: number = 10
): ProjetListResponse {
  // Simuler la pagination côté client
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = apiProjets.slice(startIndex, endIndex);
  const totalPages = Math.ceil(apiProjets.length / limit);

  return {
    data: paginatedData.map((projet) => apiProjetToProjetWithDetails(projet)),
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
