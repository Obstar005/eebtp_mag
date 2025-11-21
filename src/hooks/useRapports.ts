import { useMutation } from "@tanstack/react-query";
import rapportService from "../services/api/rapportService";

/**
 * Hook pour générer un rapport PDF des stocks d'un projet
 */
export function useGenererRapportPDF() {
  return useMutation({
    mutationFn: ({
      projetId,
      nomProjet,
    }: {
      projetId: number;
      nomProjet?: string;
    }) => rapportService.telechargerRapportStocksPDF(projetId, nomProjet),
  });
}
