import { useState } from "react";
import type { ProcessedFluctuationData } from "../types/fluctuation";

interface ChartFluctuationProps {
  title: string;
  data1: ProcessedFluctuationData | null;
  label1: string;
  color1: string; // Classe Tailwind: "text-purple-500", "text-cyan-400"
  data2: ProcessedFluctuationData | null;
  label2: string;
  color2: string;
  isLoading?: boolean;
  error?: string | null;
}

export function ChartFluctuation({
  title,
  data1,
  label1,
  color1,
  data2,
  label2,
  color2,
  isLoading = false,
  error = null,
}: ChartFluctuationProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-4 h-64 flex items-center justify-center">
          <div className="text-gray-400">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!data1 || !data2 || data1.values.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-4 h-64 flex items-center justify-center">
          <div className="text-gray-400">Aucune donnée disponible</div>
        </div>
      </div>
    );
  }

  // Combiner les données pour calculer les échelles
  const allValues = [...data1.values, ...data2.values];
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const range = maxValue - minValue || 1;

  // Générer les valeurs d'échelle Y
  const ySteps = 5;
  const stepValue = Math.ceil(range / ySteps / 1000) * 1000; // Arrondir à 1000
  const yValues = Array.from({ length: ySteps + 1 }, (_, i) => stepValue * i);

  // Normaliser les valeurs pour la hauteur du graphique (0-100%)
  const normalizeValue = (val: number) => {
    if (range === 0) return 50;
    return ((val - minValue) / range) * 100;
  };

  // Créer les points SVG pour les courbes
  const createPathData = (values: number[]) => {
    if (values.length === 0) return "";

    const width = 400;
    const height = 150;
    const padding = 40;

    const points = values.map((val, i) => {
      const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
      const y = height - (normalizeValue(val) / 100) * height;
      return [x, y];
    });

    // Créer une courbe lisse avec Bezier
    let pathData = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev[0] + (curr[0] - prev[0]) / 3;
      const cp1y = prev[1];
      const cp2x = curr[0] - (curr[0] - prev[0]) / 3;
      const cp2y = curr[1];
      pathData += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${curr[0]} ${curr[1]}`;
    }

    return pathData;
  };

  const path1 = createPathData(data1.values);
  const path2 = createPathData(data2.values);

  // Formater les grandes valeurs (ex: 80000 -> 80K)
  const formatValue = (val: number) => {
    if (val >= 1000) {
      return (val / 1000).toFixed(0) + "k";
    }
    return val.toFixed(0);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      {/* Légende */}
      <div className="flex gap-6 mt-4 mb-6">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${color1.replace("text-", "bg-")}`}
          ></div>
          <span className="text-sm text-gray-600">{label1}</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatValue(data1.max)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${color2.replace("text-", "bg-")}`}
          ></div>
          <span className="text-sm text-gray-600">{label2}</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatValue(data2.max)}
          </span>
        </div>
      </div>

      {/* Graphique */}
      <div className="relative h-80">
        {/* Axe Y */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-400 py-4">
          {yValues.reverse().map((val, i) => (
            <span key={i}>{formatValue(val)}</span>
          ))}
        </div>

        {/* Zone du graphique */}
        <div className="absolute left-12 right-0 top-0 bottom-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 rounded-lg overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 400 180"
            preserveAspectRatio="none"
          >
            {/* Dégradé sous les courbes */}
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#A855F7" stopOpacity="0.01" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Zone remplie sous courbe 1 */}
            {path1 && (
              <path
                d={path1 + " L 400 180 L 0 180 Z"}
                fill="url(#grad1)"
                className="opacity-40"
              />
            )}

            {/* Zone remplie sous courbe 2 */}
            {path2 && (
              <path
                d={path2 + " L 400 180 L 0 180 Z"}
                fill="url(#grad2)"
                className="opacity-40"
              />
            )}

            {/* Courbe 1 */}
            {path1 && (
              <path
                d={path1}
                stroke="#A855F7"
                strokeWidth="3"
                fill="none"
                className="opacity-80"
              />
            )}

            {/* Courbe 2 */}
            {path2 && (
              <path
                d={path2}
                stroke="#06B6D4"
                strokeWidth="3"
                fill="none"
                className="opacity-80"
              />
            )}

            {/* Points au hover */}
            {hoveredIndex !== null && (
              <>
                <circle
                  cx={`${((hoveredIndex + 1) / data1.values.length) * 100}%`}
                  cy={`${100 - normalizeValue(data1.values[hoveredIndex])}%`}
                  r="6"
                  fill="#A855F7"
                  className="opacity-80"
                />
                <circle
                  cx={`${((hoveredIndex + 1) / data2.values.length) * 100}%`}
                  cy={`${100 - normalizeValue(data2.values[hoveredIndex])}%`}
                  r="6"
                  fill="#06B6D4"
                  className="opacity-80"
                />
              </>
            )}
          </svg>

          {/* Labels des mois */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4 text-xs text-gray-400">
            {[
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
            ]
              .slice(0, data1.labels.length)
              .map((month, i) => (
                <span key={i}>{month}</span>
              ))}
          </div>

          {/* Hover zone interactive */}
          <div
            className="absolute inset-0 flex"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percent = x / rect.width;
              const index = Math.round(percent * (data1.values.length - 1));
              if (index >= 0 && index < data1.values.length) {
                setHoveredIndex(index);
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Tooltip */}
            {hoveredIndex !== null && (
              <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded whitespace-nowrap text-sm pointer-events-none">
                <div className="font-semibold">
                  {formatValue(data1.values[hoveredIndex])}
                </div>
                <div className="text-xs text-gray-300">
                  {data1.dataPoints[hoveredIndex]?.date}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
