import {
  ArrowLeft,
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
  RefreshCw,
  User,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccess } from "../hooks/useAccessPermissions";
import { AccessDenied } from "../components/ui/AccessGuard";
import { formatApiDate } from "../utils/formatUtils";
import { notificationApiService } from "../services/api/notificationService";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "../types/notification";

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

// Hook pour récupérer tout l'historique
function useAllHistorique() {
  return useQuery({
    queryKey: ["historique", "all"],
    queryFn: () => notificationApiService.getAllHistorique(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function HistoriquePage() {
  const navigate = useNavigate();
  const { historique: historiquePerms, isLoading: permissionsLoading } =
    useAccess();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActionType, setSelectedActionType] = useState<string>("");

  // Récupérer tout l'historique
  const { data: historique = [], isLoading, refetch } = useAllHistorique();

  // Filtrer l'historique
  const filteredHistorique = historique.filter((item: Notification) => {
    const matchesSearch =
      !searchQuery ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.objet_concerne?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      !selectedActionType ||
      item.action_type.toLowerCase().includes(selectedActionType.toLowerCase());

    return matchesSearch && matchesType;
  });

  // Extraire les types d'actions uniques pour le filtre
  const actionTypes = Array.from(
    new Set(historique.map((item: Notification) => item.action_type)),
  );

  // Vérification des permissions de chargement
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Vérification des permissions de consultation
  if (!historiquePerms?.canView) {
    return (
      <AccessDenied message="Vous n'avez pas la permission de consulter l'historique des actions." />
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Historique des actions
            </h1>
            <p className="text-sm text-gray-500">
              Consultez l'historique de toutes les actions effectuées dans le
              système
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par description, utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtre par type d'action */}
          <div className="w-full md:w-64">
            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Filtrer par type d'action"
            >
              <option value="">Tous les types</option>
              {actionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">
                {historique.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Créations</p>
              <p className="text-xl font-bold text-gray-900">
                {
                  historique.filter((h: Notification) =>
                    h.action_type.toLowerCase().includes("creation"),
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Edit className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Modifications</p>
              <p className="text-xl font-bold text-gray-900">
                {
                  historique.filter((h: Notification) =>
                    h.action_type.toLowerCase().includes("modification"),
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Validations</p>
              <p className="text-xl font-bold text-gray-900">
                {
                  historique.filter((h: Notification) =>
                    h.action_type.toLowerCase().includes("validation"),
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste de l'historique */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Historique des actions
              </h2>
              <span className="text-sm text-gray-500">
                ({filteredHistorique.length} résultat
                {filteredHistorique.length > 1 ? "s" : ""})
              </span>
            </div>
          </div>
        </div>

        {/* Liste */}
        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-500">Chargement...</span>
            </div>
          ) : filteredHistorique.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Clock className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-lg font-medium">Aucune action trouvée</p>
              <p className="text-sm">
                {searchQuery || selectedActionType
                  ? "Essayez de modifier vos filtres"
                  : "L'historique est vide"}
              </p>
            </div>
          ) : (
            filteredHistorique.map((item: Notification) => (
              <div
                key={item.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  {/* Icône */}
                  <div
                    className={`flex-shrink-0 p-2 rounded-lg ${getActionColor(item.action_type)}`}
                  >
                    {getActionIcon(item.action_type)}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {item.description}
                      </p>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatApiDate(item.date_action)}
                      </span>
                    </div>

                    <div className="flex items-center mt-1 space-x-4">
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        <span>{item.user}</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {item.action_type}
                      </span>
                    </div>

                    {item.objet_concerne && (
                      <p className="text-xs text-gray-400 mt-1">
                        Objet: {item.objet_concerne}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
