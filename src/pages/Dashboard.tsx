import { useState, useMemo } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  useFluctuationEntrees,
  useFluctuationSorties,
} from "../hooks/useFluctuation";
import { useProjetsSelect } from "../hooks/useProjetsSelect";
import { useProjetMagasins } from "../hooks/useProjets";
import { useStockArticles } from "../hooks/useMagasins";
import { FluctuationChart } from "../components/FluctuationChart";
import type { FluctuationParams } from "../types/fluctuation";

export function Dashboard() {
  // Récupérer les projets de l'API
  const projetsQuery = useProjetsSelect();

  // États pour les menus déroulants
  const [openProjectMenu, setOpenProjectMenu] = useState(false);
  const [openPeriodMenu, setOpenPeriodMenu] = useState(false);
  const [openProductEntreeMenu, setOpenProductEntreeMenu] = useState(false);
  const [openTypeEntreeMenu, setOpenTypeEntreeMenu] = useState(false);
  const [openProductSortieMenu, setOpenProductSortieMenu] = useState(false);

  // Filtres globaux (affectent les deux graphiques)
  const [selectedProject, setSelectedProject] = useState<number | null>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "jour" | "semaine" | "mois" | "total"
  >("jour");

  // Filtres spécifiques au graphique Entrées
  const [selectedProductEntree, setSelectedProductEntree] = useState<
    number | null
  >(1);
  const [selectedTypeEntree, setSelectedTypeEntree] =
    useState<string>("entree");

  // Filtres spécifiques au graphique Sorties
  const [selectedProductSortie, setSelectedProductSortie] = useState<
    number | null
  >(1);

  // Récupérer les magasins du projet sélectionné
  const magasinsQuery = useProjetMagasins(selectedProject || 0);

  // Récupérer le premier magasin (par défaut, la plupart des projets ont un magasin principal)
  const firstMagasinId = magasinsQuery.data?.[0]?.id || null;

  // Récupérer les articles du magasin associé au projet
  const articlesQuery = useStockArticles(firstMagasinId || 0, {});

  // Articles formatés pour les sélecteurs
  const articlesList = useMemo(() => {
    return (
      articlesQuery.data?.data?.map((article) => ({
        id: article.id,
        name: article.name,
      })) || []
    );
  }, [articlesQuery.data?.data]);

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

  return (
    <div className="space-y-6">
      {/* Header avec titre et filtres globaux */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>

        {/* Filtres globaux */}
        <div className="flex gap-3">
          {/* Sélecteur de Projet */}
          <div className="relative">
            <button
              onClick={() => setOpenProjectMenu(!openProjectMenu)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M3 6a2 2 0 0 1 2-2h5.532a2 2 0 0 1 1.536.72l1.9 2.28H3V6Zm0 3v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9H3Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {projetsQuery.data?.find((p) => p.id === selectedProject)
                  ?.name || "Sélectionner"}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  openProjectMenu ? "rotate-180" : ""
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
            {openProjectMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                {projetsQuery.data?.map((projet) => (
                  <button
                    key={projet.id}
                    onClick={() => {
                      setSelectedProject(projet.id);
                      setOpenProjectMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedProject === projet.id
                        ? "bg-blue-50 text-blue-900 font-semibold"
                        : "text-gray-900"
                    }`}
                  >
                    {projet.name}
                  </button>
                ))}
              </div>
            )}
          </div>

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
                {["jour", "semaine", "mois", "total"].map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(
                        period as "jour" | "semaine" | "mois" | "total"
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
            <span className="text-3xl font-bold text-gray-900">2,420</span>
            <span className="text-green-600 text-xs font-semibold bg-green-100 px-2 py-0.5 rounded-full">
              +20%
            </span>
          </div>
          <span className="text-xs text-gray-400">vs. Hier</span>
        </div>

        {/* Projets Actif */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Projets Actif
            </span>
            <button
              className="text-gray-400 hover:text-gray-600"
              title="Options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">2,420</span>
            <span className="text-red-600 text-xs font-semibold bg-red-100 px-2 py-0.5 rounded-full">
              -20%
            </span>
          </div>
          <span className="text-xs text-gray-400">vs. Hier</span>
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

      {/* Graphiques de fluctuation */}
      <div className="grid grid-cols-1 gap-6">
        {/* Graphique Entrées */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              État des Entrées
            </h3>
            <div className="flex gap-2">
              {/* Filtre Article pour Entrées */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenProductEntreeMenu(!openProductEntreeMenu)
                  }
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-900 rounded hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <span>Article</span>
                  <svg
                    className={`w-3 h-3 transition-transform ${
                      openProductEntreeMenu ? "rotate-180" : ""
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
                {openProductEntreeMenu && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                    {articlesQuery.isLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Chargement...
                      </div>
                    ) : articlesQuery.isError ? (
                      <div className="p-4 text-center text-sm text-red-500">
                        Erreur de chargement
                      </div>
                    ) : articlesList.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Aucun article
                      </div>
                    ) : (
                      articlesList.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSelectedProductEntree(product.id);
                            setOpenProductEntreeMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            selectedProductEntree === product.id
                              ? "bg-blue-50 text-blue-900 font-semibold"
                              : "text-gray-900"
                          }`}
                        >
                          {product.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

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
                      { value: "entree", label: "Livraison" },
                      { value: "depot", label: "Dépôt" },
                      { value: "retour", label: "Retour" },
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
          <FluctuationChart
            title=""
            entreeData={entreeQuery.data || null}
            sortieData={null}
            isLoading={entreeQuery.isLoading}
            isError={entreeQuery.isError}
          />
        </div>

        {/* Graphique Sorties */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              État des Sorties
            </h3>
            <div className="flex gap-2">
              {/* Filtre Article pour Sorties */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenProductSortieMenu(!openProductSortieMenu)
                  }
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-900 rounded hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <span>Article</span>
                  <svg
                    className={`w-3 h-3 transition-transform ${
                      openProductSortieMenu ? "rotate-180" : ""
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
                {openProductSortieMenu && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                    {articlesQuery.isLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Chargement...
                      </div>
                    ) : articlesQuery.isError ? (
                      <div className="p-4 text-center text-sm text-red-500">
                        Erreur de chargement
                      </div>
                    ) : articlesList.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Aucun article
                      </div>
                    ) : (
                      articlesList.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSelectedProductSortie(product.id);
                            setOpenProductSortieMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            selectedProductSortie === product.id
                              ? "bg-blue-50 text-blue-900 font-semibold"
                              : "text-gray-900"
                          }`}
                        >
                          {product.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <FluctuationChart
            title=""
            entreeData={null}
            sortieData={sortieQuery.data || null}
            isLoading={sortieQuery.isLoading}
            isError={sortieQuery.isError}
          />
        </div>
      </div>
    </div>
  );
}
