import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader } from "lucide-react";
import {
  useCreateProjet,
  useUpdateProjet,
  useProjet,
} from "../../hooks/useProjets";
import { useAuth } from "../../contexts/AuthContext";
import { CountrySelector } from "../../components/ui";
import type { CreateProjetData, UpdateProjetData } from "../../types/project";

export function AddEditProjetPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditMode = !!id;

  // Hooks pour les mutations
  const createProjetMutation = useCreateProjet();
  const updateProjetMutation = useUpdateProjet();
  const { data: existingProjet, isLoading: isLoadingProjet } = useProjet(
    id ? parseInt(id) : 0
  );

  // État du formulaire
  const [formData, setFormData] = useState<CreateProjetData>({
    name: "",
    description: "",
    date_debut: "",
    date_fin: "",
    pays: "",
    chef_projet_user_id: parseInt(user?.id || "0"),
    directeur_travaux_user_id: parseInt(user?.id || "0"),
    chef_chantier_user_id: parseInt(user?.id || "0"),
    coordinateur_travaux_user_id: parseInt(user?.id || "0"),
    chef_equipe_user_id: parseInt(user?.id || "0"),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les données existantes en mode édition
  useEffect(() => {
    if (isEditMode && existingProjet) {
      setFormData({
        name: existingProjet.name,
        description: existingProjet.description,
        date_debut: existingProjet.date_debut.toISOString().split("T")[0],
        date_fin: existingProjet.date_fin.toISOString().split("T")[0],
        pays: existingProjet.pays,
        chef_projet_user_id: existingProjet.chef_projet_user_id,
        directeur_travaux_user_id: existingProjet.directeur_travaux_user_id,
        chef_chantier_user_id: existingProjet.chef_chantier_user_id,
        coordinateur_travaux_user_id:
          existingProjet.coordinateur_travaux_user_id,
        chef_equipe_user_id: existingProjet.chef_equipe_user_id,
      });
    }
  }, [isEditMode, existingProjet]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom du projet est requis";
    }

    if (!formData.date_debut) {
      newErrors.date_debut = "La date de début est requise";
    }

    if (!formData.date_fin) {
      newErrors.date_fin = "La date de fin est requise";
    }

    if (
      formData.date_debut &&
      formData.date_fin &&
      formData.date_debut > formData.date_fin
    ) {
      newErrors.date_fin =
        "La date de fin doit être postérieure à la date de début";
    }

    if (!formData.pays) {
      newErrors.pays = "Le pays est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && id) {
        const updateData: UpdateProjetData = {
          id: parseInt(id),
          ...formData,
        };
        await updateProjetMutation.mutateAsync(updateData);
      } else {
        await createProjetMutation.mutateAsync(formData);
      }

      navigate("/projects");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setErrors({
        submit: "Une erreur est survenue lors de la sauvegarde",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion des changements de champs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Gestion du sélecteur de pays
  const handleCountryChange = (country: { code: string; name: string }) => {
    setFormData((prev) => ({ ...prev, pays: country.name }));
    if (errors.pays) {
      setErrors((prev) => ({ ...prev, pays: "" }));
    }
  };

  if (isEditMode && isLoadingProjet) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/projects")}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "Modifier le projet" : "Nouveau projet"}
        </h1>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom du projet */}
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nom du projet *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Entrez le nom du projet"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description du projet (optionnel)"
              />
            </div>

            {/* Pays */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays *
              </label>
              <CountrySelector
                value={undefined}
                displayMode="name"
                placeholder="Sélectionner un pays"
                onChange={handleCountryChange}
              />
              {errors.pays && (
                <p className="mt-1 text-sm text-red-600">{errors.pays}</p>
              )}
            </div>

            {/* Date de début */}
            <div>
              <label
                htmlFor="date_debut"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date de début *
              </label>
              <input
                type="date"
                id="date_debut"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date_debut ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.date_debut && (
                <p className="mt-1 text-sm text-red-600">{errors.date_debut}</p>
              )}
            </div>

            {/* Date de fin */}
            <div>
              <label
                htmlFor="date_fin"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date de fin *
              </label>
              <input
                type="date"
                id="date_fin"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date_fin ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.date_fin && (
                <p className="mt-1 text-sm text-red-600">{errors.date_fin}</p>
              )}
            </div>
          </div>

          {/* Messages d'erreur généraux */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting
                ? "Sauvegarde..."
                : isEditMode
                ? "Modifier"
                : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
