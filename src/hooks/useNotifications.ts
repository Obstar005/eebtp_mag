import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApiService } from "../services/api/notificationService";
import type { Notification, NotificationFilters } from "../types/notification";

// Hook pour récupérer les notifications de l'utilisateur
export function useUserNotifications() {
  return useQuery({
    queryKey: ["notifications", "user"],
    queryFn: () => notificationApiService.getUserNotifications(),
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // Actualiser toutes les minutes
  });
}

// Hook pour récupérer toutes les notifications (admin)
export function useAllNotifications() {
  return useQuery({
    queryKey: ["notifications", "all"],
    queryFn: () => notificationApiService.getAllNotifications(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

// Hook pour récupérer les notifications avec pagination et filtres
export function useNotifications(
  filters?: NotificationFilters,
  page: number = 1,
  limit: number = 20,
  allNotifications: boolean = false
) {
  return useQuery({
    queryKey: [
      "notifications",
      "paginated",
      { filters, page, limit, allNotifications },
    ],
    queryFn: () =>
      notificationApiService.getNotifications(
        filters,
        page,
        limit,
        allNotifications
      ),
    staleTime: 30000,
    placeholderData: (previousData) => previousData, // Remplacer keepPreviousData par placeholderData
  });
}

// Hook pour récupérer les statistiques des notifications
export function useNotificationStats(allNotifications: boolean = false) {
  return useQuery({
    queryKey: ["notifications", "stats", { allNotifications }],
    queryFn: () =>
      notificationApiService.getNotificationStats(allNotifications),
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Actualiser toutes les 2 minutes
  });
}

// Hook pour marquer une notification comme lue
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => {
      notificationApiService.markAsRead(notificationId);
      return Promise.resolve();
    },
    onSuccess: () => {
      // Invalider les requêtes de notifications pour les mettre à jour
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// Hook pour marquer toutes les notifications comme lues
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notifications: Notification[]) => {
      notificationApiService.markAllAsRead(notifications);
      return Promise.resolve();
    },
    onSuccess: () => {
      // Invalider les requêtes de notifications pour les mettre à jour
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// Hook pour effacer toutes les notifications lues
export function useClearReadNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      notificationApiService.clearReadNotifications();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Invalider les requêtes de notifications pour les mettre à jour
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// Hook pour obtenir le nombre de notifications non lues
export function useUnreadNotificationsCount(allNotifications: boolean = false) {
  const { data: stats } = useNotificationStats(allNotifications);
  return stats?.unread || 0;
}

// Hook pour obtenir les notifications récentes (dernières 24h)
export function useRecentNotifications(
  allNotifications: boolean = false,
  limit: number = 5
) {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const filters: NotificationFilters = {
    dateFrom: yesterday.toISOString(),
  };

  return useQuery({
    queryKey: ["notifications", "recent", { allNotifications, limit }],
    queryFn: () =>
      notificationApiService.getNotifications(
        filters,
        1,
        limit,
        allNotifications
      ),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
