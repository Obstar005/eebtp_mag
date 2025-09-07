import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Filter, Eye } from "lucide-react";
import {
  useDeclarations,
  useDeclarationStats,
} from "../../hooks/useDeclarations";
import { useMagasin } from "../../hooks/useMagasins";
import type {
  DeclarationFilter,
  DeclarationType,
} from "../../types/declaration";

export function DeclarationsPage() {
  const navigate = useNavigate();
  const { magasinId } = useParams<{ magasinId: string }>();
  const magasinIdNumber = magasinId ? parseInt(magasinId) : 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<DeclarationType | "">("");
  const [activeTab, setActiveTab] = useState<
    "Tous" | "Entrée" | "Sortie" | "Retour"
  >("Tous");

  // Synchroniser le filtre avec l'onglet actif
  useEffect(() => {
    switch (activeTab) {
      case "Entrée":
        setSelectedType("entree");
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
  const { data: stats } = useDeclarationStats(magasinIdNumber);

  const filter: DeclarationFilter = {
    search: searchTerm || undefined,
    type_enum: selectedType || undefined,
    magasin_id: magasinIdNumber,
  };

  const { data: declarationsResponse, isLoading } = useDeclarations(
    magasinIdNumber,
    filter
  );
  const declarations = useMemo(
    () => declarationsResponse?.data || [],
    [declarationsResponse?.data]
  );

  const getDeclarationTypeColor = (type: DeclarationType) => {
    switch (type) {
      case "entree":
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
      case "entree":
        return "Entrée";
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
    type: DeclarationType
  ) => {
    navigate(
      `/magasins/${magasinIdNumber}/declarations/${declarationId}/detail/${type}`
    );
  };

  // Filtrage des données
  const filteredDeclarations = useMemo(() => {
    let filtered = declarations;

    // Filtrage par type selon l'onglet actif
    if (activeTab !== "Tous") {
      const typeMap: Record<string, DeclarationType> = {
        Entrée: "entree",
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
            .includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [declarations, activeTab, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          title="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Liste des déclarations du magasin N°{magasin?.name || magasinId}
        </h1>
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
                  {stats.totalEntrees.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center text-sm">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    stats.variationVsHier.entrees >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {stats.variationVsHier.entrees >= 0 ? "+" : ""}
                  {stats.variationVsHier.entrees}%
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
                  {stats.totalSorties.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center text-sm">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    stats.variationVsHier.sorties >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {stats.variationVsHier.sorties >= 0 ? "+" : ""}
                  {stats.variationVsHier.sorties}%
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
                  {stats.totalRetours.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center text-sm">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    stats.variationVsHier.retours >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {stats.variationVsHier.retours >= 0 ? "+" : ""}
                  {stats.variationVsHier.retours}%
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
        <div className="p-6 border-b border-gray-200">
          {/* Onglets */}
          <div className="flex space-x-8 mb-4">
            {["Tous", "Entrée", "Sortie", "Retour"].map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab as "Tous" | "Entrée" | "Sortie" | "Retour")
                }
                className={`pb-2 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {tab === "Tous" && ` (${declarations.length})`}
                {tab === "Entrée" &&
                  ` (${
                    declarations.filter((d) => d.type_enum === "entree").length
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
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4" />
              </button>
            </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fournisseur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Déclaration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeclarations.map((declaration) => (
                  <tr key={declaration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {declaration.stockItem?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {declaration.quantite_float} kilogramme
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
                          declaration.type_enum
                        )}`}
                      >
                        {getDeclarationTypeLabel(declaration.type_enum)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {declaration.date_voeux_livrer_string}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleViewDeclaration(
                            declaration.id,
                            declaration.type_enum
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
        <div className="px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de 1-10 sur 100 données
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                1
              </button>
              <span className="text-sm text-gray-500">/</span>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                2
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
