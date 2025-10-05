import { apiClient as client } from "./client";
import { withApiErrorHandling } from "../../utils/apiErrorUtils";
import type {
  ApiEntree,
  ApiSortie,
  ApiEntreeListResponse,
  ApiSortieListResponse,
} from "../../types/api-declarations";
import {
  apiEntreeToDeclaration,
  apiSortieToDeclaration,
  createDeclarationDataToApiRequest,
  extractPaginatedDeclarationData,
} from "../../types/api-transformers-declarations";
import type {
  Declaration,
  CreateDeclarationData,
  UpdateDeclarationData,
  DeclarationFilter,
  DeclarationStats,
} from "../../types/declaration";
import type { PaginatedResponse } from "../../types/api";

/**
 * Service API pour la gestion des déclarations (mouvements)
 * Utilise les endpoints /Mouvements/* de l'API EEBTP_MAG v3.7
 */
class DeclarationApiService {
  private basePath = "/Mouvements";

  // ==================== LECTURE DES DÉCLARATIONS ====================

  /**
   * Récupérer toutes les déclarations d'un magasin
   * Combine les entrées et sorties pour avoir une vue unifiée
   */
  async getDeclarations(
    magasinId: number,
    filter: DeclarationFilter = {}
  ): Promise<PaginatedResponse<Declaration>> {
    return withApiErrorHandling(
      async () => {
        console.log(
          "📋 Récupération des déclarations pour le magasin:",
          magasinId
        );

        // Récupérer les entrées et sorties en parallèle
        const [entreesPromise, sortiesPromise] = await Promise.allSettled([
          this.getEntrees(magasinId, filter),
          this.getSorties(magasinId, filter),
        ]);

        let allDeclarations: Declaration[] = [];

        // Traiter les entrées
        if (entreesPromise.status === "fulfilled") {
          allDeclarations.push(...entreesPromise.value.data);
        } else {
          console.warn(
            "Erreur lors de la récupération des entrées:",
            entreesPromise.reason
          );
        }

        // Traiter les sorties
        if (sortiesPromise.status === "fulfilled") {
          allDeclarations.push(...sortiesPromise.value.data);
        } else {
          console.warn(
            "Erreur lors de la récupération des sorties:",
            sortiesPromise.reason
          );
        }

        // Filtrer par type si spécifié
        if (filter.type_enum) {
          allDeclarations = allDeclarations.filter(
            (decl) => decl.type_enum === filter.type_enum
          );
        }

        // Filtrer par recherche si spécifiée
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          allDeclarations = allDeclarations.filter(
            (decl) =>
              decl.stockItem?.name.toLowerCase().includes(searchLower) ||
              decl.motif?.toLowerCase().includes(searchLower) ||
              decl.fournisseur?.name.toLowerCase().includes(searchLower) ||
              decl.receveur?.name.toLowerCase().includes(searchLower)
          );
        }

        // Trier par date de création (plus récent en premier)
        allDeclarations.sort(
          (a, b) =>
            new Date(b.date_creation).getTime() -
            new Date(a.date_creation).getTime()
        );

        return {
          data: allDeclarations,
          pagination: {
            page: 1,
            limit: allDeclarations.length,
            total: allDeclarations.length,
            totalPages: 1,
          },
        };
      },
      "Récupération des déclarations",
      { magasinId, filter }
    );
  }

  /**
   * Récupérer une déclaration par ID
   * Essaie d'abord les entrées, puis les sorties
   */
  async getDeclaration(id: number): Promise<Declaration> {
    return withApiErrorHandling(
      async () => {
        console.log("📋 Récupération de la déclaration:", id);

        // Essayer d'abord comme entrée
        try {
          const entreeResponse = await client.get<ApiEntree>(
            `${this.basePath}/entree-detail/${id}`
          );
          return apiEntreeToDeclaration(entreeResponse.data);
        } catch (entreeError) {
          console.log("Pas trouvé dans les entrées, essai dans les sorties...");
        }

        // Essayer comme sortie
        try {
          const sortieResponse = await client.get<ApiSortie>(
            `${this.basePath}/sortie-detail/${id}`
          );
          return apiSortieToDeclaration(sortieResponse.data);
        } catch (sortieError) {
          throw new Error(`Déclaration ${id} introuvable`);
        }
      },
      "Récupération de la déclaration",
      { id }
    );
  }

  // ==================== CRÉATION DES DÉCLARATIONS ====================

  /**
   * Créer une nouvelle déclaration
   */
  async createDeclaration(data: CreateDeclarationData): Promise<Declaration> {
    return withApiErrorHandling(
      async () => {
        console.log("📋 Création de la déclaration:", data);

        const apiRequest = createDeclarationDataToApiRequest(data);

        if (data.type_enum === "entree" || data.type_enum === "retour") {
          // Créer une entrée
          const response = await client.post<ApiEntree>(
            `${this.basePath}/entree-create`,
            apiRequest
          );
          return apiEntreeToDeclaration(response.data);
        } else if (data.type_enum === "sortie") {
          // Créer une sortie
          const response = await client.post<ApiSortie>(
            `${this.basePath}/sortie-create`,
            apiRequest
          );
          return apiSortieToDeclaration(response.data);
        } else {
          throw new Error(
            `Type de déclaration non supporté: ${data.type_enum}`
          );
        }
      },
      "Création de la déclaration",
      { data }
    );
  }

  // ==================== MISE À JOUR ET SUPPRESSION ====================

  /**
   * Mettre à jour une déclaration
   * Note: L'API ne semble pas avoir d'endpoints pour la mise à jour
   */
  async updateDeclaration(data: UpdateDeclarationData): Promise<Declaration> {
    // Pour l'instant, on retourne une erreur car l'API ne semble pas supporter la mise à jour
    throw new Error("Mise à jour des déclarations non supportée par l'API");
  }

  /**
   * Supprimer une déclaration
   * Note: L'API ne semble pas avoir d'endpoints pour la suppression
   */
  async deleteDeclaration(id: number): Promise<void> {
    // Pour l'instant, on retourne une erreur car l'API ne semble pas supporter la suppression
    throw new Error("Suppression des déclarations non supportée par l'API");
  }

  // ==================== MÉTHODES PRIVÉES ====================

  /**
   * Récupérer les entrées d'un magasin
   */
  private async getEntrees(
    magasinId: number,
    filter: DeclarationFilter = {}
  ): Promise<PaginatedResponse<Declaration>> {
    const response = await client.get<ApiEntree[] | ApiEntreeListResponse>(
      `${this.basePath}/liste-entree-magasin/${magasinId}`
    );

    // Gérer différents formats de réponse API
    const extracted = extractPaginatedDeclarationData(response.data);

    // Convertir vers le format frontend
    const declarations = extracted.data
      .filter((item): item is ApiEntree => "type" in item)
      .map(apiEntreeToDeclaration);

    return {
      data: declarations,
      pagination: {
        page: 1,
        limit: extracted.total,
        total: extracted.total,
        totalPages: 1,
      },
    };
  }

  /**
   * Récupérer les sorties d'un magasin
   */
  private async getSorties(
    magasinId: number,
    filter: DeclarationFilter = {}
  ): Promise<PaginatedResponse<Declaration>> {
    const response = await client.get<ApiSortie[] | ApiSortieListResponse>(
      `${this.basePath}/liste-sortie-magasin/${magasinId}`
    );

    // Gérer différents formats de réponse API
    const extracted = extractPaginatedDeclarationData(response.data);

    // Convertir vers le format frontend
    const declarations = extracted.data
      .filter((item): item is ApiSortie => !("type" in item))
      .map(apiSortieToDeclaration);

    return {
      data: declarations,
      pagination: {
        page: 1,
        limit: extracted.total,
        total: extracted.total,
        totalPages: 1,
      },
    };
  }

  // ==================== STATISTIQUES ====================

  /**
   * Récupérer les statistiques des déclarations
   * Calculées côté client en l'absence d'endpoint dédié
   */
  async getDeclarationStats(magasinId: number): Promise<DeclarationStats> {
    return withApiErrorHandling(
      async () => {
        console.log("📊 Calcul des statistiques des déclarations");

        // Récupérer toutes les déclarations
        const declarations = await this.getDeclarations(magasinId, {});

        // Calculer les statistiques
        const stats: DeclarationStats = {
          totalEntrees: declarations.data.filter(
            (d) => d.type_enum === "entree"
          ).length,
          totalSorties: declarations.data.filter(
            (d) => d.type_enum === "sortie"
          ).length,
          totalRetours: declarations.data.filter(
            (d) => d.type_enum === "retour"
          ).length,
          variationVsHier: {
            entrees: 0, // Pas de données historiques disponibles
            sorties: 0,
            retours: 0,
          },
        };

        return stats;
      },
      "Calcul des statistiques des déclarations",
      { magasinId }
    );
  }
}

export const declarationApiService = new DeclarationApiService();
