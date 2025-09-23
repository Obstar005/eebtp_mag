// Types pour l'API EEBTP - Authentication & Users
export interface ApiCustomUser {
  id: number;
  nationality: string; // Nom complet du pays
  password: string;
  last_login?: string; // ISO datetime
  is_superuser: boolean;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  is_staff: boolean;
  date_joined: string; // ISO datetime
  surname: string;
  birth_date?: string; // YYYY-MM-DD
  type: "Interne" | "Consultant";
  titre: string;
  poste: string;
  photo_profil?: string; // URI
  telephone: string;
  is_active: boolean;
  date_creation: string; // ISO datetime
  date_modif: string; // ISO datetime
  id_profil?: number;
  groups: number[];
  user_permissions: number[];
}

export interface ApiProfil {
  id: number;
  libelle: string;
  description: string;
  is_active: boolean;
  date_creation: string; // ISO datetime
  date_modif: string; // ISO datetime
}

// Types pour les requêtes d'authentification
export interface ApiCheckUserExistsRequest {
  telephone: string;
}

export interface ApiCheckUserExistsResponse {
  Verifié: boolean; // Format réel de l'API
  user_id?: number;
  message?: string;
}

export interface ApiLoginByPhoneRequest {
  telephone: string;
  password: string;
}

export interface ApiLoginByPhoneResponse {
  success?: boolean;
  user?: ApiCustomUser;
  access_token?: string; // Format réel de l'API
  refresh_token?: string;
  message: string;
  is_firstlogin?: boolean; // Indique si c'est la première connexion de l'utilisateur
}

export interface ApiSetPasswordRequest {
  user_id?: number;
  telephone?: string;
  old_password?: string;
  new_password: string;
  confirm_password: string;
}

export interface ApiSetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ApiUserInfoResponse {
  user: ApiCustomUser;
}

// Types pour la gestion des utilisateurs
export interface ApiCreateUserRequest {
  nationality: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  surname: string;
  email?: string;
  birth_date?: string;
  type: "Interne" | "Consultant";
  titre: string;
  poste: string;
  telephone: string;
  id_profil?: number;
}

export interface ApiUpdateUserRequest extends Partial<ApiCreateUserRequest> {
  id: number;
}

// Types pour la gestion des profils
export interface ApiCreateProfilRequest {
  libelle: string;
  description: string;
}

export interface ApiUpdateProfilRequest
  extends Partial<ApiCreateProfilRequest> {
  id: number;
}
