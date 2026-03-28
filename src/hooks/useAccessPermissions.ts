import { useQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  accessService,
  DEMANDE_ACCESS_CODES,
  STOCK_ACCESS_CODES,
  ARTICLE_ACCESS_CODES,
  MAGASIN_ACCESS_CODES,
  PROJET_ACCESS_CODES,
  USER_ACCESS_CODES,
  PROFIL_ACCESS_CODES,
  ENTREE_ACCESS_CODES,
  SORTIE_ACCESS_CODES,
  RAPPORT_ACCESS_CODES,
  STATISTIQUE_ACCESS_CODES,
  HISTORIQUE_ACCESS_CODES,
} from "../services/api/accessService";
import {
  getAvailableTreatmentActionsWithAccess,
  canUserTreatRequestWithAccess,
  type AvailableAction,
} from "../utils/permissions";

// Export des codes d'accès pour utilisation externe
export {
  DEMANDE_ACCESS_CODES,
  STOCK_ACCESS_CODES,
  ARTICLE_ACCESS_CODES,
  MAGASIN_ACCESS_CODES,
  PROJET_ACCESS_CODES,
  USER_ACCESS_CODES,
  PROFIL_ACCESS_CODES,
  ENTREE_ACCESS_CODES,
  SORTIE_ACCESS_CODES,
  RAPPORT_ACCESS_CODES,
  STATISTIQUE_ACCESS_CODES,
  HISTORIQUE_ACCESS_CODES,
};

// Clés de requête pour React Query
export const accessKeys = {
  all: ["access"] as const,
  list: () => [...accessKeys.all, "list"] as const,
  userPermissions: () => [...accessKeys.all, "user-permissions"] as const,
};

/**
 * Hook pour récupérer la liste de tous les accès disponibles
 */
export function useAllAccess() {
  return useQuery({
    queryKey: accessKeys.list(),
    queryFn: () => accessService.getAllAccess(),
    staleTime: 30 * 60 * 1000, // 30 minutes - les accès changent rarement
  });
}

/**
 * Hook pour récupérer les permissions de l'utilisateur connecté
 */
export function useUserPermissions() {
  return useQuery({
    queryKey: accessKeys.userPermissions(),
    queryFn: async () => {
      const { permissions } = await accessService.getCurrentUserInfo();
      return permissions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook principal pour la gestion des accès/permissions
 * Combine les permissions utilisateur avec des helpers de vérification
 */
export function useAccess() {
  const { user } = useAuth();
  const { data: permissions = [], isLoading, error } = useUserPermissions();

  // Vérifier si l'utilisateur a un accès spécifique
  const hasAccess = useCallback(
    (accessCode: string): boolean => {
      return permissions.some((p) => p.code === accessCode);
    },
    [permissions]
  );

  // Vérifier si l'utilisateur a au moins un des accès
  const hasAnyAccess = useCallback(
    (accessCodes: string[]): boolean => {
      return accessCodes.some((code) => hasAccess(code));
    },
    [hasAccess]
  );

  // Vérifier si l'utilisateur a tous les accès
  const hasAllAccess = useCallback(
    (accessCodes: string[]): boolean => {
      return accessCodes.every((code) => hasAccess(code));
    },
    [hasAccess]
  );

  // Permissions spécifiques pour les demandes
  const demandePermissions = useMemo(
    () => {
      const result = {
        canView: hasAccess(DEMANDE_ACCESS_CODES.VIEW),
        canCreate: hasAccess(DEMANDE_ACCESS_CODES.CREATE),
        canUpdate: hasAccess(DEMANDE_ACCESS_CODES.UPDATE),
        canDelete: hasAccess(DEMANDE_ACCESS_CODES.DELETE),
        canConfirm: hasAccess(DEMANDE_ACCESS_CODES.CONFIRM),
        canApprove: hasAccess(DEMANDE_ACCESS_CODES.APPROVE),
        canValidate: hasAccess(DEMANDE_ACCESS_CODES.VALIDATE),
      };
      
      return result;
    },
    [hasAccess, permissions]
  );

  // Permissions pour les stocks
  const stockPermissions = useMemo(
    () => ({
      canView: hasAccess(STOCK_ACCESS_CODES.VIEW),
      canCreate: hasAccess(STOCK_ACCESS_CODES.CREATE),
      canUpdate: hasAccess(STOCK_ACCESS_CODES.UPDATE),
      canDelete: hasAccess(STOCK_ACCESS_CODES.DELETE),
    }),
    [hasAccess]
  );

  // Permissions pour les articles
  const articlePermissions = useMemo(
    () => ({
      canView: hasAccess(ARTICLE_ACCESS_CODES.VIEW),
      canCreate: hasAccess(ARTICLE_ACCESS_CODES.CREATE),
      canUpdate: hasAccess(ARTICLE_ACCESS_CODES.UPDATE),
      canDelete: hasAccess(ARTICLE_ACCESS_CODES.DELETE),
    }),
    [hasAccess]
  );

  // Permissions pour les magasins
  const magasinPermissions = useMemo(
    () => ({
      canView: hasAccess(MAGASIN_ACCESS_CODES.VIEW),
      canCreate: hasAccess(MAGASIN_ACCESS_CODES.CREATE),
      canUpdate: hasAccess(MAGASIN_ACCESS_CODES.UPDATE),
      canDelete: hasAccess(MAGASIN_ACCESS_CODES.DELETE),
    }),
    [hasAccess]
  );

  // Permissions pour les projets
  const projetPermissions = useMemo(
    () => ({
      canView: hasAccess(PROJET_ACCESS_CODES.VIEW),
      canCreate: hasAccess(PROJET_ACCESS_CODES.CREATE),
      canUpdate: hasAccess(PROJET_ACCESS_CODES.UPDATE),
      canDelete: hasAccess(PROJET_ACCESS_CODES.DELETE),
    }),
    [hasAccess]
  );

  // Permissions pour les utilisateurs
  const userPermissionsAccess = useMemo(
    () => ({
      canView: hasAccess(USER_ACCESS_CODES.VIEW),
      canCreate: hasAccess(USER_ACCESS_CODES.CREATE),
      canUpdate: hasAccess(USER_ACCESS_CODES.UPDATE),
      canDelete: hasAccess(USER_ACCESS_CODES.DELETE),
    }),
    [hasAccess]
  );

  // Permissions pour les profils
  const profilPermissions = useMemo(
    () => ({
      canView: hasAccess(PROFIL_ACCESS_CODES.VIEW),
      canCreate: hasAccess(PROFIL_ACCESS_CODES.CREATE),
      canUpdate: hasAccess(PROFIL_ACCESS_CODES.UPDATE),
      canDelete: hasAccess(PROFIL_ACCESS_CODES.DELETE),
    }),
    [hasAccess]
  );

  // Permissions pour les mouvements (entrées/sorties)
  const mouvementPermissions = useMemo(
    () => ({
      entree: {
        canView: hasAccess(ENTREE_ACCESS_CODES.VIEW),
        canCreate: hasAccess(ENTREE_ACCESS_CODES.CREATE),
        canUpdate: hasAccess(ENTREE_ACCESS_CODES.UPDATE),
        canDelete: hasAccess(ENTREE_ACCESS_CODES.DELETE),
      },
      sortie: {
        canView: hasAccess(SORTIE_ACCESS_CODES.VIEW),
        canCreate: hasAccess(SORTIE_ACCESS_CODES.CREATE),
        canUpdate: hasAccess(SORTIE_ACCESS_CODES.UPDATE),
        canDelete: hasAccess(SORTIE_ACCESS_CODES.DELETE),
      },
    }),
    [hasAccess]
  );

  // Permissions pour les statistiques
  const statistiquePermissions = useMemo(
    () => ({
      canView: hasAccess(STATISTIQUE_ACCESS_CODES.VIEW),
    }),
    [hasAccess]
  );

  // Permissions pour l'historique
  const historiquePermissions = useMemo(
    () => ({
      canView: hasAccess(HISTORIQUE_ACCESS_CODES.VIEW),
    }),
    [hasAccess]
  );

  // Permissions pour les rapports
  const rapportPermissions = useMemo(
    () => ({
      canCreate: hasAccess(RAPPORT_ACCESS_CODES.CREATE),
    }),
    [hasAccess]
  );

  // Fonction pour obtenir les actions de traitement disponibles pour une demande
  const getDemandeActions = useCallback(
    (requestStatus: string): AvailableAction[] => {
      return getAvailableTreatmentActionsWithAccess(permissions, requestStatus);
    },
    [permissions]
  );

  // Fonction pour vérifier si l'utilisateur peut traiter une demande
  const canTreatDemande = useCallback(
    (requestStatus: string): boolean => {
      return canUserTreatRequestWithAccess(permissions, requestStatus);
    },
    [permissions]
  );

  return {
    // Données brutes
    permissions,
    isLoading,
    error,
    user,

    // Fonctions de vérification génériques
    hasAccess,
    hasAnyAccess,
    hasAllAccess,

    // Fonctions pour le traitement des demandes
    getDemandeActions,
    canTreatDemande,

    // Permissions par module
    demande: demandePermissions,
    stock: stockPermissions,
    article: articlePermissions,
    magasin: magasinPermissions,
    projet: projetPermissions,
    userAccess: userPermissionsAccess,
    profil: profilPermissions,
    mouvement: mouvementPermissions,
    statistique: statistiquePermissions,
    historique: historiquePermissions,
    rapport: rapportPermissions,
  };
}

/**
 * Hook pour tester les endpoints d'accès (pour debug)
 */
export function useTestAccess() {
  const runTest = useCallback(async () => {
    await accessService.testAccessEndpoints();
  }, []);

  return { runTest };
}
