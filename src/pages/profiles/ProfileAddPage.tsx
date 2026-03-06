import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Save,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toast";
import { useCreateAccountProfile } from "../../hooks";
import { useAccess, useAllAccess } from "../../hooks/useAccessPermissions";
import { AccessDenied } from "../../components/ui/AccessGuard";
import {
  extractApiError,
  formatErrorForDisplay,
} from "../../utils/apiErrorUtils";
import type { ApiAccess } from "../../services/api/accessService";

interface ProfileFormData {
  code: string;
  nom: string;
  description?: string;
  permissions: number[];
}

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

export function ProfileAddPage() {
  const navigate = useNavigate();
  const { profil: profilPerms, isLoading: permissionsLoading } = useAccess();
  const { data: allAccesses = [], isLoading: accessesLoading } = useAllAccess();

  const createMutation = useCreateAccountProfile();

  const [formData, setFormData] = useState<ProfileFormData>({
    code: "",
    nom: "",
    description: "",
    permissions: [],
  });

  // État pour les modules expandés/collapsés
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >({});

  // Message d'erreur à afficher en bannière stylée
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Grouper les accès par module
  const groupedAccesses = useMemo(
    () => groupAccessesByModule(allAccesses),
    [allAccesses],
  );

  const handleBack = () => {
    navigate("/profiles");
  };

  const toggleModule = (module: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  const handlePermissionToggle = (accessId: number) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(accessId)
        ? prev.permissions.filter((id) => id !== accessId)
        : [...prev.permissions, accessId],
    }));
  };

  const handleSelectAllModule = (
    moduleAccesses: ApiAccess[],
    select: boolean,
  ) => {
    const moduleIds = moduleAccesses.map((a) => a.id);
    setFormData((prev) => ({
      ...prev,
      permissions: select
        ? [...new Set([...prev.permissions, ...moduleIds])]
        : prev.permissions.filter((id) => !moduleIds.includes(id)),
    }));
  };

  const isModuleFullySelected = (moduleAccesses: ApiAccess[]) => {
    return moduleAccesses.every((a) => formData.permissions.includes(a.id));
  };

  const isModulePartiallySelected = (moduleAccesses: ApiAccess[]) => {
    const selectedCount = moduleAccesses.filter((a) =>
      formData.permissions.includes(a.id),
    ).length;
    return selectedCount > 0 && selectedCount < moduleAccesses.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim() || !formData.code.trim()) {
      setErrorMessage("Le code et le libellé sont requis.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        code: formData.code,
        nom: formData.nom,
        description: formData.description,
        permissions: formData.permissions,
      });
      toast.success("Profil créé avec succès !");
      navigate("/profiles");
    } catch (error) {
      // Extraire et formater l'erreur API
      const formattedError = extractApiError(error);
      const displayMessage = formatErrorForDisplay(formattedError);

      // Détection d'un cas fréquent : profil existant
      const isDuplicate =
        formattedError.status === 400 &&
        formattedError.details?.some((d) =>
          /existe|exist|already|duplicate|conflict/i.test(d),
        );

      const userMessage = isDuplicate
        ? "Un profil avec ce code ou ce nom existe déjà. Choisissez des valeurs différentes."
        : displayMessage;

      setErrorMessage(userMessage);
    }
  };

  // Vérification des permissions de chargement
  if (permissionsLoading || accessesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Vérification des permissions de création
  if (!profilPerms.canCreate) {
    return (
      <AccessDenied message="Vous n'avez pas la permission de créer des profils." />
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
          Ajouter un nouveau profil
        </h1>
      </div>

      {/* Formulaire de création */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Bannière d'erreur stylée */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600" />
            <div className="flex-1 text-sm text-red-800 whitespace-pre-line">
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-3 rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
              title="Fermer"
            >
              Fermer
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, code: e.target.value }))
              }
              placeholder="Ex: MAG, DIR, ADMIN..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Libellé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Libellé <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nom: e.target.value }))
              }
              placeholder="Ex: Magasinier, Directeur..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Décrivez les responsabilités de ce profil..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Section des accès/permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions / Accès
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Sélectionnez les accès que ce profil pourra avoir.
            </p>

            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {Object.entries(groupedAccesses).map(([module, accesses]) => (
                <div key={module} className="overflow-hidden">
                  {/* En-tête du module */}
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleModule(module)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedModules[module] ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                      <input
                        type="checkbox"
                        checked={isModuleFullySelected(accesses)}
                        ref={(el) => {
                          if (el)
                            el.indeterminate =
                              isModulePartiallySelected(accesses);
                        }}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectAllModule(accesses, e.target.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-700">
                        {MODULE_LABELS[module] || module}
                      </span>
                      <span className="text-xs text-gray-500">
                        (
                        {
                          accesses.filter((a) =>
                            formData.permissions.includes(a.id),
                          ).length
                        }
                        /{accesses.length})
                      </span>
                    </div>
                  </div>

                  {/* Liste des accès du module */}
                  {expandedModules[module] && (
                    <div className="px-4 py-2 space-y-2 bg-white">
                      {accesses.map((access) => (
                        <label
                          key={access.id}
                          className="flex items-center gap-3 py-1 px-2 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(access.id)}
                            onChange={() => handlePermissionToggle(access.id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-700">
                              {access.libelle}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              ({access.code})
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Résumé des permissions sélectionnées */}
            <div className="mt-3 text-sm text-gray-600">
              {formData.permissions.length} permission(s) sélectionnée(s)
            </div>
          </div>

          {/* Bouton d'action */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                !formData.nom.trim() ||
                !formData.code.trim()
              }
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {createMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
