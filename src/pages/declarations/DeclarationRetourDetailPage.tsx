import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useDeclaration } from "../../hooks/useDeclarations";
import { PhoneDisplay } from "../../components/ui/PhoneDisplay";

export function DeclarationRetourDetailPage() {
  const navigate = useNavigate();
  const { declarationId } = useParams<{
    declarationId: string;
  }>();

  const declarationIdNumber = declarationId ? parseInt(declarationId) : 0;

  // Hooks
  const { data: declaration, isLoading } = useDeclaration(declarationIdNumber);

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
          Détail de la déclaration de retour
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
              <span className="inline-flex px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Retour
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité
                </label>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between gap-2">
                  <span>Quantité</span>
                  <span className="inline-flex px-2 py-1 text-xs font-medium text-red-100 bg-red-500 rounded">
                    Urgent
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de déclaration
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {declaration.date_voeux_livrer_string}
                </div>
              </div>
            </div>
          </div>

          {/* Déposant */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Déposant
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                {declaration.deposant?.name || "Nom du déposant"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fonction
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                {declaration.deposant?.fonction || "Fonction du déposant"}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <PhoneDisplay
                phoneNumber={declaration.deposant?.telephone}
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
