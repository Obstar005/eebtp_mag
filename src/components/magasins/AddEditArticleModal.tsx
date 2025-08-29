import { useState, useEffect } from "react";
import { FormModal } from "../layout/FormModal";
import {
  useCreateStockArticle,
  useUpdateStockArticle,
  useStockArticle,
} from "../../hooks/useMagasins";
import type {
  CreateStockArticleData,
  UpdateStockArticleData,
  ArticleEtat,
} from "../../types/magasin";

interface AddEditArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  magasinId: number;
  articleId?: number; // Si fourni, on est en mode édition
}

export function AddEditArticleModal({
  isOpen,
  onClose,
  magasinId,
  articleId,
}: AddEditArticleModalProps) {
  const isEditing = !!articleId;

  const [formData, setFormData] = useState<CreateStockArticleData>({
    name: "",
    description: "",
    quantite: 0,
    quantite_seuil: 0,
    etat: "Neuf",
    type_enum: "matiere_premiere",
    magasin_id: magasinId,
    prix_unitaire: 0,
  });

  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { data: article } = useStockArticle(articleId || 0);
  const createMutation = useCreateStockArticle();
  const updateMutation = useUpdateStockArticle();

  // Initialiser le formulaire en mode édition
  useEffect(() => {
    if (isEditing && article) {
      setFormData({
        name: article.name,
        description: article.description || "",
        quantite: article.quantite,
        quantite_seuil: article.quantite_seuil,
        etat: article.etat,
        type_enum: article.type_enum || "matiere_premiere",
        magasin_id: article.magasin_id,
        prix_unitaire: article.prix_unitaire || 0,
      });
    }
  }, [isEditing, article]);

  // Reset du formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        quantite: 0,
        quantite_seuil: 0,
        etat: "Neuf",
        type_enum: "matiere_premiere",
        magasin_id: magasinId,
        prix_unitaire: 0,
      });
      setError(null);
    }
  }, [isOpen, magasinId]);

  const handleInputChange = (
    field: keyof CreateStockArticleData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);

    // Validations
    if (!formData.name.trim()) {
      setError("Le nom de l'article est requis");
      return;
    }
    if (formData.quantite < 0) {
      setError("La quantité ne peut pas être négative");
      return;
    }
    if (formData.quantite_seuil < 0) {
      setError("La quantité seuil ne peut pas être négative");
      return;
    }

    try {
      if (isEditing && articleId) {
        const updateData: UpdateStockArticleData = {
          id: articleId,
          ...formData,
        };
        await updateMutation.mutateAsync(updateData);
      } else {
        await createMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setError("Une erreur est survenue lors de la sauvegarde");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={isEditing ? "Détails de l'article CIMENT" : "Ajouter un article"}
      loading={isLoading}
      submitText={isEditing ? "Modifier" : "Enregistrer"}
      size="md"
    >
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
            Article
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nom de l'article"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            État
          </label>
          <select
            value={formData.etat}
            onChange={(e) =>
              handleInputChange("etat", e.target.value as ArticleEtat)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Sélectionner l'état de l'article"
          >
            <option value="Neuf">Neuf</option>
            <option value="Usagé">Usagé</option>
            <option value="Abandonné">Abandonné</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantité
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.1"
            value={formData.quantite}
            onChange={(e) =>
              handleInputChange("quantite", parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Quantité"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantité Seuil
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.1"
            value={formData.quantite_seuil}
            onChange={(e) =>
              handleInputChange(
                "quantite_seuil",
                parseFloat(e.target.value) || 0
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Quantité Seuil"
          />
        </div>
      </div>
    </FormModal>
  );
}
