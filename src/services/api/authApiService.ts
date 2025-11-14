import { apiClient } from "./client";
import {
  apiUserToAccount,
  apiUserToUser,
  apiProfilToProfile,
  profileToApiProfil,
  createAccountDataToApiUser,
  updateAccountDataToApiUser,
  apiLoginResponseToAuthResponse,
} from "./api-transformers";
import { debugApiResponse, validateApiUser } from "../../utils/debugUtils";
import type {
  ApiCustomUser,
  ApiProfil,
  ApiCheckUserExistsResponse,
  ApiLoginByPhoneResponse,
  ApiSetPasswordRequest,
  ApiSetPasswordResponse,
  ApiUpdateUserRequest,
  ApiUpdateProfilRequest,
} from "../../types/api-users";
import type {
  PhoneVerificationRequest,
  PhoneVerificationResponse,
  DirectLoginCredentials,
  User,
  AccountSetupData,
  AuthResponse,
} from "../../types/auth";
import type {
  Account,
  Profile,
  AccountFilters,
  AccountStats,
  AccountListResponse,
  CreateAccountData,
  UpdateAccountData,
} from "../../types/account";
import { MockAuthService } from "./mockService";

// Service pour l'authentification avec l'API EEBTP
export class AuthApiService {
  private mockService = new MockAuthService(); // Fallback en cas d'erreur

  // Vérifier si un utilisateur existe par téléphone
  async checkUserExists(
    phone: string
  ): Promise<{ exists: boolean; userId?: number; message: string }> {
    try {
      // Appel sans authentification car cet endpoint est public
      const response = await apiClient.post<ApiCheckUserExistsResponse>(
        "/Users/authentication/check-user-exists/",
        {
          telephone: phone,
        },
        {
          headers: {
            "X-No-Auth": "true", // Flag pour désactiver l'authentification
          },
        }
      );
      return {
        exists: response.data.Verifié, // Adapter au format réel de l'API
        userId: response.data.user_id,
        message:
          response.data.message ||
          (response.data.Verifié
            ? "Utilisateur trouvé"
            : "Utilisateur non trouvé"),
      };
    } catch (error: unknown) {
      console.error("Erreur checkUserExists:", error);

      // Gérer les erreurs HTTP 4xx et 5xx
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status: number; data: Record<string, unknown> };
        };
        const status = axiosError.response?.status;

        // 404 ou tout autre 4xx = erreur client, ne pas continuer
        if (status === 404) {
          throw new Error(
            "Ce numéro de téléphone n'est pas enregistré dans le système"
          );
        }

        if (status && status >= 400 && status < 500) {
          const errorMessage =
            (axiosError.response?.data as Record<string, unknown>)?.message ||
            `Erreur ${status}`;
          throw new Error(errorMessage as string);
        }

        // 5xx = erreur serveur
        if (status && status >= 500) {
          throw new Error(
            "Erreur serveur. Veuillez réessayer dans quelques instants."
          );
        }
      }

      // Pour les autres erreurs, relancer avec un message générique
      throw new Error(
        "Impossible de vérifier le numéro de téléphone. Veuillez réessayer."
      );
    }
  }

  // Connexion par téléphone et mot de passe
  async loginByPhone(
    credentials: DirectLoginCredentials
  ): Promise<AuthResponse> {
    try {
      // Utiliser Basic Auth admin pour cette requête, credentials utilisateur dans le body
      const response = await apiClient.post<ApiLoginByPhoneResponse>(
        "/Users/authentication/login-by-phone-web/",
        {
          telephone: credentials.phone,
          password: credentials.password,
        },
        {
          headers: {
            "X-No-Auth": "true", // Désactiver auto-auth pour utiliser Basic Auth admin
          },
        }
      );

      // L'API retourne toujours un message, access_token si succès
      if (response.data.access_token) {
        // Stocker le token pour les futures requêtes
        localStorage.setItem("auth_token", response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }

        // Utiliser le transformateur pour inclure is_firstlogin
        return await apiLoginResponseToAuthResponse(response.data);
      } else {
        throw new Error(response.data.message || "Échec de la connexion");
      }
    } catch (error) {
      console.error("Erreur loginByPhone:", error);

      // Améliorer le message d'erreur pour les erreurs 401
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 401) {
          throw new Error("Informations de connexion incorrectes");
        }
      }

      throw error;
    }
  }

  // Définir ou changer le mot de passe
  async setPassword(
    data: ApiSetPasswordRequest
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<ApiSetPasswordResponse>(
        "/Users/authentication/set-password/",
        data
      );
      return {
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Erreur setPassword:", error);
      throw error;
    }
  }

  // Implémentation des méthodes legacy pour compatibilité
  async verifyPhone(
    data: PhoneVerificationRequest
  ): Promise<PhoneVerificationResponse> {
    try {
      const result = await this.checkUserExists(data.phone);
      return {
        message: result.exists ? "Utilisateur trouvé" : "Nouvel utilisateur",
        sessionId: `session_${Date.now()}`,
        isNewUser: !result.exists,
      };
    } catch (error) {
      console.error("Erreur verifyPhone:", error);
      return this.mockService.verifyPhone(data);
    }
  }

  // Récupérer les informations de l'utilisateur connecté (nécessite JWT)
  async getUserInfo(): Promise<User> {
    try {
      const response = await apiClient.get<ApiCustomUser>(
        "/Users/authentication/user-info/"
      );
      return await apiUserToUser(response.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des infos utilisateur:",
        error
      );
      throw error;
    }
  }

  // Méthodes mock pour compatibilité (à remplacer par l'API réelle si disponible)
  async verifyOtp(data: { sessionId: string; otpCode: string }) {
    return this.mockService.verifyOtp(data);
  }

  async setupAccount(data: AccountSetupData) {
    return this.mockService.setupAccount(data);
  }

  async directLogin(data: DirectLoginCredentials) {
    return this.loginByPhone(data);
  }

  async resendOtp(sessionId: string) {
    return this.mockService.resendOtp(sessionId);
  }

  async refreshToken() {
    // TODO: Implémenter le refresh token avec l'API réelle
    return Promise.resolve({
      token: `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      refreshToken: `refresh_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    });
  }

  async simpleVerifyPhone(data: PhoneVerificationRequest) {
    const result = await this.checkUserExists(data.phone);
    return {
      success: true,
      isNewUser: !result.exists,
      message: result.exists ? "Utilisateur trouvé" : "Nouvel utilisateur",
    };
  }

  async simpleLogin(data: DirectLoginCredentials) {
    return this.loginByPhone(data);
  }

  async changePassword(data: {
    phone: string;
    oldPassword?: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return this.mockService.changePassword(data);
  }

  async simpleSetupAccount(data: AccountSetupData) {
    // Adapter AccountSetupData pour l'interface du mock service
    const adaptedData = {
      phone: data.tempToken, // Utiliser tempToken comme placeholder pour phone
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    };
    return this.mockService.simpleSetupAccount(adaptedData);
  }

  // Déconnecter l'utilisateur en invalidant son token JWT
  async logout(): Promise<void> {
    try {
      await apiClient.post("/Users/authentication/logout/");
    } catch (error) {
      console.warn(
        "⚠️ Erreur lors de la déconnexion API (non-bloquant):",
        error
      );
    }
  }
}

// Service pour la gestion des utilisateurs
export class UserApiService {
  // Récupérer tous les utilisateurs
  async getUsers(): Promise<Account[]> {
    try {
      console.log(
        "🔍 UserApiService: Récupération des utilisateurs depuis l'API EEBTP..."
      );
      const response = await apiClient.get<ApiCustomUser[]>(
        "/Users/liste-users"
      );
      console.log(
        "✅ UserApiService: Réponse API utilisateurs:",
        response.data
      );

      const accounts = await Promise.all(response.data.map(apiUserToAccount));
      console.log("🔄 UserApiService: Utilisateurs transformés:", accounts);

      return accounts;
    } catch (error) {
      console.error("❌ Erreur getUsers:", error);
      throw new Error("Impossible de récupérer la liste des utilisateurs");
    }
  }

  // Récupérer un utilisateur par ID
  async getUserById(id: string): Promise<Account> {
    try {
      console.log(
        `🔍 Récupération des détails de l'utilisateur avec ID: ${id}`
      );
      const response = await apiClient.get<ApiCustomUser>(
        `/Users/user-detail${id}`
      );
      return await apiUserToAccount(response.data);
    } catch (error) {
      console.error("Erreur getUserById:", error);
      throw new Error("Impossible de récupérer l'utilisateur");
    }
  }

  // Créer un utilisateur
  async createUser(data: CreateAccountData): Promise<Account> {
    try {
      console.log("🚀 Création d'un nouvel utilisateur:", {
        nom: data.nom,
        prenoms: data.prenoms,
        nom_utilisateur: data.nom_utilisateur,
        type: data.type,
        telephone: data.telephone,
        profile_id: data.profile_id,
        has_photo: !!data.photo_profil,
      });

      const apiData = createAccountDataToApiUser(data);

      // Utiliser FormData si une image est présente
      if (data.photo_profil) {
        console.log("📸 Image détectée, utilisation de FormData");

        const formData = new FormData();

        // Ajouter toutes les données utilisateur
        Object.entries(apiData).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, value.toString());
          }
        });

        // Ajouter l'image
        formData.append("photo_profil", data.photo_profil);

        const response = await apiClient.post<ApiCustomUser>(
          "/Users/user-create",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log(
          "✅ Utilisateur créé avec succès avec image:",
          response.data
        );
        console.log("🔍 Structure complète de la réponse API (avec image):", {
          status: response.status,
          hasData: !!response.data,
          dataKeys: Object.keys(response.data || {}),
          userId: response.data?.id,
          userIdType: typeof response.data?.id,
        });

        // Validation de la réponse API
        const validation = validateApiUser(response.data);
        if (!validation.isValid) {
          console.error(
            "❌ Validation de l'utilisateur créé (avec image) échouée:",
            validation
          );
        } else {
          console.log(
            "✅ Validation de l'utilisateur créé (avec image) réussie"
          );
        }

        debugApiResponse(response.data, "Utilisateur créé (avec image)");

        return await apiUserToAccount(response.data);
      } else {
        // Si pas d'image, utiliser JSON standard
        const response = await apiClient.post<ApiCustomUser>(
          "/Users/user-create",
          apiData
        );

        console.log("✅ Utilisateur créé avec succès:", response.data);
        console.log("🔍 Structure complète de la réponse API:", {
          status: response.status,
          hasData: !!response.data,
          dataKeys: Object.keys(response.data || {}),
          userId: response.data?.id,
          userIdType: typeof response.data?.id,
        });

        // Validation de la réponse API
        const validation = validateApiUser(response.data);
        if (!validation.isValid) {
          console.error(
            "❌ Validation de l'utilisateur créé échouée:",
            validation
          );
        } else {
          console.log("✅ Validation de l'utilisateur créé réussie");
        }

        debugApiResponse(response.data, "Utilisateur créé (sans image)");

        return await apiUserToAccount(response.data);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'utilisateur:", error);

      // Informations détaillées sur l'erreur en utilisant une approche sûre au niveau du typage
      const err = error as {
        response?: {
          status?: number;
          statusText?: string;
          data?: { message?: string; error?: string; [key: string]: unknown };
        };
      };

      if (err.response) {
        console.error("Détails de l'erreur API:", {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
        });

        // Extraire un message d'erreur spécifique si disponible
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          "Impossible de créer l'utilisateur";

        throw new Error(`Erreur ${err.response.status}: ${errorMessage}`);
      }

      // Extraire le message d'erreur de façon sûre
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      throw new Error("Impossible de créer l'utilisateur: " + errorMessage);
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(data: UpdateAccountData & { id: string }): Promise<Account> {
    try {
      if (!data.id) throw new Error("ID utilisateur requis");

      const apiData = updateAccountDataToApiUser(data);
      const response = await apiClient.put<ApiCustomUser>(
        `/Users/user-update/${data.id}`,
        apiData
      );
      return await apiUserToAccount(response.data);
    } catch (error) {
      console.error("Erreur updateUser:", error);
      throw new Error("Impossible de mettre à jour l'utilisateur");
    }
  }

  // Supprimer un utilisateur
  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`/Users/user-delete/${id}`);
    } catch (error) {
      console.error("Erreur deleteUser:", error);
      throw new Error("Impossible de supprimer l'utilisateur");
    }
  }

  // Activer/désactiver un utilisateur (toggle status)
  async toggleAccountStatus(id: string): Promise<Account> {
    try {
      // 1. Récupérer l'utilisateur actuel
      const user = await this.getUserById(id);

      // 2. Préparer les données pour la mise à jour (inverser is_active)
      const updateData: Partial<ApiUpdateUserRequest> = {
        id: parseInt(id),
        is_active: !user.is_active,
      };

      // 3. Mettre à jour l'utilisateur
      const response = await apiClient.put<ApiCustomUser>(
        `/Users/user-update/${id}`,
        updateData
      );

      // 4. Retourner l'utilisateur mis à jour
      return await apiUserToAccount(response.data);
    } catch (error) {
      console.error("Erreur toggleAccountStatus:", error);
      throw new Error("Impossible de modifier le statut du compte");
    }
  }

  // Méthodes pour compatibilité avec l'interface existante
  async getAccounts(
    filters?: AccountFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<AccountListResponse> {
    try {
      const accounts = await this.getUsers();

      // Filtrage côté client (à améliorer avec des paramètres API)
      let filteredAccounts = accounts;

      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filteredAccounts = filteredAccounts.filter(
          (account) =>
            account.nom.toLowerCase().includes(search) ||
            account.prenoms.toLowerCase().includes(search) ||
            account.nom_utilisateur.toLowerCase().includes(search) ||
            account.telephone.includes(search)
        );
      }

      if (filters?.type) {
        filteredAccounts = filteredAccounts.filter(
          (account) => account.type === filters.type
        );
      }

      // Pagination côté client
      const total = filteredAccounts.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedAccounts = filteredAccounts.slice(start, end);

      return {
        data: paginatedAccounts.map((account) => ({
          id: account.id,
          code: account.code,
          nom: account.nom,
          prenoms: account.prenoms,
          nom_utilisateur: account.nom_utilisateur,
          telephone: account.telephone,
          type: account.type,
          is_active: account.is_active,
          derniere_connexion: account.derniere_connexion,
          profile: {
            id: account.profile_id,
            nom: account.profile?.nom || "Non défini",
          },
        })),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error("Erreur getAccounts:", error);
      throw error;
    }
  }

  async getAccountStats(): Promise<AccountStats> {
    try {
      // 1. Récupérer tous les comptes
      const accounts = await this.getUsers();

      // 2. Récupérer tous les profils pour avoir les noms
      const profiles = await profileApiService.getProfiles();

      // 3. Calculer les statistiques de base
      const total = accounts.length;
      const interne = accounts.filter((a) => a.type === "Interne").length;
      const consultant = accounts.filter((a) => a.type === "Consultant").length;
      const active = accounts.filter((a) => a.is_active).length;
      const inactive = total - active;

      // 4. Calculer les statistiques par profil
      const profileCounts: Record<string, number> = {};
      accounts.forEach((account) => {
        if (account.profile_id) {
          const profileId = account.profile_id;
          profileCounts[profileId] = (profileCounts[profileId] || 0) + 1;
        }
      });

      // 5. Formater les statistiques par profil
      const byProfile = Object.entries(profileCounts).map(
        ([profileId, count]) => {
          const profile = profiles.find((p) => p.id === profileId);
          return {
            profile_id: profileId,
            profile_name: profile?.nom || "Profil inconnu",
            count,
          };
        }
      );

      return {
        total,
        interne,
        consultant,
        active,
        inactive,
        byProfile,
      };
    } catch (error) {
      console.error("Erreur getAccountStats:", error);
      throw error;
    }
  }
}

// Service pour la gestion des profils
export class ProfileApiService {
  // Récupérer tous les profils
  async getProfiles(): Promise<Profile[]> {
    try {
      console.log(
        "🔍 ProfileApiService: Récupération des profils depuis l'API EEBTP..."
      );
      const response = await apiClient.get<ApiProfil[]>("/Users/liste-profils");
      console.log("✅ ProfileApiService: Réponse API profils:", response.data);

      const profiles = response.data.map(apiProfilToProfile);
      console.log("🔄 ProfileApiService: Profils transformés:", profiles);

      return profiles;
    } catch (error) {
      console.error("❌ Erreur getProfiles:", error);
      throw new Error("Impossible de récupérer la liste des profils");
    }
  }

  // Récupérer un profil par ID
  async getProfileById(id: number): Promise<Profile> {
    try {
      const response = await apiClient.get<ApiProfil>(
        `/Users/profil-detail/${id}`
      );
      return apiProfilToProfile(response.data);
    } catch (error) {
      console.error("Erreur getProfileById:", error);
      throw new Error("Impossible de récupérer le profil");
    }
  }

  // Créer un profil
  async createProfile(data: {
    nom: string;
    description?: string;
  }): Promise<Profile> {
    try {
      const apiData = profileToApiProfil({
        ...data,
        id: "",
        description: data.description || "",
      });
      const response = await apiClient.post<ApiProfil>(
        "/Users/profil-create",
        apiData
      );
      return apiProfilToProfile(response.data);
    } catch (error) {
      console.error("Erreur createProfile:", error);
      throw new Error("Impossible de créer le profil");
    }
  }

  // Mettre à jour un profil
  async updateProfile(
    id: string,
    data: { nom: string; description?: string }
  ): Promise<Profile> {
    try {
      const apiData = profileToApiProfil({
        ...data,
        id,
        description: data.description || "",
      });
      const response = await apiClient.put<ApiProfil>(
        `/Users/profil-update/${id}`,
        { ...apiData, id: parseInt(id) } as ApiUpdateProfilRequest
      );
      return apiProfilToProfile(response.data);
    } catch (error) {
      console.error("Erreur updateProfile:", error);
      throw new Error("Impossible de mettre à jour le profil");
    }
  }

  // Supprimer un profil
  async deleteProfile(id: string): Promise<void> {
    try {
      await apiClient.delete(`/Users/profil-delete/${id}`);
    } catch (error) {
      console.error("Erreur deleteProfile:", error);
      throw new Error("Impossible de supprimer le profil");
    }
  }
}

// Instances exportées
export const authApiService = new AuthApiService();
export const userApiService = new UserApiService();
export const profileApiService = new ProfileApiService();
