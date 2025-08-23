import { useState } from "react";
import { ChevronRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import logoPng from "../../assets/eebtp.png";
import logoPngBg from "../../assets/logo_eebtp.png";

interface DirectLoginPageProps {
  phone: string;
  onSubmit: (password: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function DirectLoginPage({
  phone,
  onSubmit,
  onBack,
  isLoading,
}: DirectLoginPageProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password.trim());
    }
  };

  const formatPhone = (phoneNumber: string) => {
    return phoneNumber.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
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

          {/* Bouton retour */}
          <button
            onClick={onBack}
            className="mb-6 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Connectez vous
            </h1>
            <p className="text-gray-600">
              Bien vouloir rentrez votre adresse numéro de téléphone pour
              commencer
            </p>
          </div>

          {/* Info utilisateur */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              Connecté en tant que{" "}
              <span className="font-medium">+228 {formatPhone(phone)}</span>
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
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

            {/* Lien mot de passe oublié */}
            <div className="text-center">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>

          {/* Bouton changer de numéro */}
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
            >
              Utiliser un autre numéro
            </button>
          </div>

          {/* Indicateur de progression */}
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-6 h-2 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Partie droite - Design bleu avec logo et texte */}
      <div className="flex-1 bg-blue-600 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute top-10 right-10 w-16 h-16 border-2 border-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 right-18 w-44 h-44 border-2 border-white bg-opacity-5 rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 border-2 border-white bg-opacity-5 rounded-full transform translate-x-32 translate-y-32"></div>

        {/* Contenu central */}
        <div className="text-center z-10 text-white">
          <h2 className="text-3xl font-bold mb-4">Bienvenue</h2>
          <h3 className="text-xl mb-2">dans l'espace de travail</h3>
          <h3 className="text-xl mb-8">
            de l'entreprise <span className="font-bold italic">EEBTP_MAG</span>
          </h3>

          {/* Logo */}
          <img
            src={logoPng}
            alt="EEBTP"
            className="w-24 h-24 mx-auto filter brightness-0 invert"
          />
        </div>
      </div>
    </div>
  );
}
