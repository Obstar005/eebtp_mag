import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";
import { useProfiles } from "../../hooks";

export function ProfileDetailPage() {
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId: string }>();

  const { data: profiles, isLoading } = useProfiles();

  // Trouver le profil spécifique
  const profile = profiles?.find((p) => p.id.toString() === profileId);

  const handleBack = () => {
    navigate("/profiles");
  };

  const handleEdit = () => {
    navigate(`/profiles/${profileId}/edit`);
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
          Détail d'un profil N° PRF-001
        </h1>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
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
            <div className="p-3 bg-gray-100 rounded-lg min-h-[100px]">
              {profile.description || "Profil de magasinier de projet"}
            </div>
          </div>

          {/* Bouton d'action */}
          <div className="pt-6">
            <button
              onClick={handleEdit}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Enregistrer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
