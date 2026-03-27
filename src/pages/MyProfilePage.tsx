import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Shield,
  Calendar,
  Bell,
  Clock,
  FileText,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  XCircle,
  LogIn,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { formatRole } from "../utils/formatUtils";
import { formatApiDate } from "../utils/formatUtils";
import { useUserNotifications } from "../hooks/useNotifications";
import type { Notification } from "../types/notification";

// Périodes disponibles pour le filtre
const PERIODES = [
  { value: "jour", label: "Aujourd'hui" },
  { value: "semaine", label: "Cette semaine" },
  { value: "mois", label: "Ce mois" },
  { value: "total", label: "Tout" },
] as const;

// Icône selon le type d'action
const getActionIcon = (actionType: string) => {
  const type = actionType.toLowerCase();
  if (type.includes("connexion")) return <LogIn className="h-4 w-4" />;
  if (type.includes("creation") || type.includes("création"))
    return <FileText className="h-4 w-4" />;
  if (type.includes("modification")) return <Edit className="h-4 w-4" />;
  if (type.includes("suppression")) return <Trash2 className="h-4 w-4" />;
  if (type.includes("consultation")) return <Eye className="h-4 w-4" />;
  if (type.includes("validation")) return <CheckCircle className="h-4 w-4" />;
  if (type.includes("approbation")) return <ThumbsUp className="h-4 w-4" />;
  if (type.includes("rejet")) return <XCircle className="h-4 w-4" />;
  return <Bell className="h-4 w-4" />;
};

// Couleur selon le type d'action
const getActionColor = (actionType: string) => {
  const type = actionType.toLowerCase();
  if (type.includes("connexion")) return "bg-blue-100 text-blue-600";
  if (type.includes("creation") || type.includes("création"))
    return "bg-green-100 text-green-600";
  if (type.includes("modification")) return "bg-yellow-100 text-yellow-600";
  if (type.includes("suppression")) return "bg-red-100 text-red-600";
  if (type.includes("validation")) return "bg-emerald-100 text-emerald-600";
  if (type.includes("approbation")) return "bg-teal-100 text-teal-600";
  if (type.includes("rejet")) return "bg-rose-100 text-rose-600";
  return "bg-gray-100 text-gray-600";
};

export function MyProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPeriode, setSelectedPeriode] = useState<string>("total");

  // Récupérer les notifications de l'utilisateur
  const { data: notifications = [], isLoading: isLoadingNotifications } =
    useUserNotifications(selectedPeriode);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Carte principale du profil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête avec avatar */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center h-20 w-20 bg-white rounded-full shadow-lg">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold capitalize">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                  {formatRole(user.profil)}
                </div>
              </div>
            </div>
          </div>

          {/* Informations du profil */}
          <div className="p-6 space-y-6">
            {/* Section Contact */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Informations de contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center h-10 w-10 bg-blue-100 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.phone || "Non renseigné"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center h-10 w-10 bg-green-100 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.email || "Non renseigné"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Compte */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Informations du compte
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center h-10 w-10 bg-purple-100 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Profil</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatRole(user.profil)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center h-10 w-10 bg-orange-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date de création</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.createdAt
                        ? formatApiDate(user.createdAt, true)
                        : "Non disponible"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Statut */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Statut du compte
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Compte</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        user.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    {user.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">
                    Téléphone vérifié
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isPhoneVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.isPhoneVerified ? "Vérifié" : "Non vérifié"}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Email vérifié</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isEmailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.isEmailVerified ? "Vérifié" : "Non vérifié"}
                  </span>
                </div>
              </div>
            </div>

            {/* ID Utilisateur */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                ID Utilisateur: <span className="font-mono">{user.id}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Section Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Mes activités
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {notifications.length}
                </span>
              </div>

              {/* Filtre par période */}
              <div className="flex items-center space-x-2">
                {PERIODES.map((periode) => (
                  <button
                    key={periode.value}
                    onClick={() => setSelectedPeriode(periode.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      selectedPeriode === periode.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {periode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {isLoadingNotifications ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Bell className="h-12 w-12 mb-3 text-gray-300" />
                <p className="text-sm">Aucune activité pour cette période</p>
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`flex items-center justify-center h-9 w-9 rounded-lg ${getActionColor(
                        notification.action_type,
                      )}`}
                    >
                      {getActionIcon(notification.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.action_type}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {notification.description}
                      </p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatApiDate(notification.date_action)}
                        </span>
                        {notification.objet_concerne && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-500">
                            {notification.objet_concerne}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
