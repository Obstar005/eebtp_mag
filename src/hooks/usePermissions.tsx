// Hook personnalisé pour gérer les permissions utilisateur

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  checkUserPermission,
  getUserPermissions,
  canUserTreatRequest,
  getAvailableTreatmentActions,
} from "../utils/permissions";
import type { ProfilePermissions, AvailableAction } from "../utils/permissions";

/**
 * Hook personnalisé pour gérer les permissions de l'utilisateur connecté
 */
export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<ProfilePermissions | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les permissions au montage du composant ou changement d'utilisateur
  useEffect(() => {
    if (user) {
      loadPermissions();
    } else {
      setPermissions(null);
      setError(null);
    }
  }, [user]);

  const loadPermissions = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const userPermissions = await getUserPermissions(user);
      setPermissions(userPermissions);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des permissions";
      setError(errorMessage);
      console.error("Erreur lors du chargement des permissions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  const hasPermission = async (
    permission: keyof ProfilePermissions["permissions"]
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      return await checkUserPermission(user, permission);
    } catch (err) {
      console.error(
        `Erreur lors de la vérification de la permission ${permission}:`,
        err
      );
      return false;
    }
  };

  /**
   * Vérifie si l'utilisateur peut traiter une demande dans un état donné
   */
  const canTreatRequest = async (requestStatus: string): Promise<boolean> => {
    if (!user) return false;

    try {
      return await canUserTreatRequest(user, requestStatus);
    } catch (err) {
      console.error(
        "Erreur lors de la vérification de traitement de demande:",
        err
      );
      return false;
    }
  };

  /**
   * Récupère les actions de traitement disponibles pour un état de demande
   */
  const getAvailableActions = async (
    requestStatus: string
  ): Promise<AvailableAction[]> => {
    if (!user) return [];

    try {
      return await getAvailableTreatmentActions(user, requestStatus);
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des actions disponibles:",
        err
      );
      return [];
    }
  };

  /**
   * Recharge les permissions depuis l'API
   */
  const refreshPermissions = () => {
    loadPermissions();
  };

  return {
    // État
    permissions,
    isLoading,
    error,
    user,
    isAuthenticated: !!user,

    // Méthodes de vérification
    hasPermission,
    canTreatRequest,
    getAvailableActions,
    refreshPermissions,

    // Raccourcis pour les permissions communes
    canConfirmRequests: permissions?.permissions.canConfirmRequest ?? false,
    canApproveRequests: permissions?.permissions.canApproveRequest ?? false,
    canValidateRequests: permissions?.permissions.canValidateRequest ?? false,
    canRejectRequests: permissions?.permissions.canRejectRequest ?? false,
    canManageStock: permissions?.permissions.canManageStock ?? false,
    canCreateEntry: permissions?.permissions.canCreateEntry ?? false,
    canCreateExit: permissions?.permissions.canCreateExit ?? false,
    canManageUsers: permissions?.permissions.canManageUsers ?? false,
    canManageProfiles: permissions?.permissions.canManageProfiles ?? false,
    canAccessAdminPanel: permissions?.permissions.canAccessAdminPanel ?? false,
    canViewReports: permissions?.permissions.canViewReports ?? false,
    canExportData: permissions?.permissions.canExportData ?? false,
  };
}

/**
 * Hook pour vérifier une permission spécifique de manière synchrone
 * Utilise les permissions déjà chargées
 */
export function usePermissionCheck(
  permission: keyof ProfilePermissions["permissions"]
) {
  const { permissions } = usePermissions();
  return permissions?.permissions[permission] ?? false;
}

/**
 * Hook pour récupérer les actions de traitement disponibles pour un état de demande
 */
export function useTreatmentActions(requestStatus: string) {
  const { user } = useAuth();
  const [actions, setActions] = useState<AvailableAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadActions = async () => {
      if (!user) {
        setActions([]);
        return;
      }

      setIsLoading(true);
      try {
        const availableActions = await getAvailableTreatmentActions(
          user,
          requestStatus
        );
        setActions(availableActions);
      } catch (err) {
        console.error("Erreur lors du chargement des actions:", err);
        setActions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadActions();
  }, [user, requestStatus]);

  return {
    actions,
    isLoading,
    hasActions: actions.length > 0,
    canTreat: actions.length > 0,
  };
}

/**
 * Hook pour créer des composants conditionnels basés sur les permissions
 */
export function useConditionalRender() {
  const permissions = usePermissions();

  const renderIfPermission = (
    permission: keyof ProfilePermissions["permissions"],
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    if (permissions.isLoading) {
      return <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>;
    }

    const hasPermission =
      permissions.permissions?.permissions[permission] ?? false;
    return hasPermission ? component : fallback ?? null;
  };

  const renderIfAuthenticated = (
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return permissions.isAuthenticated ? component : fallback ?? null;
  };

  const renderIfRole = (
    requiredProfils: string[],
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    const userProfil = permissions.user?.profil;
    const hasProfil = userProfil && requiredProfils.includes(userProfil);
    return hasProfil ? component : fallback ?? null;
  };

  return {
    renderIfPermission,
    renderIfAuthenticated,
    renderIfRole,
    ...permissions,
  };
}
