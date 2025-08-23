import { useState } from "react";
import { Plus, Edit, Trash2, Shield, Users } from "lucide-react";
import {
  useProfiles,
  useCreateAccountProfile,
  useUpdateAccountProfile,
  useDeleteAccountProfile,
} from "../hooks";
import { FormModal, ConfirmationModal } from "../components/layout";
import { useModal } from "../hooks/useModal";
import type { Profile } from "../types/account";

interface ProfileFormData {
  nom: string;
  description?: string;
}

export function ProfilesPage() {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    nom: "",
    description: "",
  });

  const { data: profiles, isLoading } = useProfiles();
  const createMutation = useCreateAccountProfile();
  const updateMutation = useUpdateAccountProfile();
  const deleteMutation = useDeleteAccountProfile();

  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  const handleCreate = () => {
    setFormData({ nom: "", description: "" });
    createModal.open();
  };

  const handleEdit = (profile: Profile) => {
    setSelectedProfile(profile);
    setFormData({
      nom: profile.nom,
      description: profile.description || "",
    });
    editModal.open();
  };

  const handleDelete = (profile: Profile) => {
    setSelectedProfile(profile);
    deleteModal.open();
  };

  const handleSubmitCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      createModal.close();
      setFormData({ nom: "", description: "" });
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const handleSubmitUpdate = async () => {
    if (selectedProfile) {
      try {
        await updateMutation.mutateAsync({
          id: selectedProfile.id,
          data: formData,
        });
        editModal.close();
        setSelectedProfile(null);
        setFormData({ nom: "", description: "" });
      } catch (error) {
        console.error("Erreur lors de la modification:", error);
      }
    }
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
            Gestion des profils
          </h1>
          <p className="text-gray-600">
            Gérez les profils et leurs permissions
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un profil</span>
        </button>
      </div>

      {/* Liste des profils */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Liste des profils
          </h3>
          <p className="text-gray-600">Profils disponibles dans le système</p>
        </div>

        {isLoading ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            {profiles && profiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {profile.nom}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Users className="h-4 w-4 mr-1" />
                            <span>0 utilisateurs</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {profile.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {profile.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(profile)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDelete(profile)}
                        className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun profil trouvé</p>
                <button
                  onClick={handleCreate}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Créer le premier profil
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de création */}
      <FormModal
        isOpen={createModal.isOpen}
        onClose={() => {
          createModal.close();
          setFormData({ nom: "", description: "" });
        }}
        onSubmit={handleSubmitCreate}
        title="Créer un nouveau profil"
        submitText="Créer"
        loading={createMutation.isPending}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du profil *
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>

      {/* Modal de modification */}
      <FormModal
        isOpen={editModal.isOpen}
        onClose={() => {
          editModal.close();
          setSelectedProfile(null);
          setFormData({ nom: "", description: "" });
        }}
        onSubmit={handleSubmitUpdate}
        title="Modifier le profil"
        submitText="Enregistrer"
        loading={updateMutation.isPending}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du profil *
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>

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
