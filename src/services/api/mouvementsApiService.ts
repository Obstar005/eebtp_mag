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
   * - typeEntree: Type d'entrée (ex: "entree", "depot", etc.)
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
      console.error(
        "\n❌ ERREUR LORS DE L'APPEL API\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      );

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status: number;
            statusText: string;
            data: unknown;
            config: { url: string; method: string };
          };
        };

        const response = axiosError.response;
        if (response) {
          console.error(`   Status HTTP: ${response.status}`);
          console.error(`   Status Text: ${response.statusText}`);
          console.error(
            `   Méthode: ${response.config?.method?.toUpperCase()}`
          );
          console.error(`   URL: ${response.config?.url}`);
          console.error(`\n   Réponse d'erreur:`);
          console.error(JSON.stringify(response.data, null, 2));
        }
      } else if (error instanceof Error) {
        console.error(`   Message: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
      } else {
        console.error(`   Erreur inconnue:`, error);
      }

      console.error(
        "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      );

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
