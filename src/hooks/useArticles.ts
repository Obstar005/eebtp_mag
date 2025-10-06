import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articleService } from "../services/api/articleService";
import type {
  CreateStockArticleData,
  UpdateStockArticleData,
  StockArticleFilter,
} from "../types/magasin";

// Clés de requête pour les articles
export const articleKeys = {
  all: ["articles"] as const,
  lists: () => [...articleKeys.all, "list"] as const,
  list: (magasinId: number, filter: StockArticleFilter) =>
    [...articleKeys.lists(), magasinId, filter] as const,
  details: () => [...articleKeys.all, "detail"] as const,
  detail: (id: number) => [...articleKeys.details(), id] as const,
};

/**
 * Hook pour récupérer la liste des articles d'un magasin
 */
export function useStockArticles(
  magasinId: number,
  filter: StockArticleFilter = {}
) {
  return useQuery({
    queryKey: articleKeys.list(magasinId, filter),
    queryFn: () => articleService.getArticles(magasinId, filter),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!magasinId,
  });
}

/**
 * Hook pour récupérer un article par son ID
 */
export function useStockArticle(id: number) {
  return useQuery({
    queryKey: articleKeys.detail(id),
    queryFn: () => articleService.getArticle(id),
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook pour créer un nouvel article
 */
export function useCreateStockArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockArticleData) =>
      articleService.createArticle(data),
    onSuccess: (newArticle) => {
      // Invalider la liste des articles du magasin
      queryClient.invalidateQueries({
        queryKey: articleKeys.lists(),
      });

      // Mettre à jour le cache de l'article créé
      queryClient.setQueryData(articleKeys.detail(newArticle.id), newArticle);

      console.log("✅ Article créé avec succès:", newArticle);
    },
    onError: (error) => {
      console.error("❌ Erreur lors de la création de l'article:", error);
    },
  });
}

/**
 * Hook pour mettre à jour un article
 */
export function useUpdateStockArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStockArticleData) =>
      articleService.updateArticle(data),
    onSuccess: (updatedArticle) => {
      // Invalider la liste des articles
      queryClient.invalidateQueries({
        queryKey: articleKeys.lists(),
      });

      // Mettre à jour le cache de l'article
      queryClient.setQueryData(
        articleKeys.detail(updatedArticle.id),
        updatedArticle
      );

      console.log("✅ Article mis à jour avec succès:", updatedArticle);
    },
    onError: (error) => {
      console.error("❌ Erreur lors de la mise à jour de l'article:", error);
    },
  });
}

/**
 * Hook pour supprimer un article
 */
export function useDeleteStockArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => articleService.deleteArticle(id),
    onSuccess: (_result, deletedId) => {
      // Invalider la liste des articles
      queryClient.invalidateQueries({
        queryKey: articleKeys.lists(),
      });

      // Supprimer l'article du cache
      queryClient.removeQueries({
        queryKey: articleKeys.detail(deletedId),
      });

      console.log("✅ Article supprimé avec succès:", deletedId);
    },
    onError: (error) => {
      console.error("❌ Erreur lors de la suppression de l'article:", error);
    },
  });
}
