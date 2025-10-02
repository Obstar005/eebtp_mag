import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  ChevronDown,
  Search,
} from "lucide-react";
import {
  useCreateProjet,
  useUpdateProjet,
  useProjet,
  useProjetMagasins,
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
  const { data: magasins, isLoading: isLoadingMagasins } =
    useProjetMagasins(projetId);
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

  // États pour les comptes associés
  const [selectedAccounts, setSelectedAccounts] = useState<
    { id: string; name: string }[]
  >([]);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [accountSearchTerm, setAccountSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateProjetData>({
    name: "",
    description: "",
    date_debut: "",
    date_fin: "",
    pays: "TG",
    chef_projet_userid: 0,
    directeur_travaux_userid: 0,
    chef_chantier_userid: 0,
    coordinateur_travaux_userid: 0,
    chef_equipe_userid: 0,
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

  // Gérer la fermeture du dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAccountDropdownOpen(false);
        setAccountSearchTerm(""); // Réinitialiser la recherche
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Charger les données du projet en mode édition
  useEffect(() => {
    if (isEditing && projet) {
      // Accéder à la propriété comptes via l'accesseur direct (projet as any).comptes
      const projetComptes = (projet as any).comptes || [];

      // Définir les données du formulaire depuis le projet
      const projectFormData = {
        name: projet.name,
        description: projet.description || "",
        date_debut: projet.date_debut.toISOString().split("T")[0],
        date_fin: projet.date_fin.toISOString().split("T")[0],
        pays: projet.pays,
        chef_projet_userid: projet.chef_projet_userid,
        directeur_travaux_userid: projet.directeur_travaux_userid,
        chef_chantier_userid: projet.chef_chantier_userid,
        coordinateur_travaux_userid: projet.coordinateur_travaux_userid,
        chef_equipe_userid: projet.chef_equipe_userid,
        // Si nous avons des magasins chargés, les inclure directement
        magasins:
          magasins?.map((m) => ({
            name: m.name,
            adresse: m.adresse || "",
            id: m.id, // Stocker l'ID comme propriété supplémentaire
          })) || [],
        images: [],
        comptes_associes: projetComptes,
      };

      setFormData(projectFormData);

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

      // Charger les comptes associés si disponibles
      if (projetComptes.length > 0 && accounts?.data) {
        const comptesAssocies = projetComptes
          .map((compteId: number | string) => {
            const account = accounts.data.find(
              (acc) => acc.id === compteId.toString()
            );
            if (account) {
              return {
                id: account.id,
                name: `${account.prenoms} ${account.nom}`,
              };
            }
            return null;
          })
          .filter((item: any) => item !== null) as {
          id: string;
          name: string;
        }[];

        setSelectedAccounts(comptesAssocies);
      }
    }
  }, [isEditing, projet, countries, accounts?.data, magasins]);

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
    // Ne pas permettre l'ajout de magasins en mode édition
    if (isEditing) {
      return;
    }
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
    const currentMagasin = newMagasins[index] || {};

    // Préserver l'ID du magasin s'il existe
    const magasinId = "id" in currentMagasin ? currentMagasin.id : undefined;

    newMagasins[index] = {
      ...currentMagasin,
      [field]: value,
      id: magasinId, // Conserver l'ID
    };

    setFormData((prev) => ({ ...prev, magasins: newMagasins }));
  };

  const removeMagasin = (index: number) => {
    // Ne pas permettre la suppression de magasins en mode édition
    if (isEditing) {
      return;
    }
    const newMagasins = [...(formData.magasins || [])];
    newMagasins.splice(index, 1);
    setFormData((prev) => ({ ...prev, magasins: newMagasins }));
  };

  // Fonctions pour la gestion des comptes associés
  const toggleAccountSelection = (account: { id: string; name: string }) => {
    const isSelected = selectedAccounts.some((item) => item.id === account.id);

    if (isSelected) {
      // Supprimer le compte
      setSelectedAccounts((prev) =>
        prev.filter((item) => item.id !== account.id)
      );
    } else {
      // Ajouter le compte
      setSelectedAccounts((prev) => [...prev, account]);
    }

    // Mettre à jour formData avec les IDs des comptes sélectionnés
    updateComptesAssocies(
      isSelected
        ? selectedAccounts.filter((item) => item.id !== account.id)
        : [...selectedAccounts, account]
    );
  };

  // Fonction pour mettre à jour formData.comptes_associes
  const updateComptesAssocies = (
    accounts: { id: string; name: string }[] = selectedAccounts
  ) => {
    const compteIds = accounts.map((account) => account.id);
    console.log("🔄 Mise à jour des comptes associés:", compteIds);
    setFormData((prev) => ({
      ...prev,
      comptes_associes: compteIds,
    }));
  };

  const removeSelectedAccount = (accountId: string) => {
    // Mettre à jour le tableau des comptes sélectionnés
    const updatedAccounts = selectedAccounts.filter(
      (item) => item.id !== accountId
    );
    setSelectedAccounts(updatedAccounts);

    // Mettre à jour formData avec les IDs des comptes sélectionnés après suppression
    updateComptesAssocies(updatedAccounts);
  };

  // Filtrer les comptes selon le terme de recherche
  const filteredAccounts =
    accounts?.data?.filter((account) => {
      const accountName = `${account.nom} ${account.prenoms}`.toLowerCase();
      const profileName = account.profile.nom.toLowerCase();
      const searchTerm = accountSearchTerm.toLowerCase();

      return (
        accountName.includes(searchTerm) || profileName.includes(searchTerm)
      );
    }) || [];

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

    // S'assurer que les comptes associés sont inclus dans les données du formulaire
    const compteIds = selectedAccounts.map((account) => account.id);
    console.log("💾 Enregistrement des comptes associés:", compteIds);

    // Créer une copie des données du formulaire avec les comptes associés
    const formDataWithComptes = {
      ...formData,
      comptes_associes: compteIds,
    };

    try {
      if (isEditing) {
        const updateData: UpdateProjetData = {
          id: projetId,
          ...formDataWithComptes,
        };
        await updateProjetMutation.mutateAsync(updateData);
      } else {
        await createProjetMutation.mutateAsync(formDataWithComptes);
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
                {isEditing && (
                  <span className="text-sm italic text-gray-600">
                    Seule la modification des magasins existants est autorisée
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {!isEditing && (
                  <>
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
                  </>
                )}

                {/* Liste des magasins existants */}

                {isLoadingMagasins && isEditing ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (magasins && magasins.length > 0) ||
                  (Array.isArray(formData.magasins) &&
                    formData.magasins.length > 0) ? (
                  // Utiliser les magasins du formData s'ils sont disponibles, sinon les magasins bruts
                  (Array.isArray(formData.magasins) &&
                  formData.magasins.length > 0
                    ? formData.magasins
                    : magasins?.map((m) => ({
                        name: m.name,
                        adresse: m.adresse || "",
                        id: m.id,
                      })) || []
                  ).map(
                    (
                      magasin: { name: string; adresse?: string; id?: number },
                      index
                    ) => (
                      <div
                        key={index}
                        className="flex gap-4 items-start bg-gray-50 rounded-lg p-4 mt-2"
                      >
                        <div className="flex-1 space-y-3">
                          <div className="">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nom du magasin{" "}
                              {isEditing && magasin.id ? `#${magasin.id}` : ""}
                            </label>
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
                          </div>
                          <div className="">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Adresse du magasin
                            </label>
                            <input
                              type="text"
                              value={magasin.adresse || ""}
                              onChange={(e) =>
                                updateMagasin(index, "adresse", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Adresse du magasin"
                              title={`Adresse du magasin ${index + 1}`}
                              aria-label={`Adresse du magasin ${index + 1}`}
                            />
                          </div>
                        </div>
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => removeMagasin(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer le magasin"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )
                  )
                ) : (
                  isEditing && (
                    <div className="text-center p-4 border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-500">
                        {isLoadingMagasins
                          ? "Chargement des magasins..."
                          : "Aucun magasin associé à ce projet."}
                      </p>
                    </div>
                  )
                )}
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
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comptes
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors absolute right-0 top-0 z-20 inset-y-1"
                    >
                      Ajouter <Plus className="h-4 w-4 ml-1" />
                    </button>
                    {/* Champ de sélection avec tags des comptes sélectionnés */}
                    <div className="relative" ref={dropdownRef}>
                      <div
                        onClick={() =>
                          setIsAccountDropdownOpen(!isAccountDropdownOpen)
                        }
                        className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
                      >
                        <div className="flex items-center flex-wrap gap-2">
                          {/* Tags des comptes sélectionnés */}
                          {selectedAccounts.map((account) => (
                            <div
                              key={account.id}
                              className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
                            >
                              <span className="mr-1">{account.name}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSelectedAccount(account.id);
                                }}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                                title={`Supprimer ${account.name}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}

                          {/* Placeholder quand rien n'est sélectionné */}
                          {selectedAccounts.length === 0 && (
                            <span className="text-gray-500 text-sm">
                              Sélectionner des comptes...
                            </span>
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

                      {/* Dropdown des comptes disponibles */}
                      {isAccountDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                          {/* Barre de recherche */}
                          <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <input
                                type="text"
                                value={accountSearchTerm}
                                onChange={(e) =>
                                  setAccountSearchTerm(e.target.value)
                                }
                                placeholder="Rechercher un compte..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>

                          {/* Liste des comptes filtrés */}
                          <div className="max-h-48 overflow-y-auto">
                            {filteredAccounts.length > 0 ? (
                              <div className="p-2">
                                {filteredAccounts.map((account) => {
                                  const accountName = `${account.nom} ${account.prenoms}`;
                                  const isSelected = selectedAccounts.some(
                                    (item) => item.id === account.id
                                  );

                                  return (
                                    <div
                                      key={account.id}
                                      onClick={() => {
                                        toggleAccountSelection({
                                          id: account.id,
                                          name: accountName,
                                        });
                                      }}
                                      className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:bg-gray-50 ${
                                        isSelected
                                          ? "bg-blue-50 text-blue-600"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      <div className="flex items-center">
                                        <div className="flex-1">
                                          <div className="font-medium text-sm">
                                            {accountName}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {account.profile.nom} •{" "}
                                            {account.telephone}
                                          </div>
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <div className="ml-2">
                                          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="px-3 py-4 text-center">
                                {accountSearchTerm ? (
                                  <div className="text-gray-500 text-sm">
                                    Aucun compte trouvé pour "
                                    {accountSearchTerm}"
                                  </div>
                                ) : (
                                  <div className="text-gray-500 text-sm">
                                    Aucun compte disponible
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
