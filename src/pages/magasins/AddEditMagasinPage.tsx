import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import {
  useCreateMagasin,
  useUpdateMagasin,
  useMagasin,
} from "../../hooks/useMagasins";
import type { CreateMagasinData, UpdateMagasinData } from "../../types/magasin";

interface MagasinForm {
  name: string;
  adresse: string;
  description: string;
  projetId?: number;
}

export function AddEditMagasinPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<MagasinForm>({
    name: "",
    adresse: "",
    description: "",
    projetId: undefined,
  });

  const [errors, setErrors] = useState<Partial<MagasinForm>>({});

  // Hooks
  const { data: magasin, isLoading } = useMagasin(id ? parseInt(id) : null);
  const createMagasinMutation = useCreateMagasin();
  const updateMagasinMutation = useUpdateMagasin();

  // Charger les données pour l'édition
  useEffect(() => {
    if (isEditing && magasin) {
      setForm({
        name: magasin.name,
        adresse: magasin.adresse || "",
        description: magasin.description || "",
        projetId: magasin.projet?.id,
      });
    }
  }, [isEditing, magasin]);

  const validateForm = (): boolean => {
    const newErrors: Partial<MagasinForm> = {};

    if (!form.name.trim()) {
      newErrors.name = "Le nom du magasin est requis";
    }

    if (!form.adresse.trim()) {
      newErrors.adresse = "L'adresse est requise";
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
      if (isEditing && id) {
        const updateData: UpdateMagasinData = {
          id: parseInt(id),
          name: form.name.trim(),
          adresse: form.adresse.trim(),
        };
        await updateMagasinMutation.mutateAsync(updateData);
      } else {
        const createData: CreateMagasinData = {
          name: form.name.trim(),
          adresse: form.adresse.trim(),
          project_id: form.projetId,
        };
        await createMagasinMutation.mutateAsync(createData);
      }
      navigate("/magasins");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleChange = (
    field: keyof MagasinForm,
    value: string | number | undefined
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isLoading_ =
    isLoading ||
    createMagasinMutation.isPending ||
    updateMagasinMutation.isPending;

  if (isEditing && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/magasins")}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Retour à la liste des magasins"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Modifier le magasin" : "Ajouter un magasin"}
            </h1>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nom du magasin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du magasin *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Entrez le nom du magasin"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                value={form.adresse}
                onChange={(e) => handleChange("adresse", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.adresse ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Entrez l'adresse du magasin"
              />
              {errors.adresse && (
                <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>
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
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description du magasin (optionnel)"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/magasins")}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading_}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading_}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading_ ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEditing ? "Mettre à jour" : "Créer le magasin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
