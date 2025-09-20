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
    profile_id: apiUser.id_profil?.toString() || "",
  };
}

export function apiUserToUser(apiUser: ApiCustomUser): User {
  return {
    id: apiUser.id.toString(),
    email: apiUser.email,
    phone: apiUser.telephone,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
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
  return {
    user: apiUserToUser(apiResponse.user),
    token: apiResponse.token,
    refreshToken: apiResponse.refresh_token || "",
    requiresSetup: apiResponse.is_firstlogin, // Mapper is_firstlogin vers requiresSetup
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
  return {
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
    id_profil: parseInt(data.profile_id),
  };
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
  return {
    id: apiProjet.id,
    name: apiProjet.nom,
    description: apiProjet.description,
    date_creation: new Date(apiProjet.date_creation),
    date_debut: new Date(apiProjet.date_debut),
    date_fin: new Date(apiProjet.date_fin),
    date_modif: new Date(apiProjet.date_modif),
    date_mise_a_jour: new Date(apiProjet.date_mise_a_jour),
    pays: apiProjet.pays,
    chef_projet_user_id: apiProjet.chef_projet_user_id,
    directeur_travaux_user_id: apiProjet.directeur_travaux_user_id,
    chef_chantier_user_id: apiProjet.chef_chantier_user_id,
    coordinateur_travaux_user_id: apiProjet.coordinateur_travaux_user_id,
    chef_equipe_user_id: apiProjet.chef_equipe_user_id,
    server_boolean: apiProjet.server_boolean,
    images: apiProjet.images,
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
    description: apiProjet.description,
    date_debut: apiProjet.date_debut,
    date_fin: apiProjet.date_fin,
    pays: apiProjet.pays,
    status: getProjetStatus(apiProjet.date_debut, apiProjet.date_fin),
    chefProjet: options.chefProjet || {
      id: apiProjet.chef_projet_user_id,
      name: "N/A",
    },
    directeurTravaux: options.directeurTravaux || {
      id: apiProjet.directeur_travaux_user_id,
      name: "N/A",
    },
    chefChantier: options.chefChantier || {
      id: apiProjet.chef_chantier_user_id,
      name: "N/A",
    },
    magasinsCount: options.magasinsCount || 0,
    comptesAssociesCount: options.comptesAssociesCount || 0,
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
  return {
    nom: data.name,
    description: data.description,
    date_debut: data.date_debut,
    date_fin: data.date_fin,
    pays: data.pays,
    chef_projet_user_id: data.chef_projet_user_id,
    directeur_travaux_user_id: data.directeur_travaux_user_id,
    chef_chantier_user_id: data.chef_chantier_user_id,
    coordinateur_travaux_user_id: data.coordinateur_travaux_user_id,
    chef_equipe_user_id: data.chef_equipe_user_id,
    images: data.images,
  };
}

// Frontend → API : Transformer UpdateProjetData vers ApiUpdateProjetRequest
export function updateProjetDataToApiUpdateProjet(
  data: UpdateProjetData
): ApiUpdateProjetRequest {
  return {
    id: data.id,
    nom: data.name,
    description: data.description,
    date_debut: data.date_debut,
    date_fin: data.date_fin,
    pays: data.pays,
    chef_projet_user_id: data.chef_projet_user_id,
    directeur_travaux_user_id: data.directeur_travaux_user_id,
    chef_chantier_user_id: data.chef_chantier_user_id,
    coordinateur_travaux_user_id: data.coordinateur_travaux_user_id,
    chef_equipe_user_id: data.chef_equipe_user_id,
    images: data.images,
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
