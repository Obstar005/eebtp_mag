import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Edit, Trash2, Filter } from "lucide-react";
import { toast } from "react-toast";
import {
  useStockArticles,
  useDeleteStockArticle,
} from "../../hooks/useArticles";
import { useModal } from "../../hooks/useModal";
import { useAccess } from "../../hooks/useAccessPermissions";
import { ConfirmationModal } from "../../components/layout/ConfirmationModal";
import { AccessDenied } from "../../components/ui/AccessGuard";
import type { StockArticleFilter, ArticleType } from "../../types/magasin";
import { formatApiDate, formatUnit } from "../../utils/formatUtils";

export function ArticlesPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ArticleType | "">("");
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"tous" | "materiel" | "materiaux">(
    "tous",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filter: StockArticleFilter = {
    search: searchTerm || undefined,
    type_enum: selectedType || undefined,
  };

  // Hooks
  const { data: articlesResponse, isLoading } = useStockArticles(0, filter); // magasin_id 0 pour tous les articles
  const deleteArticleMutation = useDeleteStockArticle();
  const confirmDeleteModal = useModal();

  // Permissions
  const { article: articlePerms, isLoading: permissionsLoading } = useAccess();

  const articles = articlesResponse?.data || [];

  // Filtrer par onglet
  const filteredArticles = articles.filter((article) => {
    if (activeTab === "materiel") return article.type_enum === "equipement";
    if (activeTab === "materiaux")
      return article.type_enum === "matiere_premiere";
    return true;
  });

  // Calculs de pagination
  const totalItems = filteredArticles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

  // Réinitialiser à la page 1 quand on change de filtre/recherche
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: ArticleType | "") => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: "tous" | "materiel" | "materiaux") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleDeleteArticle = (articleId: number) => {
    setSelectedArticleId(articleId);
    confirmDeleteModal.open();
  };

  const confirmDelete = async () => {
    if (selectedArticleId) {
      try {
        await deleteArticleMutation.mutateAsync(selectedArticleId);
        toast.success("Article supprimé avec succès !");
        confirmDeleteModal.close();
        setSelectedArticleId(null);
      } catch (error) {
        toast.error("Erreur lors de la suppression de l'article");
      }
    }
  };

  const getTypeColor = (type: ArticleType) => {
    switch (type) {
      case "matiere_premiere":
        return "text-green-600";
      case "equipement":
        return "text-purple-600";
      default:
        return "text-yellow-600";
    }
  };

  const getTabCount = (tab: string) => {
    if (tab === "materiel")
      return articles.filter((a) => a.type_enum === "equipement").length;
    if (tab === "materiaux")
      return articles.filter((a) => a.type_enum === "matiere_premiere").length;
    return articles.length;
  };

  if (isLoading || permissionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Chargement...</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Vérification des permissions de vue
  if (!articlePerms.canViewList) {
    return (
      <AccessDenied message="Vous n'avez pas la permission de consulter les articles." />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Liste des articles</h1>
        {articlePerms.canCreate && (
          <button
            onClick={() => navigate("/articles/add")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Ajouter un article"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "tous", label: "Tous", count: getTabCount("tous") },
              {
                id: "materiel",
                label: "Matériel",
                count: getTabCount("materiel"),
              },
              {
                id: "materiaux",
                label: "Matériaux",
                count: getTabCount("materiaux"),
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  handleTabChange(tab.id as "tous" | "materiel" | "materiaux")
                }
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Filtres et recherche */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-3">
              {/* Filtre par type */}
              <select
                value={selectedType}
                onChange={(e) =>
                  handleTypeChange(e.target.value as ArticleType | "")
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filtrer par type"
              >
                <option value="">Type</option>
                <option value="matiere_premiere">Matériaux</option>
                <option value="equipement">Matériel</option>
                <option value="consommable">Consommable</option>
              </select>

              <button
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Plus de filtres"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table des articles */}
        <div className="overflow-x-auto">
          {totalItems === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm
                  ? "Aucun article trouvé"
                  : "Aucun article disponible"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate("/articles/add")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter le premier article
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Désignation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'ajout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {article.name}
                      </div>
                      {article.description && (
                        <div className="text-sm text-gray-500">
                          {article.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                      {formatUnit(article.unite?.toLowerCase() || "")}
                    </td>
                    <td
                      className={`px-6 py-3 whitespace-nowrap text-gray-900 ${getTypeColor(
                        article.type_enum || "equipement",
                      )}`}
                    >
                      {article.type_enum === "matiere_premiere"
                        ? "Matériaux"
                        : article.type_enum === "equipement"
                          ? "Matériel"
                          : "Consommable"}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                      {formatApiDate(article.date_creation)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/articles/${article.id}`)}
                          className="p-0.5 px-2  text-gray-50 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {articlePerms.canUpdate && (
                          <button
                            onClick={() =>
                              navigate(`/articles/${article.id}/edit`)
                            }
                            className="p-0.5 px-2  text-gray-50 bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {articlePerms.canDelete && (
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="p-0.5 px-2  text-gray-50 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                            title="Supprimer"
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
          )}
        </div>

        {/* Footer avec pagination */}
        {totalItems > 0 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Affichage de {startIndex + 1}-{Math.min(endIndex, totalItems)}{" "}
                sur {totalItems} données
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  {/* Bouton Précédent */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>

                  {/* Numéros de page */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        // Afficher seulement certaines pages pour éviter l'encombrement
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);

                        if (!showPage) {
                          // Afficher "..." pour les pages cachées
                          if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span key={page} className="px-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm border rounded transition-colors ${
                              currentPage === page
                                ? "bg-blue-500 text-white border-blue-500"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      },
                    )}
                  </div>

                  {/* Bouton Suivant */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={confirmDeleteModal.close}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible."
        variant="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={deleteArticleMutation.isPending}
      />
    </div>
  );
}
