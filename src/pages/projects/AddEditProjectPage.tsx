import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X, Plus, Trash2, ChevronDown } from "lucide-react";
import {
  useCreateProjet,
  useUpdateProjet,
  useProjet,
} from "../../hooks/useProjets";
import { useAccounts } from "../../hooks/useAccounts";
import { CountrySelector } from "../../components/ui/CountrySelector";
import { ProjectImage } from "../../components/ui/CustomImage";
import type { CreateProjetData, UpdateProjetData } from "../../types/project";
import type { Country } from "../../services/countriesService";
import { useCountries } from "../../hooks/useCountries";

export function AddEditProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const projetId = id ? parseInt(id) : 0;

  // Hooks
  const { data: projet, isLoading: isLoadingProjet } = useProjet(projetId);
  const { data: accounts } = useAccounts({});
  const createProjetMutation = useCreateProjet();
  const updateProjetMutation = useUpdateProjet();
  const { countries } = useCountries();

  // States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    undefined
  );
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // États pour les comptes associés (utilisation de strings simples pour le prototype)
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const [formData, setFormData] = useState<CreateProjetData>({
    name: "",
    description: "",
    date_debut: "",
    date_fin: "",
    pays: "TG",
    chef_projet_user_id: 0,
    directeur_travaux_user_id: 0,
    chef_chantier_user_id: 0,
    coordinateur_travaux_user_id: 0,
    chef_equipe_user_id: 0,
    magasins: [],
    images: [],
  });

  // Initialiser le pays par défaut
  useEffect(() => {
    if (countries && countries.length > 0 && !selectedCountry) {
      const defaultCountry = countries.find((c) => c.abbreviation === "TG");
      if (defaultCountry) {
        setSelectedCountry(defaultCountry);
      }
    }
  }, [countries, selectedCountry]);

  // Charger les données du projet en mode édition
  useEffect(() => {
    if (isEditing && projet) {
      setFormData({
        name: projet.name,
        description: projet.description || "",
        date_debut: projet.date_debut.toISOString().split("T")[0],
        date_fin: projet.date_fin.toISOString().split("T")[0],
        pays: projet.pays,
        chef_projet_user_id: projet.chef_projet_user_id,
        directeur_travaux_user_id: projet.directeur_travaux_user_id,
        chef_chantier_user_id: projet.chef_chantier_user_id,
        coordinateur_travaux_user_id: projet.coordinateur_travaux_user_id,
        chef_equipe_user_id: projet.chef_equipe_user_id,
        magasins:
          projet.magasins?.map((m) => ({ name: m.name, adresse: m.adresse })) ||
          [],
        images: [],
      });

      // Initialiser le pays sélectionné
      if (countries && projet.pays) {
        const country = countries.find((c) => c.abbreviation === projet.pays);
        if (country) {
          setSelectedCountry(country);
        }
      }

      // Charger les images existantes
      if (projet.images) {
        setPreviewImages(projet.images);
      }
    }
  }, [isEditing, projet, countries]);

  const handleInputChange = (
    field: keyof CreateProjetData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = [...(formData.images || []), ...files];
    setFormData((prev) => ({ ...prev, images: newImages }));

    // Créer des prévisualisations
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: newImages }));

    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const addMagasin = () => {
    setFormData((prev) => ({
      ...prev,
      magasins: [...(prev.magasins || []), { name: "", adresse: "" }],
    }));
  };

  const updateMagasin = (
    index: number,
    field: "name" | "adresse",
    value: string
  ) => {
    const newMagasins = [...(formData.magasins || [])];
    newMagasins[index] = { ...newMagasins[index], [field]: value };
    setFormData((prev) => ({ ...prev, magasins: newMagasins }));
  };

  const removeMagasin = (index: number) => {
    const newMagasins = [...(formData.magasins || [])];
    newMagasins.splice(index, 1);
    setFormData((prev) => ({ ...prev, magasins: newMagasins }));
  };

  // Fonctions pour la gestion des comptes associés (mode string pour le prototype)
  const toggleAccountSelection = (accountName: string) => {
    const isSelected = selectedAccounts.includes(accountName);

    if (isSelected) {
      // Supprimer le compte
      setSelectedAccounts((prev) =>
        prev.filter((name) => name !== accountName)
      );
    } else {
      // Ajouter le compte
      setSelectedAccounts((prev) => [...prev, accountName]);
    }
  };

  const removeSelectedAccount = (accountName: string) => {
    setSelectedAccounts((prev) => prev.filter((name) => name !== accountName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!formData.name.trim()) {
      setError("Le nom du projet est requis");
      return;
    }
    if (!formData.date_debut || !formData.date_fin) {
      setError("Les dates de début et de fin sont requises");
      return;
    }
    if (new Date(formData.date_debut) >= new Date(formData.date_fin)) {
      setError("La date de début doit être antérieure à la date de fin");
      return;
    }

    try {
      if (isEditing) {
        const updateData: UpdateProjetData = { id: projetId, ...formData };
        await updateProjetMutation.mutateAsync(updateData);
      } else {
        await createProjetMutation.mutateAsync(formData);
      }
      navigate("/projects");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setError("Une erreur est survenue lors de la sauvegarde");
    }
  };

  const isLoading =
    createProjetMutation.isPending || updateProjetMutation.isPending;

  if (isEditing && isLoadingProjet) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/projects")}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            title="Retour à la liste des projets"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
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
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/projects")}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900"
          title="Retour à la liste des projets"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing
            ? `Modification du projet N° PRJT${String(projetId).padStart(
                3,
                "0"
              )}`
            : "Ajouter un projet"}
        </h1>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 relative">
          <strong className="font-bold">Erreur ! </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            title="Fermer le message d'erreur"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section principale avec 2 colonnes */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="">
            {/* Colonne de gauche - Détails Basiques */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Détails Basique
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom du projet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description du projet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Période
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Début
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date_debut}
                        onChange={(e) =>
                          handleInputChange("date_debut", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Date de début du projet"
                        aria-label="Date de début du projet"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Fin
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date_fin}
                        onChange={(e) =>
                          handleInputChange("date_fin", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Date de fin du projet"
                        aria-label="Date de fin du projet"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <div className="relative">
                    <CountrySelector
                      value={selectedCountry}
                      displayMode="name"
                      placeholder="Sélectionner un pays"
                      onChange={(country) => {
                        setSelectedCountry(country);
                        setFormData((prev) => ({
                          ...prev,
                          pays: country.abbreviation,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Section Magasins Associés */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Magasins Associés
                </h3>
                <button
                  type="button"
                  onClick={addMagasin}
                  className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un magasin
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du magasin
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom du magasin"
                    title="Nom du magasin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse du magasin
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adresse du magasin"
                    title="Adresse du magasin"
                  />
                </div>

                {/* Liste des magasins existants */}
                {formData.magasins?.map((magasin, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={magasin.name}
                        onChange={(e) =>
                          updateMagasin(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nom du magasin"
                        title={`Nom du magasin ${index + 1}`}
                        aria-label={`Nom du magasin ${index + 1}`}
                      />
                      <input
                        type="text"
                        value={magasin.adresse}
                        onChange={(e) =>
                          updateMagasin(index, "adresse", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Adresse du magasin"
                        title={`Adresse du magasin ${index + 1}`}
                        aria-label={`Adresse du magasin ${index + 1}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMagasin(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer le magasin"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="">
            {/* Colonne de droite - Images du projet */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Télécharger les images du projet
              </h3>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">Photo</p>

                {/* Zone de drop pour les images */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium">
                        Ajouter une image
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Glisser-déposer ou cliquer pour sélectionner
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input file caché */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  title="Sélectionner des images"
                  aria-label="Sélectionner des images du projet"
                />

                {/* Prévisualisation des images */}
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {previewImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <ProjectImage
                          src={image}
                          alt={`Prévisualisation ${index + 1}`}
                          className="w-full h-24 border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Supprimer l'image"
                          aria-label={`Supprimer l'image ${index + 1}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section Comptes Associés */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Comptes Associés
                </h3>
                <button
                  type="button"
                  className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter <Plus className="h-4 w-4 ml-1" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comptes
                  </label>

                  {/* Champ de sélection avec tags des comptes sélectionnés */}
                  <div className="relative">
                    <div
                      onClick={() =>
                        setIsAccountDropdownOpen(!isAccountDropdownOpen)
                      }
                      className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
                    >
                      <div className="flex items-center flex-wrap gap-2">
                        {/* Tags des comptes sélectionnés */}
                        {selectedAccounts.map((accountName) => (
                          <div
                            key={accountName}
                            className="flex items-center bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm"
                          >
                            <span className="mr-1">{accountName}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSelectedAccount(accountName);
                              }}
                              className="ml-1 text-gray-500 hover:text-gray-700"
                              title={`Supprimer ${accountName}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}

                        {/* Barre verticale de séparation */}
                        {selectedAccounts.length > 0 && (
                          <div className="w-px h-5 bg-red-400 mx-1" />
                        )}

                        {/* Flèche dropdown */}
                        <div className="flex-1 flex justify-end">
                          <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform ${
                              isAccountDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="flex justify-start">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
