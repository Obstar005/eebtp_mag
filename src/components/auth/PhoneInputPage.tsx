import { useState, useEffect } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import logoPng from "../../assets/eebtp.png";
import logoPngBg from "../../assets/logo_eebtp.png";
import { CountrySelector } from "../ui/CountrySelector";
import { useCountries } from "../../hooks/useCountries";
import type { Country } from "../../services/countriesService";

interface PhoneInputPageProps {
  onSubmit: (phone: string) => void;
  isLoading: boolean;
  onBack?: () => void;
}

export function PhoneInputPage({
  onSubmit,
  isLoading,
  onBack,
}: PhoneInputPageProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const {
    validatePhoneNumber,
    formatPhoneNumberForAPI,
    getTogoCountry,
    isLoading: countriesLoading,
  } = useCountries();

  // Sélectionner le Togo par défaut quand les pays sont chargés
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();

  useEffect(() => {
    if (!countriesLoading && !selectedCountry) {
      const togo = getTogoCountry();
      if (togo) {
        setSelectedCountry(togo);
      }
    }
  }, [countriesLoading, selectedCountry, getTogoCountry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedCountry) {
      setError("Veuillez sélectionner un pays");
      return;
    }

    if (!phone.trim()) {
      setError("Veuillez saisir votre numéro de téléphone");
      return;
    }

    // Valider le format du numéro
    if (!validatePhoneNumber(phone, selectedCountry.code)) {
      setError("Format de numéro de téléphone invalide");
      return;
    }

    // Utiliser le format API (00XXXXXXXX au lieu de +XXXXXXXX)
    const apiPhoneNumber = formatPhoneNumberForAPI(phone, selectedCountry.code);
    onSubmit(apiPhoneNumber);
  };

  return (
    <div className="min-h-screen flex max-lg:flex-col-reverse">
      {/* Partie gauche - Formulaire */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo en haut */}
          <div className="mb-12">
            <img src={logoPngBg} alt="EEBTP" className="w-16 h-16 mb-6" />
          </div>

          {/* Bouton retour optionnel */}
          {onBack && (
            <button
              onClick={onBack}
              className="mb-6 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Bienvenue sur EEBTP_MAG
            </h1>
            <p className="text-gray-600">
              Saisissez votre numéro de téléphone pour vous connecter
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Numéro de téléphone avec sélecteur de pays intégré */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Numéro de téléphone
              </label>
              <div className="flex border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                {/* Sélecteur de pays intégré */}
                <div className="relative">
                  <CountrySelector
                    value={selectedCountry}
                    onChange={setSelectedCountry}
                  />
                </div>

                {/* Séparateur */}
                <div className="w-px bg-gray-300"></div>

                {/* Input téléphone */}
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="90 90 90 90"
                  className="flex-1 px-4 py-3 border-0 rounded-r-lg focus:ring-0 focus:outline-none"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Message d'erreur */}
            {error && <div className="text-red-600 text-sm">{error}</div>}

            {/* Bouton */}
            <button
              type="submit"
              disabled={isLoading || !phone.trim() || !selectedCountry}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Indicateur de progression */}
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-6 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Partie droite - Design bleu avec logo */}
      <div className="flex-1 bg-blue-600 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute top-10 right-10 w-16 h-16 border-2 border-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 right-18 w-44 h-44 border-2 border-white bg-opacity-5 rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 border-2 border-white bg-opacity-5 rounded-full transform translate-x-32 translate-y-32"></div>

        {/* Logo central */}
        <div className="text-center z-10">
          <img
            src={logoPng}
            alt="EEBTP"
            className="w-64 h-64 mx-auto mb-8 filter brightness-0 invert"
          />
        </div>
      </div>
    </div>
  );
}
