import { useState } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfiles, useDeleteAccountProfile } from "../hooks";
import { ConfirmationModal } from "../components/layout";
import { useModal } from "../hooks/useModal";
import type { Profile } from "../types/account";

export function ProfilesPage() {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const { data: profiles, isLoading } = useProfiles();
  const deleteMutation = useDeleteAccountProfile();

  const deleteModal = useModal();

  const handleCreate = () => {
    navigate("/profiles/add");
  };

  const handleViewDetails = (profile: Profile) => {
    navigate(`/profiles/${profile.id}`);
  };

  const handleEdit = (profile: Profile) => {
    navigate(`/profiles/${profile.id}/edit`);
  };

  const handleDelete = (profile: Profile) => {
    setSelectedProfile(profile);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (selectedProfile) {
      try {
        await deleteMutation.mutateAsync(selectedProfile.id);
        deleteModal.close();
        setSelectedProfile(null);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Liste des profils
          </h1>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un profil</span>
        </button>
      </div>

      {/* Tableau des profils */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Libellé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mise à jour le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profiles && profiles.length > 0 ? (
                  profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {profile.nom}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date().toLocaleDateString("fr-FR")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date().toLocaleDateString("fr-FR")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(profile)}
                            className="p-0.5 px-2  text-gray-50 bg-green-600 hover:bg-green-800 rounded"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(profile)}
                            className="p-0.5 px-2  text-gray-50 bg-blue-600 hover:bg-blue-800 rounded"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(profile)}
                            className="p-0.5 px-2  text-gray-50 bg-red-600 hover:bg-red-800 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-gray-500">Aucun profil trouvé</div>
                      <button
                        onClick={handleCreate}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                      >
                        Créer le premier profil
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.close();
          setSelectedProfile(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le profil "${selectedProfile?.nom}" ? Cette action est irréversible.`}
        variant="danger"
        confirmText="Supprimer"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
