import { useState, useEffect } from "react";
import { toast } from "react-toast";
import { FormModal } from "../layout/FormModal";
import { useUpdateMagasin, useMagasin } from "../../hooks/useMagasins";
import type { UpdateMagasinData } from "../../types/magasin";

interface EditMagasinModalProps {
  isOpen: boolean;
  onClose: () => void;
  magasinId: number;
}

export function EditMagasinModal({
  isOpen,
  onClose,
  magasinId,
}: EditMagasinModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    adresse: "",
  });

  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { data: magasin, isLoading: isLoadingMagasin } = useMagasin(magasinId);
  const updateMutation = useUpdateMagasin();

  // Initialiser le formulaire avec les données du magasin
  useEffect(() => {
    if (magasin) {
      setFormData({
        name: magasin.name,
        adresse: magasin.adresse || "",
      });
    }
  }, [magasin]);

  // Reset du formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);

    // Validations
    if (!formData.name.trim()) {
      setError("Le nom du magasin est requis");
      return;
    }

    try {
      const updateData: UpdateMagasinData = {
        id: magasinId,
        name: formData.name,
        adresse: formData.adresse,
      };
      await updateMutation.mutateAsync(updateData);
      toast.success("Magasin modifié avec succès !");
      onClose();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour");
      setError("Une erreur est survenue lors de la mise à jour");
    }
  };

  const isLoading = updateMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={`Modification du magasin ${magasin ? `N° ${magasin.name}` : ""}`}
      loading={isLoading}
      submitText="Enregistrer"
      size="md"
    >
      {/* Loading state */}
      {isLoadingMagasin ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom du magasin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => handleInputChange("adresse", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Adresse du magasin"
              />
            </div>
          </div>
        </>
      )}
    </FormModal>
  );
}
