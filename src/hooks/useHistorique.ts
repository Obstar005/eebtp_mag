// Hook pour gérer l'historique des actions
import { useQuery } from "@tanstack/react-query";
import type { PeriodeHistorique } from "../types/historique";
import { historiqueService } from "../services/api/historiqueApiService";

// Clés de cache pour React Query
const historiqueKeys = {
  all: ["historique"] as const,
  userHistorique: (periode: PeriodeHistorique) =>
    [...historiqueKeys.all, "user", periode] as const,
  allHistorique: () => [...historiqueKeys.all, "all"] as const,
};

/**
 * Hook pour récupérer l'historique de l'utilisateur connecté
 * @param periode Période à récupérer: 'jour', 'semaine', 'mois', 'total'
 * @returns Données d'historique avec état de chargement
 */
export function useUserHistorique(periode: PeriodeHistorique = "total") {
  return useQuery({
    queryKey: historiqueKeys.userHistorique(periode),
    queryFn: () => historiqueService.getUserHistorique(periode),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook pour récupérer l'historique complet du système
 * @returns Données d'historique complet avec état de chargement
 */
export function useAllHistorique() {
  return useQuery({
    queryKey: historiqueKeys.allHistorique(),
    queryFn: () => historiqueService.getAllHistorique(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
