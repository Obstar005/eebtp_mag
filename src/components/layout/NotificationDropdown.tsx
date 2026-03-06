import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, X, Clock, User, Eye } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "react-toast";
import {
  useUserNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "../../hooks/useNotifications";
import {
  ACTION_TYPE_ICONS,
  ACTION_TYPE_COLORS,
  ACTION_TYPE_CATEGORIES,
} from "../../types/notification";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hooks pour les données
  const { data: notifications = [], isLoading, error } = useUserNotifications();
  const unreadCount = useUnreadNotificationsCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId, {
      onSuccess: () => {
        toast.success("Notification marquée comme lue");
      },
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate(notifications, {
      onSuccess: () => {
        toast.success("Toutes les notifications marquées comme lues");
      },
    });
  };

  const getIconComponent = (actionType: string) => {
    const iconName = ACTION_TYPE_ICONS[actionType] || "bell";

    switch (iconName) {
      case "user-check":
        return <User className="h-4 w-4" />;
      case "plus-circle":
        return <span className="h-4 w-4 rounded-full bg-current"></span>;
      case "edit":
        return <span className="h-4 w-4 text-current">✏️</span>;
      case "trash-2":
        return <span className="h-4 w-4 text-current">🗑️</span>;
      case "eye":
        return <Eye className="h-4 w-4" />;
      case "check-circle":
        return <Check className="h-4 w-4" />;
      case "thumbs-up":
        return <span className="h-4 w-4 text-current">👍</span>;
      case "thumbs-down":
        return <span className="h-4 w-4 text-current">👎</span>;
      case "check-square":
        return <CheckCheck className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
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

  // Limiter à 10 notifications dans le dropdown
  const recentNotifications = notifications.slice(0, 10);
  const hasMoreNotifications = notifications.length > 10;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    disabled={markAllAsReadMutation.isPending}
                  >
                    Tout marquer comme lu
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue
                {unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Chargement...</p>
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-red-600">
                  Erreur lors du chargement des notifications
                </p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icône */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          ACTION_TYPE_COLORS[notification.action_type] ||
                          "text-gray-600 bg-gray-50"
                        }`}
                      >
                        {getIconComponent(notification.action_type)}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getActionTypeLabel(notification.action_type)}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          <span className="mr-3">{notification.user}</span>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDate(notification.date_action)}</span>
                        </div>
                        {notification.objet_concerne && (
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.objet_concerne}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {hasMoreNotifications && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                Voir toutes les notifications ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
