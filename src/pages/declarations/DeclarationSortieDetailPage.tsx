import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useDeclaration } from "../../hooks/useDeclarations";
import { useAccess } from "../../hooks/useAccessPermissions";
import { AccessDenied } from "../../components/ui/AccessGuard";
import { PhoneDisplay } from "../../components/ui";
import { formatUnit } from "../../utils/formatUtils";

export function DeclarationSortieDetailPage() {
  const navigate = useNavigate();
  const { declarationId } = useParams<{
    declarationId: string;
  }>();
  const { mouvement, isLoading: permissionsLoading } = useAccess();

  const declarationIdNumber = declarationId ? parseInt(declarationId) : 0;

  // Hooks
  const { data: declaration, isLoading } = useDeclaration(declarationIdNumber);

  // Vérification des permissions de chargement
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Vérification des permissions de consultation de sortie
  if (!mouvement.sortie.canView) {
    return (
      <AccessDenied message="Vous n'avez pas la permission de consulter les déclarations de sortie." />
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

  if (!declaration) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            title="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Déclaration introuvable
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          title="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Détail de la déclaration de sortie
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {/* Détails Basique */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Détails Basique
              </h3>
              <span className="inline-flex px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                Sortie
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Désignation
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {declaration.stockItem?.name || "Non spécifié"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité sortie
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {declaration.quantite_float}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unité de mesure
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        {formatUnit(declaration.stockItem?.unite)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de déclaration
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {declaration.date_creation
                    ? new Date(declaration.date_creation).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : declaration.date_voeux_livrer_string || "Non spécifiée"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif
                </label>
                <div className="p-3 bg-gray-50 rounded-lg min-h-[80px]">
                  {declaration.motif || "Aucun motif spécifié"}
                </div>
              </div>
            </div>
          </div>

          {/* Receveur */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Receveur
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                {declaration.receveur?.name || "Nom du receveur"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fonction
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                {declaration.receveur?.fonction || "Fonction du receveur"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <PhoneDisplay
                phoneNumber={declaration.receveur?.telephone}
                showFullNumber={true}
              />
            </div>
          </div>
        </div>

        {/* Les images de l'article */}
        <div className="bg-white rounded-lg shadow-sm p-6 h-max">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Les images de l'article
          </h3>
          <div className="text-sm text-gray-500 mb-4">Photos</div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center">
            <span className="text-gray-400">Aucune image disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
