import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Eye,
  EyeOff,
  Calendar,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { useCreateAccount, useProfiles } from "../../hooks";
import { CountrySelector } from "../../components/ui/CountrySelector";
import { useCountries } from "../../hooks/useCountries";
import type { CreateAccountData, AccountType } from "../../types/account";
import type { Country } from "../../services/countriesService";

// Fonctions de validation
const validateUsername = (username: string): boolean => {
  // Autorise uniquement des lettres, des chiffres et @/./+/-/_
  const usernameRegex = /^[\w.@+-]+$/;
  return usernameRegex.test(username);
};

const validatePassword = (password: string): boolean => {
  // Minimum 8 caractères, au moins une lettre et un chiffre
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

export function AddAccountPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    undefined
  );
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<
    Country | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);

  // États de validation
  const [validationErrors, setValidationErrors] = useState<{
    nom_utilisateur?: string;
    mot_de_passe?: string;
  }>({});
  const [fieldsTouched, setFieldsTouched] = useState<{
    nom_utilisateur: boolean;
    mot_de_passe: boolean;
  }>({ nom_utilisateur: false, mot_de_passe: false });

  const { data: profiles } = useProfiles();
  const createAccountMutation = useCreateAccount();
  const { countries } = useCountries();
  const {
    validatePhoneNumber,
    formatPhoneNumber,
    isLoading: countriesLoading,
  } = useCountries();

  const [formData, setFormData] = useState<CreateAccountData>({
    nom: "",
    prenoms: "",
    nom_utilisateur: "",
    date_naissance: "",
    nationalite: "TG", // Code pays par défaut
    mot_de_passe: "",
    confirm_mot_de_passe: "",
    type: "Interne",
    titre: "",
    telephone: "",
    profile_id: "",
    photo_profil: undefined,
  });

  // Initialiser le pays par défaut
  useEffect(() => {
    if (countries && countries.length > 0 && !selectedCountry) {
      const togoCountry = countries.find(
        (country) => country.abbreviation === "TG"
      );
      if (togoCountry) {
        setSelectedCountry(togoCountry);
      }
      if (!selectedPhoneCountry) {
        setSelectedPhoneCountry(togoCountry);
      }
    }
  }, [countries, selectedCountry, selectedPhoneCountry]);

  const handleInputChange = (
    field: keyof CreateAccountData,
    value: string | File
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Marquer le champ comme touché
    if (field === "nom_utilisateur" || field === "mot_de_passe") {
      setFieldsTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      // Valider le champ
      validateField(field, value as string);
    }
  };

  // Fonction pour valider un champ spécifique
  const validateField = (field: string, value: string) => {
    const newErrors = { ...validationErrors };

    if (field === "nom_utilisateur") {
      if (!validateUsername(value)) {
        newErrors.nom_utilisateur =
          "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et @/./+/-/_";
      } else {
        delete newErrors.nom_utilisateur;
      }
    }

    if (field === "mot_de_passe") {
      if (!validatePassword(value)) {
        newErrors.mot_de_passe =
          "Le mot de passe doit contenir au moins 8 caractères, dont au moins une lettre et un chiffre";
      } else {
        delete newErrors.mot_de_passe;
      }
    }

    setValidationErrors(newErrors);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type et la taille du fichier
      if (!file.type.match("image.*")) {
        setError("Le fichier doit être une image valide");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB max
        setError("L'image est trop volumineuse. Taille maximum: 5MB");
        return;
      }

      console.log(
        "Image sélectionnée:",
        file.name,
        file.type,
        `${(file.size / 1024).toFixed(2)}KB`
      );
      setFormData((prev) => ({ ...prev, photo_profil: file }));

      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Marquer tous les champs comme touchés pour montrer toutes les erreurs
    setFieldsTouched({
      nom_utilisateur: true,
      mot_de_passe: true,
    });

    // Valider tous les champs critiques
    validateField("nom_utilisateur", formData.nom_utilisateur);
    validateField("mot_de_passe", formData.mot_de_passe);

    // Vérifier s'il y a des erreurs de validation
    if (validationErrors.nom_utilisateur || validationErrors.mot_de_passe) {
      setError(
        "Veuillez corriger les erreurs de validation avant de soumettre le formulaire."
      );
      return;
    }

    if (formData.mot_de_passe !== formData.confirm_mot_de_passe) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    // Vérification et formatage du numéro de téléphone
    if (selectedPhoneCountry && formData.telephone) {
      if (!validatePhoneNumber(formData.telephone, selectedPhoneCountry.code)) {
        setError("Format de numéro de téléphone invalide");
        return;
      } else {
        const fullPhoneNumber = formatPhoneNumber(
          formData.telephone,
          selectedPhoneCountry.code
        );
        formData.telephone = fullPhoneNumber;
      }
    } else {
      setError("Veuillez sélectionner un pays pour le téléphone");
      return;
    }

    // Préparation des données pour l'API
    const submissionData = {
      ...formData,
      // Assurer que la date est au format YYYY-MM-DD
      date_naissance: formData.date_naissance
        ? new Date(formData.date_naissance).toISOString().split("T")[0]
        : "",
    };

    try {
      await createAccountMutation.mutateAsync(submissionData);

      navigate("/accounts");
    } catch (error) {
      console.error("Erreur lors de la création du compte:", error);

      // Vérifier si l'erreur est liée à un ID manquant
      if (
        error instanceof Error &&
        error.message.includes("sans ID d'utilisateur")
      ) {
        setError(
          "Le compte a été créé mais l'ID est manquant. Redirection vers la liste des comptes..."
        );
        // Attendre un peu puis rediriger vers la liste
        setTimeout(() => {
          navigate("/accounts");
        }, 2000);
        return;
      }

      // Extraction des messages d'erreur spécifiques de l'API
      // Utiliser une approche sûre au niveau du typage
      const err = error as { response?: { data?: Record<string, unknown> } };
      if (err.response?.data) {
        const apiErrors = err.response.data;
        let errorMessage = "";

        // Parcourir tous les champs d'erreur retournés par l'API
        Object.entries(apiErrors).forEach(([field, messagesRaw]) => {
          // Vérifier si messages est un tableau
          const messages = Array.isArray(messagesRaw) ? messagesRaw : [];
          if (messages.length > 0 && typeof messages[0] === "string") {
            errorMessage += `${field}: ${messages[0]}\n`;
          }
        });

        setError(
          errorMessage ||
            "Échec de la création du compte. Veuillez vérifier les informations et réessayer."
        );
      } else {
        setError(
          "Échec de la création du compte. Veuillez vérifier les informations et réessayer."
        );
      }
    }
  };

  const isLoading = createAccountMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Ajouter un nouveau compte
        </h1>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Erreur ! </strong>
          <div className="block sm:inline whitespace-pre-line">{error}</div>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Fermer</title>
              <path d="M14.348 5.652a1 1 0 00-1.414 0L10 8.586 7.066 5.652a1 1 0 10-1.414 1.414L8.586 10l-2.934 2.934a1 1 0 101.414 1.414L10 11.414l2.934 2.934a1 1 0 001.414-1.414L11.414 10l2.934-2.934a1 1 0 000-1.414z" />
            </svg>
          </span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informations personnelles
            </h3>

            <div className="flex max-md:flex-col gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => handleInputChange("nom", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Doe"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénoms *
                </label>
                <input
                  type="text"
                  required
                  value={formData.prenoms}
                  onChange={(e) => handleInputChange("prenoms", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>
            </div>

            <div className="flex max-md:flex-col gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom_utilisateur}
                  onChange={(e) =>
                    handleInputChange("nom_utilisateur", e.target.value)
                  }
                  className={`w-full px-3 py-2 border ${
                    fieldsTouched.nom_utilisateur &&
                    validationErrors.nom_utilisateur
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-1 ${
                    fieldsTouched.nom_utilisateur &&
                    validationErrors.nom_utilisateur
                      ? "focus:ring-red-500"
                      : "focus:ring-blue-500"
                  }`}
                  placeholder="johndoe"
                />
                {fieldsTouched.nom_utilisateur &&
                  validationErrors.nom_utilisateur && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.nom_utilisateur}
                    </div>
                  )}
                <p className="mt-1 text-xs text-gray-500">
                  Peut contenir uniquement des lettres, des chiffres et
                  @/./+/-/_
                </p>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.date_naissance}
                    onChange={(e) =>
                      handleInputChange("date_naissance", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    title="Date de naissance"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex max-md:flex-col gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationalité *
                </label>
                <CountrySelector
                  value={selectedCountry}
                  displayMode="name"
                  placeholder="Sélectionner un pays"
                  onChange={(country) => {
                    setSelectedCountry(country);
                    setFormData((prev) => ({
                      ...prev,
                      nationalite: country.abbreviation, // Utiliser l'abréviation du pays
                    }));
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <div className="flex border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  {/* Sélecteur de pays intégré */}
                  <div className="relative">
                    <CountrySelector
                      value={selectedPhoneCountry}
                      onChange={setSelectedPhoneCountry}
                    />
                  </div>

                  {/* Séparateur */}
                  <div className="w-px bg-gray-300"></div>

                  {/* Input téléphone */}
                  <input
                    type="tel"
                    id="phone"
                    value={formData.telephone}
                    onChange={(e) =>
                      handleInputChange("telephone", e.target.value)
                    }
                    placeholder="90 90 90 90"
                    className="flex-1 px-4 py-3 border-0 rounded-r-lg focus:ring-0 focus:outline-none"
                    disabled={countriesLoading}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 max-md:flex-col mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.mot_de_passe}
                    onChange={(e) =>
                      handleInputChange("mot_de_passe", e.target.value)
                    }
                    className={`w-full px-3 py-2 pr-10 border ${
                      fieldsTouched.mot_de_passe &&
                      validationErrors.mot_de_passe
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-1 ${
                      fieldsTouched.mot_de_passe &&
                      validationErrors.mot_de_passe
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {fieldsTouched.mot_de_passe &&
                  validationErrors.mot_de_passe && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.mot_de_passe}
                    </div>
                  )}
                <p className="mt-1 text-xs text-gray-500">
                  8 caractères minimum avec au moins une lettre et un chiffre
                </p>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirm_mot_de_passe}
                    onChange={(e) =>
                      handleInputChange("confirm_mot_de_passe", e.target.value)
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Titre && Type */}
          <div className="flex max-md:flex-col gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                required
                value={formData.titre}
                onChange={(e) => handleInputChange("titre", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ex: Ingénieur, Manager..."
                title="Titre du compte (Ex: Ingénieur, Manager...)"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.type}
                  onChange={(e) =>
                    handleInputChange("type", e.target.value as AccountType)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                  title="Sélectionner le type de compte"
                >
                  <option value="Interne">Interne</option>
                  <option value="Consultant">Consultant</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>{" "}
            </div>
          </div>

          <div className="flex max-md:flex-col gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profil *
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.profile_id}
                  onChange={(e) =>
                    handleInputChange("profile_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                  title="Sélectionner un profil"
                >
                  <option value="">Sélectionner un profil</option>
                  {profiles?.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.nom}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo de profil
              </label>

              <div
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 bg-gray-50"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Aperçu"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 text-center">
                      Glisser-déposer ou cliquer ici pour sélectionner le
                      fichier
                    </span>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                title="Sélectionner une photo de profil"
                aria-label="Sélectionner une photo de profil"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Création...
                </>
              ) : (
                "Enregistrer"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/accounts")}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
