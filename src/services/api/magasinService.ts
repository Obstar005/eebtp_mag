import { apiClient as client } from "./client";
import { withApiErrorHandling } from "../../utils/apiErrorUtils";
import type {
  ApiMagasinResponse,
  ApiStockItem,
  ApiMagasinListResponse,
  ApiStockItemListResponse,
} from "../../types/api-magasins";

import {
  apiMagasinToMagasin,
  createMagasinDataToApiRequest,
  updateMagasinDataToApiRequest,
  apiStockItemToStockArticle,
  createStockArticleDataToApiRequest,
  updateStockArticleDataToApiRequest,
  extractPaginatedData,
} from "../../types/api-transformers-magasins";

import { projetApiService } from "./projetApiService";

import type {
  Magasin,
  CreateMagasinData,
  UpdateMagasinData,
  MagasinFilter,
  StockArticle,
  CreateStockArticleData,
  UpdateStockArticleData,
  StockArticleFilter,
  MagasinStats,
} from "../../types/magasin";
import type { PaginatedResponse } from "../../types/api";

/**
 * Service API pour la gestion des magasins et articles de stock
 * Utilise les endpoints /Projets/magasin-* et /Stocks/stock-item-* de l'API EEBTP_MAG v3.7
 */
class MagasinService {
  private basePath = "/Projets";
  private stockPath = "/Stocks";

  // ==================== GESTION DES MAGASINS ====================

  /**
   * Récupérer tous les magasins avec filtres
   * GET /Projets/liste-magasins
   */
  async getMagasins(
    filter: MagasinFilter = {}
  ): Promise<PaginatedResponse<Magasin>> {
    return withApiErrorHandling(
      async () => {
        const params = new URLSearchParams();

        // Ajouter les filtres
        if (filter.search) {
          params.append("search", filter.search);
        }
        if (filter.project_id) {
          params.append("project_id", filter.project_id.toString());
        }

        const queryString = params.toString();
        const url = `${this.basePath}/liste-magasins${
          queryString ? `?${queryString}` : ""
        }`;

        const response = await client.get<
          ApiMagasinResponse[] | ApiMagasinListResponse
        >(url);

        // Gérer différents formats de réponse API
        let magasins: ApiMagasinResponse[];
        let total: number;

        if (Array.isArray(response.data)) {
          magasins = response.data;
          total = magasins.length;
        } else {
          const extracted = extractPaginatedData(response.data);
          magasins = extracted.data;
          total = extracted.total;
        }

        // Convertir vers le format frontend
        const convertedMagasins = magasins.map(apiMagasinToMagasin);

        // Enrichir avec le nombre d'articles (optionnel pour les performances)
        for (const magasin of convertedMagasins) {
          try {
            const articlesResponse = await this.getStockArticles(
              magasin.id,
              {}
            );
            magasin.articlesCount = articlesResponse.data.length;
          } catch (error) {
            magasin.articlesCount = 0;
          }
        }

        return {
          data: convertedMagasins,
          pagination: {
            page: 1,
            limit: total,
            total,
            totalPages: 1,
          },
        };
      },
      "Récupération des magasins",
      { filter }
    );
  }

  /**
   * Récupérer un magasin par ID
   * GET /Projets/magasin-detail/{id}
   */
  async getMagasin(id: number): Promise<Magasin> {
    try {
      const response = await client.get<ApiMagasinResponse>(
        `${this.basePath}/magasin-detail/${id}`
      );

      const magasin = apiMagasinToMagasin(response.data);

      // Si un projet est associé, récupérer ses détails complets
      if (magasin.projet?.id) {
        try {
          const projetComplet = await projetApiService.getProjetById(
            magasin.projet.id
          );
          // Enrichir les informations du projet
          magasin.projet = {
            ...magasin.projet,
            ...projetComplet,
          };
        } catch (error) {
          // Garder les informations basiques du projet en cas d'erreur
        }
      }

      // Enrichir avec le nombre d'articles
      try {
        const articlesResponse = await this.getStockArticles(id, {});
        magasin.articlesCount = articlesResponse.data.length;
      } catch (error) {
        magasin.articlesCount = 0;
      }

      return magasin;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Créer un nouveau magasin
   * POST /Projets/magasin-create
   */
  async createMagasin(data: CreateMagasinData): Promise<Magasin> {
    return withApiErrorHandling(
      async () => {
        // Récupérer l'utilisateur actuel pour le creator
        const currentUserId = this.getCurrentUserId();

        const apiRequest = createMagasinDataToApiRequest(data, currentUserId);

        const response = await client.post<ApiMagasinResponse>(
          `${this.basePath}/magasin-create`,
          apiRequest
        );

        return apiMagasinToMagasin(response.data);
      },
      "Création du magasin",
      { data }
    );
  }

  /**
   * Mettre à jour un magasin
   * PUT /Projets/magasin-update/{id}
   */
  async updateMagasin(data: UpdateMagasinData): Promise<Magasin> {
    try {
      const apiRequest = updateMagasinDataToApiRequest(data);

      const response = await client.put<ApiMagasinResponse>(
        `${this.basePath}/magasin-update/${data.id}`,
        apiRequest
      );

      return apiMagasinToMagasin(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Supprimer un magasin
   * DELETE /Projets/magasin-delete/{id}
   */
  async deleteMagasin(id: number): Promise<void> {
    try {
      await client.delete(`${this.basePath}/magasin-delete/${id}`);
    } catch (error) {
      throw error;
    }
  }

  // ==================== GESTION DES ARTICLES DE STOCK ====================

  /**
   * Récupérer les articles de stock d'un magasin
   * GET /Stocks/liste-stock-items/{magasin_id}
   */
  async getStockArticles(
    magasinId: number,
    filter: StockArticleFilter = {}
  ): Promise<PaginatedResponse<StockArticle>> {
    try {
      const params = new URLSearchParams();

      // Ajouter les filtres
      if (filter.search) {
        params.append("search", filter.search);
      }
      if (filter.type_enum) {
        params.append("type_enum", filter.type_enum);
      }

      const queryString = params.toString();
      const url = `${this.stockPath}/liste-stock-items/${magasinId}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await client.get<
        ApiStockItem[] | ApiStockItemListResponse
      >(url);

      // Gérer différents formats de réponse API
      let articles: ApiStockItem[];
      let total: number;

      if (Array.isArray(response.data)) {
        articles = response.data;
        total = articles.length;
      } else {
        const extracted = extractPaginatedData(response.data);
        articles = extracted.data;
        total = extracted.total;
      }

      // Convertir vers le format frontend
      const convertedArticles = articles.map(apiStockItemToStockArticle);
      
      return {
        data: convertedArticles,
        pagination: {
          page: 1,
          limit: total,
          total,
          totalPages: 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Récupérer un article de stock par ID
   * GET /Stocks/stock-item-detail/{stock_item_id}
   */
  async getStockArticle(id: number): Promise<StockArticle> {
    try {
      const response = await client.get<ApiStockItem>(
        `${this.stockPath}/stock-item-detail/${id}`
      );

      return apiStockItemToStockArticle(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Créer un nouvel article de stock
   * POST /Stocks/stock-item-create
   */
  async createStockArticle(
    data: CreateStockArticleData
  ): Promise<StockArticle> {
    try {
      // Récupérer l'utilisateur actuel pour le user_id
      const currentUserId = this.getCurrentUserId();

      const apiRequest = createStockArticleDataToApiRequest(
        data,
        currentUserId
      );

      const response = await client.post<ApiStockItem>(
        `${this.stockPath}/stock-item-create`,
        apiRequest
      );

      return apiStockItemToStockArticle(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mettre à jour un article de stock
   * PUT /Stocks/stock-item-update/{magasin_id}
   * Note: L'API utilise magasin_id dans l'URL mais l'ID de l'article dans le body
   */
  async updateStockArticle(
    data: UpdateStockArticleData
  ): Promise<StockArticle> {
    try {
      const apiRequest = updateStockArticleDataToApiRequest(data);

      // L'API nécessite le magasin_id dans l'URL
      const magasinId = data.magasin_id || apiRequest.magasin_id;
      if (!magasinId) {
        throw new Error("magasin_id est requis pour la mise à jour");
      }

      const response = await client.put<ApiStockItem>(
        `${this.stockPath}/stock-item-update/${magasinId}`,
        apiRequest
      );

      return apiStockItemToStockArticle(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Supprimer un article de stock
   * DELETE /Stocks/stock-item-delete/{stock_item_id}
   */
  async deleteStockArticle(id: number): Promise<void> {
    try {
      await client.delete(`${this.stockPath}/stock-item-delete/${id}`);
    } catch (error) {
      throw error;
    }
  }

  // ==================== STATISTIQUES ====================

  /**
   * Récupérer les statistiques des magasins
   * Calculées côté client en l'absence d'endpoint dédié
   */
  async getMagasinStats(): Promise<MagasinStats> {
    try {
      // Récupérer tous les magasins
      const magasinsResponse = await this.getMagasins({});
      const magasins = magasinsResponse.data;

      // Récupérer tous les articles de tous les magasins
      const allArticles: StockArticle[] = [];

      for (const magasin of magasins) {
        try {
          const articlesResponse = await this.getStockArticles(magasin.id, {});
          allArticles.push(...articlesResponse.data);
        } catch (error) {
          // Ignorer les erreurs de récupération d'articles
        }
      }

      // Calculer les statistiques
      const stats: MagasinStats = {
        totalMagasins: magasins.length,
        totalArticles: allArticles.length,
        articlesNeuf: 0, // Supprimé car le champ 'etat' n'existe plus
        articlesUsage: 0, // Supprimé car le champ 'etat' n'existe plus
        articlesEndommage: 0, // Supprimé car le champ 'etat' n'existe plus
      };

      return stats;
    } catch (error) {
      throw error;
    }
  }

  // ==================== HELPERS ====================

  /**
   * Récupérer l'ID de l'utilisateur actuel
   * À adapter selon le système d'authentification
   */
  private getCurrentUserId(): number {
    try {
      // Essayer de récupérer depuis le localStorage
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user.user_id || 1;
      }

      // Ou depuis le token JWT
      const token = localStorage.getItem("authToken");
      if (token) {
        // Décoder le JWT pour récupérer l'ID utilisateur
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.user_id || payload.sub || 1;
      }

      // Valeur par défaut
      return 1;
    } catch {
      return 1;
    }
  }
}

export const magasinService = new MagasinService();
