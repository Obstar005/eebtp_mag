import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { declarationService } from "../services/api/declarationService";
import type {
  CreateDeclarationData,
  UpdateDeclarationData,
  DeclarationFilter,
  PeriodeType,
} from "../types/declaration";

// Clés de requête pour les déclarations
export const declarationKeys = {
  all: ["declarations"] as const,
  lists: () => [...declarationKeys.all, "list"] as const,
  list: (magasinId: number, filter: DeclarationFilter) =>
    [...declarationKeys.lists(), magasinId, filter] as const,
  details: () => [...declarationKeys.all, "detail"] as const,
  detail: (id: number) => [...declarationKeys.details(), id] as const,
  stats: (magasinId: number) =>
    [...declarationKeys.all, "stats", magasinId] as const,
};

// Hook pour récupérer les déclarations d'un magasin
export function useDeclarations(
  magasinId: number,
  filter: DeclarationFilter = {}
) {
  return useQuery({
    queryKey: declarationKeys.list(magasinId, filter),
    queryFn: () => declarationService.getDeclarations(magasinId, filter),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!magasinId,
  });
}

// Hook pour récupérer une déclaration par ID
export function useDeclaration(id: number) {
  return useQuery({
    queryKey: declarationKeys.detail(id),
    queryFn: () => declarationService.getDeclaration(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
}

// Hook pour créer une déclaration
export function useCreateDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeclarationData) =>
      declarationService.createDeclaration(data),
    onSuccess: (newDeclaration) => {
      // Invalider la liste des déclarations du magasin
      queryClient.invalidateQueries({
        queryKey: declarationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: declarationKeys.stats(newDeclaration.magasin_id),
      });
    },
  });
}

// Hook pour mettre à jour une déclaration
export function useUpdateDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDeclarationData) =>
      declarationService.updateDeclaration(data),
    onSuccess: (updatedDeclaration) => {
      // Invalider la liste des déclarations
      queryClient.invalidateQueries({
        queryKey: declarationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: declarationKeys.detail(updatedDeclaration.id),
      });
      queryClient.invalidateQueries({
        queryKey: declarationKeys.stats(updatedDeclaration.magasin_id),
      });
    },
  });
}

// Hook pour supprimer une déclaration
export function useDeleteDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => declarationService.deleteDeclaration(id),
    onSuccess: () => {
      // Invalider toutes les listes de déclarations
      queryClient.invalidateQueries({
        queryKey: declarationKeys.all,
      });
    },
  });
}

// Hook pour les statistiques des déclarations
export function useDeclarationStats(
  magasinId: number,
  periode: PeriodeType = "total"
) {
  return useQuery({
    queryKey: [...declarationKeys.stats(magasinId), periode],
    queryFn: () => declarationService.getDeclarationStats(magasinId, periode),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!magasinId,
  });
}
