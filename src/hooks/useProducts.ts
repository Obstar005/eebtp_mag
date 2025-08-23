import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/api";
import type {
  ProductCategory,
  Supplier,
  CreateProductData,
  UpdateProductData,
  ProductFilter,
} from "../types";

// Clés de requête pour les produits
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filter: ProductFilter) => [...productKeys.lists(), filter] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  categories: ["categories"] as const,
  suppliers: ["suppliers"] as const,
};

// Hook pour récupérer les produits avec pagination et filtres
export function useProducts(filter?: ProductFilter) {
  return useQuery({
    queryKey: productKeys.list(filter || {}),
    queryFn: () => productService.getProducts(filter),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook pour récupérer un produit par ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
}

// Hook pour créer un produit
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Hook pour mettre à jour un produit
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductData) => productService.updateProduct(data),
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(
        productKeys.detail(updatedProduct.id),
        updatedProduct
      );
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Hook pour supprimer un produit
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Hook pour récupérer les catégories
export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: () => productService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook pour créer une catégorie
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<ProductCategory, "id">) =>
      productService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.categories });
    },
  });
}

// Hook pour récupérer les fournisseurs
export function useSuppliers() {
  return useQuery({
    queryKey: productKeys.suppliers,
    queryFn: () => productService.getSuppliers(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook pour créer un fournisseur
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Supplier, "id">) =>
      productService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.suppliers });
    },
  });
}
