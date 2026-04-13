import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stockService } from "../services/api";
import { stockApiService } from "../services/api/stockApiService";
import type {
  StockMovement,
  CreateStockMovementData,
  InventoryCheck,
  StockMovementFilter,
} from "../types";
import type { ApiUniteType } from "../types/api-stocks";

// Clés de requête pour le stock
export const stockKeys = {
  all: ["stock"] as const,
  movements: () => [...stockKeys.all, "movements"] as const,
  movementsList: (filter: StockMovementFilter) =>
    [...stockKeys.movements(), filter] as const,
  inventories: () => [...stockKeys.all, "inventories"] as const,
  reports: () => [...stockKeys.all, "reports"] as const,
  productStock: (productId: string) =>
    [...stockKeys.all, "product", productId] as const,
};

// Hook pour récupérer les mouvements de stock
export function useStockMovements(filter?: StockMovementFilter) {
  return useQuery({
    queryKey: stockKeys.movementsList(filter || {}),
    queryFn: () => stockService.getStockMovements(filter),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Hook pour créer un mouvement de stock
export function useCreateStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockMovementData) =>
      stockService.createStockMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.movements() });
      queryClient.invalidateQueries({ queryKey: stockKeys.reports() });
    },
  });
}

// Hook pour récupérer le stock d'un produit
export function useProductStock(productId: string) {
  return useQuery({
    queryKey: stockKeys.productStock(productId),
    queryFn: () => stockService.getProductStock(productId),
    enabled: !!productId,
  });
}

// Hook pour récupérer le rapport de stock
export function useStockReport() {
  return useQuery({
    queryKey: stockKeys.reports(),
    queryFn: () => stockService.getStockReport(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook pour récupérer les contrôles d'inventaire
export function useInventoryChecks() {
  return useQuery({
    queryKey: stockKeys.inventories(),
    queryFn: () => stockService.getInventoryChecks(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook pour créer un contrôle d'inventaire
export function useCreateInventoryCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Omit<InventoryCheck, "id" | "createdAt" | "updatedAt" | "items">
    ) => stockService.createInventoryCheck(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.inventories() });
    },
  });
}

// Hook pour terminer un contrôle d'inventaire
export function useCompleteInventoryCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockService.completeInventoryCheck(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.inventories() });
      queryClient.invalidateQueries({ queryKey: stockKeys.reports() });
    },
  });
}

// ==================== Nouveaux endpoints ====================

// Clés de requête pour les alertes et stats
export const stockAlertKeys = {
  belowThreshold: (projetId: number) =>
    ["stock", "alerts", "below-threshold", projetId] as const,
  statsByUnite: (magasinId: number, unite: ApiUniteType) =>
    ["stock", "stats", "unite", magasinId, unite] as const,
};

/**
 * Hook pour récupérer les articles en dessous du seuil de stock
 * Endpoint: GET /Stocks/articles-below-threshold/{projet_id}
 */
export function useArticlesBelowThreshold(projetId: number | null) {
  return useQuery({
    queryKey: stockAlertKeys.belowThreshold(projetId ?? 0),
    queryFn: () => {
      return stockApiService.getArticlesBelowThreshold(projetId!);
    },
    enabled: !!projetId && projetId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook pour récupérer les statistiques de stock par unité
 * Endpoint: GET /Stocks/stats/{magasin_id}/{unite}
 */
export function useStockStatsByUnite(
  magasinId: number | null,
  unite: ApiUniteType
) {
  return useQuery({
    queryKey: stockAlertKeys.statsByUnite(magasinId ?? 0, unite),
    queryFn: () => {
      return stockApiService.getStockStatsByUnite(magasinId!, unite);
    },
    enabled: !!magasinId && magasinId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
