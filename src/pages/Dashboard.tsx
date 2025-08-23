import React from "react";
import {
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  FolderOpen,
  UserCheck,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
// Définir vos filtres avec icônes
const filters = [
  { period: "Jours", icon: <TrendingUp className="w-4 h-4" /> },
  { period: "Semaines", icon: <BarChart3 className="w-4 h-4" /> },
  { period: "Mois", icon: <Calendar className="w-4 h-4" /> },
];

export function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = React.useState("Mois");
  return (
    <div className="space-y-6">
      <div className="flex max-lg:flex-col gap-4 lg:justify-between p-4 bg-white shadow-lg rounded-xl border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Statistiques</h1>
          <p className="text-gray-500 mt-1">
            Vue d'ensemble de votre stock et activités
          </p>
        </div>

        {/* Filtre jours|semaines|mois */}
        <div className="flex space-x-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
          {filters.map((item) => (
            <div key={item.period}>
              <input
                type="radio"
                name="filterPeriod"
                id={"period-" + item.period}
                className="hidden"
                checked={item.period === selectedPeriod}
                value={item.period}
                onChange={() => {
                  setSelectedPeriod(item.period);
                }}
              />
              <label htmlFor={"period-" + item.period}>
                <span
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    item.period === selectedPeriod
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {item.icon}
                  {item.period}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Utilisateurs Total */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Utilisateurs Total
              </span>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600"
              title="Plus d'options"
              aria-label="Plus d'options pour utilisateurs total"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">2,420</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500 font-medium">20%</span>
                <span className="text-sm text-gray-500 ml-2">vs. Hier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projets Actif */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <FolderOpen className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Projets Actif
              </span>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600"
              title="Plus d'options"
              aria-label="Plus d'options pour projets actifs"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">2,420</p>
              <div className="flex items-center mt-2">
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-500 font-medium">20%</span>
                <span className="text-sm text-gray-500 ml-2">vs. Hier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Utilisateurs Connectés */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Utilisateurs Connectés
              </span>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600"
              title="Plus d'options"
              aria-label="Plus d'options pour utilisateurs connectés"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">316</p>
              <div className="flex items-center mt-2">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 bg-yellow-500 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium">
                    +
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activités récentes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Activités récentes
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-900">
                Nouvelle commande #1234 reçue
                <span className="text-gray-500 ml-2">il y a 2 minutes</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-900">
                Stock du produit "Ciment Portland" mis à jour
                <span className="text-gray-500 ml-2">il y a 15 minutes</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm text-gray-900">
                Alerte : Stock faible pour "Fer à béton 12mm"
                <span className="text-gray-500 ml-2">il y a 1 heure</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
