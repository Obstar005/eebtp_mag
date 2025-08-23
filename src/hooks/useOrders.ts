import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/api";
import type { PurchaseOrder, OrderFilter } from "../types";

// Clés de requête pour les commandes
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filter: OrderFilter) => [...orderKeys.lists(), filter] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  alerts: ["alerts"] as const,
  dashboard: ["dashboard"] as const,
};

// Hook pour récupérer les commandes
export function usePurchaseOrders(filter?: OrderFilter) {
  return useQuery({
    queryKey: orderKeys.list(filter || {}),
    queryFn: () => orderService.getPurchaseOrders(filter),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook pour récupérer une commande par ID
export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderService.getPurchaseOrder(id),
    enabled: !!id,
  });
}

// Hook pour créer une commande
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<PurchaseOrder, "id" | "createdAt" | "updatedAt">) =>
      orderService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

// Hook pour confirmer une commande
export function useConfirmPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.confirmPurchaseOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

// Hook pour recevoir une commande
export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      items,
    }: {
      id: string;
      items: { itemId: string; receivedQuantity: number }[];
    }) => orderService.receivePurchaseOrder(id, items),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

// Hook pour récupérer les alertes de stock
export function useStockAlerts() {
  return useQuery({
    queryKey: orderKeys.alerts,
    queryFn: () => orderService.getStockAlerts(),
    staleTime: 30 * 1000, // 30 secondes
  });
}

// Hook pour marquer une alerte comme lue
export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.markAlertAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.alerts });
    },
  });
}

// Hook pour récupérer les statistiques du dashboard
export function useDashboardStats() {
  return useQuery({
    queryKey: orderKeys.dashboard,
    queryFn: () => orderService.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
