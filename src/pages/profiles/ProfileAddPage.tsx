import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Save } from "lucide-react";
import { useCreateAccountProfile } from "../../hooks";
import {
  extractApiError,
  formatErrorForDisplay,
} from "../../utils/apiErrorUtils";

interface ProfileFormData {
  nom: string;
  description?: string;
}

export function ProfileAddPage() {
  const navigate = useNavigate();

  const createMutation = useCreateAccountProfile();

  const [formData, setFormData] = useState<ProfileFormData>({
    nom: "",
    description: "",
  });

  // Message d'erreur à afficher en bannière stylée
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBack = () => {
    navigate("/profiles");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      navigate("/profiles");
    } catch (error) {
      // Extraire et formater l'erreur API
      const formattedError = extractApiError(error);
      const displayMessage = formatErrorForDisplay(formattedError);

      console.error("Erreur lors de la création:", error);

      // Détection d'un cas fréquent : profil existant
      const isDuplicate =
        formattedError.status === 400 &&
        formattedError.details?.some((d) =>
          /existe|exist|already|duplicate|conflict/i.test(d)
        );

      const userMessage = isDuplicate
        ? "Un profil avec ce nom existe déjà. Choisissez un autre nom."
        : displayMessage;

      setErrorMessage(userMessage);
    }
  };

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
          {/* Libellé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Libellé
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
              Description
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
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Bouton d'action */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={createMutation.isPending || !formData.nom.trim()}
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
