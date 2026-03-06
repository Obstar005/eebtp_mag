import { useState } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toast";
import { useProfiles, useDeleteAccountProfile } from "../hooks";
import { useAccess } from "../hooks/useAccessPermissions";
import { ConfirmationModal } from "../components/layout";
import { AccessDenied } from "../components/ui/AccessGuard";
import { useModal } from "../hooks/useModal";
import type { Profile } from "../types/account";

export function ProfilesPage() {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const { data: profiles, isLoading } = useProfiles();
  const deleteMutation = useDeleteAccountProfile();

  const deleteModal = useModal();

  // Permissions
  const { profil: profilPerms, isLoading: permissionsLoading } = useAccess();

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
        toast.success("Profil supprimé avec succès !");
        deleteModal.close();
        setSelectedProfile(null);
      } catch (error) {
        toast.error("Erreur lors de la suppression du profil");
      }
    }
  };

  // Vérification des permissions de vue
  if (!permissionsLoading && !profilPerms.canView) {
    return (
      <AccessDenied message="Vous n'avez pas la permission de consulter les profils." />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Liste des profils
          </h1>
        </div>
        {profilPerms.canCreate && (
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un profil</span>
          </button>
        )}
      </div>

      {/* Tableau des profils */}
      <div className="bg-white rounded-lg shadow">
        {isLoading || permissionsLoading ? (
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
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
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
                      <td className="px-6 max-w-64 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 flex flex-col">
                          <h5 className="font-semibold">{profile.nom}</h5>
                          <p className="text-gray-500 text-sm line-clamp-1 w-full">
                            {profile.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {profile.code || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            profile.is_active !== false
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {profile.is_active !== false ? "Actif" : "Inactif"}
                        </span>
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
                          {profilPerms.canUpdate && (
                            <button
                              onClick={() => handleEdit(profile)}
                              className="p-0.5 px-2  text-gray-50 bg-blue-600 hover:bg-blue-800 rounded"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {profilPerms.canDelete && (
                            <button
                              onClick={() => handleDelete(profile)}
                              className="p-0.5 px-2  text-gray-50 bg-red-600 hover:bg-red-800 rounded"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-gray-500">Aucun profil trouvé</div>
                      {profilPerms.canCreate && (
                        <button
                          onClick={handleCreate}
                          className="mt-4 text-blue-600 hover:text-blue-800"
                        >
                          Créer le premier profil
                        </button>
                      )}
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
