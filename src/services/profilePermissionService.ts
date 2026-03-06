// Service pour gérer les profils utilisateurs et leurs permissions

import type { User } from "../types/auth";
import { profileApiService } from "./api/authApiService";
import type { Profile } from "../types/account";

/**
 * Configuration des permissions par profil
 * Basé sur les profils fournis: dtx, dt, dga, Admin, magasinier
 */
export interface ProfilePermissions {
  profileId: string;
  libelle: string; // Nom du profil depuis l'API
  permissions: {
    // Actions de traitement des demandes
    canConfirmRequest: boolean; // Peut confirmer les demandes émises
    canApproveRequest: boolean; // Peut approuver les demandes confirmées
    canValidateRequest: boolean; // Peut valider les demandes approuvées
    canRejectRequest: boolean; // Peut rejeter une demande

    // Gestion des stocks et magasins
    canManageStock: boolean; // Peut gérer les stocks
    canCreateEntry: boolean; // Peut créer des entrées de stock
    canCreateExit: boolean; // Peut créer des sorties de stock

    // Gestion des utilisateurs et profils
    canManageUsers: boolean; // Peut gérer les comptes utilisateurs
    canManageProfiles: boolean; // Peut gérer les profils

    // Administration système
    canAccessAdminPanel: boolean; // Peut accéder au panneau d'administration
    canViewReports: boolean; // Peut voir les rapports
    canExportData: boolean; // Peut exporter des données
  };
}

// Importer la configuration centralisée des permissions
import { PROFILE_PERMISSIONS_CONFIG as DEFAULT_PROFILE_PERMISSIONS } from "../utils/permissionConfig";

/**
 * Service pour gérer les permissions des profils
 */
export class ProfilePermissionService {
  private profilesCache: Map<string, Profile> = new Map();
  private permissionsCache: Map<string, ProfilePermissions> = new Map();

  /**
   * Récupère le profil détaillé depuis l'API
   */
  async getProfileDetail(profileId: string): Promise<Profile | null> {
    try {
      // Vérifier le cache d'abord
      if (this.profilesCache.has(profileId)) {
        return this.profilesCache.get(profileId)!;
      }

      // Récupérer depuis l'API
      const profile = await profileApiService.getProfileById(profileId);

      // Mettre en cache
      this.profilesCache.set(profileId, profile);

      return profile;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du profil ${profileId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Récupère les permissions pour un profil donné
   */
  async getProfilePermissions(
    profileId: string
  ): Promise<ProfilePermissions | null> {
    try {
      // Vérifier le cache d'abord
      if (this.permissionsCache.has(profileId)) {
        return this.permissionsCache.get(profileId)!;
      }

      // Récupérer le profil détaillé
      const profile = await this.getProfileDetail(profileId);
      if (!profile) {
        return null;
      }

      // Mapper le libelle vers les permissions
      const libelle = profile.nom.toLowerCase();
      const defaultPermissions = DEFAULT_PROFILE_PERMISSIONS[libelle];

      if (!defaultPermissions) {
        // Retourner des permissions par défaut très limitées
        const fallbackPermissions: ProfilePermissions = {
          profileId,
          libelle: profile.nom,
          permissions: {
            canConfirmRequest: false,
            canApproveRequest: false,
            canValidateRequest: false,
            canRejectRequest: false,
            canManageStock: false,
            canCreateEntry: false,
            canCreateExit: false,
            canManageUsers: false,
            canManageProfiles: false,
            canAccessAdminPanel: false,
            canViewReports: false,
            canExportData: false,
          },
        };

        this.permissionsCache.set(profileId, fallbackPermissions);
        return fallbackPermissions;
      }

      // Construire l'objet permissions complet
      const profilePermissions: ProfilePermissions = {
        profileId,
        ...defaultPermissions,
      };

      // Mettre en cache
      this.permissionsCache.set(profileId, profilePermissions);

      return profilePermissions;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des permissions pour le profil ${profileId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Récupère les permissions pour l'utilisateur connecté
   */
  async getUserPermissions(user: User): Promise<ProfilePermissions | null> {
    // Utiliser l'ID du profil depuis l'utilisateur (user.profileId)
    if (!user.profileId) {
      return null;
    }

    // Récupérer les permissions du profil via l'API
    return this.getProfilePermissions(user.profileId.toString());
  }

  /**
   * Vide le cache (utile pour forcer un rechargement)
   */
  clearCache(): void {
    this.profilesCache.clear();
    this.permissionsCache.clear();
  }

  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  async checkPermission(
    user: User,
    permission: keyof ProfilePermissions["permissions"]
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(user);
    return userPermissions?.permissions[permission] ?? false;
  }

  /**
   * Liste tous les profils disponibles avec leurs permissions
   */
  async getAllProfilesWithPermissions(): Promise<ProfilePermissions[]> {
    try {
      const profiles = await profileApiService.getProfiles();
      const profilePermissions: ProfilePermissions[] = [];

      for (const profile of profiles) {
        const permissions = await this.getProfilePermissions(profile.id);
        if (permissions) {
          profilePermissions.push(permissions);
        }
      }

      return profilePermissions;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de tous les profils:",
        error
      );
      return [];
    }
  }
}

// Instance exportée du service
export const profilePermissionService = new ProfilePermissionService();
