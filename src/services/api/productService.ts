// import { apiClient } from './client';
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
  // private readonly basePath = '/products';

  // TODO: Implémenter les méthodes pour les produits
  async getProducts(
    _filter?: ProductFilter
  ): Promise<PaginatedResponse<Product>> {
    throw new Error("Not implemented");
  }

  async getProduct(_id: string): Promise<Product> {
    throw new Error("Not implemented");
  }

  async createProduct(_data: CreateProductData): Promise<Product> {
    throw new Error("Not implemented");
  }

  async updateProduct(_data: UpdateProductData): Promise<Product> {
    throw new Error("Not implemented");
  }

  async deleteProduct(_id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async getProductByBarcode(_barcode: string): Promise<Product> {
    throw new Error("Not implemented");
  }

  // Méthodes pour les catégories
  async getCategories(): Promise<ProductCategory[]> {
    throw new Error("Not implemented");
  }

  async createCategory(
    _data: Omit<ProductCategory, "id">
  ): Promise<ProductCategory> {
    throw new Error("Not implemented");
  }

  async updateCategory(
    _id: string,
    _data: Partial<ProductCategory>
  ): Promise<ProductCategory> {
    throw new Error("Not implemented");
  }

  async deleteCategory(_id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  // Méthodes pour les fournisseurs
  async getSuppliers(): Promise<Supplier[]> {
    throw new Error("Not implemented");
  }

  async createSupplier(_data: Omit<Supplier, "id">): Promise<Supplier> {
    throw new Error("Not implemented");
  }

  async updateSupplier(
    _id: string,
    _data: Partial<Supplier>
  ): Promise<Supplier> {
    throw new Error("Not implemented");
  }

  async deleteSupplier(_id: string): Promise<void> {
    throw new Error("Not implemented");
  }
}

export const productService = new ProductService();
