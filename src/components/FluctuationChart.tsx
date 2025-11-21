import { useState, useMemo } from "react";
import type { ProcessedFluctuationData } from "../types/fluctuation";

interface FluctuationChartProps {
  title: string;
  entreeData: ProcessedFluctuationData | null;
  sortieData: ProcessedFluctuationData | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Formate un nombre en unité lisible (ex: 2500 -> "2.5k")
 */
function formatValue(value: number): string {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "k";
  }
  return value.toFixed(0);
}

/**
 * Calcule les points SVG pour tracer une courbe
 */
function calculatePathData(
  values: number[],
  width: number,
  height: number,
  padding: number
): string {
  if (values.length === 0) return "";

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const xStep = (width - 2 * padding) / (values.length - 1 || 1);
  const yScale = (height - 2 * padding) / range;

  let pathData = "";
  const points: [number, number][] = [];

  values.forEach((value, index) => {
    const x = padding + index * xStep;
    const y = height - padding - (value - min) * yScale;
    points.push([x, y]);
  });

  // Première courbe avec Quadratic Bezier
  pathData = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const xMid = (points[i - 1][0] + points[i][0]) / 2;
    const yMid = (points[i - 1][1] + points[i][1]) / 2;
    pathData += ` Q ${xMid},${points[i - 1][1]} ${xMid},${yMid}`;
  }

  return pathData;
}

/**
 * Composant pour afficher un graphique de fluctuation avec 2 courbes
 */
export function FluctuationChart({
  title,
  entreeData,
  sortieData,
  isLoading,
  isError,
}: FluctuationChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Déterminer quel dataset on affiche
  const activeData = entreeData || sortieData;

  // Combiner les deux datasets pour trouver min/max
  const allValues = useMemo(() => {
    const values = [];
    if (entreeData?.values) values.push(...entreeData.values);
    if (sortieData?.values) values.push(...sortieData.values);
    return values;
  }, [entreeData, sortieData]);

  const maxValue = Math.max(...allValues, 0);

  // Calculer les labels d'axe Y
  const yAxisLabels = useMemo(() => {
    const labels = [];
    const step = Math.ceil(maxValue / 5);
    for (let i = 0; i <= 5; i++) {
      labels.push(formatValue(i * step));
    }
    return labels;
  }, [maxValue]);

  // Labels pour l'axe X
  const xLabels = useMemo(() => {
    if (!activeData?.labels) return [];
    // Pour 12+ points, afficher tous les labels; sinon afficher tous
    if (activeData.labels.length > 12) {
      return activeData.labels.map((label, i) => (i % 2 === 0 ? label : ""));
    }
    return activeData.labels;
  }, [activeData?.labels]);

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-6 flex items-center justify-center h-64 text-red-500">
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  if (isLoading || !activeData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-6 flex items-center justify-center h-64 text-gray-400">
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  const chartWidth = 800;
  const chartHeight = 280;
  const padding = 40;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      {/* Légende */}
      <div className="flex gap-6 mb-6">
        {entreeData && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Entrées - {formatValue(entreeData.total)}
            </span>
          </div>
        )}
        {sortieData && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Sorties - {formatValue(sortieData.total)}
            </span>
          </div>
        )}
      </div>

      {/* Graphique */}
      <div className="relative">
        <div className="flex gap-2">
          {/* Axe Y */}
          <div className="flex flex-col justify-between text-xs text-gray-400 py-1 w-12 text-right pr-2">
            {yAxisLabels.map((label, i) => (
              <div key={i}>{label}</div>
            ))}
          </div>

          {/* Zone du graphique */}
          <div className="flex-1 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 rounded-lg overflow-hidden relative">
            {/* SVG du graphique */}
            <svg
              className="w-full h-64"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                {/* Dégradés pour les courbes */}
                <linearGradient
                  id="purpleGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient
                  id="cyanGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Grille d'arrière-plan */}
              {yAxisLabels.map((_, i) => {
                const y =
                  padding +
                  ((chartHeight - 2 * padding) / (yAxisLabels.length - 1)) * i;
                return (
                  <line
                    key={`grid-${i}`}
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeDasharray="4"
                    opacity="0.3"
                  />
                );
              })}

              {/* Zone sous la courbe des sorties */}
              {sortieData && sortieData.values.length > 0 && (
                <path
                  d={`${calculatePathData(
                    sortieData.values,
                    chartWidth,
                    chartHeight,
                    padding
                  )} L ${chartWidth - padding},${
                    chartHeight - padding
                  } L ${padding},${chartHeight - padding} Z`}
                  fill="url(#cyanGradient)"
                />
              )}

              {/* Courbe des sorties */}
              {sortieData && sortieData.values.length > 0 && (
                <path
                  d={calculatePathData(
                    sortieData.values,
                    chartWidth,
                    chartHeight,
                    padding
                  )}
                  stroke="#06B6D4"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Zone sous la courbe des entrées */}
              {entreeData && entreeData.values.length > 0 && (
                <path
                  d={`${calculatePathData(
                    entreeData.values,
                    chartWidth,
                    chartHeight,
                    padding
                  )} L ${chartWidth - padding},${
                    chartHeight - padding
                  } L ${padding},${chartHeight - padding} Z`}
                  fill="url(#purpleGradient)"
                />
              )}

              {/* Courbe des entrées */}
              {entreeData && entreeData.values.length > 0 && (
                <path
                  d={calculatePathData(
                    entreeData.values,
                    chartWidth,
                    chartHeight,
                    padding
                  )}
                  stroke="#9333EA"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points d'interaction pour le hover */}
              {activeData &&
                activeData.values.map((_, index) => {
                  const xStep =
                    (chartWidth - 2 * padding) /
                    (activeData.values.length - 1 || 1);
                  const x = padding + index * xStep;
                  return (
                    <rect
                      key={`hover-${index}`}
                      x={x - 20}
                      y={0}
                      width={40}
                      height={chartHeight}
                      fill="transparent"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
            </svg>

            {/* Tooltip au hover : positionne horizontalement au point survolé */}
            {hoveredIndex !== null &&
              activeData &&
              (() => {
                const denom = activeData.values.length - 1 || 1;
                const leftPercent = (hoveredIndex / denom) * 100;
                return (
                  <div
                    className="absolute top-4 bg-gray-900 text-white px-3 py-2 rounded text-sm whitespace-nowrap pointer-events-none"
                    style={{
                      left: `${leftPercent}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="font-semibold">
                      {activeData.dataPoints[hoveredIndex]?.date}
                    </div>
                    {entreeData &&
                      entreeData.values[hoveredIndex] !== undefined && (
                        <div className="text-purple-300 text-xs">
                          Entrées:{" "}
                          {formatValue(entreeData.values[hoveredIndex])}
                        </div>
                      )}
                    {sortieData &&
                      sortieData.values[hoveredIndex] !== undefined && (
                        <div className="text-cyan-300 text-xs">
                          Sorties:{" "}
                          {formatValue(sortieData.values[hoveredIndex])}
                        </div>
                      )}
                  </div>
                );
              })()}

            {/* Labels de l'axe X */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8 pb-1 text-xs text-gray-400">
              {xLabels.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
