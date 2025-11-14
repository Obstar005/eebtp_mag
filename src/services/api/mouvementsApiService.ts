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
      console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      );
      console.log("📊 MouvementsApiService.getFluctuationEntree()");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      console.log("\n🔹 PARAMÈTRES D'APPEL:");
      console.log(`   projet_id: ${projetId} (type: ${typeof projetId})`);
      console.log(`   type_entree: ${typeEntree}`);
      console.log(`   periode: ${periode}`);
      console.log(`   produit_id: ${produitId} (type: ${typeof produitId})`);

      const endpoint = `/Mouvements/graphe-fluctuations-entrees/${projetId}/${typeEntree}/${periode}/${produitId}`;
      console.log(`\n🌐 ENDPOINT APPELÉ:`);
      console.log(`   ${endpoint}`);

      const response = await apiClient.get(endpoint);

      console.log("\n✅ RÉPONSE REÇUE AVEC SUCCÈS");
      console.log(`   Status HTTP: ${response.status}`);
      console.log(`   Status Text: ${response.statusText}`);

      // Analyse de la structure
      console.log("\n📋 ANALYSE DE LA STRUCTURE:");
      console.log(`   Type de response.data: ${typeof response.data}`);
      console.log(`   Est un tableau? ${Array.isArray(response.data)}`);
      console.log(`   Longueur: ${Array.isArray(response.data) ? response.data.length : "N/A"}`);

      if (response.data) {
        if (typeof response.data === "object") {
          const keys = Array.isArray(response.data)
            ? []
            : Object.keys(response.data);
          console.log(`   Clés principales: ${keys.join(", ") || "(tableau)"}`);

          // Si c'est un tableau avec éléments
          if (Array.isArray(response.data) && response.data.length > 0) {
            console.log("\n📦 STRUCTURE DU PREMIER ÉLÉMENT:");
            const firstElement = response.data[0];
            console.log(`   Type: ${typeof firstElement}`);
            if (typeof firstElement === "object" && firstElement !== null) {
              console.log(`   Clés: ${Object.keys(firstElement).join(", ")}`);
              console.log(`   Contenu:`);
              console.log(JSON.stringify(firstElement, null, 4));
            } else {
              console.log(`   Valeur: ${firstElement}`);
            }
          }
          // Si c'est un objet simple
          else if (!Array.isArray(response.data)) {
            console.log("\n🏗️ STRUCTURE DE L'OBJET RETOURNÉ:");
            console.log(JSON.stringify(response.data, null, 4));
          }
        }
      }

      console.log("\n📊 DONNÉES COMPLÈTES:");
      console.log(JSON.stringify(response.data, null, 2));

      console.log(
        "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      );

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
          console.error(`   Méthode: ${response.config?.method?.toUpperCase()}`);
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
      console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      );
      console.log("📊 MouvementsApiService.getFluctuationSortie()");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      console.log("\n🔹 PARAMÈTRES D'APPEL:");
      console.log(`   projet_id: ${projetId}`);
      console.log(`   periode: ${periode}`);
      console.log(`   produit_id: ${produitId}`);

      const endpoint = `/Mouvements/graphe-fluctuations-sorties/${projetId}/${periode}/${produitId}`;
      console.log(`\n🌐 ENDPOINT APPELÉ: ${endpoint}`);

      const response = await apiClient.get(endpoint);

      console.log("\n✅ RÉPONSE REÇUE");
      console.log(`   Status: ${response.status}`);
      console.log(JSON.stringify(response.data, null, 2));

      console.log(
        "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      );

      return response.data;
    } catch (error) {
      console.error("❌ Erreur getFluctuationSortie:", error);
      throw error;
    }
  }
}

// Instance exportée
export const mouvementsApiService = new MouvementsApiService();
