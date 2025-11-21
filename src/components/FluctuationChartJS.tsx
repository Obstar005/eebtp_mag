import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import type { ProcessedFluctuationData } from "../types/fluctuation";

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FluctuationChartJSProps {
  title: string;
  entreeData: ProcessedFluctuationData | null;
  sortieData: ProcessedFluctuationData | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Composant de graphique de fluctuation utilisant Chart.js
 */
export function FluctuationChartJS({
  title,
  entreeData,
  sortieData,
  isLoading,
  isError,
}: FluctuationChartJSProps) {
  // Préparer les données pour Chart.js
  const chartData = useMemo(() => {
    // Utiliser les labels du dataset disponible (entrées ou sorties)
    const labels = entreeData?.labels || sortieData?.labels || [];

    const datasets = [];

    // Dataset pour les entrées
    if (entreeData && entreeData.values.length > 0) {
      datasets.push({
        label: "Entrées",
        data: entreeData.values,
        borderColor: "rgb(147, 51, 234)", // purple-600
        backgroundColor: "rgba(147, 51, 234, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4, // Courbe lisse
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(147, 51, 234)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      });
    }

    // Dataset pour les sorties
    if (sortieData && sortieData.values.length > 0) {
      datasets.push({
        label: "Sorties",
        data: sortieData.values,
        borderColor: "rgb(6, 182, 212)", // cyan-500
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(6, 182, 212)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      });
    }

    return {
      labels,
      datasets,
    };
  }, [entreeData, sortieData]);

  // Options de configuration du graphique
  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          enabled: true,
          mode: "index" as const,
          intersect: false,
          backgroundColor: "rgba(17, 24, 39, 0.95)", // gray-900
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 12,
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          displayColors: true,
          callbacks: {
            title: (context) => {
              // Afficher la date du point
              return context[0].label || "";
            },
            label: (context) => {
              const label = context.dataset.label || "";
              const value = context.parsed.y;
              return `${label}: ${value !== null ? value.toFixed(0) : "N/A"}`;
            },
          },
        },
        title: {
          display: !!title,
          text: title,
          font: {
            size: 16,
            weight: "bold" as const,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 11,
            },
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(229, 231, 235, 0.5)", // gray-200
            drawBorder: false,
          },
          ticks: {
            font: {
              size: 11,
            },
            callback: (value) => {
              // Formater les grands nombres (ex: 1000 -> 1k)
              const num = Number(value);
              if (num >= 1000) {
                return (num / 1000).toFixed(1) + "k";
              }
              return num.toString();
            },
          },
        },
      },
      interaction: {
        mode: "nearest" as const,
        axis: "x" as const,
        intersect: false,
      },
    }),
    [title]
  );

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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-6 flex items-center justify-center h-64 text-gray-400">
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (
    (!entreeData || entreeData.values.length === 0) &&
    (!sortieData || sortieData.values.length === 0)
  ) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-6 flex items-center justify-center h-64 text-gray-400">
          <p>Aucune donnée pour la période sélectionnée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
