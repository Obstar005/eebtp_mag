import { apiClient as client } from "./client";
import { withApiErrorHandling } from "../../utils/apiErrorUtils";
import type {
  ApiProduit,
  ApiProductListResponse,
} from "../../types/api-products";
import {
  apiProduitToCatalogProduct,
  createProductDataToApiRequest,
  updateProductDataToApiRequest,
  extractPaginatedProductData,
  type CatalogProduct,
} from "../../types/api-transformers-products";
import type {
  Product,
  ProductCategory,
  Supplier,
  CreateProductData,
  UpdateProductData,
  PaginatedResponse,
  ProductFilter,
} from "../../types";

export class ProductService {
  private readonly basePath = "/Stocks";

  /**
   * Récupérer tous les produits du catalogue
   * GET /Stocks/liste-articles
   */
  async getProducts(
    _filter?: ProductFilter
  ): Promise<PaginatedResponse<CatalogProduct>> {
    return withApiErrorHandling(
      async () => {

        const response = await client.get<
          ApiProduit[] | ApiProductListResponse
        >(`${this.basePath}/liste-articles`);

        // Gérer différents formats de réponse API
        const extracted = extractPaginatedProductData(response.data);

        // Convertir vers le format frontend
        const products = extracted.data.map(apiProduitToCatalogProduct);

        return {
          data: products,
          pagination: {
            page: 1,
            limit: extracted.total,
            total: extracted.total,
            totalPages: 1,
          },
        };
      },
      "Récupération du catalogue des produits",
      { filter: _filter }
    );
  }

  async getProduct(id: string): Promise<CatalogProduct> {
    return withApiErrorHandling(
      async () => {

        const response = await client.get<ApiProduit>(
          `${this.basePath}/article-detail/${id}`
        );

        return apiProduitToCatalogProduct(response.data);
      },
      "Récupération du produit",
      { id }
    );
  }

  async createProduct(data: {
    name: string;
    type: "materiel" | "materiau";
    unit: string;
    isActive?: boolean;
  }): Promise<CatalogProduct> {
    return withApiErrorHandling(
      async () => {

        const apiRequest = createProductDataToApiRequest(data);

        const response = await client.post<ApiProduit>(
          `${this.basePath}/article-create`,
          apiRequest
        );

        return apiProduitToCatalogProduct(response.data);
      },
      "Création du produit",
      { data }
    );
  }

  async updateProduct(data: {
    id: string;
    name?: string;
    type?: "materiel" | "materiau";
    unit?: string;
    isActive?: boolean;
  }): Promise<CatalogProduct> {
    return withApiErrorHandling(
      async () => {

        const apiRequest = updateProductDataToApiRequest(data);

        const response = await client.put<ApiProduit>(
          `${this.basePath}/article-update/${data.id}`,
          apiRequest
        );

        return apiProduitToCatalogProduct(response.data);
      },
      "Mise à jour du produit",
      { data }
    );
  }

  async deleteProduct(id: string): Promise<void> {
    return withApiErrorHandling(
      async () => {

        await client.delete(`${this.basePath}/article-delete/${id}`);
      },
      "Suppression du produit",
      { id }
    );
  }

  async getProductByBarcode(_barcode: string): Promise<Product> {
    throw new Error("Recherche par code-barres non supportée par l'API");
  }

  // Méthodes pour les catégories (non implémentées - pas disponibles dans l'API)
  async getCategories(): Promise<ProductCategory[]> {
    // Retourner des catégories basées sur les types de l'API
    return [
      {
        id: "materiel",
        name: "Matériel",
        description: "Équipements et outils",
        isActive: true,
      },
      {
        id: "materiau",
        name: "Matériau",
        description: "Matières premières et matériaux",
        isActive: true,
      },
    ];
  }

  async createCategory(
    _data: Omit<ProductCategory, "id">
  ): Promise<ProductCategory> {
    throw new Error("Création de catégories non supportée par l'API");
  }

  async updateCategory(
    _id: string,
    _data: Partial<ProductCategory>
  ): Promise<ProductCategory> {
    throw new Error("Mise à jour de catégories non supportée par l'API");
  }

  async deleteCategory(_id: string): Promise<void> {
    throw new Error("Suppression de catégories non supportée par l'API");
  }

  // Méthodes pour les fournisseurs (non implémentées - pas disponibles dans l'API)
  async getSuppliers(): Promise<Supplier[]> {
    throw new Error("Gestion des fournisseurs non supportée par l'API");
  }

  async createSupplier(_data: Omit<Supplier, "id">): Promise<Supplier> {
    throw new Error("Création de fournisseurs non supportée par l'API");
  }

  async updateSupplier(
    _id: string,
    _data: Partial<Supplier>
  ): Promise<Supplier> {
    throw new Error("Mise à jour de fournisseurs non supportée par l'API");
  }

  async deleteSupplier(_id: string): Promise<void> {
    throw new Error("Suppression de fournisseurs non supportée par l'API");
  }
}

export const productService = new ProductService();
