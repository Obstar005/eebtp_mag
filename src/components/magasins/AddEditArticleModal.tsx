import { useState, useEffect } from "react";
import { FormModal } from "../layout/FormModal";
import {
  useCreateStockArticle,
  useUpdateStockArticle,
  useStockArticle,
} from "../../hooks/useMagasins";
import { useProducts } from "../../hooks/useProducts";
import { SelectWithSearch } from "../ui/SelectWithSearch";
import {
  type CreateStockArticleData,
  type UpdateStockArticleData,
  ArticleEtat,
  ArticleType,
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

  // Charger tous les produits du catalogue pour le select
  const { data: productsList } = useProducts();

  const [formData, setFormData] = useState<{
    articleId: number;
    description: string;
    quantite: number;
    quantite_seuil: number;
    etat: ArticleEtat;
    type_enum: ArticleType;
    magasin_id: number;
    prix_unitaire: number;
  }>({
    articleId: 0,
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
        articleId: Number(article.id),
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
        articleId: 0,
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

  // Si on sélectionne un article dans la liste, on pré-remplit le formulaire
  const handleArticleSelect = (selectedId: string | number) => {
    const idStr = String(selectedId);
    const selected = productsList?.data.find((p) => p.id === idStr);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        articleId: Number(idStr),
        description: selected.description || "",
        prix_unitaire: selected.unitPrice || 0,
      }));
    } else {
      setFormData((prev) => ({ ...prev, articleId: 0 }));
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);

    // Validations
    if (!formData.articleId) {
      setError("Veuillez sélectionner un article");
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
        const updateData: UpdateStockArticleData & {
          article_id: number;
          type_enum: ArticleType;
        } = {
          id: articleId,
          article_id: formData.articleId,
          description: formData.description,
          quantite: formData.quantite,
          quantite_seuil: formData.quantite_seuil,
          etat: formData.etat,
          type_enum: formData.type_enum,
          magasin_id: formData.magasin_id,
          prix_unitaire: formData.prix_unitaire,
        };
        await updateMutation.mutateAsync(updateData);
      } else {
        const selectedProduct = productsList?.data.find(
          (p) => p.id === String(formData.articleId)
        );
        const createData: CreateStockArticleData & {
          article_id: number;
          type_enum: ArticleType;
        } = {
          article_id: formData.articleId,
          name: selectedProduct?.name || "",
          description: formData.description,
          quantite: formData.quantite,
          quantite_seuil: formData.quantite_seuil,
          etat: formData.etat,
          type_enum: formData.type_enum,
          magasin_id: formData.magasin_id,
          prix_unitaire: formData.prix_unitaire,
        };
        await createMutation.mutateAsync(createData);
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
        <SelectWithSearch
          label="Article"
          options={
            productsList?.data.map((product) => ({
              value: String(product.id),
              label: product.name,
            })) || []
          }
          value={formData.articleId}
          onChange={handleArticleSelect}
          placeholder="-- Sélectionner un article du catalogue --"
        />

        <SelectWithSearch
          label="État"
          options={[
            { value: "Neuf", label: "Neuf" },
            { value: "Usagé", label: "Usagé" },
            { value: "Abandonné", label: "Abandonné" },
          ]}
          value={formData.etat}
          onChange={(v) => handleInputChange("etat", v as ArticleEtat)}
          placeholder="Sélectionner l'état de l'article"
        />

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
