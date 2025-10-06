import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Edit, Trash2, Filter } from "lucide-react";
import {
  useStockArticles,
  useDeleteStockArticle,
} from "../../hooks/useArticles";
import { useModal } from "../../hooks/useModal";
import { ConfirmationModal } from "../../components/layout/ConfirmationModal";
import type {
  StockArticleFilter,
  ArticleEtat,
  ArticleType,
} from "../../types/magasin";

export function ArticlesPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEtat, setSelectedEtat] = useState<ArticleEtat | "">("");
  const [selectedType, setSelectedType] = useState<ArticleType | "">("");
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"tous" | "materiel" | "materiaux">(
    "tous"
  );

  const filter: StockArticleFilter = {
    search: searchTerm || undefined,
    etat: selectedEtat || undefined,
    type_enum: selectedType || undefined,
  };

  // Hooks
  const { data: articlesResponse, isLoading } = useStockArticles(1, filter); // Utilise magasin_id = 1 pour l'exemple
  const deleteArticleMutation = useDeleteStockArticle();
  const confirmDeleteModal = useModal();

  const articles = articlesResponse?.data || [];

  // Filtrer par onglet
  const filteredArticles = articles.filter((article) => {
    if (activeTab === "materiel") return article.type_enum === "equipement";
    if (activeTab === "materiaux")
      return article.type_enum === "matiere_premiere";
    return true;
  });

  const handleDeleteArticle = (articleId: number) => {
    setSelectedArticleId(articleId);
    confirmDeleteModal.open();
  };

  const confirmDelete = async () => {
    if (selectedArticleId) {
      try {
        await deleteArticleMutation.mutateAsync(selectedArticleId);
        confirmDeleteModal.close();
        setSelectedArticleId(null);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const getEtatColor = (etat: string) => {
    switch (etat) {
      case "neuf":
        return "bg-green-100 text-green-800";
      case "usagé":
        return "bg-yellow-100 text-yellow-800";
      case "abandonné":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTabCount = (tab: string) => {
    if (tab === "materiel")
      return articles.filter((a) => a.type_enum === "equipement").length;
    if (tab === "materiaux")
      return articles.filter((a) => a.type_enum === "matiere_premiere").length;
    return articles.length;
  };

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Liste des articles</h1>
        <button
          onClick={() => navigate("/articles/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Ajouter un article"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
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
                  setActiveTab(tab.id as "tous" | "materiel" | "materiaux")
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-3">
              {/* Filtre par état */}
              <select
                value={selectedEtat}
                onChange={(e) =>
                  setSelectedEtat(e.target.value as ArticleEtat | "")
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filtrer par état"
              >
                <option value="">État</option>
                <option value="neuf">Neuf</option>
                <option value="usagé">Usagé</option>
                <option value="endommagé">Endommagé</option>
              </select>

              {/* Filtre par type */}
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(e.target.value as ArticleType | "")
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
          {filteredArticles.length === 0 ? (
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
                    État
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
                {filteredArticles.map((article) => (
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
                      Kilogramme
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                      {article.type_enum === "matiere_premiere"
                        ? "Matériaux"
                        : article.type_enum === "equipement"
                        ? "Matériel"
                        : "Consommable"}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEtatColor(
                          article.etat
                        )}`}
                      >
                        {article.etat === "neuf"
                          ? "Bon"
                          : article.etat === "usagé"
                          ? "Mauvais"
                          : article.etat}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                      {new Date(article.date_creation).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
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
                        <button
                          onClick={() =>
                            navigate(`/articles/${article.id}/edit`)
                          }
                          className="p-0.5 px-2  text-gray-50 bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="p-0.5 px-2  text-gray-50 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
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
          )}
        </div>

        {/* Footer avec pagination */}
        {filteredArticles.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Affichage de 1-10 sur {filteredArticles.length} données
              </div>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                  1
                </button>
                <span className="px-2 text-gray-500">/</span>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                  2
                </button>
              </div>
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
