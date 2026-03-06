import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";
import { useProfiles } from "../../hooks";
import { useAccess, useAllAccess } from "../../hooks/useAccessPermissions";
import { AccessDenied } from "../../components/ui/AccessGuard";
import type { ApiAccess } from "../../services/api/accessService";
import { useState } from "react";

// Grouper les accès par module (avant le point dans le code)
function groupAccessesByModule(
  accesses: ApiAccess[],
): Record<string, ApiAccess[]> {
  return accesses.reduce(
    (groups, access) => {
      const module = access.code.split(".")[0] || "autre";
      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(access);
      return groups;
    },
    {} as Record<string, ApiAccess[]>,
  );
}

// Libellés français pour les modules
const MODULE_LABELS: Record<string, string> = {
  demande: "Demandes",
  article: "Articles",
  projet: "Projets",
  magasin: "Magasins",
  user: "Utilisateurs",
  profil: "Profils",
  entree: "Mouvements d'entrée",
  sortie: "Mouvements de sortie",
  stock_item: "Stock",
  statistique: "Statistiques",
  rapport: "Rapports",
  historique: "Historique",
  autre: "Autres",
};

export function ProfileDetailPage() {
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId: string }>();
  const { profil: profilPerms, isLoading: permissionsLoading } = useAccess();
  const { data: allAccesses = [], isLoading: accessesLoading } = useAllAccess();

  const { data: profiles, isLoading } = useProfiles();

  // État pour les modules expandés/collapsés
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >({});

  // Trouver le profil spécifique
  const profile = profiles?.find((p) => p.id.toString() === profileId);

  // Grouper les accès par module
  const groupedAccesses = useMemo(
    () => groupAccessesByModule(allAccesses),
    [allAccesses],
  );

  // Permissions du profil
  const profilePermissions = profile?.permissions || [];

  const handleBack = () => {
    navigate("/profiles");
  };

  const handleEdit = () => {
    navigate(`/profiles/${profileId}/edit`);
  };

  const toggleModule = (module: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  // Vérification des permissions de chargement
  if (permissionsLoading || accessesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Vérification des permissions de consultation
  if (!profilPerms.canView) {
    return (
      <AccessDenied message="Vous n'avez pas la permission de consulter les détails des profils." />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            title="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Profil introuvable
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          title="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Détail du profil {profile.code || `N° ${profile.id}`}
        </h1>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code
            </label>
            <div className="p-3 bg-gray-100 rounded-lg">
              {profile.code || "-"}
            </div>
          </div>

          {/* Libellé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Libellé
            </label>
            <div className="p-3 bg-gray-100 rounded-lg">{profile.nom}</div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="p-3 bg-gray-100 rounded-lg min-h-[80px]">
              {profile.description || "-"}
            </div>
          </div>

          {/* Section des accès/permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions / Accès
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Liste des accès attribués à ce profil.
            </p>

            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {Object.entries(groupedAccesses).map(([module, accesses]) => {
                const moduleSelectedCount = accesses.filter((a) =>
                  profilePermissions.includes(a.id),
                ).length;
                const hasAnySelected = moduleSelectedCount > 0;

                return (
                  <div key={module} className="overflow-hidden">
                    {/* En-tête du module */}
                    <div
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 ${hasAnySelected ? "bg-blue-50" : "bg-gray-50"}`}
                      onClick={() => toggleModule(module)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedModules[module] ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                        <span
                          className={`font-medium ${hasAnySelected ? "text-blue-700" : "text-gray-700"}`}
                        >
                          {MODULE_LABELS[module] || module}
                        </span>
                        <span
                          className={`text-xs ${hasAnySelected ? "text-blue-600" : "text-gray-500"}`}
                        >
                          ({moduleSelectedCount}/{accesses.length})
                        </span>
                      </div>
                    </div>

                    {/* Liste des accès du module */}
                    {expandedModules[module] && (
                      <div className="px-4 py-2 space-y-1 bg-white">
                        {accesses.map((access) => {
                          const isSelected = profilePermissions.includes(
                            access.id,
                          );
                          return (
                            <div
                              key={access.id}
                              className={`flex items-center gap-3 py-2 px-3 rounded ${isSelected ? "bg-green-50" : "bg-gray-50"}`}
                            >
                              {isSelected ? (
                                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <div className="h-4 w-4 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <span
                                  className={`text-sm ${isSelected ? "text-green-700 font-medium" : "text-gray-500"}`}
                                >
                                  {access.libelle}
                                </span>
                                <span className="text-xs text-gray-400 ml-2">
                                  ({access.code})
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Résumé des permissions */}
            <div className="mt-3 text-sm text-gray-600">
              {profilePermissions.length} permission(s) attribuée(s)
            </div>
          </div>

          {/* Bouton d'action */}
          {profilPerms.canUpdate && (
            <div className="pt-6">
              <button
                onClick={handleEdit}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Modifier</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
