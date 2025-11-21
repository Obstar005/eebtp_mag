import { apiClient } from "./client";
import type {
  ApiProduit,
  ApiCreateProduitRequest,
  ApiUpdateProduitRequest,
  ApiProduitsListResponse,
  ApiProduitResponse,
} from "../../types/api-articles";

/**
 * Service API pour la gestion des articles/produits
 * Utilise les endpoints /Stocks/article-* de l'API EEBTP_MAG v3.7
 */
export class ArticleApiService {
  private baseUrl = "/Stocks";

  /**
   * Récupérer la liste de tous les articles/produits
   * GET /Stocks/liste-articles
   */
  async getArticles(): Promise<ApiProduit[]> {
    try {

      const response = await apiClient.get<ApiProduitsListResponse>(
        `${this.baseUrl}/liste-articles`
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Récupérer un article/produit par son ID
   * GET /Stocks/article-detail/{id}
   */
  async getArticle(id: number): Promise<ApiProduit> {
    try {

      const response = await apiClient.get<ApiProduitResponse>(
        `${this.baseUrl}/article-detail/${id}`
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Créer un nouvel article/produit
   * POST /Stocks/article-create
   */
  async createArticle(
    articleData: ApiCreateProduitRequest
  ): Promise<ApiProduit> {
    try {

      // S'assurer que is_active est défini
      const dataWithDefaults: ApiCreateProduitRequest = {
        ...articleData,
        is_active: articleData.is_active ?? true,
      };

      const response = await apiClient.post<ApiProduitResponse>(
        `${this.baseUrl}/article-create`,
        dataWithDefaults
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mettre à jour un article/produit existant
   * PUT /Stocks/article-update/{id}
   */
  async updateArticle(
    id: number,
    articleData: ApiUpdateProduitRequest
  ): Promise<ApiProduit> {
    try {

      const response = await apiClient.put<ApiProduitResponse>(
        `${this.baseUrl}/article-update/${id}`,
        articleData
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Supprimer un article/produit
   * DELETE /Stocks/article-delete/{id}
   */
  async deleteArticle(id: number): Promise<void> {
    try {

      await apiClient.delete(`${this.baseUrl}/article-delete/${id}`);

    } catch (error) {
      throw error;
    }
  }
}

export const articleApiService = new ArticleApiService();
