/**
 * Service principal pour la gestion des demandes
 * Utilise demandeApiService et transforme les données pour le frontend
 */

import { demandeApiService } from "./demandeApiService";
import { apiDemandeToMaterialRequest } from "./api-transformers";
import type { MaterialRequest } from "../../types/request";
import type {
  ApiCreateDemandeRequest,
  ApiApprouverDemandeRequest,
  ApiConfirmerDemandeRequest,
  ApiValiderDemandeRequest,
  ApiRejeterDemandeRequest,
} from "../../types/api-demandes";

// Interface pour les filtres des demandes
export interface DemandeFilter {
  status?: string;
  magasin_id?: number;
  stock_item_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Interface pour les statistiques des demandes (frontend)
export interface DemandeStats {
  total: number;
  emises: number;
  confirmees: number;
  approuvees: number;
  validees: number;
  rejetees: number;
  livrees: number;
}

// Interface pour la réponse paginée
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class DemandeService {
  // ==================== RÉCUPÉRATION DES DEMANDES ====================

  /**
   * Récupérer toutes les demandes avec filtres
   */
  async getDemandes(
    filter: DemandeFilter = {}
  ): Promise<PaginatedResponse<MaterialRequest>> {
    try {
      console.log("📋 Récupération des demandes avec filtres:", filter);

      // Récupérer les demandes de l'API
      const apiDemandes = await demandeApiService.getDemandesFiltered(filter);

      // Transformer en format frontend
      let demandes = apiDemandes.map(apiDemandeToMaterialRequest);

      // Filtrage côté client pour les champs non supportés par l'API
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        demandes = demandes.filter(
          (demande) =>
            demande.demande.toLowerCase().includes(searchLower) ||
            demande.nomMagasinier.toLowerCase().includes(searchLower) ||
            demande.nomMagasin?.toLowerCase().includes(searchLower)
        );
      }

      console.log("✅ Demandes récupérées et transformées:", demandes.length);

      return {
        data: demandes,
        pagination: {
          page: 1,
          limit: demandes.length,
          total: demandes.length,
          totalPages: 1,
        },
      };
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des demandes:", error);
      throw error;
    }
  }

  /**
   * Récupérer une demande par ID
   */
  async getDemande(id: string): Promise<MaterialRequest> {
    try {
      console.log("📦 Récupération de la demande:", id);

      const apiDemande = await demandeApiService.getDemandeById(parseInt(id));
      const demande = apiDemandeToMaterialRequest(apiDemande);

      console.log("✅ Demande récupérée et transformée:", demande);
      return demande;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de la demande:", error);
      throw error;
    }
  }

  /**
   * Récupérer les demandes par statut
   */
  async getDemandesByStatus(status: string): Promise<MaterialRequest[]> {
    try {
      console.log("📋 Récupération des demandes par statut:", status);

      const demandes = await this.getDemandes({ status });
      return demandes.data;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des demandes par statut:",
        error
      );
      throw error;
    }
  }

  // ==================== CRÉATION ET MODIFICATION ====================

  /**
   * Créer une nouvelle demande
   */
  async createDemande(data: {
    stock_item_id: number;
    magasin_id: number;
    quantite: number;
    raison: string;
  }): Promise<MaterialRequest> {
    try {
      console.log("📤 Création d'une nouvelle demande:", data);

      const apiData: ApiCreateDemandeRequest = {
        stock_item: data.stock_item_id,
        magasin: data.magasin_id,
        quantite: data.quantite,
        raison: data.raison,
      };

      const apiDemande = await demandeApiService.createDemande(apiData);
      const demande = apiDemandeToMaterialRequest(apiDemande);

      console.log("✅ Demande créée avec succès:", demande);
      return demande;
    } catch (error) {
      console.error("❌ Erreur lors de la création de la demande:", error);
      throw error;
    }
  }

  // ==================== ACTIONS SUR LES DEMANDES ====================

  /**
   * Confirmer une demande
   */
  async confirmerDemande(
    id: string,
    data?: { motif?: string }
  ): Promise<MaterialRequest> {
    try {
      console.log("✅ Confirmation de la demande:", id);

      const apiData: ApiConfirmerDemandeRequest = {
        confirmed: true,
        motif: data?.motif,
      };

      const apiDemande = await demandeApiService.confirmerDemande(
        parseInt(id),
        apiData
      );
      const demande = apiDemandeToMaterialRequest(apiDemande);

      console.log("✅ Demande confirmée avec succès:", demande);
      return demande;
    } catch (error) {
      console.error("❌ Erreur lors de la confirmation de la demande:", error);
      throw error;
    }
  }

  /**
   * Approuver une demande
   */
  async approuverDemande(
    id: string,
    data?: { motif?: string }
  ): Promise<MaterialRequest> {
    try {
      console.log("✅ Approbation de la demande:", id);

      const apiData: ApiApprouverDemandeRequest = {
        approved: true,
        motif: data?.motif,
      };

      const apiDemande = await demandeApiService.approuverDemande(
        parseInt(id),
        apiData
      );
      const demande = apiDemandeToMaterialRequest(apiDemande);

      console.log("✅ Demande approuvée avec succès:", demande);
      return demande;
    } catch (error) {
      console.error("❌ Erreur lors de l'approbation de la demande:", error);
      throw error;
    }
  }

  /**
   * Valider une demande
   */
  async validerDemande(
    id: string,
    data?: { motif?: string }
  ): Promise<MaterialRequest> {
    try {
      console.log("✅ Validation de la demande:", id);

      const apiData: ApiValiderDemandeRequest = {
        validated: true,
        motif: data?.motif,
      };

      const apiDemande = await demandeApiService.validerDemande(
        parseInt(id),
        apiData
      );
      const demande = apiDemandeToMaterialRequest(apiDemande);

      console.log("✅ Demande validée avec succès:", demande);
      return demande;
    } catch (error) {
      console.error("❌ Erreur lors de la validation de la demande:", error);
      throw error;
    }
  }

  /**
   * Rejeter une demande
   */
  async rejeterDemande(id: string, motif: string): Promise<MaterialRequest> {
    try {
      console.log("❌ Rejet de la demande:", id, motif);

      const apiData: ApiRejeterDemandeRequest = {
        rejected: true,
        motif_rejet: motif,
      };

      const apiDemande = await demandeApiService.rejeterDemande(
        parseInt(id),
        apiData
      );
      const demande = apiDemandeToMaterialRequest(apiDemande);

      console.log("✅ Demande rejetée avec succès:", demande);
      return demande;
    } catch (error) {
      console.error("❌ Erreur lors du rejet de la demande:", error);
      throw error;
    }
  }

  // ==================== STATISTIQUES ====================

  /**
   * Récupérer les statistiques des demandes
   */
  async getDemandeStats(): Promise<DemandeStats> {
    try {
      console.log("📊 Récupération des statistiques des demandes...");

      const apiStats = await demandeApiService.getDemandeStats();

      const stats: DemandeStats = {
        total: apiStats.total_demandes,
        emises: apiStats.demandes_emises,
        confirmees: apiStats.demandes_confirmees,
        approuvees: apiStats.demandes_approuvees,
        validees: apiStats.demandes_validees,
        rejetees: apiStats.demandes_rejetees,
        livrees: apiStats.demandes_livrees,
      };

      console.log("✅ Statistiques récupérées:", stats);
      return stats;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des statistiques:",
        error
      );
      throw error;
    }
  }

  // ==================== MÉTHODES HELPER ====================

  /**
   * Traiter une demande (action générique)
   */
  async traiterDemande(
    id: string,
    action: "confirmer" | "approuver" | "valider" | "rejeter",
    motif?: string
  ): Promise<MaterialRequest> {
    switch (action) {
      case "confirmer":
        return this.confirmerDemande(id, { motif });
      case "approuver":
        return this.approuverDemande(id, { motif });
      case "valider":
        return this.validerDemande(id, { motif });
      case "rejeter":
        if (!motif) {
          throw new Error("Le motif de rejet est requis");
        }
        return this.rejeterDemande(id, motif);
      default:
        throw new Error(`Action non supportée: ${action}`);
    }
  }
}

// Instance exportée du service
export const demandeService = new DemandeService();
