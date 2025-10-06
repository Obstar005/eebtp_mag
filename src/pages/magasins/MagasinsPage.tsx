import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useMagasins, useDeleteMagasin } from "../../hooks/useMagasins";
import { useModal } from "../../hooks/useModal";
import { ConfirmationModal } from "../../components/layout/ConfirmationModal";
import { EditMagasinModal } from "../../components/magasins/EditMagasinModal";
import type { MagasinFilter } from "../../types/magasin";

export default function MagasinsPage() {
  const navigate = useNavigate();

  const [selectedMagasinId, setSelectedMagasinId] = useState<number | null>(
    null
  );
  const [editMagasinId, setEditMagasinId] = useState<number | null>(null);

  const filter: MagasinFilter = {
    // Filter logic can be added here when needed
  };

  // Hooks
  const { data: magasinsResponse, isLoading } = useMagasins(filter);
  const deleteMagasinMutation = useDeleteMagasin();
  const confirmDeleteModal = useModal();
  const editMagasinModal = useModal();

  const magasins = magasinsResponse?.data || [];

  const handleDeleteMagasin = (magasinId: number) => {
    setSelectedMagasinId(magasinId);
    confirmDeleteModal.open();
  };

  const confirmDelete = async () => {
    if (selectedMagasinId) {
      try {
        await deleteMagasinMutation.mutateAsync(selectedMagasinId);
        confirmDeleteModal.close();
        setSelectedMagasinId(null);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleViewMagasin = (magasinId: number) => {
    navigate(`/projects/magasins/${magasinId}`);
  };

  const handleEditMagasin = (magasinId: number) => {
    setEditMagasinId(magasinId);
    editMagasinModal.open();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Chargement...</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Liste des magasins</h1>
      </div>

      {/* Section principale */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Liste</h2>

        {magasins.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun magasin disponible</p>
            <button
              onClick={() => navigate("/magasins/add")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer le premier magasin
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {magasins.map((magasin) => (
              <div
                key={magasin.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header de la carte avec menu */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      MAG-{String(magasin.id).padStart(3, "0")}
                    </span>
                  </div>
                  <div className="relative group">
                    <button
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="Actions"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>

                    {/* Menu dropdown */}
                    <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="py-1">
                        <button
                          onClick={() => handleViewMagasin(magasin.id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          Voir les détails
                        </button>
                        <button
                          onClick={() => handleEditMagasin(magasin.id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteMagasin(magasin.id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image du magasin */}
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>

                {/* Contenu de la carte */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {magasin.name}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Adresse:</span>{" "}
                      {magasin.adresse || "Non spécifiée"}
                    </div>

                    {magasin.projet && (
                      <div>
                        <span className="font-medium">Projet:</span>{" "}
                        {magasin.projet.name}
                      </div>
                    )}

                    <div>
                      <span className="font-medium">Articles:</span>{" "}
                      {magasin.articlesCount || 0}
                    </div>
                  </div>

                  {/* Actions principales */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleViewMagasin(magasin.id)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Voir détails
                    </button>
                    <button
                      onClick={() => handleEditMagasin(magasin.id)}
                      className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={confirmDeleteModal.close}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce magasin ? Cette action est irréversible et supprimera également tous les articles associés."
        variant="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={deleteMagasinMutation.isPending}
      />

      {/* Modal d'édition de magasin */}
      {editMagasinId && (
        <EditMagasinModal
          isOpen={editMagasinModal.isOpen}
          onClose={() => {
            editMagasinModal.close();
            setEditMagasinId(null);
          }}
          magasinId={editMagasinId}
        />
      )}
    </div>
  );
}
