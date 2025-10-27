import { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  RefreshCw,
  User,
  Clock,
  Eye,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  useNotifications,
  useNotificationStats,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useClearReadNotifications,
} from "../hooks/useNotifications";
import {
  ACTION_TYPE_ICONS,
  ACTION_TYPE_COLORS,
  ACTION_TYPE_CATEGORIES,
  type Notification,
} from "../types/notification";
import type { NotificationFilters } from "../types/notification";

export function NotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 20; // Constante au lieu d'état

  // Hooks pour les données
  const {
    data: notificationsResponse,
    isLoading,
    error,
    refetch,
  } = useNotifications(filters, currentPage, pageSize, false);

  const { data: stats } = useNotificationStats(false);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const clearReadMutation = useClearReadNotifications();

  const notifications = notificationsResponse?.data || [];
  const totalPages = notificationsResponse?.totalPages || 1;
  const total = notificationsResponse?.total || 0;

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate(notifications);
  };

  const handleClearRead = () => {
    clearReadMutation.mutate();
  };

  const handleFilterChange = (newFilters: Partial<NotificationFilters>) => {
    setFilters((prev: NotificationFilters) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const getIconComponent = (actionType: string) => {
    const iconName = ACTION_TYPE_ICONS[actionType] || "bell";

    switch (iconName) {
      case "user-check":
        return <User className="h-5 w-5" />;
      case "plus-circle":
        return <span className="h-5 w-5 rounded-full bg-current"></span>;
      case "edit":
        return <span className="h-5 w-5 text-current">✏️</span>;
      case "trash-2":
        return <Trash2 className="h-5 w-5" />;
      case "eye":
        return <Eye className="h-5 w-5" />;
      case "check-circle":
        return <Check className="h-5 w-5" />;
      case "thumbs-up":
        return <span className="h-5 w-5 text-current">👍</span>;
      case "thumbs-down":
        return <span className="h-5 w-5 text-current">👎</span>;
      case "check-square":
        return <CheckCheck className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    return ACTION_TYPE_CATEGORIES[actionType] || actionType;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  const formatFullDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  const actionTypes = Array.from(
    new Set(notifications.map((n: { action_type: string }) => n.action_type))
  );

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              Gérez vos notifications et l'historique des actions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualiser
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-900">Non lues</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.unread}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">Récentes</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.recent}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCheck className="h-8 w-8 text-gray-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Lues</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.total - stats.unread}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'action
              </label>
              <select
                value={filters.action_type || ""}
                onChange={(e) =>
                  handleFilterChange({
                    action_type: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les types</option>
                {actionTypes.map((type: string) => (
                  <option key={type} value={type}>
                    {getActionTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                État de lecture
              </label>
              <select
                value={
                  filters.isRead !== undefined
                    ? filters.isRead
                      ? "read"
                      : "unread"
                    : ""
                }
                onChange={(e) =>
                  handleFilterChange({
                    isRead:
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "read",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Utilisateur
              </label>
              <input
                type="text"
                value={filters.user || ""}
                onChange={(e) =>
                  handleFilterChange({ user: e.target.value || undefined })
                }
                placeholder="Nom d'utilisateur..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Effacer les filtres
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Marquer tout comme lu
              </button>
              <button
                onClick={handleClearRead}
                disabled={clearReadMutation.isPending}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Nettoyer les lues
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des notifications */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">
              Erreur lors du chargement des notifications
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune notification trouvée</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icône */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        ACTION_TYPE_COLORS[notification.action_type] ||
                        "text-gray-600 bg-gray-50"
                      }`}
                    >
                      {getIconComponent(notification.action_type)}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {getActionTypeLabel(notification.action_type)}
                          </h3>
                          {!notification.isRead && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {formatDate(notification.date_action)}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Marquer comme lu"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 mt-2">
                        {notification.description}
                      </p>

                      <div className="flex items-center mt-3 text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{notification.user}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {formatFullDate(notification.date_action)}
                          </span>
                        </div>
                      </div>

                      {notification.objet_concerne && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Objet concerné :</strong>{" "}
                            {notification.objet_concerne}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
                    {Math.min(currentPage * pageSize, total)} sur {total}{" "}
                    notifications
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </button>
                  <span className="px-3 py-2 text-sm">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
