/**
 * Hooks React Query pour la gestion des demandes
 * Basés sur le modèle useProjets.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { demandeService } from "../services/api/demandeService";
import type {
  DemandeFilter,
  PeriodeType,
} from "../services/api/demandeService";

// Clés de cache pour React Query
export const demandeKeys = {
  all: ["demandes"] as const,
  lists: () => [...demandeKeys.all, "list"] as const,
  list: (filters: DemandeFilter) => [...demandeKeys.lists(), filters] as const,
  details: () => [...demandeKeys.all, "detail"] as const,
  detail: (id: string) => [...demandeKeys.details(), id] as const,
  stats: () => [...demandeKeys.all, "stats"] as const,
};

// ==================== HOOKS DE LECTURE ====================

/**
 * Hook pour récupérer la liste des demandes avec filtres
 */
export function useDemandes(filters: DemandeFilter = {}) {
  return useQuery({
    queryKey: demandeKeys.list(filters),
    queryFn: () => demandeService.getDemandes(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (les demandes changent plus souvent que les projets)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour récupérer une demande spécifique par ID
 */
export function useDemande(id: string) {
  return useQuery({
    queryKey: demandeKeys.detail(id),
    queryFn: () => demandeService.getDemande(id),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!id, // Ne pas exécuter si l'ID est falsy
  });
}

/**
 * Hook pour récupérer les demandes par statut
 */
export function useDemandesByStatus(status: string) {
  return useQuery({
    queryKey: demandeKeys.list({ status }),
    queryFn: () => demandeService.getDemandesByStatus(status),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!status && status !== "tous",
  });
}

/**
 * Hook pour récupérer les statistiques des demandes
 */
export function useDemandeStats(periode: PeriodeType = "total") {
  return useQuery({
    queryKey: [...demandeKeys.stats(), periode],
    queryFn: () => demandeService.getDemandeStats(periode),
    staleTime: 5 * 60 * 1000, // 5 minutes pour les stats
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ==================== HOOKS DE MUTATION ====================

/**
 * Hook pour créer une nouvelle demande
 */
export function useCreateDemande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      stock_item_id: number;
      magasin_id: number;
      quantite: number;
      raison: string;
    }) => demandeService.createDemande(data),
    onSuccess: (newDemande) => {
      // Invalider et refetch les listes de demandes
      queryClient.invalidateQueries({ queryKey: demandeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: demandeKeys.stats() });

      // Mettre en cache la nouvelle demande
      queryClient.setQueryData(demandeKeys.detail(newDemande.id), newDemande);

      console.log("✅ Cache invalidé après création de demande");
    },
    onError: (error) => {
      console.error("❌ Erreur lors de la création de la demande:", error);
    },
  });
}

/**
 * Hook pour confirmer une demande
 */
export function useConfirmerDemande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif?: string }) =>
      demandeService.confirmerDemande(id, { motif }),
    onSuccess: (updatedDemande, variables) => {
      // Mettre à jour le cache de la demande spécifique
      queryClient.setQueryData(
        demandeKeys.detail(variables.id),
        updatedDemande
      );

      // Invalider les listes pour forcer une mise à jour
      queryClient.invalidateQueries({ queryKey: demandeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: demandeKeys.stats() });

      console.log("✅ Cache invalidé après confirmation de demande");
    },
    onError: (error) => {
      console.error("❌ Erreur lors de la confirmation de la demande:", error);
    },
  });
}

/**
 * Hook pour approuver une demande
 */
export function useApprouverDemande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif?: string }) =>
      demandeService.approuverDemande(id, { motif }),
    onSuccess: (updatedDemande, variables) => {
      // Mettre à jour le cache de la demande spécifique
      queryClient.setQueryData(
        demandeKeys.detail(variables.id),
        updatedDemande
      );

      // Invalider les listes pour forcer une mise à jour
      queryClient.invalidateQueries({ queryKey: demandeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: demandeKeys.stats() });

      console.log("✅ Cache invalidé après approbation de demande");
    },
    onError: (error) => {
      console.error("❌ Erreur lors de l'approbation de la demande:", error);
    },
  });
}

/**
 * Hook pour valider une demande
 */
export function useValiderDemande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif?: string }) =>
      demandeService.validerDemande(id, { motif }),
    onSuccess: (updatedDemande, variables) => {
      // Mettre à jour le cache de la demande spécifique
      queryClient.setQueryData(
        demandeKeys.detail(variables.id),
        updatedDemande
      );

      // Invalider les listes pour forcer une mise à jour
      queryClient.invalidateQueries({ queryKey: demandeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: demandeKeys.stats() });

      console.log("✅ Cache invalidé après validation de demande");
    },
    onError: (error) => {
      console.error("❌ Erreur lors de la validation de la demande:", error);
    },
  });
}

/**
 * Hook pour rejeter une demande
 */
export function useRejeterDemande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) =>
      demandeService.rejeterDemande(id, motif),
    onSuccess: (updatedDemande, variables) => {
      // Mettre à jour le cache de la demande spécifique
      queryClient.setQueryData(
        demandeKeys.detail(variables.id),
        updatedDemande
      );

      // Invalider les listes pour forcer une mise à jour
      queryClient.invalidateQueries({ queryKey: demandeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: demandeKeys.stats() });

      console.log("✅ Cache invalidé après rejet de demande");
    },
    onError: (error) => {
      console.error("❌ Erreur lors du rejet de la demande:", error);
    },
  });
}

/**
 * Hook générique pour traiter une demande
 */
export function useTraiterDemande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      action,
      motif,
    }: {
      id: string;
      action: "confirmer" | "approuver" | "valider" | "rejeter";
      motif?: string;
    }) => demandeService.traiterDemande(id, action, motif),
    onSuccess: (updatedDemande, variables) => {
      // Mettre à jour le cache de la demande spécifique
      queryClient.setQueryData(
        demandeKeys.detail(variables.id),
        updatedDemande
      );

      // Invalider les listes pour forcer une mise à jour
      queryClient.invalidateQueries({ queryKey: demandeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: demandeKeys.stats() });

      console.log(`✅ Cache invalidé après ${variables.action} de demande`);
    },
    onError: (error) => {
      console.error("❌ Erreur lors du traitement de la demande:", error);
    },
  });
}

// ==================== HOOKS COMPOSÉS ====================

/**
 * Hook pour récupérer toutes les demandes (sans pagination) - utile pour les sélecteurs
 */
export function useAllDemandes() {
  return useDemandes({}); // Sans limite spécifique
}

/**
 * Hook pour recherche en temps réel
 */
export function useDemandeSearch(searchTerm: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...demandeKeys.lists(), "search", searchTerm],
    queryFn: () => demandeService.getDemandes({ search: searchTerm }),
    staleTime: 30 * 1000, // 30 secondes pour la recherche
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: enabled && !!searchTerm && searchTerm.length >= 2,
  });
}

/**
 * Hook pour récupérer les demandes d'un magasin spécifique
 */
export function useDemandesByMagasin(
  magasinId: number,
  enabled: boolean = true
) {
  return useDemandes({
    magasin_id: magasinId,
  });
}
