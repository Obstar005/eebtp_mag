import React from "react";
import { MoreHorizontal } from "lucide-react";

export function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = React.useState("Jour");
  return (
    <div className="space-y-6">
      {/* Header avec titre et filtres */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>

        {/* Filtres Jour/Semaine/Mois */}
        <div className="flex bg-blue-50 rounded-full p-1 gap-1">
          {["Jour", "Semaine", "Mois"].map((label) => (
            <button
              key={label}
              onClick={() => setSelectedPeriod(label)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none ${
                selectedPeriod === label
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-500 hover:text-blue-600"
              }`}
              type="button"
            >
              {label}
            </button>
          ))}
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
            <button className="text-gray-400 hover:text-gray-600">
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
            <button className="text-gray-400 hover:text-gray-600">
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
            <button className="text-gray-400 hover:text-gray-600">
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

      {/* Graphiques État du stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique en barres - État du stock */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              État du stock
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                SOK
              </span>
              <span className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                ENR
              </span>
              <span className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                SOK
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2 text-xs bg-blue-600 text-white px-3 py-1 rounded">
              Projet A
            </div>
            <div className="flex gap-2 text-xs bg-blue-600 text-white px-3 py-1 rounded">
              Jour
            </div>
          </div>
          <div className="mt-6 h-64 flex items-end justify-between gap-2">
            {/* Simulation de barres */}
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex flex-col gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t"
                    style={{ height: `${Math.random() * 120 + 40}px` }}
                  ></div>
                  <div
                    className="w-full bg-gradient-to-t from-purple-400 to-purple-600"
                    style={{ height: `${Math.random() * 80 + 20}px` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400">
                  {
                    [
                      "Jan",
                      "Fév",
                      "Mar",
                      "Avr",
                      "Mai",
                      "Jun",
                      "Jul",
                      "Aoû",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Déc",
                    ][i]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Graphique courbe - État du stock */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              État du stock
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                ENR
              </span>
              <span className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                ENR
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2 text-xs bg-blue-600 text-white px-3 py-1 rounded">
              Projet A
            </div>
            <div className="flex gap-2 text-xs bg-blue-600 text-white px-3 py-1 rounded">
              Jour
            </div>
          </div>
          <div className="mt-6 h-64 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg relative overflow-hidden">
            {/* Simulation de courbes */}
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <path
                d="M0,150 Q100,100 200,120 T400,80"
                stroke="#8B5CF6"
                strokeWidth="3"
                fill="none"
                className="opacity-80"
              />
              <path
                d="M0,180 Q100,140 200,160 T400,120"
                stroke="#3B82F6"
                strokeWidth="3"
                fill="none"
                className="opacity-80"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
