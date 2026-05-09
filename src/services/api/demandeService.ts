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
  ApiRejeterConfirmationRequest,
  ApiRejeterApprobationRequest,
  ApiRejeterValidationRequest,
} from "../../types/api-demandes";
import { REQUEST_STATUS } from "../../utils/permissions";

// Interface pour les filtres des demandes
export interface DemandeFilter {
  status?: string;
  magasin_id?: number;
  stock_item_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  periode?: PeriodeType; // Nouveau paramètre pour les filtres de période
}

// Type pour les périodes supportées par l'API
export type PeriodeType = "jour" | "semaine" | "mois" | "total";

// Interface pour les statistiques des demandes (frontend)
export interface DemandeStats {
  total: number;
  emises: number;
  confirmees: number;
  approuvees: number;
  validees: number;
  rejetees: number;
  livrees: number;
  enAttenteValidation?: number;
  variationVsHier?: {
    total?: number;
    emises?: number;
    confirmees?: number;
    approuvees?: number;
    validees?: number;
    rejetees?: number;
    livrees?: number;
    enAttente?: number;
  };
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
            (demande.nomMagasinier || "").toLowerCase().includes(searchLower) ||
            (demande.nomMagasin || "").toLowerCase().includes(searchLower)
        );
      }


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
      throw error;
    }
  }

  /**
   * Récupérer une demande par ID
   */
  async getDemande(id: string): Promise<MaterialRequest> {
    try {

      const apiDemande = await demandeApiService.getDemandeById(parseInt(id));
      const demande = apiDemandeToMaterialRequest(apiDemande);

      return demande;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Récupérer les demandes par statut
   */
  async getDemandesByStatus(status: string): Promise<MaterialRequest[]> {
    try {

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

      const apiData: ApiCreateDemandeRequest = {
        stock_item: data.stock_item_id,
        magasin: data.magasin_id,
        quantite_dem: data.quantite,
        raison: data.raison,
      };

      const apiDemande = await demandeApiService.createDemande(apiData);
      const demande = apiDemandeToMaterialRequest(apiDemande);

      return demande;
    } catch (error) {
      throw error;
    }
  }

  // ==================== ACTIONS SUR LES DEMANDES ====================

  /**
   * Confirmer une demande
   */
  async confirmerDemande(
    id: string,
    data?: { commentaire?: string }
  ): Promise<MaterialRequest> {
    try {
      const commentaire = data?.commentaire?.trim();

      const apiData: ApiConfirmerDemandeRequest = {
        ...(commentaire ? { commentaire_confirmation: commentaire } : {}),
      };

      const apiDemande = await demandeApiService.confirmerDemande(
        parseInt(id),
        apiData
      );
      const demande = apiDemandeToMaterialRequest(apiDemande);

      return demande;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Approuver une demande
   */
  async approuverDemande(
    id: string,
    data?: { commentaire?: string; quantite?: number }
  ): Promise<MaterialRequest> {
    try {
      const commentaire = data?.commentaire?.trim();

      const apiData: ApiApprouverDemandeRequest = {
        ...(commentaire ? { commentaire_approbation: commentaire } : {}),
        quantite_approuv: data?.quantite,
        quantite_approv: data?.quantite,
        is_quantity_reduced_by_approb: data?.quantite !== undefined,
      };

      const apiDemande = await demandeApiService.approuverDemande(
        parseInt(id),
        apiData
      );
      const demande = apiDemandeToMaterialRequest(apiDemande);

      return demande;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Valider une demande
   */
  async validerDemande(
    id: string,
    data?: { commentaire?: string; quantite?: number }
  ): Promise<MaterialRequest> {
    try {
      const commentaire = data?.commentaire?.trim();

      const apiData: ApiValiderDemandeRequest = {
        ...(commentaire ? { commentaire_validation: commentaire } : {}),
        quantite_valid: data?.quantite,
        quantity_valid: data?.quantite,
        is_quantity_reduced_by_validation: data?.quantite !== undefined,
      };

      const apiDemande = await demandeApiService.validerDemande(
        parseInt(id),
        apiData
      );
      const demande = apiDemandeToMaterialRequest(apiDemande);

      return demande;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rejeter une demande selon l'étape en cours
   */
  async rejeterDemande(
    id: string,
    motif: string,
    requestStatus: string
  ): Promise<MaterialRequest> {
    try {
      const commentaire = motif.trim() || undefined;
      let apiDemande;

      if (requestStatus === REQUEST_STATUS.EMISE) {
        const data: ApiRejeterConfirmationRequest = commentaire
          ? { commentaire_confirmation: commentaire }
          : {};
        apiDemande = await demandeApiService.rejeterConfirmation(parseInt(id), data);
      } else if (requestStatus === REQUEST_STATUS.CONFIRMEE) {
        const data: ApiRejeterApprobationRequest = commentaire
          ? { commentaire_approbation: commentaire }
          : {};
        apiDemande = await demandeApiService.rejeterApprobation(parseInt(id), data);
      } else if (requestStatus === REQUEST_STATUS.APPROUVEE) {
        const data: ApiRejeterValidationRequest = commentaire
          ? { commentaire_validation: commentaire }
          : {};
        apiDemande = await demandeApiService.rejeterValidation(parseInt(id), data);
      } else {
        throw new Error(`Rejet non supporté pour le statut: ${requestStatus}`);
      }

      return apiDemandeToMaterialRequest(apiDemande);
    } catch (error) {
      throw error;
    }
  }

  // ==================== STATISTIQUES ====================

  /**
   * Récupérer les statistiques des demandes
   */
  async getDemandeStats(periode: PeriodeType = "total"): Promise<DemandeStats> {
    try {

      const apiStats = await demandeApiService.getDemandeStats(periode);

      const stats: DemandeStats = {
        total: apiStats.total_demandes,
        emises: apiStats.demandes_emises,
        confirmees: apiStats.demandes_confirmees,
        approuvees: apiStats.demandes_approuvees,
        validees: apiStats.demandes_validees,
        rejetees: apiStats.demandes_rejetees,
        livrees: apiStats.demandes_livrees,
        enAttenteValidation: apiStats.demandes_en_attente_validation,
        variationVsHier: apiStats.taux_variation ? {
          total: apiStats.taux_variation.total,
          emises: apiStats.taux_variation.emises,
          confirmees: apiStats.taux_variation.confirmees,
          approuvees: apiStats.taux_variation.approuvees,
          validees: apiStats.taux_variation.validees,
          rejetees: apiStats.taux_variation.rejetees,
          livrees: apiStats.taux_variation.livrees,
          enAttente: apiStats.taux_variation.en_attente,
        } : undefined,
      };

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
    data?: { commentaire?: string; quantite?: number; requestStatus?: string }
  ): Promise<MaterialRequest> {
    switch (action) {
      case "confirmer":
        return this.confirmerDemande(id, { commentaire: data?.commentaire });
      case "approuver":
        return this.approuverDemande(id, { 
          commentaire: data?.commentaire, 
          quantite: data?.quantite 
        });
      case "valider":
        return this.validerDemande(id, { 
          commentaire: data?.commentaire, 
          quantite: data?.quantite
        });
      case "rejeter":
        if (!data?.commentaire) {
          throw new Error("Le motif de rejet est requis");
        }
        return this.rejeterDemande(id, data.commentaire, data.requestStatus ?? "");
      default:
        throw new Error(`Action non supportée: ${action}`);
    }
  }
}

// Instance exportée du service
export const demandeService = new DemandeService();
