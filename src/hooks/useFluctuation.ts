import { useQuery } from "@tanstack/react-query";
import { mouvementsApiService } from "../services/api";
import type {
  FluctuationEntreeResponse,
  FluctuationSortieResponse,
  ProcessedFluctuationData,
  FluctuationParams,
  FluctuationDataPoint,
} from "../types/fluctuation";

/**
 * Traiter les données API pour les afficher dans le graphique
 */
function processFluctuationData(
  data: FluctuationDataPoint[]
): ProcessedFluctuationData {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log("⚠️ Données vides ou invalides");
    return {
      labels: [],
      values: [],
      min: 0,
      max: 0,
      average: 0,
      total: 0,
      dataPoints: [],
    };
  }

  const values = data.map((d) => d.quantite_totale);
  const labels = data.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  });

  const result = {
    labels,
    values,
    min: Math.min(...values),
    max: Math.max(...values),
    average: values.reduce((a, b) => a + b, 0) / values.length,
    total: values.reduce((a, b) => a + b, 0),
    dataPoints: data,
  };

  console.log(`✅ Traité: ${data.length} points, Total: ${result.total}`);

  return result;
}

/**
 * Hook pour récupérer les données de fluctuation d'entrées
 */
export function useFluctuationEntrees(params: FluctuationParams | null) {
  return useQuery({
    queryKey: ["fluctuation-entrees", params],
    queryFn: async () => {
      if (!params) throw new Error("Paramètres manquants");

      const response = (await mouvementsApiService.getFluctuationEntree(
        params.projetId,
        params.typeEntree || "entree",
        params.periode,
        params.produitId
      )) as FluctuationEntreeResponse;

      // Extraire les données
      let donnees: FluctuationDataPoint[] = [];

      if (response && typeof response === "object") {
        if ("donnees" in response && Array.isArray(response.donnees)) {
          donnees = response.donnees;
        } else if (Array.isArray(response)) {
          donnees = response as unknown as FluctuationDataPoint[];
        }
      }

      return processFluctuationData(donnees);
    },
    enabled: !!params,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour récupérer les données de fluctuation de sorties
 */
export function useFluctuationSorties(params: FluctuationParams | null) {
  return useQuery({
    queryKey: ["fluctuation-sorties", params],
    queryFn: async () => {
      if (!params) throw new Error("Paramètres manquants");

      const response = (await mouvementsApiService.getFluctuationSortie(
        params.projetId,
        params.periode,
        params.produitId
      )) as FluctuationSortieResponse;

      // Extraire les données
      let donnees: FluctuationDataPoint[] = [];

      if (response && typeof response === "object") {
        if ("donnees" in response && Array.isArray(response.donnees)) {
          donnees = response.donnees;
        } else if (Array.isArray(response)) {
          donnees = response as unknown as FluctuationDataPoint[];
        }
      }

      return processFluctuationData(donnees);
    },
    enabled: !!params,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
