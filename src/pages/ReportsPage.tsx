import { useState } from "react";
import {
  Download,
  ChevronDown,
  ChevronUp,
  Package,
  TrendingUp,
  TrendingDown,
  Search,
} from "lucide-react";
import { toast } from "react-toast";
import { useProjets } from "../hooks/useProjets";
import {
  useGenererRapportDetail,
  useGenererRapportPDF,
} from "../hooks/useRapports";
import { useAccess } from "../hooks/useAccessPermissions";
import { AccessDenied } from "../components/ui/AccessGuard";
import { showErrorMessage } from "../utils/errorHandling";

export function ReportsPage() {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  type RapportEntree = { date: string; quantite: number; fait_par: string; source: string };
  type RapportSortie = { date: string; quantite: number; fait_par: string; objet: string };
  type RapportArticle = {
    article: string;
    type: string;
    unite: string;
    quantite_actuelle: number;
    entrees: RapportEntree[];
    sorties: RapportSortie[];
  };
  type RapportHeader = { projet: string; lieu_exec: string; magasinier: string; Du: string | null; Au: string | null };

  const [reportArticles, setReportArticles] = useState<RapportArticle[]>([]);
  const [reportHeader, setReportHeader] = useState<RapportHeader | null>(null);
  const [isReportLoaded, setIsReportLoaded] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState<Set<number>>(new Set([0]));
  const [articleTabs, setArticleTabsState] = useState<Record<number, "entrees" | "sorties">>({});

  const setArticleTab = (i: number, tab: "entrees" | "sorties") =>
    setArticleTabsState((prev) => ({ ...prev, [i]: tab }));

  // Récupérer la liste des projets depuis l'API
  const { data: projetsData, isLoading: isLoadingProjets } = useProjets({});
  const projects = projetsData?.data || [];

  // Mutation pour générer le rapport PDF
  const genererRapportDetailMutation = useGenererRapportDetail();
  const genererRapportMutation = useGenererRapportPDF();

  // Permissions
  const { rapport, isLoading: permissionsLoading } = useAccess();

  const parseReportPayload = (payload: unknown) => {
    type RapportEntree = { date: string; quantite: number; fait_par: string; source: string };
    type RapportSortie = { date: string; quantite: number; fait_par: string; objet: string };
    type RapportArticle = { article: string; type: string; unite: string; quantite_actuelle: number; entrees: RapportEntree[]; sorties: RapportSortie[] };
    type RapportHeader = { projet: string; lieu_exec: string; magasinier: string; Du: string | null; Au: string | null };
    if (!Array.isArray(payload) || payload.length === 0) return { header: null as RapportHeader | null, articles: [] as RapportArticle[] };
    const [first, ...rest] = payload as Record<string, any>[];
    const header: RapportHeader = {
      projet: first?.projet ?? "—",
      lieu_exec: first?.lieu_exec ?? "—",
      magasinier: first?.magasinier ?? "—",
      Du: first?.Du ?? null,
      Au: first?.Au ?? null,
    };
    const articles: RapportArticle[] = rest
      .filter((r) => r?.article)
      .map((r) => ({
        article: r.article,
        type: r.type ?? "—",
        unite: r.unite ?? "",
        quantite_actuelle: r.quantite_actuelle ?? 0,
        entrees: Array.isArray(r.entrees) ? r.entrees : [],
        sorties: Array.isArray(r.sorties) ? r.sorties : [],
      }));
    return { header, articles };
  };

  const formatISODate = (isoStr: string | null) => {
    if (!isoStr) return "—";
    const d = new Date(isoStr);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const toggleArticle = (i: number) => {
    setExpandedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const loadReportDetails = async () => {
    if (!selectedProjectId) {
      alert("Veuillez sélectionner un projet");
      return;
    }
    setIsLoading(true);
    try {
      const payload = await genererRapportDetailMutation.mutateAsync({ projetId: selectedProjectId });
      const { header, articles } = parseReportPayload(payload);
      setReportHeader(header);
      setReportArticles(articles);
      setIsReportLoaded(true);
      setExpandedArticles(new Set([0]));
      toast.success("Rapport chargé avec succès !");
    } catch (error) {
      toast.error("Erreur lors du chargement du rapport");
      showErrorMessage(error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!selectedProjectId || !isReportLoaded) {
      return;
    }

    try {
      await genererRapportMutation.mutateAsync({
        projetId: selectedProjectId,
        nomProjet: selectedProject,
      });
      toast.success("Téléchargement du rapport lancé !");
    } catch (error) {
      toast.error("Erreur lors du téléchargement du rapport");
      showErrorMessage(error);
    }
  };

  // Vérification des permissions (afficher loading si nécessaire)
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Vérification des permissions
  if (!rapport.canCreate) {
    return (
      <AccessDenied message="Vous n'avez pas la permission de générer des rapports." />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rapport</h1>
      </div>

      {/* Sélecteur de projet + boutons */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        {/* Projet avec dropdown */}
        <div className="relative w-full sm:max-w-xs">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            Projet
          </label>
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between bg-white transition-colors hover:border-gray-400"
            >
              <span className="truncate">
                {selectedProject || "Sélectionner un projet"}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            {showProjectDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto py-1">
                  {isLoadingProjets ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  ) : projects.length > 0 ? (
                    projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setSelectedProject(project.name);
                          setSelectedProjectId(project.id);
                          setIsReportLoaded(false);
                          setReportArticles([]);
                          setReportHeader(null);
                          setExpandedArticles(new Set([0]));
                          setShowProjectDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                          selectedProjectId === project.id
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {project.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2.5 text-gray-500 text-sm">
                      Aucun projet disponible
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Boutons rapport */}
        <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={loadReportDetails}
              disabled={isLoading || !selectedProjectId}
              title="Charger le rapport"
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Chargement...
                </>
              ) : (
                "Charger le rapport"
              )}
            </button>

            {isReportLoaded && (
              <button
                onClick={downloadReport}
                disabled={genererRapportMutation.isPending || !selectedProjectId}
                title="Télécharger le PDF"
                className="w-full sm:w-auto bg-gray-900 text-white px-6 py-3.5 rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {genererRapportMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Télécharger PDF
                  </>
                )}
              </button>
            )}
        </div>
      </div>

      {/* Section rapport */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm flex items-center justify-center py-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Chargement du rapport...</p>
            </div>
          </div>
        ) : isReportLoaded ? (
          <>
            {/* Stats résumé */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                  <Package className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Articles</p>
                  <p className="text-xl font-bold text-gray-900">{reportArticles.length}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total entrées</p>
                  <p className="text-xl font-bold text-gray-900">
                    {reportArticles.reduce((acc, a) => acc + a.entrees.reduce((s, e) => s + (e.quantite || 0), 0), 0)}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total sorties</p>
                  <p className="text-xl font-bold text-gray-900">
                    {reportArticles.reduce((acc, a) => acc + a.sorties.reduce((s, e) => s + (e.quantite || 0), 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Liste des articles */}
            <div className="space-y-3">
              {reportArticles.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm py-16 text-center">
                  <p className="text-gray-400">Aucun article trouvé dans ce rapport.</p>
                </div>
              ) : (
                reportArticles.map((article, i) => {
                  const isOpen = expandedArticles.has(i);
                  return (
                    <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      {/* En-tête article */}
                      <button
                        onClick={() => toggleArticle(i)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{article.article}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500 capitalize">{article.type}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-500">{article.unite}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-gray-400">Stock actuel</p>
                            <p className="text-sm font-bold text-blue-700">
                              {article.quantite_actuelle}{" "}
                              <span className="font-normal text-gray-500">{article.unite}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              <TrendingUp className="h-3.5 w-3.5" />
                              {article.entrees.length}
                            </span>
                            <span className="flex items-center gap-1 text-red-500 font-medium">
                              <TrendingDown className="h-3.5 w-3.5" />
                              {article.sorties.length}
                            </span>
                          </div>
                          {isOpen
                            ? <ChevronUp className="h-4 w-4 text-gray-400" />
                            : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </button>

                      {/* Détails entrées / sorties — onglets */}
                      {isOpen && (() => {
                        const activeTab = articleTabs[i] ?? "entrees";
                        return (
                          <div className="border-t border-gray-100">
                            {/* Barre d'onglets */}
                            <div className="flex border-b border-gray-100 px-5 bg-gray-50">
                              <button
                                onClick={() => setArticleTab(i, "entrees")}
                                className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 transition-colors ${
                                  activeTab === "entrees"
                                    ? "border-green-500 text-green-700"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                              >
                                <TrendingUp className="h-3.5 w-3.5" />
                                Entrées
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                  activeTab === "entrees" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                                }`}>
                                  {article.entrees.length}
                                </span>
                              </button>
                              <button
                                onClick={() => setArticleTab(i, "sorties")}
                                className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 transition-colors ${
                                  activeTab === "sorties"
                                    ? "border-red-500 text-red-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                              >
                                <TrendingDown className="h-3.5 w-3.5" />
                                Sorties
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                  activeTab === "sorties" ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-500"
                                }`}>
                                  {article.sorties.length}
                                </span>
                              </button>
                            </div>

                            {/* Contenu de l'onglet actif */}
                            {activeTab === "entrees" ? (
                              article.entrees.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full">
                                    <thead>
                                      <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantité</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fait par</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {article.entrees.map((e, j) => (
                                        <tr key={j} className="hover:bg-green-50/30 transition-colors">
                                          <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{formatISODate(e.date)}</td>
                                          <td className="px-5 py-3">
                                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700">
                                              <TrendingUp className="h-3.5 w-3.5" />
                                              +{e.quantite} <span className="font-normal text-gray-400 text-xs">{article.unite}</span>
                                            </span>
                                          </td>
                                          <td className="px-5 py-3 text-sm text-gray-700">{e.fait_par || "—"}</td>
                                          <td className="px-5 py-3 text-sm text-gray-500">{e.source || "—"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="py-10 text-sm text-gray-400 text-center">Aucune entrée enregistrée</p>
                              )
                            ) : (
                              article.sorties.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full">
                                    <thead>
                                      <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantité</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fait par</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Objet</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {article.sorties.map((s, j) => (
                                        <tr key={j} className="hover:bg-red-50/30 transition-colors">
                                          <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{formatISODate(s.date)}</td>
                                          <td className="px-5 py-3">
                                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600">
                                              <TrendingDown className="h-3.5 w-3.5" />
                                              −{s.quantite} <span className="font-normal text-gray-400 text-xs">{article.unite}</span>
                                            </span>
                                          </td>
                                          <td className="px-5 py-3 text-sm text-gray-700">{s.fait_par || "—"}</td>
                                          <td className="px-5 py-3 text-sm text-gray-500">{s.objet || "—"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="py-10 text-sm text-gray-400 text-center">Aucune sortie enregistrée</p>
                              )
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm py-20 text-center">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">Sélectionnez un projet et cliquez sur "Charger le rapport".</p>
          </div>
        )}
      </div>
    </div>
  );
}
