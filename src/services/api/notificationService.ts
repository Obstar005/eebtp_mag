import { apiClient } from "./client";
import type {
  HistoriqueAction,
  Notification,
  NotificationFilters,
  NotificationListResponse,
  NotificationStats,
} from "../../types/notification";
import { ACTION_TYPE_PRIORITIES } from "../../types/notification";

export class NotificationApiService {
  // Récupérer l'historique des actions de l'utilisateur connecté
  async getUserNotifications(periode: string = "total"): Promise<Notification[]> {
    try {
      const response = await apiClient.get<HistoriqueAction[]>(
        `/App/historique-user/${periode}`
      );
      // Transformer en notifications avec métadonnées
      const notifications: Notification[] = response.data.map((action) => ({
        ...action,
        isRead: this.isNotificationRead(action.id),
        priority: this.getActionPriority(action.action_type),
        category: action.action_type,
      }));

      return notifications;
    } catch (error) {
      // Si l'endpoint n'existe pas (404), retourner une liste vide plutôt que de faire échouer
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 404
      ) {
        return [];
      }
      throw new Error("Impossible de récupérer les notifications");
    }
  }

  // Récupérer toutes les notifications du système (pour les administrateurs)
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<HistoriqueAction[]>(
        "/App/historique-toutes-actions"
      );


      // Transformer en notifications avec métadonnées
      const notifications: Notification[] = response.data.map((action) => ({
        ...action,
        isRead: this.isNotificationRead(action.id),
        priority: this.getActionPriority(action.action_type),
        category: action.action_type,
      }));

      return notifications;
    } catch (error) {
      throw new Error("Impossible de récupérer toutes les notifications");
    }
  }

  // Récupérer les notifications avec pagination et filtres
  async getNotifications(
    filters?: NotificationFilters,
    page: number = 1,
    limit: number = 20,
    allNotifications: boolean = false,
    periode: string = "total"
  ): Promise<NotificationListResponse> {
    try {
      // Récupérer toutes les notifications ou seulement celles de l'utilisateur
      const allData = allNotifications
        ? await this.getAllNotifications()
        : await this.getUserNotifications(periode);

      // Appliquer les filtres
      let filteredData = [...allData];

      if (filters?.action_type) {
        filteredData = filteredData.filter(
          (n) => n.action_type === filters.action_type
        );
      }

      if (filters?.user) {
        filteredData = filteredData.filter((n) =>
          n.user.toLowerCase().includes(filters.user!.toLowerCase())
        );
      }

      if (filters?.isRead !== undefined) {
        filteredData = filteredData.filter((n) => n.isRead === filters.isRead);
      }

      if (filters?.priority) {
        filteredData = filteredData.filter(
          (n) => n.priority === filters.priority
        );
      }

      if (filters?.category) {
        filteredData = filteredData.filter(
          (n) => n.category === filters.category
        );
      }

      if (filters?.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredData = filteredData.filter(
          (n) => new Date(n.date_action) >= fromDate
        );
      }

      if (filters?.dateTo) {
        const toDate = new Date(filters.dateTo);
        filteredData = filteredData.filter(
          (n) => new Date(n.date_action) <= toDate
        );
      }

      // Trier par date (plus récent en premier)
      filteredData.sort(
        (a, b) =>
          new Date(b.date_action).getTime() - new Date(a.date_action).getTime()
      );

      // Pagination
      const total = filteredData.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const data = filteredData.slice(startIndex, endIndex);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les statistiques des notifications
  async getNotificationStats(
    allNotifications: boolean = false,
    periode: string = "total"
  ): Promise<NotificationStats> {
    try {
      const notifications = allNotifications
        ? await this.getAllNotifications()
        : await this.getUserNotifications(periode);

      const total = notifications.length;
      const unread = notifications.filter((n) => !n.isRead).length;

      // Statistiques par type d'action
      const byActionType: Record<string, number> = {};
      notifications.forEach((n) => {
        byActionType[n.action_type] = (byActionType[n.action_type] || 0) + 1;
      });

      // Statistiques par utilisateur
      const byUser: Record<string, number> = {};
      notifications.forEach((n) => {
        byUser[n.user] = (byUser[n.user] || 0) + 1;
      });

      // Notifications récentes (dernières 24h)
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recent = notifications.filter(
        (n) => new Date(n.date_action) >= yesterday
      ).length;

      return {
        total,
        unread,
        byActionType,
        byUser,
        recent,
      };
    } catch (error) {
      throw error;
    }
  }

  // Marquer une notification comme lue
  markAsRead(notificationId: number): void {
    try {
      const readNotifications = this.getReadNotifications();
      if (!readNotifications.includes(notificationId)) {
        readNotifications.push(notificationId);
        localStorage.setItem(
          "readNotifications",
          JSON.stringify(readNotifications)
        );
      }
    } catch (error) {
    }
  }

  // Marquer toutes les notifications comme lues
  markAllAsRead(notifications: Notification[]): void {
    try {
      const readNotifications = this.getReadNotifications();
      const newReadIds = notifications
        .map((n) => n.id)
        .filter((id) => !readNotifications.includes(id));

      const updatedReadNotifications = [...readNotifications, ...newReadIds];
      localStorage.setItem(
        "readNotifications",
        JSON.stringify(updatedReadNotifications)
      );
    } catch (error) {
    }
  }

  // Vérifier si une notification est lue
  private isNotificationRead(notificationId: number): boolean {
    try {
      const readNotifications = this.getReadNotifications();
      return readNotifications.includes(notificationId);
    } catch (error) {
      return false;
    }
  }

  // Récupérer la liste des notifications lues depuis localStorage
  private getReadNotifications(): number[] {
    try {
      const stored = localStorage.getItem("readNotifications");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  // Obtenir la priorité d'une action
  private getActionPriority(actionType: string): "low" | "medium" | "high" {
    return ACTION_TYPE_PRIORITIES[actionType] || "medium";
  }

  // Effacer toutes les notifications lues du localStorage
  clearReadNotifications(): void {
    try {
      localStorage.removeItem("readNotifications");
    } catch (error) {
    }
  }
}

// Instance exportée
export const notificationApiService = new NotificationApiService();
