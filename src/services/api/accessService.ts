import { apiClient } from "./client";

/**
 * Types pour le système de permissions
 */

// Structure d'un accès/permission retourné par l'API
export interface ApiAccess {
  id: number;
  code: string; // ex: "demande.view", "demande.approuv", "demande.confirm"
  create_by: number | null;
  libelle: string; // Description de l'accès
}

// Structure des permissions d'un utilisateur (dans user-info)
export interface UserPermission {
  id: number;
  code: string;
  create_by: number | null;
  libelle: string;
}

// Codes d'accès pour les demandes
export const DEMANDE_ACCESS_CODES = {
  VIEW: "demande.view",
  VIEW_LIST: "demandes.view",
  CREATE: "demande.create",
  UPDATE: "demande.update",
  DELETE: "demande.delete",
  CONFIRM: "demande.confirm",
  APPROVE: "demande.approv",
  VALIDATE: "demande.valid",
  REJECT: "demande.rejet",
} as const;

// Codes d'accès pour les stocks
export const STOCK_ACCESS_CODES = {
  VIEW: "stock_item.view",
  VIEW_LIST: "stock_items.view",
  CREATE: "stock_item.create",
  UPDATE: "stock_item.update",
  DELETE: "stock_item.delete",
} as const;

// Codes d'accès pour les articles
export const ARTICLE_ACCESS_CODES = {
  VIEW: "article.view",
  VIEW_LIST: "articles.view",
  CREATE: "article.create",
  UPDATE: "article.update",
  DELETE: "article.delete",
} as const;

// Codes d'accès pour les magasins
export const MAGASIN_ACCESS_CODES = {
  VIEW: "magasin.view",
  VIEW_LIST: "magasins.view",
  CREATE: "magasin.create",
  UPDATE: "magasin.update",
  DELETE: "magasin.delete",
} as const;

// Codes d'accès pour les projets
export const PROJET_ACCESS_CODES = {
  VIEW: "projet.view",
  VIEW_LIST: "projets.view",
  CREATE: "projet.create",
  UPDATE: "projet.update",
  DELETE: "projet.delete",
} as const;

// Codes d'accès pour les utilisateurs
export const USER_ACCESS_CODES = {
  VIEW: "user.view",
  VIEW_LIST: "users.view",
  CREATE: "user.create",
  UPDATE: "user.update",
  DELETE: "user.delete",
} as const;

// Codes d'accès pour les profils
export const PROFIL_ACCESS_CODES = {
  VIEW: "profil.view",
  VIEW_LIST: "profils.view",
  CREATE: "profil.create",
  UPDATE: "profil.update",
  DELETE: "profil.delete",
} as const;

// Codes d'accès pour les entrées/sorties
export const ENTREE_ACCESS_CODES = {
  VIEW: "entree.view",
  VIEW_LIST: "entrees.view",
  CREATE: "entree.create",
  UPDATE: "entree.update",
  DELETE: "entree.delete",
} as const;

export const SORTIE_ACCESS_CODES = {
  VIEW: "sortie.view",
  VIEW_LIST: "sorties.view",
  CREATE: "sortie.create",
  UPDATE: "sortie.update",
  DELETE: "sortie.delete",
} as const;

// Codes d'accès pour les rapports et statistiques
export const RAPPORT_ACCESS_CODES = {
  CREATE: "rapport.create",
} as const;

export const STATISTIQUE_ACCESS_CODES = {
  VIEW: "statistique.view",
} as const;

export const HISTORIQUE_ACCESS_CODES = {
  VIEW: "historique.view",
} as const;

/**
 * Service pour gérer les accès/permissions
 */
class AccessService {
  /**
   * Récupérer la liste de tous les accès disponibles
   */
  async getAllAccess(): Promise<ApiAccess[]> {
    try {
      const response = await apiClient.get<ApiAccess[]>("/Users/liste-acces");
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des accès:", error);
      throw error;
    }
  }

  /**
   * Récupérer les informations de l'utilisateur connecté (avec permissions)
   */
  async getCurrentUserInfo(): Promise<{
    user: Record<string, unknown>;
    permissions: UserPermission[];
  }> {
    try {
      const response = await apiClient.get<{
        permissions: UserPermission[];
        [key: string]: unknown;
      }>("/Users/authentication/user-info/");
      
      return {
        user: response.data,
        permissions: response.data.permissions || [],
      };
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des infos utilisateur:", error);
      throw error;
    }
  }

  /**
   * Vérifier si l'utilisateur a un accès spécifique
   */
  hasAccess(userPermissions: UserPermission[], accessCode: string): boolean {
    return userPermissions.some((p) => p.code === accessCode);
  }

  /**
   * Vérifier si l'utilisateur a au moins un des accès spécifiés
   */
  hasAnyAccess(userPermissions: UserPermission[], accessCodes: string[]): boolean {
    return accessCodes.some((code) => this.hasAccess(userPermissions, code));
  }

  /**
   * Vérifier si l'utilisateur a tous les accès spécifiés
   */
  hasAllAccess(userPermissions: UserPermission[], accessCodes: string[]): boolean {
    return accessCodes.every((code) => this.hasAccess(userPermissions, code));
  }

  /**
   * Tester les endpoints et afficher les résultats (pour debug)
   */
  async testAccessEndpoints(): Promise<void> {
    try {
      // 1. Récupérer tous les accès
      await this.getAllAccess();
      
      // 2. Récupérer les infos utilisateur avec permissions
      await this.getCurrentUserInfo();
      
    } catch (error) {
      console.error("❌ Erreur lors du test:", error);
    }
  }
}

export const accessService = new AccessService();
