import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useDeclaration } from "../../hooks/useDeclarations";
import { useAccess } from "../../hooks/useAccessPermissions";
import { AccessDenied } from "../../components/ui/AccessGuard";
import { PhoneDisplay } from "../../components/ui";
import { formatUnit } from "../../utils/formatUtils";

export function DeclarationEntreeDetailPage() {
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

  // Vérification des permissions de consultation d'entrée
  if (!mouvement.entree.canView) {
    return (
      <AccessDenied message="Vous n'avez pas la permission de consulter les déclarations d'entrée." />
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
          Détail de la déclaration d'entrée
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Détails Basique */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Détails Basique
            </h3>
            <span className="inline-flex px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
              Entrée
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Désignation
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                {declaration.stockItem?.name}
              </div>
            </div>

            {/* Source Objet */}
            {declaration.source_objet && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objet source
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {declaration.source_objet}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité entrée
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
                Description
              </label>
              <div className="p-3 bg-gray-50 rounded-lg min-h-[80px]">
                {declaration.stockItem?.description || "Description"}
              </div>
            </div>
          </div>
        </div>

        {/* Les images de l'article */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Les images de l'article
          </h3>
          <div className="text-sm text-gray-500 mb-4">Photos</div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center">
            <span className="text-gray-400">Aucune image disponible</span>
          </div>
        </div>
        {/* Sections supplémentaires */}
        <div className="grid grid-cols-1 gap-6">
          {/* Fournisseur */}
          <div className="bg-white rounded-lg shadow-sm p-6 h-max">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fournisseur
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {declaration.fournisseur?.name || "Nom du fournisseur"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <PhoneDisplay
                  phoneNumber={declaration.fournisseur?.telephone}
                  showFullNumber={true}
                />
              </div>
            </div>
          </div>
          {/* Livreur */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Livreur
            </h3>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {(declaration.livreur?.name || declaration.deposant?.name)
                    ?.substring(0, 2)
                    .toUpperCase() || "LV"}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {declaration.livreur?.name ||
                    declaration.deposant?.name ||
                    "Non spécifié"}
                </div>
                <div className="text-sm text-gray-500">
                  {declaration.deposant?.fonction && (
                    <span className="mr-3">
                      {declaration.deposant.fonction}
                    </span>
                  )}
                  Tél:{" "}
                  {declaration.livreur?.telephone ||
                    declaration.deposant?.telephone ||
                    "Non spécifié"}
                </div>
              </div>
              {/* Copy phone number btn */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    declaration.livreur?.telephone ||
                      declaration.deposant?.telephone ||
                      "",
                  );
                }}
                className="px-3 py-1 text-blue-600 text-xs rounded hover:text-blue-700"
                title="Copier le numéro de téléphone"
              >
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-500">Signature</span>
              {declaration.signature_livreur ? (
                <div className="mt-2">
                  <img
                    src={declaration.signature_livreur}
                    alt="Signature du livreur"
                    className="max-w-[200px] mx-auto border rounded"
                  />
                </div>
              ) : (
                <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <span className="text-gray-400 text-sm">
                    Aucune signature
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
