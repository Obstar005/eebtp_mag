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
      console.log("📋 Récupération de la liste des articles...");

      const response = await apiClient.get<ApiProduitsListResponse>(
        `${this.baseUrl}/liste-articles`
      );

      console.log("✅ Articles récupérés:", response.data.length);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des articles:", error);
      throw error;
    }
  }

  /**
   * Récupérer un article/produit par son ID
   * GET /Stocks/article-detail/{id}
   */
  async getArticle(id: number): Promise<ApiProduit> {
    try {
      console.log("📦 Récupération de l'article:", id);

      const response = await apiClient.get<ApiProduitResponse>(
        `${this.baseUrl}/article-detail/${id}`
      );

      console.log("✅ Article récupéré:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'article:", error);
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
      console.log("📦 Création de l'article:", articleData);

      // S'assurer que is_active est défini
      const dataWithDefaults: ApiCreateProduitRequest = {
        ...articleData,
        is_active: articleData.is_active ?? true,
      };

      const response = await apiClient.post<ApiProduitResponse>(
        `${this.baseUrl}/article-create`,
        dataWithDefaults
      );

      console.log("✅ Article créé:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'article:", error);
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
      console.log("📝 Mise à jour de l'article:", id, articleData);

      const response = await apiClient.put<ApiProduitResponse>(
        `${this.baseUrl}/article-update/${id}`,
        articleData
      );

      console.log("✅ Article mis à jour:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de l'article:", error);
      throw error;
    }
  }

  /**
   * Supprimer un article/produit
   * DELETE /Stocks/article-delete/{id}
   */
  async deleteArticle(id: number): Promise<void> {
    try {
      console.log("🗑️ Suppression de l'article:", id);

      await apiClient.delete(`${this.baseUrl}/article-delete/${id}`);

      console.log("✅ Article supprimé:", id);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de l'article:", error);
      throw error;
    }
  }
}

export const articleApiService = new ArticleApiService();
