/**
 * Service API pour la gestion des demandes
 * Utilise les endpoints /Demandes/* de l'API EEBTP_MAG v3.7
 */

import { apiClient } from "./client";
import type {
  ApiDemande,
  ApiCreateDemandeRequest,
  ApiApprouverDemandeRequest,
  ApiConfirmerDemandeRequest,
  ApiValiderDemandeRequest,
  ApiRejeterDemandeRequest,
  ApiDemandeStats,
} from "../../types/api-demandes";
import { mockApiDemandes, mockDemandeStats } from "../../data/mockDemandes";

export class DemandeApiService {
  private basePath = "/Demandes";

  // ==================== RÉCUPÉRATION DES DEMANDES ====================

  /**
   * Récupérer toutes les demandes
   * GET /Demandes/demandes/toutes
   */
  async getAllDemandes(): Promise<ApiDemande[]> {
    // Pour le développement, utiliser les données mockées
    // TODO: Remplacer par l'API réelle une fois l'authentification configurée
    // console.log("🔄 Utilisation des données mockées pour le développement");
    // return mockApiDemandes;

    try {
      console.log("📋 Récupération de toutes les demandes...");

      const response = await apiClient.get<ApiDemande[]>(
        `${this.basePath}/demandes/toutes`
      );

      console.log("✅ Demandes récupérées:", response.data.length);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des demandes:", error);
      console.warn("🔄 Utilisation des données mockées en fallback");
      return mockApiDemandes;
    }
  }

  /**
   * Récupérer les demandes par statut
   */
  async getDemandesByStatus(
    status:
      | "emises"
      | "confirmees"
      | "approuvees"
      | "validees"
      | "rejetees"
      | "livrees"
      | "en-attente-validation"
  ): Promise<ApiDemande[]> {
    try {
      console.log(`📋 Récupération des demandes ${status}...`);

      const response = await apiClient.get<ApiDemande[]>(
        `${this.basePath}/demandes/${status}`
      );

      console.log(`✅ Demandes ${status} récupérées:`, response.data.length);
      return response.data;
    } catch (error) {
      console.error(
        `❌ Erreur lors de la récupération des demandes ${status}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Récupérer une demande par ID
   * GET /Demandes/demande/detail/{id}
   */
  async getDemandeById(id: number): Promise<ApiDemande> {
    try {
      console.log("📦 Récupération de la demande:", id);

      const response = await apiClient.get<ApiDemande>(
        `${this.basePath}/demande/detail/${id}`
      );

      console.log("✅ Demande récupérée:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de la demande:", error);
      throw error;
    }
  }

  // ==================== CRÉATION ET MODIFICATION ====================

  /**
   * Émettre une nouvelle demande
   * POST /Demandes/demande/emettre
   */
  async createDemande(data: ApiCreateDemandeRequest): Promise<ApiDemande> {
    try {
      console.log("📤 Émission d'une nouvelle demande:", data);

      const response = await apiClient.post<ApiDemande>(
        `${this.basePath}/demande/emettre`,
        data
      );

      console.log("✅ Demande émise avec succès:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de l'émission de la demande:", error);
      throw error;
    }
  }

  // ==================== ACTIONS SUR LES DEMANDES ====================

  /**
   * Confirmer une demande (par un chef appro ou supérieur autorisé)
   * POST /Demandes/demande/confirmer/{id}
   */
  async confirmerDemande(
    id: number,
    data?: ApiConfirmerDemandeRequest
  ): Promise<ApiDemande> {
    try {
      console.log("✅ Confirmation de la demande:", id);

      const response = await apiClient.post<ApiDemande>(
        `${this.basePath}/demande/confirmer/${id}`,
        data || {}
      );

      // Validation de la réponse
      if (!response.data || !response.data.id) {
        console.warn(
          "⚠️ Réponse API incomplète pour confirmation:",
          response.data
        );
        // En cas de réponse incomplète, récupérer la demande mise à jour
        return await this.getDemandeById(id);
      }

      console.log("✅ Demande confirmée avec succès:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la confirmation de la demande:", error);
      throw error;
    }
  }

  /**
   * Approuver une demande (par DT, DTX ou supérieur autorisé)
   * POST /Demandes/demande/approuver/{id}
   */
  async approuverDemande(
    id: number,
    data?: ApiApprouverDemandeRequest
  ): Promise<ApiDemande> {
    try {
      console.log("✅ Approbation de la demande:", id);

      const response = await apiClient.post<ApiDemande>(
        `${this.basePath}/demande/approuver/${id}`,
        data || {}
      );

      // Validation de la réponse
      if (!response.data || !response.data.id) {
        console.warn(
          "⚠️ Réponse API incomplète pour approbation:",
          response.data
        );
        return await this.getDemandeById(id);
      }

      console.log("✅ Demande approuvée avec succès:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de l'approbation de la demande:", error);
      throw error;
    }
  }

  /**
   * Valider une demande
   * POST /Demandes/demande/valider/{id}
   */
  async validerDemande(
    id: number,
    data?: ApiValiderDemandeRequest
  ): Promise<ApiDemande> {
    try {
      console.log("✅ Validation de la demande:", id);

      const response = await apiClient.post<ApiDemande>(
        `${this.basePath}/demande/valider/${id}`,
        data || {}
      );

      // Validation de la réponse
      if (!response.data || !response.data.id) {
        console.warn(
          "⚠️ Réponse API incomplète pour validation:",
          response.data
        );
        return await this.getDemandeById(id);
      }

      console.log("✅ Demande validée avec succès:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la validation de la demande:", error);
      throw error;
    }
  }

  /**
   * Rejeter une demande (par DGA, DF ou DG)
   * POST /Demandes/demande/rejeter/{id}
   */
  async rejeterDemande(
    id: number,
    data: ApiRejeterDemandeRequest
  ): Promise<ApiDemande> {
    try {
      console.log("❌ Rejet de la demande:", id, data);

      const response = await apiClient.post<ApiDemande>(
        `${this.basePath}/demande/rejeter/${id}`,
        data
      );

      // Validation de la réponse
      if (!response.data || !response.data.id) {
        console.warn("⚠️ Réponse API incomplète pour rejet:", response.data);
        return await this.getDemandeById(id);
      }

      console.log("✅ Demande rejetée avec succès:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors du rejet de la demande:", error);
      throw error;
    }
  }

  // ==================== STATISTIQUES ====================

  /**
   * Récupérer les statistiques des demandes
   * GET /Demandes/demandes/statistiques/{periode}
   */
  async getDemandeStats(periode: string = "total"): Promise<ApiDemandeStats> {
    try {
      console.log(
        `📊 Récupération des statistiques des demandes pour la période: ${periode}`
      );

      const response = await apiClient.get<ApiDemandeStats>(
        `${this.basePath}/demandes/statistiques/${periode}`
      );

      console.log("✅ Statistiques récupérées:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des statistiques:",
        error
      );
      console.warn("🔄 Utilisation des statistiques mockées en fallback");
      return mockDemandeStats;
    }
  }

  // ==================== MÉTHODES HELPER ====================

  /**
   * Récupérer les demandes avec un filtre personnalisé
   */
  async getDemandesFiltered(filters: {
    status?: string;
    magasin_id?: number;
    stock_item_id?: number;
    date_from?: string;
    date_to?: string;
    periode?: string;
  }): Promise<ApiDemande[]> {
    console.log("📋 Récupération des demandes avec filtres:", filters);

    // Si on a un statut et une période, utiliser l'endpoint avec période
    if (filters.status && filters.status !== "tous" && filters.periode) {
      try {
        const statusEndpointMap: Record<string, string> = {
          emis: "emises",
          confirme: "confirmees",
          approuve: "approuvees",
          valide: "validees",
          refuse: "rejetees",
          livre: "livrees",
        };

        const endpointStatus = statusEndpointMap[filters.status];
        if (endpointStatus) {
          console.log(
            `📋 Utilisation de l'endpoint avec période: ${endpointStatus}/${filters.periode}`
          );
          const response = await apiClient.get<ApiDemande[]>(
            `${this.basePath}/demandes/${endpointStatus}/${filters.periode}`
          );
          return response.data;
        }
      } catch (error) {
        console.warn(
          "⚠️ Erreur avec l'endpoint de période, fallback vers toutes les demandes:",
          error
        );
      }
    }

    // Si on a seulement une période (sans statut), utiliser l'endpoint "toutes" avec période
    if (filters.periode && (!filters.status || filters.status === "tous")) {
      try {
        console.log(
          `📋 Utilisation de l'endpoint toutes avec période: ${filters.periode}`
        );
        const response = await apiClient.get<ApiDemande[]>(
          `${this.basePath}/demandes/toutes/${filters.periode}`
        );
        return response.data;
      } catch (error) {
        console.warn(
          "⚠️ Erreur avec l'endpoint toutes/période, fallback:",
          error
        );
      }
    }

    // Fallback : récupérer toutes les demandes et filtrer côté client
    console.log(
      "📋 Récupération de toutes les demandes pour filtrage côté client..."
    );
    const allDemandes = await this.getAllDemandes();

    return allDemandes.filter((demande) => {
      // Filtrage par statut côté client
      if (filters.status && filters.status !== "tous") {
        const statusMapping: Record<string, string> = {
          emis: "Emise",
          confirme: "Confirmée",
          approuve: "Approuvée",
          valide: "Validée",
          refuse: "Rejetée",
          livre: "Livrée",
        };

        const expectedStatus = statusMapping[filters.status];
        if (expectedStatus && demande.statut !== expectedStatus) {
          return false;
        }
      }

      if (filters.magasin_id && demande.magasin !== filters.magasin_id) {
        return false;
      }
      if (
        filters.stock_item_id &&
        demande.stock_item !== filters.stock_item_id
      ) {
        return false;
      }
      if (filters.date_from && demande.date_creation < filters.date_from) {
        return false;
      }
      if (filters.date_to && demande.date_creation > filters.date_to) {
        return false;
      }
      return true;
    });
  }
}

export const demandeApiService = new DemandeApiService();
