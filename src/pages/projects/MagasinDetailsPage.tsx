import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import {
  useMagasin,
  useStockArticles,
  useDeleteStockArticle,
} from "../../hooks/useMagasins";
import { useModal } from "../../hooks/useModal";
import { useCountries } from "../../hooks/useCountries";
import { ConfirmationModal } from "../../components/layout/ConfirmationModal";
import { AddEditArticleModal } from "../../components/magasins/AddEditArticleModal";
import { EditMagasinModal } from "../../components/magasins/EditMagasinModal";
import type { StockArticleFilter } from "../../types/magasin";

export function MagasinDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const magasinId = id ? parseInt(id) : 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [showEditArticleModal, setShowEditArticleModal] = useState(false);
  const [showEditMagasinModal, setShowEditMagasinModal] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null
  );

  // Hooks
  const { data: magasin, isLoading: isLoadingMagasin } = useMagasin(magasinId);
  const { countries, getTogoCountry } = useCountries();

  // Fonction pour détecter le pays depuis l'adresse
  const getCountryFromAddress = (address?: string) => {
    if (!address) return getTogoCountry(); // Valeur par défaut

    const addressLower = address.toLowerCase();

    // Recherche du pays dans l'adresse
    const foundCountry = countries.find((country) => {
      const nameMatch = addressLower.includes(country.name.toLowerCase());
      const abbrevMatch = addressLower.includes(
        country.abbreviation.toLowerCase()
      );

      // Recherche spéciale pour certains pays
      const specialMatches = {
        ghana: country.name.toLowerCase() === "ghana",
        accra: country.name.toLowerCase() === "ghana",
        togo: country.name.toLowerCase() === "togo",
        lomé: country.name.toLowerCase() === "togo",
        lome: country.name.toLowerCase() === "togo",
        "côte d'ivoire": country.name.toLowerCase() === "côte d'ivoire",
        abidjan: country.name.toLowerCase() === "côte d'ivoire",
        nigeria: country.name.toLowerCase() === "nigeria",
        lagos: country.name.toLowerCase() === "nigeria",
      };

      const specialMatch = Object.entries(specialMatches).some(
        ([key, condition]) => addressLower.includes(key) && condition
      );

      return nameMatch || abbrevMatch || specialMatch;
    });

    return foundCountry || getTogoCountry(); // Fallback vers Togo
  };

  const currentCountry = getCountryFromAddress(magasin?.adresse);

  const filter: StockArticleFilter = {
    search: searchTerm || undefined,
  };

  const { data: articlesResponse, isLoading: isLoadingArticles } =
    useStockArticles(magasinId, filter);
  const deleteArticleMutation = useDeleteStockArticle();
  const confirmDeleteModal = useModal();

  const articles = articlesResponse?.data || [];

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

  const handleViewArticle = (articleId: number) => {
    setSelectedArticleId(articleId);
    setShowEditArticleModal(true); // Pour l'instant, on redirige vers l'édition
  };

  const handleEditArticle = (articleId: number) => {
    setSelectedArticleId(articleId);
    setShowEditArticleModal(true);
  };

  if (isLoadingMagasin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/projects")}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            title="Retour aux projets"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Chargement...</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!magasin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/projects")}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            title="Retour aux projets"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Magasin introuvable
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            title="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Détails de magasin N°{magasin.name}
          </h1>
        </div>
        <button
          onClick={() => setShowAddArticleModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Ajouter un article"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Colonne gauche - Liste des Articles */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            {/* En-tête de la liste */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Liste des Articles(Stock)
                </h2>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowAddArticleModal(true)}
                  title="Ajouter un article"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </button>
              </div>

              {/* Barre de recherche et filtres */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="h-4 w-4" />
                    Filtres
                  </button>
                </div>
              </div>
            </div>

            {/* Table des articles */}
            <div className="overflow-x-auto">
              {isLoadingArticles ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun article trouvé</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Désignation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {article.name}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="text-gray-900">
                            {article.quantite} t
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                          {/* Colonne état supprimée */}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewArticle(article.id)}
                              className="p-0.5 px-2  text-gray-50 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditArticle(article.id)}
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
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {articles.length} Articles
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Précédent
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite - Détails Basiques */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Détails Basiques
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">{magasin.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de création
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    {magasin.date_creation
                      ? new Date(magasin.date_creation).toLocaleDateString(
                          "fr-FR"
                        )
                      : "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de mise à jour
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    {magasin.date_mise_a_jour
                      ? new Date(magasin.date_mise_a_jour).toLocaleDateString(
                          "fr-FR"
                        )
                      : "-"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                  {currentCountry?.flag ? (
                    // Si le flag est une URL (commence par http), utiliser img, sinon afficher l'emoji
                    currentCountry.flag.startsWith("http") ? (
                      <img
                        src={currentCountry.flag}
                        alt={currentCountry.name}
                        className="w-5 h-4 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span
                        className="text-lg flex-shrink-0"
                        title={currentCountry.name}
                      >
                        {currentCountry.flag}
                      </span>
                    )
                  ) : (
                    <img
                      src="/flags/tg.svg"
                      alt="Pays"
                      className="w-5 h-4 flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <span className="text-gray-900">
                    {magasin.adresse || "Non spécifiée"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Projet Associé */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Projet Associé
            </h3>

            {magasin.projet ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {magasin.projet.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">
                      {magasin.projet.name}
                    </div>
                    {/* Description du projet si disponible */}
                    {magasin.projet.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {magasin.projet.description}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 mt-1">
                      Adresse: {magasin.adresse || "Non spécifiée"}
                    </div>
                    {/* Dates du projet si disponibles */}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                      {magasin.projet.date_debut && (
                        <span>
                          Début:{" "}
                          {new Date(
                            magasin.projet.date_debut
                          ).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      {magasin.projet.date_fin && (
                        <span>
                          Fin prévue:{" "}
                          {new Date(magasin.projet.date_fin).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          magasin.projet.status === "En cours"
                            ? "bg-green-100 text-green-800"
                            : magasin.projet.status === "Terminé"
                            ? "bg-blue-100 text-blue-800"
                            : magasin.projet.status === "En attente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {magasin.projet.status || "En cours"}
                      </span>
                      {/* Budget si disponible */}
                      {magasin.projet.budget && (
                        <span className="text-xs text-gray-500">
                          Budget:{" "}
                          {magasin.projet.budget?.toLocaleString("fr-FR")} €
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/projects/${magasin.projet?.id}`)}
                  className="min-w-52 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-between gap-2"
                >
                  Consulter le projet
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">Aucun projet associé</p>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Associer un projet
                </button>
              </div>
            )}
          </div>

          {/* Déclarations */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Déclarations
            </h3>
            <div className="bg-gray-50 rounded-xl shadow-sm p-4">
              <div className=" flex items-center gap-4 min-h-[90px]">
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-2">
                  {/* Placeholder image, à remplacer par une icône ou image si besoin */}
                  <span className="w-8 h-8 bg-gray-200 rounded"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-base mb-1">
                    Liste des déclarations entrées et sorties
                  </div>
                  <div className="text-xs text-gray-500">
                    Total de déclarations:{" "}
                    <span className="font-semibold">20</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="px-4 py-2 min-w-52 bg-blue-600 text-white rounded-lg flex items-center justify-between gap-2 hover:bg-blue-700 transition-colors "
              onClick={() => navigate(`/magasins/${magasinId}/declarations`)}
            >
              Consulter
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          </div>
        </div>
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

      {/* Modal d'ajout d'article */}
      <AddEditArticleModal
        isOpen={showAddArticleModal}
        onClose={() => setShowAddArticleModal(false)}
        magasinId={magasinId}
      />

      {/* Modal d'édition d'article */}
      <AddEditArticleModal
        isOpen={showEditArticleModal}
        onClose={() => {
          setShowEditArticleModal(false);
          setSelectedArticleId(null);
        }}
        magasinId={magasinId}
        articleId={selectedArticleId || undefined}
      />

      {/* Modal d'édition de magasin */}
      <EditMagasinModal
        isOpen={showEditMagasinModal}
        onClose={() => setShowEditMagasinModal(false)}
        magasinId={magasinId}
      />
    </div>
  );
}
