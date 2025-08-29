import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { magasinService } from "../services/api/magasinService";
import type {
  CreateMagasinData,
  UpdateMagasinData,
  MagasinFilter,
  CreateStockArticleData,
  UpdateStockArticleData,
  StockArticleFilter,
} from "../types/magasin";

// Clés de requête pour les magasins
export const magasinKeys = {
  all: ["magasins"] as const,
  lists: () => [...magasinKeys.all, "list"] as const,
  list: (filter: MagasinFilter) => [...magasinKeys.lists(), filter] as const,
  details: () => [...magasinKeys.all, "detail"] as const,
  detail: (id: number) => [...magasinKeys.details(), id] as const,
  stats: () => [...magasinKeys.all, "stats"] as const,

  // Articles
  articles: (magasinId: number) =>
    [...magasinKeys.all, "articles", magasinId] as const,
  articlesList: (magasinId: number, filter: StockArticleFilter) =>
    [...magasinKeys.articles(magasinId), "list", filter] as const,
  articleDetail: (id: number) => [...magasinKeys.all, "article", id] as const,
};

// Hooks pour les magasins
export function useMagasins(filter: MagasinFilter = {}) {
  return useQuery({
    queryKey: magasinKeys.list(filter),
    queryFn: () => magasinService.getMagasins(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMagasin(id: number | null) {
  return useQuery({
    queryKey: magasinKeys.detail(id!),
    queryFn: () => magasinService.getMagasin(id!),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useCreateMagasin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMagasinData) => magasinService.createMagasin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: magasinKeys.lists() });
      queryClient.invalidateQueries({ queryKey: magasinKeys.stats() });
    },
  });
}

export function useUpdateMagasin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMagasinData) => magasinService.updateMagasin(data),
    onSuccess: (updatedMagasin) => {
      queryClient.invalidateQueries({ queryKey: magasinKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: magasinKeys.detail(updatedMagasin.id),
      });
      queryClient.invalidateQueries({ queryKey: magasinKeys.stats() });
    },
  });
}

export function useDeleteMagasin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => magasinService.deleteMagasin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: magasinKeys.lists() });
      queryClient.invalidateQueries({ queryKey: magasinKeys.stats() });
    },
  });
}

export function useMagasinStats() {
  return useQuery({
    queryKey: magasinKeys.stats(),
    queryFn: () => magasinService.getMagasinStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hooks pour les articles de stock
export function useStockArticles(
  magasinId: number,
  filter: StockArticleFilter = {}
) {
  return useQuery({
    queryKey: magasinKeys.articlesList(magasinId, filter),
    queryFn: () => magasinService.getStockArticles(magasinId, filter),
    staleTime: 2 * 60 * 1000,
    enabled: !!magasinId,
  });
}

export function useStockArticle(id: number) {
  return useQuery({
    queryKey: magasinKeys.articleDetail(id),
    queryFn: () => magasinService.getStockArticle(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useCreateStockArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockArticleData) =>
      magasinService.createStockArticle(data),
    onSuccess: (newArticle) => {
      // Invalider la liste des articles du magasin
      queryClient.invalidateQueries({
        queryKey: magasinKeys.articles(newArticle.magasin_id),
      });
      queryClient.invalidateQueries({ queryKey: magasinKeys.stats() });
    },
  });
}

export function useUpdateStockArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStockArticleData) =>
      magasinService.updateStockArticle(data),
    onSuccess: (updatedArticle) => {
      // Invalider la liste des articles
      queryClient.invalidateQueries({
        queryKey: magasinKeys.articles(updatedArticle.magasin_id),
      });
      queryClient.invalidateQueries({
        queryKey: magasinKeys.articleDetail(updatedArticle.id),
      });
      queryClient.invalidateQueries({ queryKey: magasinKeys.stats() });
    },
  });
}

export function useDeleteStockArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => magasinService.deleteStockArticle(id),
    onSuccess: () => {
      // Invalider toutes les listes d'articles (on ne connaît pas forcément le magasinId)
      queryClient.invalidateQueries({
        queryKey: magasinKeys.all,
      });
      queryClient.invalidateQueries({ queryKey: magasinKeys.stats() });
    },
  });
}
