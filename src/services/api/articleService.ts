import type {
  Product,
  CreateProductData,
  UpdateProductData,
  PaginatedResponse,
  ProductFilter,
} from "../../types";

// Mock service for articles/products
export class ArticleService {
  private articles: Product[] = [
    {
      id: "1",
      name: "Ciment Portland",
      description: "Ciment Portland de qualité supérieure",
      sku: "CIM001",
      barcode: "1234567890123",
      category: {
        id: "cat1",
        name: "Matériaux",
        isActive: true,
      },
      supplier: {
        id: "sup1",
        name: "Fournisseur ABC",
        email: "contact@abc.com",
        phone: "22890123456",
        address: {
          street: "123 Avenue de la Paix",
          city: "Lomé",
          postalCode: "01BP123",
          country: "Togo",
        },
        isActive: true,
      },
      unitPrice: 5500,
      costPrice: 4500,
      minStockLevel: 10,
      maxStockLevel: 100,
      currentStock: 50,
      unit: "sac" as any,
      isActive: true,
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  async getArticles(
    filter?: ProductFilter
  ): Promise<PaginatedResponse<Product>> {
    let filteredArticles = [...this.articles];

    if (filter?.search) {
      const search = filter.search.toLowerCase();
      filteredArticles = filteredArticles.filter(
        (article) =>
          article.name.toLowerCase().includes(search) ||
          article.sku.toLowerCase().includes(search) ||
          (article.description &&
            article.description.toLowerCase().includes(search))
      );
    }

    if (filter?.categoryId) {
      filteredArticles = filteredArticles.filter(
        (article) => article.category.id === filter.categoryId
      );
    }

    if (filter?.supplierId) {
      filteredArticles = filteredArticles.filter(
        (article) => article.supplier.id === filter.supplierId
      );
    }

    if (filter?.isActive !== undefined) {
      filteredArticles = filteredArticles.filter(
        (article) => article.isActive === filter.isActive
      );
    }

    return {
      data: filteredArticles,
      pagination: {
        page: 1,
        limit: 50,
        total: filteredArticles.length,
        totalPages: 1,
      },
    };
  }

  async getArticle(id: string): Promise<Product> {
    const article = this.articles.find((a) => a.id === id);
    if (!article) {
      throw new Error(`Article with id ${id} not found`);
    }
    return article;
  }

  async createArticle(data: CreateProductData): Promise<Product> {
    const newArticle: Product = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.articles.push(newArticle);
    return newArticle;
  }

  async updateArticle(data: UpdateProductData): Promise<Product> {
    const index = this.articles.findIndex((a) => a.id === data.id);
    if (index === -1) {
      throw new Error(`Article with id ${data.id} not found`);
    }

    const updatedArticle = {
      ...this.articles[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.articles[index] = updatedArticle;
    return updatedArticle;
  }

  async deleteArticle(id: string): Promise<void> {
    const index = this.articles.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Article with id ${id} not found`);
    }

    this.articles.splice(index, 1);
  }
}

export const articleService = new ArticleService();
