import { apiClient } from "./client";
import type {
  ApiProduit,
  ApiCreateProduitRequest,
  ApiUpdateProduitRequest,
  ApiProduitsListResponse,
  ApiProduitResponse,
} from "../../types/api-stocks";
import type {
  Product,
  CreateProductData,
  UpdateProductData,
} from "../../types/product";
import {
  apiProduitToProduct,
  productToApiCreateProduit,
  productToApiUpdateProduit,
} from "../../types/api-transformers";

/**
 * Service API pour la gestion des stocks
 * Utilise les endpoints /Stocks/* de l'API EEBTP_MAG v3.7
 */
export class StockApiService {
  private baseUrl = "/Stocks";

  /**
   * Récupérer la liste de tous les produits/articles
   * GET /Stocks/liste-articles
   */
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get<ApiProduitsListResponse>(
      `${this.baseUrl}/liste-articles`
    );

    return response.data.map(apiProduitToProduct);
  }

  /**
   * Récupérer un produit/article par son ID
   * GET /Stocks/article-detail/{id}
   */
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<ApiProduitResponse>(
      `${this.baseUrl}/article-detail/${id}`
    );

    return apiProduitToProduct(response.data);
  }

  /**
   * Créer un nouveau produit/article
   * POST /Stocks/article-create
   */
  async createProduct(productData: CreateProductData): Promise<Product> {
    const apiData = productToApiCreateProduit(productData);

    const response = await apiClient.post<ApiProduitResponse>(
      `${this.baseUrl}/article-create`,
      apiData
    );

    return apiProduitToProduct(response.data);
  }

  /**
   * Mettre à jour un produit/article existant
   * PUT /Stocks/article-update/{id}
   */
  async updateProduct(
    id: string,
    productData: UpdateProductData
  ): Promise<Product> {
    const apiData = productToApiUpdateProduit(productData);

    const response = await apiClient.put<ApiProduitResponse>(
      `${this.baseUrl}/article-update/${id}`,
      apiData
    );

    return apiProduitToProduct(response.data);
  }

  /**
   * Supprimer un produit/article
   * DELETE /Stocks/article-delete/{id}
   */
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/article-delete/${id}`);
  }

  // ========================================
  // Méthodes API brutes (si besoin)
  // ========================================

  /**
   * Récupérer la liste des produits bruts (format API)
   */
  async getRawProducts(): Promise<ApiProduit[]> {
    const response = await apiClient.get<ApiProduitsListResponse>(
      `${this.baseUrl}/liste-articles`
    );
    return response.data;
  }

  /**
   * Récupérer un produit brut par ID (format API)
   */
  async getRawProduct(id: string): Promise<ApiProduit> {
    const response = await apiClient.get<ApiProduitResponse>(
      `${this.baseUrl}/article-detail/${id}`
    );
    return response.data;
  }

  /**
   * Créer un produit avec les données API brutes
   */
  async createRawProduct(
    productData: ApiCreateProduitRequest
  ): Promise<ApiProduit> {
    const response = await apiClient.post<ApiProduitResponse>(
      `${this.baseUrl}/article-create`,
      productData
    );
    return response.data;
  }

  /**
   * Mettre à jour un produit avec les données API brutes
   */
  async updateRawProduct(
    id: string,
    productData: ApiUpdateProduitRequest
  ): Promise<ApiProduit> {
    const response = await apiClient.put<ApiProduitResponse>(
      `${this.baseUrl}/article-update/${id}`,
      productData
    );
    return response.data;
  }
}

// Instance exportée du service
export const stockApiService = new StockApiService();
