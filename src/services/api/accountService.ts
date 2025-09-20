import type {
  Account,
  Profile,
  CreateAccountData,
  UpdateAccountData,
  AccountFilters,
  AccountStats,
  AccountListResponse,
  AccountWithProfile,
  CreateProfileData,
  UpdateProfileData,
} from "../../types/account";
import { userApiService, profileApiService } from "./authApiService";

// Service pour la gestion des comptes - utilise l'API Users
export const accountService = {
  // Récupérer la liste des comptes avec filtres et pagination
  async getAccounts(
    filters?: AccountFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<AccountListResponse> {
    // En mode développement, retourner des données mock
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockAccountService.getAccounts(filters, page, limit);
    }

    // Utiliser l'API Users pour récupérer les comptes
    return await userApiService.getAccounts(filters, page, limit);
  },

  // Récupérer un compte par ID
  async getAccountById(id: string): Promise<Account> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockAccountService.getAccountById(id);
    }

    // Utiliser l'API Users pour récupérer un utilisateur
    return await userApiService.getUserById(id);
  },

  // Créer un nouveau compte
  async createAccount(data: CreateAccountData): Promise<Account> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockAccountService.createAccount(data);
    }

    // Utiliser l'API Users pour créer un utilisateur
    return await userApiService.createUser(data);
  },

  // Mettre à jour un compte
  async updateAccount(id: string, data: UpdateAccountData): Promise<Account> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockAccountService.updateAccount(id, data);
    }

    // Utiliser l'API Users pour mettre à jour un utilisateur
    return await userApiService.updateUser({ ...data, id });
  },

  // Supprimer un compte
  async deleteAccount(id: string): Promise<void> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockAccountService.deleteAccount(id);
    }

    // Utiliser l'API Users pour supprimer un utilisateur
    return await userApiService.deleteUser(id);
  },

  // Activer/désactiver le statut d'un compte
  async toggleAccountStatus(id: string): Promise<Account> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockAccountService.toggleAccountStatus(id);
    }

    // L'API Users ne semble pas avoir d'endpoint toggle, utilisons le mock pour l'instant
    return mockAccountService.toggleAccountStatus(id);
  },

  // Récupérer les statistiques des comptes
  async getAccountStats(): Promise<AccountStats> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockAccountService.getAccountStats();
    }

    // L'API Users ne semble pas avoir d'endpoint stats, utilisons le mock pour l'instant
    return mockAccountService.getAccountStats();
  },
};

// Service pour la gestion des profils
export const profileService = {
  // Récupérer tous les profils
  async getProfiles(): Promise<Profile[]> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockProfileService.getProfiles();
    }

    // Utiliser l'API Profils
    return await profileApiService.getProfiles();
  },

  // Créer un nouveau profil
  async createProfile(data: CreateProfileData): Promise<Profile> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockProfileService.createProfile(data);
    }

    // Utiliser l'API Profils
    return await profileApiService.createProfile(data);
  },

  // Mettre à jour un profil
  async updateProfile(id: string, data: UpdateProfileData): Promise<Profile> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockProfileService.updateProfile(id, data);
    }

    // Utiliser l'API Profils
    return await profileApiService.updateProfile(id, data);
  },

  // Supprimer un profil
  async deleteProfile(id: string): Promise<void> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockProfileService.deleteProfile(id);
    }

    // Utiliser l'API Profils
    return await profileApiService.deleteProfile(id);
  },
};

// Services mock pour le développement
const mockAccountService = {
  accounts: [
    {
      id: "1",
      code: "CPT-001",
      nom: "Doe",
      prenoms: "John",
      nom_utilisateur: "johndoe",
      type: "Interne" as const,
      telephone: "+228 90909090",
      is_active: true,
      derniere_connexion: "2025-01-01T08:00:00Z",
      profile: {
        id: "profile-1",
        nom: "Magasinier",
      },
    },
    {
      id: "2",
      code: "CPT-002",
      nom: "Smith",
      prenoms: "Jane",
      nom_utilisateur: "janesmith",
      type: "Interne" as const,
      telephone: "+33 1 23 45 67 89",
      is_active: true,
      derniere_connexion: "2025-01-01T09:30:00Z",
      profile: {
        id: "profile-2",
        nom: "Directeur général",
      },
    },
    {
      id: "3",
      code: "CPT-003",
      nom: "Davis",
      prenoms: "Emily",
      nom_utilisateur: "emilydavis",
      type: "Consultant" as const,
      telephone: "+228 98765432",
      is_active: false,
      derniere_connexion: "2024-12-15T14:20:00Z",
      profile: {
        id: "profile-3",
        nom: "Chef approvisionnement",
      },
    },
  ] as AccountWithProfile[],

  async getAccounts(
    filters?: AccountFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<AccountListResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredAccounts = [...this.accounts];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredAccounts = filteredAccounts.filter(
        (account) =>
          account.nom.toLowerCase().includes(search) ||
          account.prenoms.toLowerCase().includes(search) ||
          account.nom_utilisateur.toLowerCase().includes(search)
      );
    }

    if (filters?.type) {
      filteredAccounts = filteredAccounts.filter(
        (account) => account.type === filters.type
      );
    }

    if (filters?.is_active !== undefined) {
      filteredAccounts = filteredAccounts.filter(
        (account) => account.is_active === filters.is_active
      );
    }

    if (filters?.profile_id) {
      filteredAccounts = filteredAccounts.filter(
        (account) => account.profile.id === filters.profile_id
      );
    }

    const total = filteredAccounts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredAccounts.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getAccountById(id: string): Promise<Account> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const account = this.accounts.find((acc) => acc.id === id);
    if (!account) {
      throw new Error("Compte non trouvé");
    }

    return {
      ...account,
      date_naissance: "1990-10-10",
      nationalite: "TG",
      mot_de_passe: "***********",
      date_creation: "2020-10-10T00:00:00Z",
      date_modification: "2025-11-10T00:00:00Z",
      profile_id: account.profile.id,
      profile: {
        id: account.profile.id,
        nom: account.profile.nom,
        description: `Description du profil ${account.profile.nom}`,
      },
    };
  },

  async createAccount(data: CreateAccountData): Promise<Account> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newAccount: Account = {
      id: `account-${Date.now()}`,
      code: `CPT-${String(this.accounts.length + 1).padStart(3, "0")}`,
      nom: data.nom,
      prenoms: data.prenoms,
      nom_utilisateur: data.nom_utilisateur,
      date_naissance: data.date_naissance,
      nationalite: data.nationalite,
      mot_de_passe: "***********",
      type: data.type,
      telephone: data.telephone,
      is_active: true,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString(),
      profile_id: data.profile_id,
    };

    return newAccount;
  },

  async updateAccount(id: string, data: UpdateAccountData): Promise<Account> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const account = this.accounts.find((acc) => acc.id === id);
    if (!account) {
      throw new Error("Compte non trouvé");
    }

    const { photo_profil, ...updateData } = data;

    return {
      ...account,
      ...updateData,
      date_naissance: data.date_naissance || "1990-10-10",
      nationalite: data.nationalite || "TG",
      mot_de_passe: "***********",
      date_modification: new Date().toISOString(),
      date_creation: "2020-10-10T00:00:00Z",
      profile_id: data.profile_id || account.profile.id,
      photo_profil: photo_profil ? "uploaded-photo-url" : undefined,
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteAccount(_id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // En mock, on ne fait rien
  },

  async toggleAccountStatus(id: string): Promise<Account> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const account = this.accounts.find((acc) => acc.id === id);
    if (!account) {
      throw new Error("Compte non trouvé");
    }

    return {
      ...account,
      date_naissance: "1990-10-10",
      nationalite: "TG",
      is_active: !account.is_active,
      mot_de_passe: "***********",
      date_creation: "2020-10-10T00:00:00Z",
      date_modification: new Date().toISOString(),
      profile_id: account.profile.id,
    };
  },

  async getAccountStats(): Promise<AccountStats> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const total = this.accounts.length;
    const interne = this.accounts.filter(
      (acc) => acc.type === "Interne"
    ).length;
    const consultant = this.accounts.filter(
      (acc) => acc.type === "Consultant"
    ).length;
    const active = this.accounts.filter((acc) => acc.is_active).length;
    const inactive = total - active;

    const profileCounts = this.accounts.reduce((acc, account) => {
      const profileName = account.profile.nom;
      acc[profileName] = (acc[profileName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byProfile = Object.entries(profileCounts).map(([name, count]) => ({
      profile_id: `profile-${name}`,
      profile_name: name,
      count,
    }));

    return {
      total,
      interne,
      consultant,
      active,
      inactive,
      byProfile,
    };
  },
};

const mockProfileService = {
  profiles: [
    {
      id: "profile-1",
      nom: "Magasinier",
      description: "Gestion des stocks et des inventaires",
    },
    {
      id: "profile-2",
      nom: "Directeur général",
      description: "Direction et supervision générale",
    },
    {
      id: "profile-3",
      nom: "Directeur général adjoint",
      description: "Assistance à la direction générale",
    },
    {
      id: "profile-4",
      nom: "Chef approvisionnement",
      description: "Gestion des approvisionnements et achats",
    },
  ] as Profile[],

  async getProfiles(): Promise<Profile[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...this.profiles];
  },

  async getProfile(id: string): Promise<Profile> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const profile = this.profiles.find((p) => p.id === id);
    if (!profile) {
      throw new Error("Profil non trouvé");
    }
    return profile;
  },

  async createProfile(data: {
    nom: string;
    description?: string;
  }): Promise<Profile> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      nom: data.nom,
      description: data.description,
    };

    this.profiles.push(newProfile);
    return newProfile;
  },

  async updateProfile(
    id: string,
    data: { nom: string; description?: string }
  ): Promise<Profile> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const profile = this.profiles.find((p) => p.id === id);
    if (!profile) {
      throw new Error("Profil non trouvé");
    }

    Object.assign(profile, data);
    return profile;
  },

  async deleteProfile(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.profiles.findIndex((p) => p.id === id);
    if (index > -1) {
      this.profiles.splice(index, 1);
    }
  },
};
