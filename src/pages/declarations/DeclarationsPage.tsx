import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useDeclarations,
  useDeclarationStats,
} from "../../hooks/useDeclarations";
import { useMagasin } from "../../hooks/useMagasins";
import { useAccess } from "../../hooks/useAccessPermissions";
import { AccessDenied } from "../../components/ui/AccessGuard";
import type {
  DeclarationFilter,
  DeclarationType,
  PeriodeType,
} from "../../types/declaration";
import { formatUnit } from "../../utils/formatUtils";

export function DeclarationsPage() {
  const navigate = useNavigate();
  const { magasinId } = useParams<{ magasinId: string }>();
  const magasinIdNumber = magasinId ? parseInt(magasinId) : 0;
  const { mouvement, isLoading: permissionsLoading } = useAccess();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<DeclarationType | "">("");
  const [activeTab, setActiveTab] = useState<
    "Tous" | "Livraison" | "Sortie" | "Retour"
  >("Tous");
  const [selectedPeriode, setSelectedPeriode] = useState<PeriodeType>("total");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Synchroniser le filtre avec l'onglet actif
  useEffect(() => {
    switch (activeTab) {
      case "Livraison":
        setSelectedType("livraison");
        break;
      case "Sortie":
        setSelectedType("sortie");
        break;
      case "Retour":
        setSelectedType("retour");
        break;
      default:
        setSelectedType("");
        break;
    }
  }, [activeTab]);

  // Hooks
  const { data: magasin } = useMagasin(magasinIdNumber);
  const { data: stats } = useDeclarationStats(magasinIdNumber, selectedPeriode);

  const filter: DeclarationFilter = {
    search: searchTerm || undefined,
    type_enum: selectedType || undefined,
    magasin_id: magasinIdNumber,
    periode: selectedPeriode,
  };

  const { data: declarationsResponse, isLoading } = useDeclarations(
    magasinIdNumber,
    filter,
  );
  const declarations = useMemo(
    () => declarationsResponse?.data || [],
    [declarationsResponse?.data],
  );

  const getDeclarationTypeColor = (type: DeclarationType) => {
    switch (type) {
      case "livraison":
        return "bg-green-100 text-green-800";
      case "sortie":
        return "bg-red-100 text-red-800";
      case "retour":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDeclarationTypeLabel = (type: DeclarationType) => {
    switch (type) {
      case "livraison":
        return "Livraison";
      case "sortie":
        return "Sortie";
      case "retour":
        return "Retour";
      default:
        return type;
    }
  };

  const handleViewDeclaration = (
    declarationId: number,
    type: DeclarationType,
  ) => {
    navigate(
      `/magasins/${magasinIdNumber}/declarations/${declarationId}/detail/${type}`,
    );
  };

  // Filtrage des données
  const filteredDeclarations = useMemo(() => {
    let filtered = declarations;
    // Filtrage par type selon l'onglet actif
    if (activeTab !== "Tous") {
      const typeMap: Record<string, DeclarationType> = {
        Livraison: "livraison",
        Sortie: "sortie",
        Retour: "retour",
      };
      const filterType = typeMap[activeTab];
      if (filterType) {
        filtered = filtered.filter((d) => d.type_enum === filterType);
      }
    }

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.id.toString().includes(searchTerm) ||
          d.stockItem?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.stockItem?.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [declarations, activeTab, searchTerm]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, selectedPeriode]);

  // Pagination
  const totalPages = Math.ceil(filteredDeclarations.length / itemsPerPage);
  const paginatedDeclarations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDeclarations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDeclarations, currentPage, itemsPerPage]);

  // Vérification des permissions de chargement
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Vérification des permissions de consultation (entrée ou sortie)
  if (!mouvement.entree.canViewList && !mouvement.sortie.canViewList) {
    return (
      <AccessDenied message="Vous n'avez pas la permission de consulter les déclarations." />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="flex items-center gap-4 justify-between max-md:flex-col mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            title="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Liste des déclarations du magasin {magasin?.name || magasinId}
          </h1>
        </div>
        <div className="flex bg-blue-50 rounded-full p-1 gap-1">
          {[
            {
              label: "Jour",
              value: "jour" as PeriodeType,
            },
            {
              label: "Semaine",
              value: "semaine" as PeriodeType,
            },
            {
              label: "Mois",
              value: "mois" as PeriodeType,
            },
            {
              label: "Total",
              value: "total" as PeriodeType,
            },
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriode(period.value)}
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
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Des Entrées
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {(stats.totalLivraisons ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center text-sm">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    (stats.variationVsHier?.livraisons ?? 0) >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {(stats.variationVsHier?.livraisons ?? 0) >= 0 ? "+" : ""}
                  {stats.variationVsHier?.livraisons ?? 0}%
                </span>
                <span className="ml-2 text-gray-500">vs. Hier</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Des Sorties
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {(stats.totalSorties ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center text-sm">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    (stats.variationVsHier?.sorties ?? 0) >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {(stats.variationVsHier?.sorties ?? 0) >= 0 ? "+" : ""}
                  {stats.variationVsHier?.sorties ?? 0}%
                </span>
                <span className="ml-2 text-gray-500">vs. Hier</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total des retours
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {(stats.totalRetours ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center text-sm">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    (stats.variationVsHier?.retours ?? 0) >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {(stats.variationVsHier?.retours ?? 0) >= 0 ? "+" : ""}
                  {stats.variationVsHier?.retours ?? 0}%
                </span>
                <span className="ml-2 text-gray-500">vs. Hier</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Onglets et filtres */}
        <div className="p-6 border-b border-gray-200 flex items-center gap-4 justify-between max-md:flex-col">
          {/* Onglets */}
          <div className="flex space-x-8">
            {["Tous", "Livraison", "Sortie", "Retour"].map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(
                    tab as "Tous" | "Livraison" | "Sortie" | "Retour",
                  )
                }
                className={`pb-2 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {tab === "Tous" && ` (${declarations.length})`}
                {tab === "Livraison" &&
                  ` (${
                    declarations.filter((d) => d.type_enum === "livraison")
                      .length
                  })`}
                {tab === "Sortie" &&
                  ` (${
                    declarations.filter((d) => d.type_enum === "sortie").length
                  })`}
                {tab === "Retour" &&
                  ` (${
                    declarations.filter((d) => d.type_enum === "retour").length
                  })`}
              </button>
            ))}
          </div>

          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {/* <div className="flex gap-2 relative h-min">
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4" />
              </button>
              <div className="absolute top-[calc(100%+.5rem)] right-0 bg-white border border-gray-200 rounded-md shadow-md min-h-24 w-64">
                {[
                  { value: "", label: "Tous les types" },
                  { value: "livraison", label: "Livraison" },
                  { value: "sortie", label: "Sortie" },
                  { value: "retour", label: "Retour" },
                ].map((status) => (
                  <div
                    key={status.value}
                    onClick={() => setSelectedType(status.value as DeclarationType | "")}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      selectedType === status.value ? "bg-gray-200 font-medium" : ""
                    }`}
                  > 
                    {status.label}
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>

        {/* Tableau des déclarations */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredDeclarations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune déclaration trouvée</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Désignation
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fournisseur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Déclaration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDeclarations.map((declaration, index) => (
                  <tr
                    key={`${index}-${declaration.id}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {declaration.stockItem?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-gray-900">
                        {declaration.quantite_float}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {formatUnit(declaration.stockItem?.unite) || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {declaration.fournisseur?.name ||
                          declaration.receveur?.name ||
                          declaration.deposant?.name ||
                          "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDeclarationTypeColor(
                          declaration.type_enum,
                        )}`}
                      >
                        {getDeclarationTypeLabel(declaration.type_enum)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {declaration.date_creation.toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleViewDeclaration(
                            declaration.id,
                            declaration.type_enum,
                          )
                        }
                        className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer avec pagination */}
        {filteredDeclarations.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Affichage de {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredDeclarations.length,
                )}{" "}
                sur {filteredDeclarations.length} données
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Page précédente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Page suivante"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
