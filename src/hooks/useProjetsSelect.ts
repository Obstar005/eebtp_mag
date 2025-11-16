import { useQuery } from "@tanstack/react-query";
import { projetApiService } from "../services/api/projetApiService";

/**
 * Hook pour récupérer la liste des projets pour les selects
 */
export function useProjetsSelect() {
  return useQuery({
    queryKey: ["projets-select"],
    queryFn: async () => {
      const response = await projetApiService.getProjets();
      // response.data contient les projets transformés avec le champ 'name'
      return response.data.map((projet) => ({
        id: projet.id,
        name: projet.name || "Projet sans nom",
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
