// Types pour la gestion des comptes utilisateurs
export interface Account {
  id: string;
  code: string; // Code du compte (ex: CPT-001)
  nom: string;
  prenoms: string;
  nom_utilisateur: string;
  date_naissance: string; // Format: YYYY-MM-DD
  nationalite: string; // Code pays (ex: TG, FR, etc.)
  mot_de_passe: string; // Hash du mot de passe
  type: AccountType;
  titre: string; // Titre du compte (ex: Ingénieur, Manager)
  telephone: string;
  photo_profil?: string; // URL de la photo de profil
  is_active: boolean;
  is_connected?: boolean;
  date_creation: string; // ISO string
  date_modification: string; // ISO string
  derniere_connexion?: string; // ISO string
  profile_id: string;
  profile: Profile;
}

export interface Profile {
  id: string;
  code: string; // Code unique du profil
  nom: string; // Nom du profil (ex: Magasinier, Directeur général, etc.)
  description?: string;
  is_active?: boolean; // Statut actif/inactif du profil
  permissions?: number[]; // IDs des accès/permissions assignés
}

export const AccountType = {
  INTERNE: "Interne",
  EXTERNE: "Externe",
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

// Types pour les formulaires
export interface CreateAccountData {
  nom: string;
  prenoms: string;
  nom_utilisateur: string;
  date_naissance: string;
  nationalite: string;
  mot_de_passe: string;
  confirm_mot_de_passe: string;
  type: AccountType;
  titre: string;
  telephone: string;
  photo_profil?: File;
  profile_id: string;
}

export interface UpdateAccountData extends Partial<
  Omit<CreateAccountData, "mot_de_passe" | "confirm_mot_de_passe">
> {
  mot_de_passe?: string;
  confirm_mot_de_passe?: string;
}

// Types pour les filtres et la recherche
export interface AccountFilters {
  type?: AccountType;
  profile_id?: string;
  nationalite?: string;
  is_active?: boolean;
  search?: string; // Recherche dans nom, prenoms, nom_utilisateur
}

// Types pour les statistiques
export interface AccountStats {
  total: number;
  interne: number;
  externe: number;
  active: number;
  inactive: number;
  byProfile: Array<{
    profile_id: string;
    profile_name: string;
    count: number;
  }>;
}

// Interface pour l'affichage de la liste des comptes avec relations
export interface AccountWithProfile {
  id: string;
  code: string;
  nom: string;
  prenoms: string;
  nom_utilisateur: string;
  telephone: string;
  type: AccountType;
  is_active: boolean;
  derniere_connexion?: string;
  profile: {
    id: string;
    nom: string;
  };
}

// Types pour la pagination
export interface AccountListResponse {
  data: AccountWithProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types pour la gestion des profils
export interface CreateProfileData {
  nom: string;
  description?: string;
}

export interface UpdateProfileData {
  nom: string;
  description?: string;
}
