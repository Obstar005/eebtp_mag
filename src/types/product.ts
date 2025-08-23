// Types pour la gestion des produits
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string; // Code produit unique
  barcode?: string;
  category: ProductCategory;
  supplier: Supplier;
  unitPrice: number;
  costPrice: number;
  minStockLevel: number;
  maxStockLevel: number;
  currentStock: number;
  unit: ProductUnit;
  isActive: boolean;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: Address;
  isActive: boolean;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export const ProductUnit = {
  PIECE: "piece",
  KG: "kg",
  LITER: "liter",
  METER: "meter",
  BOX: "box",
  PACK: "pack",
} as const;

export type ProductUnit = (typeof ProductUnit)[keyof typeof ProductUnit];

// Types pour les formulaires
export interface CreateProductData {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  supplierId: string;
  unitPrice: number;
  costPrice: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: ProductUnit;
  images?: File[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}
