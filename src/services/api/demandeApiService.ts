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

      const response = await apiClient.get<ApiDemande[]>(
        `${this.basePath}/demandes/toutes`
      );

      return response.data;
    } catch (error) {
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

      const response = await apiClient.get<ApiDemande[]>(
        `${this.basePath}/demandes/${status}`
      );

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

      const response = await apiClient.get<ApiDemande>(
        `${this.basePath}/demande/detail/${id}`
      );

      return response.data;
    } catch (error) {
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

      const response = await apiClient.post<ApiDemande>(
        `${this.basePath}/demande/emettre`,
        data
      );

      return response.data;
    } catch (error) {
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

      const response = await apiClient.post<ApiDemande>(
        `${this.basePath}/demande/confirmer/${id}`,
        data || {}
      );

      // Validation de la réponse
      if (!response.data || !response.data.id) {
        // En cas de réponse incomplète, récupérer la demande mise à jour
        return await this.getDemandeById(id);
      }

      return response.data;
    } catch (error) {
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

      const response = await apiClient.post<ApiDemande>(
        `${this.basePath}/demande/approuver/${id}`,
        data || {}
      );

      // Validation de la réponse
      if (!response.data || !response.data.id) {
        return await this.getDemandeById(id);
      }

      return response.data;
    } catch (error) {
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

      const response = await apiClient.post<ApiDemande>(
        `${this.basePath}/demande/valider/${id}`,
        data || {}
      );

      // Validation de la réponse
      if (!response.data || !response.data.id) {
        return await this.getDemandeById(id);
      }

      return response.data;
    } catch (error) {
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

      const response = await apiClient.post<ApiDemande>(
        `${this.basePath}/demande/rejeter/${id}`,
        data
      );

      // Validation de la réponse
      if (!response.data || !response.data.id) {
        return await this.getDemandeById(id);
      }

      return response.data;
    } catch (error) {
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

      const response = await apiClient.get<ApiDemandeStats>(
        `${this.basePath}/demandes/statistiques/${periode}`
      );
      
      return response.data;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des statistiques:",
        error
      );
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
          const response = await apiClient.get<ApiDemande[]>(
            `${this.basePath}/demandes/${endpointStatus}/${filters.periode}`
          );
          return response.data;
        }
      } catch (error) {
        // Fallback vers toutes les demandes silencieusement
      }
    }

    // Si on a seulement une période (sans statut), utiliser l'endpoint "toutes" avec période
    if (filters.periode && (!filters.status || filters.status === "tous")) {
      try {
        const response = await apiClient.get<ApiDemande[]>(
          `${this.basePath}/demandes/toutes/${filters.periode}`
        );
        return response.data;
      } catch (error) {
        // Fallback silencieux
      }
    }

    // Fallback : récupérer toutes les demandes et filtrer côté client
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
