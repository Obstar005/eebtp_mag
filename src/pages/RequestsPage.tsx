import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye } from "lucide-react";
import { RequestStatus, RequestStatusLabels } from "../types/request";
import { useDemandes, useDemandeStats } from "../hooks/useDemandes";
import { useAccess } from "../hooks/useAccessPermissions";
import type { PeriodeType } from "../services/api/demandeService";
import { getErrorMessage } from "../utils/errorHandling";
import { getStatusBadge, getStatusIcon } from "../utils/statutUtils";
import { AccessDenied } from "../components/ui/AccessGuard";

export function RequestsPage() {
  const [activeTab, setActiveTab] = useState<RequestStatus>("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeriode, setSelectedPeriode] = useState<PeriodeType>("total");
  const itemsPerPage = 10;

  // Permissions
  const { demande: demandePerms, isLoading: permissionsLoading } = useAccess();

  // Récupération des demandes depuis l'API
  const {
    data: demandesResponse,
    isLoading,
    error,
  } = useDemandes({
    status: activeTab === "tous" ? undefined : activeTab,
    search: searchQuery || undefined,
    periode: selectedPeriode,
  });

  // Récupération des statistiques pour les compteurs
  const { data: stats } = useDemandeStats(selectedPeriode);

  // Extraire les demandes de la réponse
  const allRequests = demandesResponse?.data || [];

  const navigate = useNavigate();

  // Les données sont déjà filtrées par le hook useDemandes
  // Pagination côté client pour l'instant
  const totalPages = Math.ceil(allRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = allRequests.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Compter les demandes par statut (utiliser les stats de l'API)
  const getStatusCount = (status: RequestStatus) => {
    if (!stats) return 0;

    switch (status) {
      case "tous":
        return stats.total;
      case "emis":
        return stats.emises;
      case "confirme":
        return stats.confirmees;
      case "approuve":
        return stats.approuvees;
      case "valide":
        return stats.validees;
      case "refuse":
        return stats.rejetees;
      case "livre":
        return stats.livrees;
      default:
        return 0;
    }
  };

  // Gestion des états de chargement et d'erreur
  if (isLoading || permissionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Demandes</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Vérification des permissions de vue
  if (!demandePerms.canView) {
    return (
      <AccessDenied message="Vous n'avez pas la permission de consulter les demandes." />
    );
  }

  if (error) {
    const errorMessage = getErrorMessage(error);
    const isPermissionError = errorMessage.includes("Permission refusée");

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Demandes</h1>
        </div>
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 font-medium mb-2">
            {isPermissionError ? "Accès non autorisé" : "Erreur de chargement"}
          </div>
          <p className="text-gray-700 whitespace-pre-line">{errorMessage}</p>
          {isPermissionError && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                💡 <strong>Conseil :</strong> Contactez votre administrateur
                pour obtenir les permissions nécessaires pour consulter les
                demandes.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Demandes</h1>
        </div>
        {/* Filtres Jour/Semaine/Mois */}
        <div className="flex bg-blue-50 rounded-full p-1 gap-1">
          {[
            {
              label: "Jour",
              value: "jour",
            },
            {
              label: "Semaine",
              value: "semaine",
            },
            {
              label: "Mois",
              value: "mois",
            },
            {
              label: "Total",
              value: "total",
            },
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriode(period.value as PeriodeType)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none ${
                selectedPeriode === period.value
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-500 hover:text-blue-600"
              }`}
              type="button"
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total demandes */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Total Demandes
            </span>
          </div>
          <div className="flex items-end gap-2 justify-between">
            <span className="text-3xl font-bold text-gray-900">
              {(stats?.total ?? 0).toLocaleString()}
            </span>
            <div className="flex items-center text-sm">
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  (stats?.variationVsHier?.total ?? 0) >= 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {(stats?.variationVsHier?.total ?? 0) >= 0 ? "+" : ""}
                {stats?.variationVsHier?.total ?? 0}%
              </span>
              <span className="ml-2 text-gray-500">vs. Hier</span>
            </div>
          </div>
        </div>
        {/* Demandes approuvées */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Demandes Approuvées
            </span>
          </div>
          <div className="flex items-end gap-2 justify-between">
            <span className="text-3xl font-bold text-gray-900">
              {(stats?.approuvees ?? 0).toLocaleString()}
            </span>
            <div className="flex items-center text-sm">
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  (stats?.variationVsHier?.approuvees ?? 0) >= 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {(stats?.variationVsHier?.approuvees ?? 0) >= 0 ? "+" : ""}
                {stats?.variationVsHier?.approuvees ?? 0}%
              </span>
              <span className="ml-2 text-gray-500">vs. Hier</span>
            </div>
          </div>
        </div>
        {/* Demandes en attente */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Demandes en Attente
            </span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span className="text-3xl font-bold text-gray-900">
              {(
                stats?.enAttenteValidation ??
                (stats?.emises ?? 0) + (stats?.confirmees ?? 0)
              ).toLocaleString()}
            </span>
            <div className="flex items-center text-sm">
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  (stats?.variationVsHier?.enAttente ?? 0) >= 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {(stats?.variationVsHier?.enAttente ?? 0) >= 0 ? "+" : ""}
                {stats?.variationVsHier?.enAttente ?? 0}%
              </span>
              <span className="ml-2 text-gray-500">vs. Hier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs et Search */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-4">
            {/* Tabs - Version desktop */}
            <div className="hidden md:flex space-x-8">
              {(
                [
                  "tous",
                  "emis",
                  "approuve",
                  "valide",
                  "livre",
                  "refuse",
                ] as RequestStatus[]
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setActiveTab(status);
                    setCurrentPage(1);
                  }}
                  className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === status
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {RequestStatusLabels[status]} ({getStatusCount(status)})
                </button>
              ))}
            </div>

            {/* Tabs - Version mobile (dropdown) */}
            <div className="md:hidden w-full">
              <select
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value as RequestStatus);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm font-medium"
                title="Filtrer par statut"
              >
                {(
                  [
                    "tous",
                    "emis",
                    "approuve",
                    "valide",
                    "livre",
                    "refuse",
                  ] as RequestStatus[]
                ).map((status) => (
                  <option key={status} value={status}>
                    {RequestStatusLabels[status]} ({getStatusCount(status)})
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom du magasinier
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qté Demandée
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qté Approuvée
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qté Validée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de demande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchQuery || activeTab !== "tous"
                      ? "Aucune demande trouvée pour les critères sélectionnés"
                      : "Aucune demande disponible"}
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.demande}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {request.nomMagasinier}
                    </td>
                    <td className="text-right px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {request.quantiteDemandee}
                    </td>
                    <td className="text-right px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {request.quantiteApprouvee ?? "-"}
                    </td>
                    <td className="text-right px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {request.quantiteValidee ?? "-"}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={getStatusBadge(request.status)}>
                        {getStatusIcon(request.status)}
                        {RequestStatusLabels[request.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {request.dateDemande}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-0.5 px-2  bg-green-500 text-gray-100 hover:bg-green-600 transition-colors"
                          title="Voir"
                          onClick={() => navigate(`/requests/${request.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {/* <button
                          className="p-0.5 px-2  bg-orange-400 text-gray-100 hover:bg-orange-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 px-3 bg-red-500 text-gray-100 hover:bg-red-600 transition-colors rounded-md"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            Affichage de {startIndex + 1} à{" "}
            {Math.min(startIndex + itemsPerPage, allRequests.length)} sur{" "}
            {allRequests.length} données
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <span className="sr-only">Précédent</span>/
            </button>

            <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
              {currentPage}
            </span>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {totalPages}
            </button>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <span className="sr-only">Suivant</span>
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
