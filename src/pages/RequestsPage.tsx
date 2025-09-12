import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Edit, Trash2, ArrowUpRight } from "lucide-react";
import {
  type MaterialRequest,
  RequestStatus,
  RequestStatusLabels,
} from "../types/request";

export function RequestsPage() {
  const [activeTab, setActiveTab] = useState<RequestStatus>("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Données mockées basées sur l'image et le schéma de base de données
  const mockRequests: MaterialRequest[] = [
    {
      id: "1",
      demande: "Ciment",
      nomMagasinier: "John Doe",
      quantiteDemandee: 20,
      profil: "Magasinier",
      status: "approuve", // Utilisation du nouveau statut
      dateDemande: "01-01-2025 à 3h00",
      createdAt: "2025-01-01T03:00:00Z",
      updatedAt: "2025-01-01T03:00:00Z",
    },
    {
      id: "2",
      demande: "Fer de 8",
      nomMagasinier: "John Doe",
      quantiteDemandee: 20,
      profil: "Magasinier",
      status: "approuve", // Utilisation du nouveau statut
      dateDemande: "01-01-2025 à 3h00",
      createdAt: "2025-01-01T03:00:00Z",
      updatedAt: "2025-01-01T03:00:00Z",
    },
    {
      id: "3",
      demande: "Ciment",
      nomMagasinier: "John Doe",
      quantiteDemandee: 20,
      profil: "Magasinier",
      status: "emis", // Statut "émis" au lieu de "refusé"
      dateDemande: "01-01-2025 à 3h00",
      createdAt: "2025-01-01T03:00:00Z",
      updatedAt: "2025-01-01T03:00:00Z",
    },
    {
      id: "4",
      demande: "Ciment",
      nomMagasinier: "Emily Davis",
      quantiteDemandee: 100,
      profil: "Chef appro",
      status: "emis", // Statut "émis"
      dateDemande: "01-01-2025 à 3h00",
      createdAt: "2025-01-01T03:00:00Z",
      updatedAt: "2025-01-01T03:00:00Z",
    },
  ];

  // Filtrer les demandes selon l'onglet actif
  const filteredRequests = mockRequests.filter((request) => {
    const matchesTab = activeTab === "tous" || request.status === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      request.demande.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.nomMagasinier.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const navigate = useNavigate();
  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Compter les demandes par statut
  const getStatusCount = (status: RequestStatus) => {
    if (status === "tous") return mockRequests.length;
    return mockRequests.filter((req) => req.status === status).length;
  };

  const getStatusBadge = (status: RequestStatus) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "approuve":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "emis":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "valide":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "livre":
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case "refuse":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Demandes</h1>
        {/* Filtres Jour/Semaine/Mois */}
        <div className="flex bg-blue-50 rounded-full p-1 gap-1">
          {["Jour", "Semaine", "Mois"].map((label, idx) => (
            <button
              key={label}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none ${
                idx === 0
                  ? "bg-white text-blue-600 shadow" // Par défaut, 'Jour' sélectionné
                  : "text-gray-500 hover:text-blue-600"
              }`}
              // TODO: Gérer l'état sélectionné si besoin
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Utilisateurs total */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Utilisateurs Total
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <span className="text-lg">&#8942;</span>
            </button>
          </div>
          <div className="flex items-end gap-2 justify-between">
            <span className="text-3xl font-bold text-gray-900">2,420</span>
            <div className="flex items-end justify-end gap-2">
              <span className="text-green-600 text-xs font-semibold bg-green-100 px-2 py-0.5 rounded-full">
                +20%
              </span>
              <span className="text-xs text-gray-400">vs. Hier</span>
            </div>
          </div>
        </div>
        {/* Projets actifs */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Projets Actif
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <span className="text-lg">&#8942;</span>
            </button>
          </div>
          <div className="flex items-end gap-2 justify-between">
            <span className="text-3xl font-bold text-gray-900">2,420</span>
            <div className="flex items-end gap-2">
              <span className="text-red-600 text-xs font-semibold bg-red-100 px-2 py-0.5 rounded-full">
                -20%
              </span>
              <span className="text-xs text-gray-400">vs. Hier</span>
            </div>
          </div>
        </div>
        {/* Utilisateurs connectés */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Utilisateurs Connectés
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <span className="text-lg">&#8942;</span>
            </button>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span className="text-3xl font-bold text-gray-900">316</span>
            <div className="flex -space-x-2">
              <img
                src="/vite.svg"
                alt="avatar"
                className="w-6 h-6 rounded-full border-2 border-white"
              />
              <img
                src="/vite.svg"
                alt="avatar"
                className="w-6 h-6 rounded-full border-2 border-white"
              />
              <img
                src="/vite.svg"
                alt="avatar"
                className="w-6 h-6 rounded-full border-2 border-white"
              />
              <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 border-2 border-white">
                +6
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs et Search */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            {/* Tabs */}
            <div className="flex space-x-8">
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

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité Demandée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profil
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
              {paginatedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.demande}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                    {request.nomMagasinier}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                    {request.quantiteDemandee}t
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                    {request.profil}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={getStatusBadge(request.status)}>
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
                      <button
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
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            Affichage de {startIndex + 1} à{" "}
            {Math.min(startIndex + itemsPerPage, filteredRequests.length)} sur{" "}
            {filteredRequests.length} données
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
