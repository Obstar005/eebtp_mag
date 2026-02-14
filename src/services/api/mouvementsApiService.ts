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

      console.log(`🔍 API ENTREES: ${endpoint}`);

      const response = await apiClient.get(endpoint);

      console.log(`✅ REPONSE BRUTE API (sans transformation):`, response.data);
      console.log(`📊 Type de response.data:`, typeof response.data);
      console.log(`📊 Clés dans response.data:`, Object.keys(response.data || {}));
      console.log(`📦 response.data.donnees:`, response.data?.donnees);
      console.log(`📦 Type de donnees:`, Array.isArray(response.data?.donnees) ? 'array' : typeof response.data?.donnees);
      console.log(`📦 Longueur de donnees:`, response.data?.donnees?.length);
      
      // Log complet de la structure JSON
      console.log(`🔍 JSON.stringify de la réponse complète:`, JSON.stringify(response.data, null, 2));

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

      console.log(`🔍 API SORTIES: ${endpoint}`);

      const response = await apiClient.get(endpoint);

      console.log(`✅ REPONSE:`, response.data);
      console.log(`📊 Clés:`, Object.keys(response.data || {}));
      console.log(`📦 Donnees:`, response.data?.donnees);

      return response.data;
    } catch (error) {
      console.error("❌ Erreur getFluctuationSortie:", error);
      throw error;
    }
  }
}

// Instance exportée
export const mouvementsApiService = new MouvementsApiService();
