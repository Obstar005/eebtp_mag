import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import {
  useStockArticle,
  useUpdateStockArticle,
} from "../../hooks/useMagasins";
import type {
  UpdateStockArticleData,
  ArticleEtat,
  ArticleType,
} from "../../types/magasin";
import { CustomImage } from "../../components/ui/CustomImage";

interface ArticleForm {
  name: string;
  description: string;
  etat: ArticleEtat;
  type_enum: ArticleType;
  quantite: number;
  quantite_seuil: number;
  prix_unitaire: number;
}

// Types locaux
interface ArticleFormErrors {
  name?: string;
  description?: string;
  etat?: string;
  type_enum?: string;
  quantite?: string;
  quantite_seuil?: string;
  prix_unitaire?: string;
}

export default function ArticleDetailsPage() {
  const { id: articleId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<ArticleForm>({
    name: "",
    description: "",
    etat: "Neuf",
    type_enum: "matiere_premiere",
    quantite: 0,
    quantite_seuil: 0,
    prix_unitaire: 0,
  });

  const [errors, setErrors] = useState<ArticleFormErrors>({});
  const [previewImages] = useState<string[]>([]);

  // Hooks
  const { data: article, isLoading } = useStockArticle(
    articleId ? parseInt(articleId) : 0
  );
  const updateArticleMutation = useUpdateStockArticle();

  // Charger les données de l'article
  useEffect(() => {
    if (article) {
      setForm({
        name: article.name || "",
        description: article.description || "",
        etat: article.etat,
        type_enum: article.type_enum || "matiere_premiere",
        quantite: article.quantite,
        quantite_seuil: article.quantite_seuil,
        prix_unitaire: article.prix_unitaire || 0,
      });
    }
  }, [article]);

  const validateForm = (): boolean => {
    const newErrors: ArticleFormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "La désignation est requise";
    }

    if (form.quantite < 0) {
      newErrors.quantite = "La quantité ne peut pas être négative";
    }

    if (form.quantite_seuil < 0) {
      newErrors.quantite_seuil = "Le seuil ne peut pas être négatif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const updateData: UpdateStockArticleData = {
        id: articleId ? parseInt(articleId) : 0,
        name: form.name.trim(),
        description: form.description.trim(),
        etat: form.etat,
        type_enum: form.type_enum,
        quantite: form.quantite,
        quantite_seuil: form.quantite_seuil,
        prix_unitaire: form.prix_unitaire,
      };
      await updateArticleMutation.mutateAsync(updateData);
      navigate("/articles");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleChange = (field: keyof ArticleForm, value: string | number) => {
    setForm({ ...form, [field]: value });
    if (errors[field as keyof ArticleFormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const isLoading_ = isLoading || updateArticleMutation.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Article non trouvé</p>
          <button
            onClick={() => navigate("/articles")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/articles")}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Retour à la liste des articles"
              aria-label="Retour à la liste des articles"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Détails de l'article N° PRT-{String(articleId).padStart(3, "0")}
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Colonne gauche - Détails Basique */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Détails Basique
            </h3>

            <div className="space-y-4">
              {/* Désignation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Désignation
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Désignation de l'article"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description de l'article"
                />
              </div>

              {/* État */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État
                </label>
                <select
                  value={form.etat}
                  onChange={(e) =>
                    handleChange("etat", e.target.value as ArticleEtat)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Sélectionner l'état de l'article"
                  aria-label="État de l'article"
                >
                  <option value="Neuf">Bon</option>
                  <option value="Usagé">Mauvais</option>
                  <option value="Abandonné">Abandonné</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={form.type_enum}
                  onChange={(e) =>
                    handleChange("type_enum", e.target.value as ArticleType)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Sélectionner le type d'article"
                  aria-label="Type d'article"
                >
                  <option value="matiere_premiere">Matériaux</option>
                  <option value="equipement">Matériel</option>
                  <option value="consommable">Consommable</option>
                </select>
              </div>

              {/* Unité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue="kilogramme"
                  title="Sélectionner l'unité de mesure"
                  aria-label="Unité de mesure"
                >
                  <option value="kilogramme">Kilogramme</option>
                  <option value="litre">Litre</option>
                  <option value="piece">Pièce</option>
                  <option value="metre">Mètre</option>
                </select>
              </div>

              {/* Quantité et seuil */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={form.quantite}
                    onChange={(e) =>
                      handleChange("quantite", parseFloat(e.target.value) || 0)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.quantite ? "border-red-300" : "border-gray-300"
                    }`}
                    min="0"
                    step="0.01"
                    title="Saisir la quantité"
                    aria-label="Quantité de l'article"
                  />
                  {errors.quantite && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.quantite}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seuil
                  </label>
                  <input
                    type="number"
                    value={form.quantite_seuil}
                    onChange={(e) =>
                      handleChange(
                        "quantite_seuil",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.quantite_seuil
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    min="0"
                    step="0.01"
                    title="Saisir le seuil"
                    aria-label="Seuil de quantité"
                  />
                  {errors.quantite_seuil && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.quantite_seuil}
                    </p>
                  )}
                </div>
              </div>

              {/* Prix unitaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix unitaire
                </label>
                <input
                  type="number"
                  value={form.prix_unitaire}
                  onChange={(e) =>
                    handleChange(
                      "prix_unitaire",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de création
                  </label>
                  <input
                    type="date"
                    value={
                      new Date(article.date_creation)
                        .toISOString()
                        .split("T")[0]
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                    title="Date de création de l'article"
                    aria-label="Date de création"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de mise à jour
                  </label>
                  <input
                    type="date"
                    value={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                    title="Date de mise à jour de l'article"
                    aria-label="Date de mise à jour"
                  />
                </div>
              </div>

              {/* Bouton de sauvegarde */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading_}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading_ ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Modifier
                </button>
              </div>
            </div>
          </div>

          {/* Colonne droite - Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Les images de l'article
            </h3>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">Photo</p>

              {/* Zone de drop pour les images */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Ajouter une image
                </button>
              </div>

              {/* Prévisualisation des images existantes */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {previewImages.map((image: string, index: number) => (
                    <div key={index} className="relative group">
                      <CustomImage
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full aspect-square border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer l'image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
