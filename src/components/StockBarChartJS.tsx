import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import type { StatsArticleItem } from "../types/project";

// Enregistrer les composants Chart.js nécessaires pour les graphiques en barres
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StockBarChartJSProps {
  title: string;
  articles: StatsArticleItem[] | null;
  isLoading: boolean;
  isError: boolean;
  emptyMessage?: string;
}

/**
 * Génère un dégradé de couleurs entre deux couleurs
 */
function generateGradientColors(
  count: number,
  startColor: [number, number, number],
  endColor: [number, number, number]
): string[] {
  if (count <= 0) return [];
  if (count === 1) return [`rgb(${startColor.join(",")})`];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const ratio = i / (count - 1);
    const r = Math.round(startColor[0] + ratio * (endColor[0] - startColor[0]));
    const g = Math.round(startColor[1] + ratio * (endColor[1] - startColor[1]));
    const b = Math.round(startColor[2] + ratio * (endColor[2] - startColor[2]));
    colors.push(`rgb(${r}, ${g}, ${b})`);
  }
  return colors;
}

/**
 * Composant de graphique en bâtonnets pour les stocks d'articles
 */
export function StockBarChartJS({
  title,
  articles,
  isLoading,
  isError,
  emptyMessage = "Aucune donnée disponible",
}: StockBarChartJSProps) {
  // Préparer les données pour Chart.js
  const chartData = useMemo(() => {
    if (!articles || articles.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Générer les couleurs en dégradé (du violet au cyan)
    const backgroundColors = generateGradientColors(
      articles.length,
      [147, 51, 234], // purple-600
      [6, 182, 212] // cyan-500
    );

    // Couleurs de bordure légèrement plus foncées
    const borderColors = generateGradientColors(
      articles.length,
      [126, 34, 206], // purple-700
      [8, 145, 178] // cyan-600
    );

    return {
      labels: articles.map((article) => article.designation),
      datasets: [
        {
          label: "Quantité en stock",
          data: articles.map((article) => article.quantite),
          backgroundColor: backgroundColors.map((color) =>
            color.replace("rgb", "rgba").replace(")", ", 0.8)")
          ),
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [articles]);

  // Options de configuration du graphique
  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "x" as const, // Barres verticales
      plugins: {
        legend: {
          display: false, // Pas besoin de légende pour un seul dataset
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(17, 24, 39, 0.95)", // gray-900
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 12,
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          displayColors: true,
          callbacks: {
            title: (context) => {
              return context[0].label || "";
            },
            label: (context) => {
              const value = context.parsed.y;
              const article = articles?.[context.dataIndex];
              const unite = article?.unite || "";
              return `Quantité: ${value} ${unite}`;
            },
          },
        },
        title: {
          display: !!title,
          text: title,
          font: {
            size: 14,
            weight: "bold" as const,
          },
          padding: {
            bottom: 10,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: "rgb(55, 65, 81)", // gray-700
            font: {
              size: 10,
            },
            maxRotation: 45,
            minRotation: 45,
            // Tronquer les labels trop longs
            callback: function (value) {
              const label = this.getLabelForValue(value as number);
              if (typeof label === "string" && label.length > 12) {
                return label.substring(0, 12) + "...";
              }
              return label;
            },
          },
        },
        y: {
          grid: {
            color: "rgba(156, 163, 175, 0.2)", // gray-400 avec opacité
          },
          border: {
            display: false,
          },
          ticks: {
            color: "rgb(107, 114, 128)", // gray-500
            font: {
              size: 11,
            },
          },
        },
      },
    }),
    [title, articles]
  );

  // État de chargement
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Chargement...</span>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <p className="text-sm text-gray-600">Erreur de chargement</p>
        </div>
      </div>
    );
  }

  // Pas de données
  if (!articles || articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="h-[300px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
