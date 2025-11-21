// Service API pour l'historique des actions
import type {
  HistoriqueAction,
  PeriodeHistorique,
} from "../../types/historique";
import { apiClient as client } from "./client";

const basePath = "/App";

export const historiqueService = {
  // Récupérer l'historique de l'utilisateur connecté
  async getUserHistorique(
    periode: PeriodeHistorique
  ): Promise<HistoriqueAction[]> {
    try {
      const response = await client.get<HistoriqueAction[]>(
        `${basePath}/historique-user/${periode}`
      );
      return response.data || [];
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de l'historique utilisateur:",
        error
      );
      return [];
    }
  },

  // Récupérer l'historique de toutes les actions du système
  async getAllHistorique(): Promise<HistoriqueAction[]> {
    try {
      const response = await client.get<HistoriqueAction[]>(
        `${basePath}/historique-toutes-actions`
      );
      return response.data || [];
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de l'historique complet:",
        error
      );
      return [];
    }
  },
};
