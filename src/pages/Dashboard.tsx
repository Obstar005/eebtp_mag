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
          <h3 className="text-lg font-semibold text-gray-900">État du stock</h3>
          <div className="flex items-center justify-between mt-2 mb-6">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                80K
                <span className="text-gray-400">Unité</span>
              </span>
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                60K
                <span className="text-gray-400">Litre</span>
              </span>
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                50K
                <span className="text-gray-400">Kilogramme</span>
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-xs bg-blue-600 text-white px-3 py-2 rounded">
                <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded"></div>
                </div>
                Projet A
                <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-2 text-xs bg-blue-600 text-white px-3 py-2 rounded">
                <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded"></div>
                </div>
                Jour
                <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Graphique avec axes */}
          <div className="flex h-64 gap-2">
            {/* Axe Y avec valeurs */}
            <div className="flex flex-col justify-between text-xs text-gray-400 py-1">
              <span>100K</span>
              <span>80K</span>
              <span>60K</span>
              <span>40K</span>
              <span>20K</span>
              <span>0K</span>
            </div>

            {/* Zone de graphique */}
            <div className="flex-1 relative">
              {/* Grille de fond */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="border-t border-dashed border-gray-200"
                  ></div>
                ))}
              </div>

              {/* Barres */}
              <div className="h-full flex items-end justify-between gap-1 pb-4">
                {Array.from({ length: 12 }, (_, i) => {
                  const heights = [
                    [35, 50, 75],
                    [40, 75, 30],
                    [85, 35, 55],
                    [40, 75, 30],
                    [25, 0, 0],
                    [70, 25, 0],
                    [15, 0, 0],
                    [95, 45, 25],
                    [35, 0, 0],
                    [55, 25, 0],
                    [40, 15, 0],
                    [70, 25, 55],
                  ];
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1 flex-1"
                    >
                      <div className="w-full flex flex-col max-h-52">
                        {/* Cyan bar (Kilogramme) */}
                        <div
                          className="w-full bg-cyan-400 rounded-t"
                          style={{ height: `${heights[i][2] * 1.8}px` }}
                        ></div>
                        {/* Blue bar (Litre) */}
                        <div
                          className="w-full bg-blue-500"
                          style={{ height: `${heights[i][1] * 1.8}px` }}
                        ></div>
                        {/* Purple bar (Unité) */}
                        <div
                          className="w-full bg-purple-500"
                          style={{ height: `${heights[i][0] * 1.8}px` }}
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
                            "Jul",
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
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Graphique courbe - État du stock */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">État du stock</h3>
          <div className="flex items-center justify-between mt-2 mb-6s">
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                80K
                <span className="text-gray-400">Matériel</span>
              </span>
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                60K
                <span className="text-gray-400">Matériaux</span>
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-xs bg-blue-600 text-white px-3 py-2 rounded">
                <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded"></div>
                </div>
                Projet A
                <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-2 text-xs bg-blue-600 text-white px-3 py-2 rounded">
                <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded"></div>
                </div>
                Jour
                <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Graphique avec axes */}
          <div className="flex h-64 gap-2">
            {/* Axe Y avec valeurs */}
            <div className="flex flex-col justify-between text-xs text-gray-400 py-1">
              <span>2k</span>
              <span>2k</span>
              <span>2k</span>
              <span>2k</span>
              <span>2k</span>
              <span>0k</span>
            </div>

            {/* Zone de graphique avec dégradé */}
            <div className="flex-1 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 rounded-lg overflow-hidden relative">
              {/* Courbes SVG */}
              <svg className="w-full h-full" viewBox="0 0 400 180">
                {/* Zone sous la courbe cyan */}
                <path
                  d="M0,150 Q50,120 100,110 T200,90 Q250,80 300,70 Q350,60 400,55 L400,180 L0,180 Z"
                  fill="url(#cyanGradient)"
                  className="opacity-30"
                />
                {/* Zone sous la courbe purple */}
                <path
                  d="M0,180 Q50,160 100,150 T200,120 Q250,100 300,80 Q350,60 400,40 L400,180 L0,180 Z"
                  fill="url(#purpleGradient)"
                  className="opacity-30"
                />
                {/* Courbe cyan */}
                <path
                  d="M0,150 Q50,120 100,110 T200,90 Q250,80 300,70 Q350,60 400,55"
                  stroke="#22D3EE"
                  strokeWidth="3"
                  fill="none"
                  className="opacity-80"
                />
                {/* Courbe purple */}
                <path
                  d="M0,180 Q50,160 100,150 T200,120 Q250,100 300,80 Q350,60 400,40"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  fill="none"
                  className="opacity-80"
                />

                {/* Définition des dégradés */}
                <defs>
                  <linearGradient
                    id="cyanGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient
                    id="purpleGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Labels des mois */}
              <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-xs text-gray-400">
                {[
                  "Jan",
                  "Fév",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Déc",
                ].map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
