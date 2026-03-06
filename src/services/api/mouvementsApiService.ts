import { apiClient } from "./client";

/**
 * Service pour gérer les appels API liés aux mouvements de stock
 */
export class MouvementsApiService {
  /**
   * Récupérer les données de fluctuation d'entrée pour un graphique
   * Endpoint: GET /Mouvements/graphe-fluctuations-entrees/{projet_id}/{type_entree}/{periode}/{produit_id}
   *
   * Paramètres:
   * - projetId: ID du projet
   * - typeEntree: Type d'entrée (ex: "livraison", "depot", etc.)
   * - periode: Période (jour, semaine, mois, total)
   * - produitId: ID du produit
   */
  async getFluctuationEntree(
    projetId: string | number,
    typeEntree: string,
    periode: string,
    produitId: string | number
  ): Promise<unknown> {
    try {
      const endpoint = `/Mouvements/graphe-fluctuations-entrees/${projetId}/${typeEntree}/${periode}/${produitId}`;

      const response = await apiClient.get(endpoint);
      
      return response.data;
    } catch (error) {
      console.error(`❌ ERREUR API ENTREES:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les données de fluctuation de sortie pour un graphique
   * Endpoint: GET /Mouvements/graphe-fluctuations-sorties/{projet_id}/{periode}/{produit_id}
   */
  async getFluctuationSortie(
    projetId: string | number,
    periode: string,
    produitId: string | number
  ): Promise<unknown> {
    try {
      const endpoint = `/Mouvements/graphe-fluctuations-sorties/${projetId}/${periode}/${produitId}`;

      const response = await apiClient.get(endpoint);

      return response.data;
    } catch (error) {
      console.error("❌ Erreur getFluctuationSortie:", error);
      throw error;
    }
  }
}

// Instance exportée
export const mouvementsApiService = new MouvementsApiService();
