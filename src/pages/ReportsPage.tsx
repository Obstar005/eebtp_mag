import { useState } from "react";
import {
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ListFilter,
  Search,
} from "lucide-react";
import { toast } from "react-toast";
import { useProjets } from "../hooks/useProjets";
import { useGenererRapportPDF } from "../hooks/useRapports";
import { useAccess } from "../hooks/useAccessPermissions";
import { AccessDenied } from "../components/ui/AccessGuard";
import { showErrorMessage } from "../utils/errorHandling";

export function ReportsPage() {
  // Fonction pour formater une date en "10 janvier 2025"
  const formatDateString = (date: Date) => {
    const monthNamesLower = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];
    return `${date.getDate()} ${monthNamesLower[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Date par défaut: aujourd'hui pour dateTo, il y a un an pour dateFrom
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [dateFrom, setDateFrom] = useState(formatDateString(oneYearAgo));
  const [dateTo, setDateTo] = useState(formatDateString(today));
  const [reportType, setReportType] = useState("articles");

  // Fonction pour parser une date au format "10 juillet 2025"
  const parseDate = (dateString: string) => {
    const monthNamesLower = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];

    const parts = dateString.split(" ");
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const monthName = parts[1];
      const year = parseInt(parts[2]);

      const monthIndex = monthNamesLower.indexOf(monthName);

      if (monthIndex !== -1) {
        return new Date(year, monthIndex, day);
      }
    }
    return new Date();
  };

  // Initialiser le calendrier sur la date de début par défaut
  const getInitialCalendarDate = () => {
    const fromDate = parseDate(dateFrom);
    return fromDate || new Date();
  };

  const [currentDate, setCurrentDate] = useState(getInitialCalendarDate());
  const [isLoading, setIsLoading] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null);

  // Récupérer la liste des projets depuis l'API
  const { data: projetsData, isLoading: isLoadingProjets } = useProjets({});
  const projects = projetsData?.data || [];

  // Mutation pour générer le rapport PDF
  const genererRapportMutation = useGenererRapportPDF();

  // Permissions
  const { rapport, isLoading: permissionsLoading } = useAccess();

  const reportData: any[] = [];

  const generateReport = async () => {
    if (!selectedProjectId) {
      alert("Veuillez sélectionner un projet");
      return;
    }

    setIsLoading(true);
    try {
      await genererRapportMutation.mutateAsync({
        projetId: selectedProjectId,
        nomProjet: selectedProject,
      });
      toast.success("Rapport généré avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la génération du rapport");
      showErrorMessage(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];

    // Jours vides du début
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const monthNamesLower = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Fonction pour vérifier si un jour est dans la plage sélectionnée
  const isDayInRange = (day: number) => {
    if (!day) return false;

    const currentDateObj = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    const fromDate = parseDate(dateFrom);
    const toDate = parseDate(dateTo);

    // Si parseDate retourne une date par défaut, on vérifie si c'est valide
    if (!fromDate || !toDate || fromDate.getTime() === toDate.getTime())
      return false;

    return currentDateObj >= fromDate && currentDateObj <= toDate;
  };

  // Fonction pour vérifier si un jour est une date de début ou de fin
  const isDayBoundary = (day: number) => {
    if (!day) return false;

    const currentDateObj = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    const fromDate = parseDate(dateFrom);
    const toDate = parseDate(dateTo);

    // Vérifier que les dates sont valides et différentes
    if (!fromDate || !toDate) return false;

    return (
      currentDateObj.getTime() === fromDate.getTime() ||
      currentDateObj.getTime() === toDate.getTime()
    );
  };

  // Fonction pour vérifier si un jour est dans le futur (après aujourd'hui)
  const isDayFuture = (day: number) => {
    if (!day) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDateObj = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );

    return currentDateObj > today;
  };

  // Fonction pour ajuster le calendrier sur la date sélectionnée
  const adjustCalendarToDate = (dateString: string) => {
    const date = parseDate(dateString);
    if (date) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth()));
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

      {/* Header avec sélecteur de projet et dates */}

      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col lg:flex-row lg:items-end gap-6">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Projet avec dropdown */}
          <div className="relative max-lg:order-1">
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              Projet <span className="text-red-500 ml-1">*</span>
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
                  {/* Champ de recherche dans le dropdown */}
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
                  {/* Liste des projets */}
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

          <div className="relative max-lg:order-3 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Du */}
            <div className="relative flex-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  onClick={() => {
                    setActiveField("from");
                    adjustCalendarToDate(dateFrom);
                    setShowCalendar(true);
                    setShowFilters(false);
                  }}
                  title="Date de début"
                  placeholder="Sélectionner"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors hover:border-gray-400"
                  readOnly
                />
                <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            {/* Date Au */}
            <div className="relative flex-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  onClick={() => {
                    setActiveField("to");
                    adjustCalendarToDate(dateTo);
                    setShowCalendar(true);
                    setShowFilters(false);
                  }}
                  title="Date de fin"
                  placeholder="Sélectionner"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors hover:border-gray-400"
                  readOnly
                />
                <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Calendrier */}
            {showCalendar && (
              <div className="w-[min(90dvw,400px)] lg:col-span-2 absolute left-0 lg:left-auto lg:right-0 top-full mt-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Sélectionner une date{" "}
                      {activeField === "from" ? "(Du)" : "(Au)"}
                    </h3>
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Fermer le calendrier"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Navigation du calendrier */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth("prev")}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Mois précédent"
                      aria-label="Mois précédent"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h3 className="text-lg font-semibold">
                      {monthNames[currentDate.getMonth()]}{" "}
                      {currentDate.getFullYear()}
                    </h3>
                    <button
                      onClick={() => navigateMonth("next")}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Mois suivant"
                      aria-label="Mois suivant"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Grille du calendrier */}
                  <div className="grid grid-cols-7 gap-1">
                    {dayNames.map((day) => (
                      <div
                        key={day}
                        className="p-2 text-center text-sm font-medium text-gray-500"
                      >
                        {day}
                      </div>
                    ))}
                    {getDaysInMonth(currentDate).map((day, index) => {
                      const inRange = day ? isDayInRange(day) : false;
                      const isBoundary = day ? isDayBoundary(day) : false;
                      const isFuture = day ? isDayFuture(day) : false;

                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (day && !isFuture) {
                              const formattedDate = `${day} ${
                                monthNamesLower[currentDate.getMonth()]
                              } ${currentDate.getFullYear()}`;

                              if (activeField === "from") {
                                setDateFrom(formattedDate);
                              } else {
                                setDateTo(formattedDate);
                              }
                              setShowCalendar(false);
                            }
                          }}
                          className={`p-2 text-center text-sm rounded ${
                            !day
                              ? "text-gray-300"
                              : isFuture
                                ? "text-gray-300 cursor-not-allowed"
                                : isBoundary
                                  ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                  : inRange
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                                    : "text-gray-700 hover:bg-blue-50 cursor-pointer"
                          }`}
                        >
                          {day || ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bouton Filtres */}
          <div className="relative max-lg:order-2 flex flex-col justify-end lg:w-">
            <button
              onClick={() => {
                setShowFilters(!showFilters);
                setShowCalendar(false);
              }}
              title="Ouvrir les filtres"
              aria-label="Ouvrir les filtres"
              className="px-4 py-3 h-[52px] w-full lg:w-max rounded-xl border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <ListFilter className="h-4 w-4" />
              <span className="sm:inline hidden">Filtres</span>
            </button>

            {/* Filtrage par type */}
            {showFilters && (
              <div className="lg:col-span-1 absolute right-0 top-full mt-2 w-full lg:w-72">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Filtrage par type de rapport
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Fermer les filtres"
                      aria-label="Fermer les filtres"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="reportType"
                        value="articles"
                        checked={reportType === "articles"}
                        onChange={(e) => setReportType(e.target.value)}
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-sm">Tous les articles</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="reportType"
                        value="entree"
                        checked={reportType === "entree"}
                        onChange={(e) => setReportType(e.target.value)}
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-sm">Par articles</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="reportType"
                        value="sortie"
                        checked={reportType === "sortie"}
                        onChange={(e) => setReportType(e.target.value)}
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-sm">Par type</span>
                    </label>

                    {/* Switches pour Entrées/Sorties */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Entrées</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              defaultChecked
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Sortie</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              defaultChecked
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-600 font-medium">
                            Les deux
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              defaultChecked
                            />
                            <div className="w-11 h-6 bg-blue-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bouton Générer */}
        <div className="flex items-center justify-end">
          <button
            onClick={generateReport}
            disabled={
              isLoading ||
              genererRapportMutation.isPending ||
              !selectedProjectId
            }
            title="Générer le rapport"
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading || genererRapportMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Génération...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Générer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tableau des données */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">En cours...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mouvement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compte
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 max-h-12">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {row.date}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          row.mouvement === "Entrée"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.mouvement}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {row.article}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {row.type}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {row.compte}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
