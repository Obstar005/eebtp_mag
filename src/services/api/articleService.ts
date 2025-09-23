import type {
  Product,
  CreateProductData,
  UpdateProductData,
  PaginatedResponse,
  ProductFilter,
} from "../../types";
import { stockApiService } from "./stockApiService";

export class ArticleService {
  async getArticles(
    filter?: ProductFilter
  ): Promise<PaginatedResponse<Product>> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      return await stockApiService.getProducts().then((products) => ({
        data: products,
        pagination: {
          page: 1,
          limit: 50,
          total: products.length,
          totalPages: 1,
        },
      }));
    }
    return mockArticleService.getArticles(filter);
  }

  async getArticle(id: string): Promise<Product> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      return await stockApiService.getProduct(id);
    }
    return mockArticleService.getArticle(id);
  }

  async createArticle(data: CreateProductData): Promise<Product> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      return await stockApiService.createProduct(data);
    }
    return mockArticleService.createArticle(data);
  }

  async updateArticle(data: UpdateProductData): Promise<Product> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      return await stockApiService.updateProduct(data.id, data);
    }
    return mockArticleService.updateArticle(data);
  }

  async deleteArticle(id: string): Promise<void> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      return await stockApiService.deleteProduct(id);
    }
    return mockArticleService.deleteArticle(id);
  }
}

const mockArticleService = {
  articles: [] as Product[],
  async getArticles(
    _filter?: ProductFilter
  ): Promise<PaginatedResponse<Product>> {
    return {
      data: this.articles,
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    };
  },
  async getArticle(id: string): Promise<Product> {
    throw new Error(`Article ${id} not found`);
  },
  async createArticle(_data: CreateProductData): Promise<Product> {
    throw new Error("Not implemented");
  },
  async updateArticle(_data: UpdateProductData): Promise<Product> {
    throw new Error("Not implemented");
  },
  async deleteArticle(id: string): Promise<void> {
    throw new Error(`Delete ${id} not implemented`);
  },
};

export const articleService = new ArticleService();
