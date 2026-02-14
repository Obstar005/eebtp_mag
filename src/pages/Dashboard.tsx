import { useState, useMemo, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  useFluctuationEntrees,
  useFluctuationSorties,
} from "../hooks/useFluctuation";
import { useProjetsSelect } from "../hooks/useProjetsSelect";
import {
  useProjetMagasins,
  useStatsQuantitesArticles,
} from "../hooks/useProjets";
import { useStockArticles } from "../hooks/useMagasins";
import { useDashboardStats } from "../hooks/useDashboard";
import { FluctuationChartJS } from "../components/FluctuationChartJS";
import { StockBarChartJS } from "../components/StockBarChartJS";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import type { FluctuationParams } from "../types/fluctuation";

export function Dashboard() {
  // Récupérer les statistiques du dashboard
  const statsQuery = useDashboardStats();

  // Récupérer les projets de l'API
  const projetsQuery = useProjetsSelect();

  // États pour les menus déroulants
  const [openPeriodMenu, setOpenPeriodMenu] = useState(false);
  const [openTypeEntreeMenu, setOpenTypeEntreeMenu] = useState(false);

  // Filtres globaux (affectent les deux graphiques)
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "jour" | "semaine" | "mois" | "projet"
  >("mois");

  // Si aucun projet sélectionné, prendre le premier renvoyé par l'API
  useEffect(() => {
    if (!selectedProject && projetsQuery.data && projetsQuery.data.length > 0) {
      setSelectedProject(projetsQuery.data[0].id);
    }
  }, [projetsQuery.data, selectedProject]);

  // Reset les articles sélectionnés quand le projet change
  useEffect(() => {
    setSelectedProductEntree(null);
    setSelectedProductSortie(null);
  }, [selectedProject]);

  // Filtres spécifiques au graphique Entrées
  const [selectedProductEntree, setSelectedProductEntree] = useState<
    number | null
  >(null);
  const [selectedTypeEntree, setSelectedTypeEntree] =
    useState<string>("Livraison");

  // Filtres spécifiques au graphique Sorties
  const [selectedProductSortie, setSelectedProductSortie] = useState<
    number | null
  >(null);

  // Récupérer les magasins du projet sélectionné
  const magasinsQuery = useProjetMagasins(selectedProject || 0);

  // Récupérer le premier magasin (par défaut, la plupart des projets ont un magasin principal)
  const firstMagasinId = useMemo(() => {
    return magasinsQuery.data?.[0]?.id ?? null;
  }, [magasinsQuery.data]);

  // Récupérer les articles du magasin associé au projet
  const articlesQuery = useStockArticles(firstMagasinId ?? 0, {});

  // Articles formatés pour les sélecteurs
  const articlesList = useMemo(() => {
    const articles = articlesQuery.data?.data || [];
    return articles.map((article) => ({
      id: article.id,
      name: article.name,
    }));
  }, [articlesQuery.data?.data]);

  // S'assurer que le produit sélectionné existe dans la liste des articles
  useEffect(() => {
    if (articlesList.length === 0) return;

    const ids = articlesList.map((a) => a.id);

    if (!ids.includes(selectedProductEntree as number)) {
      setSelectedProductEntree(articlesList[0].id);
    }
    if (!ids.includes(selectedProductSortie as number)) {
      setSelectedProductSortie(articlesList[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articlesList]);

  // Paramètres pour les données d'entrées
  const fluctuationParamsEntree: FluctuationParams | null = useMemo(() => {
    if (!selectedProject || !selectedProductEntree) return null;
    return {
      projetId: selectedProject,
      produitId: selectedProductEntree,
      periode: selectedPeriod,
      typeEntree: selectedTypeEntree,
    };
  }, [
    selectedProject,
    selectedProductEntree,
    selectedPeriod,
    selectedTypeEntree,
  ]);

  // Paramètres pour les données de sorties
  const fluctuationParamsSortie: FluctuationParams | null = useMemo(() => {
    if (!selectedProject || !selectedProductSortie) return null;
    return {
      projetId: selectedProject,
      produitId: selectedProductSortie,
      periode: selectedPeriod,
    };
  }, [selectedProject, selectedProductSortie, selectedPeriod]);

  // Récupérer les données d'entrées ET sorties
  const entreeQuery = useFluctuationEntrees(fluctuationParamsEntree);
  const sortieQuery = useFluctuationSorties(fluctuationParamsSortie);

  // Récupérer les statistiques de quantités d'articles
  const statsArticlesQuery = useStatsQuantitesArticles(selectedProject);

  // Filtrer les articles par type: matériaux et matériels
  const articlesMateriaux = useMemo(() => {
    const articles = statsArticlesQuery.data?.articles || [];
    return articles.filter((article) => article.type === "materiau");
  }, [statsArticlesQuery.data?.articles]);

  const articlesMateriels = useMemo(() => {
    const articles = statsArticlesQuery.data?.articles || [];
    return articles.filter((article) => article.type === "materiel");
  }, [statsArticlesQuery.data?.articles]);

  return (
    <div className="space-y-6">
      {/* Header avec titre et filtres globaux */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>

        {/* Filtres globaux */}
        <div className="flex gap-3">
          {/* Sélecteur de Projet avec Recherche */}
          <SearchableSelect
            options={projetsQuery.data || []}
            value={selectedProject}
            onChange={setSelectedProject}
            placeholder="Sélectionner un projet"
            labelKey="name"
            valueKey="id"
          />

          {/* Sélecteur de Période */}
          <div className="relative">
            <button
              onClick={() => setOpenPeriodMenu(!openPeriodMenu)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V4H6zm1 1h2v2H7V5zm4 0h2v2h-2V5zm4 0h2v2h-2V5z" />
              </svg>
              <span>
                {selectedPeriod.charAt(0).toUpperCase() +
                  selectedPeriod.slice(1)}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  openPeriodMenu ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>
            {openPeriodMenu && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                {["jour", "semaine", "mois", "projet"].map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(
                        period as "jour" | "semaine" | "mois" | "projet",
                      );
                      setOpenPeriodMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedPeriod === period
                        ? "bg-blue-50 text-blue-900 font-semibold"
                        : "text-gray-900"
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Utilisateurs Total */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Utilisateurs Total
            </span>
            <button
              className="text-gray-400 hover:text-gray-600"
              title="Options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {statsQuery.isLoading ? (
                <span className="animate-pulse bg-gray-200 rounded w-16 h-8 inline-block" />
              ) : (
                (statsQuery.data?.total_users ?? 0)
              )}
            </span>
          </div>
          <span className="text-xs text-gray-400">Comptes enregistrés</span>
        </div>

        {/* Profils Total */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Profils Total
            </span>
            <button
              className="text-gray-400 hover:text-gray-600"
              title="Options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {statsQuery.isLoading ? (
                <span className="animate-pulse bg-gray-200 rounded w-16 h-8 inline-block" />
              ) : (
                (statsQuery.data?.total_profiles ?? 0)
              )}
            </span>
          </div>
          <span className="text-xs text-gray-400">Profils configurés</span>
        </div>

        {/* Utilisateurs Connectés */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Utilisateurs Connectés
            </span>
            <button
              className="text-gray-400 hover:text-gray-600"
              title="Options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span className="text-3xl font-bold text-gray-900">
              {statsQuery.isLoading ? (
                <span className="animate-pulse bg-gray-200 rounded w-16 h-8 inline-block" />
              ) : (
                (statsQuery.data?.connected_users ?? 0)
              )}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-600 font-medium">
                En ligne
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques de fluctuation - Layout responsive 3/5 + 2/5 */}
      <div className="space-y-6">
        {/* Ligne 1: Graphique Entrées (courbe) + Stock Articles (bâtonnets) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Graphique Entrées - 3/5 */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                État des Entrées
              </h3>
              <div className="flex gap-2">
                {/* Filtre Article pour Entrées avec Recherche */}
                <SearchableSelect
                  options={articlesList}
                  value={selectedProductEntree}
                  onChange={setSelectedProductEntree}
                  placeholder="Article"
                  labelKey="name"
                  valueKey="id"
                  buttonClassName="px-3 py-2 text-xs"
                  isLoading={articlesQuery.isLoading || magasinsQuery.isLoading}
                  emptyMessage={
                    !firstMagasinId
                      ? "Sélectionnez un projet"
                      : "Aucun article disponible"
                  }
                />

                {/* Filtre Type d'Entrée */}
                <div className="relative">
                  <button
                    onClick={() => setOpenTypeEntreeMenu(!openTypeEntreeMenu)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-900 rounded hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <span>Type</span>
                    <svg
                      className={`w-3 h-3 transition-transform ${
                        openTypeEntreeMenu ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>
                  {openTypeEntreeMenu && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                      {[
                        { value: "Livraison", label: "Livraison" },
                        { value: "Retour", label: "Retour" },
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setSelectedTypeEntree(type.value);
                            setOpenTypeEntreeMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            selectedTypeEntree === type.value
                              ? "bg-blue-50 text-blue-900 font-semibold"
                              : "text-gray-900"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <FluctuationChartJS
              title=""
              entreeData={entreeQuery.data || null}
              sortieData={null}
              isLoading={entreeQuery.isLoading}
              isError={entreeQuery.isError}
            />
          </div>

          {/* Graphique Stock Articles - 2/5 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Stock Matériaux
              </h3>
            </div>
            <StockBarChartJS
              title=""
              articles={articlesMateriaux.length > 0 ? articlesMateriaux : null}
              isLoading={statsArticlesQuery.isLoading}
              isError={statsArticlesQuery.isError}
              emptyMessage={
                !selectedProject
                  ? "Sélectionnez un projet"
                  : "Aucun matériau en stock"
              }
            />
          </div>
        </div>

        {/* Ligne 2: Graphique Sorties (courbe) + Graphique Matériels (bâtonnets) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Graphique Sorties - 3/5 */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                État des Sorties
              </h3>
              <div className="flex gap-2">
                {/* Filtre Article pour Sorties avec Recherche */}
                <SearchableSelect
                  options={articlesList}
                  value={selectedProductSortie}
                  onChange={setSelectedProductSortie}
                  placeholder="Article"
                  labelKey="name"
                  valueKey="id"
                  buttonClassName="px-3 py-2 text-xs"
                  isLoading={articlesQuery.isLoading || magasinsQuery.isLoading}
                  emptyMessage={
                    !firstMagasinId
                      ? "Sélectionnez un projet"
                      : "Aucun article disponible"
                  }
                />
              </div>
            </div>
            <FluctuationChartJS
              title=""
              entreeData={null}
              sortieData={sortieQuery.data || null}
              isLoading={sortieQuery.isLoading}
              isError={sortieQuery.isError}
            />
          </div>

          {/* Graphique Stock Matériels - 2/5 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Stock Matériels
              </h3>
            </div>
            <StockBarChartJS
              title=""
              articles={articlesMateriels.length > 0 ? articlesMateriels : null}
              isLoading={statsArticlesQuery.isLoading}
              isError={statsArticlesQuery.isError}
              emptyMessage={
                !selectedProject
                  ? "Sélectionnez un projet"
                  : "Aucun matériel en stock"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
