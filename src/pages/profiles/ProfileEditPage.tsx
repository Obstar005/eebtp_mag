import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useProfiles, useUpdateAccountProfile } from "../../hooks";

interface ProfileFormData {
  nom: string;
  description?: string;
}

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId: string }>();

  const { data: profiles, isLoading } = useProfiles();
  const updateMutation = useUpdateAccountProfile();

  // Trouver le profil spécifique
  const profile = profiles?.find((p) => p.id.toString() === profileId);

  const [formData, setFormData] = useState<ProfileFormData>({
    nom: "",
    description: "",
  });

  // Remplir le formulaire avec les données du profil
  useEffect(() => {
    if (profile) {
      setFormData({
        nom: profile.nom,
        description: profile.description || "",
      });
    }
  }, [profile]);

  const handleBack = () => {
    navigate("/profiles");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileId || !formData.nom.trim()) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: profileId,
        data: formData,
      });
      navigate("/profiles");
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

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
          Modification du profil N° PRF-001
        </h1>
      </div>

      {/* Formulaire de modification */}
      <div className="bg-white rounded-lg shadow p-6">
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
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Bouton d'action */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={updateMutation.isPending || !formData.nom.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {updateMutation.isPending ? (
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
