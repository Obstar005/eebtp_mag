import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/api/client";

// Types pour les statistiques du dashboard
export interface DashboardStats {
  total_users: number;
  connected_users: number;
  total_profiles: number;
}

// Clés de requête pour React Query
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
};

// Service pour récupérer les stats du dashboard
async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await apiClient.get<DashboardStats>(
      "/Users/Profiles-stats",
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des stats dashboard:",
      error,
    );
    throw error;
  }
}

// Hook pour récupérer les statistiques du dashboard
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes
  });
}
