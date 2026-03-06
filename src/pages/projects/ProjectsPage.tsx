import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toast";
import {
  useProjets,
  useDeleteProjet,
  useProjetStats,
} from "../../hooks/useProjets";
import { useModal } from "../../hooks/useModal";
import { useAccess } from "../../hooks/useAccessPermissions";
import { ConfirmationModal } from "../../components/layout";
import { AccessDenied } from "../../components/ui/AccessGuard";
import { CountrySelector } from "../../components/ui/CountrySelector";
import type { ProjetFilters, ProjetStatus } from "../../types/project";
import { formatApiDate } from "../../utils/formatUtils";

export function ProjectsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ProjetFilters>({
    page: 1,
    limit: 10,
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProjetId, setSelectedProjetId] = useState<number | null>(null);

  const { data: projetsData, isLoading, error } = useProjets(filters);
  const { data: stats } = useProjetStats();
  const deleteProjetMutation = useDeleteProjet();
  const confirmDeleteModal = useModal();

  // Permissions
  const { projet: projetPerms, isLoading: permissionsLoading } = useAccess();

  // Gestion de la recherche
  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
  };

  // Gestion des filtres
  const handleFilterChange = (
    key: keyof ProjetFilters,
    value: string | number,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      pays: undefined,
      status: undefined,
      date_debut_from: undefined,
      date_fin_to: undefined,
      date_debut_to: undefined,
      chef_projet_id: undefined,
    });
    setShowFilters(false);
  };

  // Gestion de la pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Suppression d'un projet
  const handleDeleteProjet = (id: number) => {
    setSelectedProjetId(id);
    confirmDeleteModal.open();
  };

  const confirmDelete = async () => {
    if (!selectedProjetId) return;

    try {
      await deleteProjetMutation.mutateAsync(selectedProjetId);
      toast.success("Projet supprimé avec succès !");
      confirmDeleteModal.close();
      setSelectedProjetId(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression du projet");
    }
  };

  // Couleurs et labels pour les statuts
  const getStatusLabel = (status: ProjetStatus) => {
    const labels = {
      planifie: "Planifié",
      en_cours: "En cours",
      termine: "Terminé",
      annule: "Annulé",
    };
    return labels[status] || status;
  };

  if (isLoading || permissionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Vérification des permissions de vue
  if (!projetPerms.canView) {
    return (
      <AccessDenied message="Vous n'avez pas la permission de consulter les projets." />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
        </div>
        <div className="text-center text-red-600">
          Erreur lors du chargement des projets: {error.message}
        </div>
      </div>
    );
  }

  const projets = projetsData?.data || [];
  const totalPages = projetsData?.totalPages || 1;

  return (
    <div className="space-y-6 pt-4">
      {/* En-tête avec filtres par statut */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Liste des projets
          </h1>
        </div>
        {projetPerms.canCreate && (
          <button
            onClick={() => navigate("/projects/add")}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un projet
          </button>
        )}
      </div>

      {/* Filtres par statut sous forme d'onglets */}
      <div className="flex lg:items-center lg:justify-between max-lg:flex-col-reverse gap-4 mt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleFilterChange("status", "")}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              !filters.status
                ? "bg-blue-100 text-blue-800 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tous {stats ? `(${stats.total})` : ""}
          </button>
          <button
            onClick={() => handleFilterChange("status", "termine")}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              filters.status === "termine"
                ? "bg-green-100 text-green-800 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Terminer {stats ? `(${stats.termines || 0})` : ""}
          </button>
          <button
            onClick={() => handleFilterChange("status", "en_cours")}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              filters.status === "en_cours"
                ? "bg-yellow-100 text-yellow-800 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            En cours {stats ? `(${stats.en_cours || 0})` : ""}
          </button>
          <button
            onClick={() => handleFilterChange("status", "annule")}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              filters.status === "annule"
                ? "bg-red-100 text-red-800 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Annuler {stats ? `(${stats.annules || 0})` : ""}
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher"
              value={filters.search || ""}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Panneau de filtres avancés */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtre par pays */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays
              </label>
              <CountrySelector
                value={undefined}
                displayMode="name"
                placeholder="Tous les pays"
                onChange={(country) =>
                  handleFilterChange("pays", country.abbreviation)
                }
              />
            </div>

            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={filters.date_debut_from || ""}
                onChange={(e) =>
                  handleFilterChange("date_debut_from", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.date_fin_to || ""}
                onChange={(e) =>
                  handleFilterChange("date_fin_to", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions filtres */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des projets */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {projets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun projet trouvé
          </div>
        ) : (
          <>
            {/* Tableau avec scroll horizontal sur mobile */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-200 border-b border-gray-200 text-nowrap fill-black">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm text-gray-700 whitespace-nowrap">
                      ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm text-gray-700 whitespace-nowrap min-w-[200px]">
                      Désignation du projet
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm text-gray-700 whitespace-nowrap min-w-[120px]">
                      Magasinier
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm text-gray-700 whitespace-nowrap min-w-[120px]">
                      Chef projet
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm text-gray-700 whitespace-nowrap min-w-[120px]">
                      Chef chantier
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm text-gray-700 whitespace-nowrap min-w-[120px]">
                      Date du début
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-sm text-gray-700 whitespace-nowrap min-w-[120px]">
                      Coût estimé
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-sm text-gray-700 whitespace-nowrap min-w-[120px]">
                      Coût réel
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm text-gray-700 whitespace-nowrap min-w-[100px]">
                      État
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm text-gray-700 whitespace-nowrap min-w-[140px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {projets.map((projet, index) => (
                    <tr
                      key={projet.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                        #{`PRJT${String(projet.id).padStart(3, "0")}`}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-900">
                        <div
                          className="max-w-[200px] truncate"
                          title={projet.name}
                        >
                          {projet.name}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 whitespace-nowrap">
                        <div
                          className="max-w-[120px] truncate"
                          title={projet.directeurTravaux?.name || "Non assigné"}
                        >
                          {projet.directeurTravaux?.name || "Non assigné"}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 whitespace-nowrap">
                        <div
                          className="max-w-[120px] truncate"
                          title={projet.chefProjet?.name || "Non assigné"}
                        >
                          {projet.chefProjet?.name || "Non assigné"}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 whitespace-nowrap">
                        <div
                          className="max-w-[120px] truncate"
                          title={projet.chefChantier?.name || "Non assigné"}
                        >
                          {projet.chefChantier?.name || "Non assigné"}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {formatApiDate(projet.date_debut, true)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 whitespace-nowrap text-right">
                        {projet.cout_total_estime
                          ? `${projet.cout_total_estime.toLocaleString("fr-FR")} FCFA`
                          : "-"}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 whitespace-nowrap text-right">
                        {projet.cout_total_reel
                          ? `${projet.cout_total_reel.toLocaleString("fr-FR")} FCFA`
                          : "-"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            projet.status === "termine"
                              ? "bg-green-100 text-green-800"
                              : projet.status === "en_cours"
                                ? "bg-yellow-100 text-yellow-800"
                                : projet.status === "annule"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              projet.status === "termine"
                                ? "bg-green-500"
                                : projet.status === "en_cours"
                                  ? "bg-yellow-500"
                                  : projet.status === "annule"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                            }`}
                          ></span>
                          {getStatusLabel(projet.status)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/projects/${projet.id}/details`)
                            }
                            className="p-0.5 px-2 text-gray-50 bg-green-600 rounded hover:bg-green-700 transition-colors"
                            title="Voir le projet"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {projetPerms.canUpdate && (
                            <button
                              onClick={() =>
                                navigate(`/projects/${projet.id}/edit`)
                              }
                              className="p-0.5 px-2 text-gray-50 bg-yellow-500 rounded hover:bg-yellow-600 transition-colors"
                              title="Modifier le projet"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {projetPerms.canDelete && (
                            <button
                              onClick={() => handleDeleteProjet(projet.id)}
                              className="p-0.5 px-2 text-gray-50 bg-red-600 rounded hover:bg-red-700 transition-colors"
                              title="Supprimer le projet"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {filters.page} sur {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(filters.page! - 1)}
                      disabled={filters.page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => handlePageChange(filters.page! + 1)}
                      disabled={filters.page === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={confirmDeleteModal.close}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible."
        variant="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={deleteProjetMutation.isPending}
      />
    </div>
  );
}
