import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import {
  useStockArticle,
  useUpdateStockArticle,
} from "../../hooks/useArticles";
import { ArticleType, ArticleUnite } from "../../types/magasin";
import type { UpdateStockArticleData } from "../../types/magasin";
import { CustomImage } from "../../components/ui/CustomImage";

interface ArticleForm {
  name: string;
  description: string;
  type_enum: ArticleType;
  unite: ArticleUnite;
}

interface ArticleFormErrors {
  name?: string;
  description?: string;
  etat?: string;
  type_enum?: string;
  unite?: string;
}

export default function EditArticlePage() {
  const { id: articleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ArticleForm>({
    name: "",
    description: "",
    type_enum: "matiere_premiere",
    unite: "unite",
  });
  const [errors, setErrors] = useState<ArticleFormErrors>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Récupérer l'article existant
  const { data: article } = useStockArticle(
    articleId ? parseInt(articleId) : 0
  );
  const updateArticleMutation = useUpdateStockArticle();

  useEffect(() => {
    if (article) {
      setForm({
        name: article.name || "",
        description: article.description || "",
        type_enum: article.type_enum || "matiere_premiere",
        unite: article.unite || "unite",
      });
      // TODO: Charger les images existantes si besoin
    }
  }, [article]);

  const validateForm = (): boolean => {
    const newErrors: ArticleFormErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "La désignation est requise";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !articleId) return;
    try {
      const updateData: UpdateStockArticleData = {
        id: parseInt(articleId),
        name: form.name.trim(),
        description: form.description.trim(),
        type_enum: form.type_enum,
        unite: form.unite,
      };
      await updateArticleMutation.mutateAsync(updateData);
      navigate("/articles");
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  const handleChange = (field: keyof ArticleForm, value: string | number) => {
    setForm({ ...form, [field]: value });
    if (errors[field as keyof ArticleFormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newFiles = [...uploadedFiles, ...files];
    setUploadedFiles(newFiles);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const isSaving = updateArticleMutation.isPending;

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
              Modifier l'article
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
              {/* <div>
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
                  placeholder="Désignation"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div> */}
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
              {/* Type avec switch toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <div className="relative">
                  <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit">
                    <button
                      type="button"
                      onClick={() =>
                        handleChange("type_enum", "matiere_premiere")
                      }
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                        form.type_enum === "matiere_premiere"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Matériaux
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange("type_enum", "equipement")}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                        form.type_enum === "equipement"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Matériel
                    </button>
                  </div>
                </div>
              </div>
              {/* Unité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité
                </label>
                <select
                  value={form.unite}
                  onChange={(e) => handleChange("unite", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Sélectionner l'unité"
                  aria-label="Unité de mesure"
                >
                  <option value="litre">Litre</option>
                  <option value="kg">Kilogramme</option>
                  <option value="m3">Mètre cube</option>
                  <option value="unite">Unité</option>
                  <option value="m">Mètre</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              {/* État */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État
                </label>
                <select
                  value={form.etat}
                  onChange={(e) =>
                    handleChange("etat", e.target.value as ArticleEtat)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="neuf">Neuf</option>
                  <option value="usagé">Usagé</option>
                  <option value="endommagé">Endommagé</option>
                </select>
              </div> */}
              {/* Quantité et seuil */}
              {/* <div className="grid grid-cols-2 gap-4">
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
                    placeholder="0"
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
                    placeholder="0"
                  />
                  {errors.quantite_seuil && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.quantite_seuil}
                    </p>
                  )}
                </div>
              </div> */}
              {/* Prix unitaire */}
              {/* <div>
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
              </div> */}
              {/* Bouton de sauvegarde */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
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
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50"
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 mx-auto px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Ajouter une image"
                  aria-label="Ajouter une image à l'article"
                >
                  <Upload className="h-4 w-4" />
                  Ajouter une image
                </button>
              </div>
              {/* Input file caché */}
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                title="Sélectionner des images"
                aria-label="Sélectionner des images pour l'article"
              />
              {/* Prévisualisation des images */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {previewImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <CustomImage
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full aspect-square border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
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
