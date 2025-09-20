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
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockArticleService.getArticles(filter);
    }
    return await stockApiService.getProducts().then((products) => ({
      data: products,
      pagination: { page: 1, limit: 50, total: products.length, totalPages: 1 },
    }));
  }

  async getArticle(id: string): Promise<Product> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockArticleService.getArticle(id);
    }
    return await stockApiService.getProduct(id);
  }

  async createArticle(data: CreateProductData): Promise<Product> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockArticleService.createArticle(data);
    }
    return await stockApiService.createProduct(data);
  }

  async updateArticle(data: UpdateProductData): Promise<Product> {
    return mockArticleService.updateArticle(data);
  }

  async deleteArticle(id: string): Promise<void> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "false") {
      return mockArticleService.deleteArticle(id);
    }
    return await stockApiService.deleteProduct(id);
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
