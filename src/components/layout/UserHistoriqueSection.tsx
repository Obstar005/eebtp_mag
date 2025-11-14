import { useState } from "react";
import { useUserHistorique } from "../../hooks";
import type { PeriodeHistorique } from "../../types/historique";
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  LogIn,
  FileText,
} from "lucide-react";

interface UserHistoriqueSectionProps {
  userId?: string; // ID de l'utilisateur dont on affiche les détails
  isOwnProfile?: boolean; // Indique si c'est le profil de l'utilisateur connecté
}

/**
 * Composant pour afficher l'historique des actions de l'utilisateur
 * Ne peut être affichée que si c'est le profil de l'utilisateur connecté
 */
export function UserHistoriqueSection({
  isOwnProfile = true,
}: UserHistoriqueSectionProps) {
  const [periode, setPeriode] = useState<PeriodeHistorique>("total");
  const {
    data: historique = [],
    isLoading,
    error,
  } = useUserHistorique(isOwnProfile ? periode : "total");

  // Ne pas afficher l'historique si ce n'est pas le profil de l'utilisateur connecté
  if (!isOwnProfile) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 text-gray-500">
          <FileText className="h-5 w-5" />
          <p className="text-sm">
            L'historique des activités est privé et n'est visible que pour votre
            propre compte.
          </p>
        </div>
      </div>
    );
  }

  // Obtenir l'icône pour le type d'action
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "creation":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "modification":
        return <Edit className="h-4 w-4 text-blue-600" />;
      case "suppression":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case "validation":
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case "connexion":
        return <LogIn className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  // Obtenir le label pour le type d'action
  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      creation: "Création",
      modification: "Modification",
      suppression: "Suppression",
      validation: "Validation",
      connexion: "Connexion",
      autre: "Autre",
    };
    return labels[actionType] || actionType;
  };

  // Obtenir la couleur du badge pour le type d'action
  const getActionBadgeColor = (actionType: string) => {
    switch (actionType) {
      case "creation":
        return "bg-green-100 text-green-800";
      case "modification":
        return "bg-blue-100 text-blue-800";
      case "suppression":
        return "bg-red-100 text-red-800";
      case "validation":
        return "bg-purple-100 text-purple-800";
      case "connexion":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Formater la date relative (e.g., "Il y a 2 heures")
  const formatRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      if (diffDays < 7) return `Il y a ${diffDays}j`;
      return formatDate(dateString);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* En-tête avec filtres */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Historique des activités
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="periode" className="text-sm text-gray-600">
              Période:
            </label>
            <select
              id="periode"
              value={periode}
              onChange={(e) => setPeriode(e.target.value as PeriodeHistorique)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="jour">Aujourd'hui</option>
              <option value="semaine">Cette semaine</option>
              <option value="mois">Ce mois</option>
              <option value="total">Total</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            <p>Erreur lors du chargement de l'historique</p>
          </div>
        ) : historique.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune activité pour cette période</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historique.map((action, index) => (
              <div
                key={action.id || index}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Icône d'action */}
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(action.action_type)}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {action.user || "Utilisateur inconnu"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(
                        action.action_type
                      )}`}
                    >
                      {getActionLabel(action.action_type)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">
                    {action.description}
                  </p>
                  {action.objet_concerne && (
                    <p className="mt-1 text-xs text-gray-500">
                      Objet: {action.objet_concerne}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm text-gray-600">
                    {formatRelativeDate(action.date_action)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(action.date_action)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
