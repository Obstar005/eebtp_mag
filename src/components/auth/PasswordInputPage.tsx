import { useState } from "react";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import logoPng from "../../assets/eebtp.png";
import logoPngBg from "../../assets/logo_eebtp.png";

interface PasswordInputPageProps {
  phone: string;
  isNewUser: boolean;
  onSubmit: (password: string) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

export function PasswordInputPage({
  isNewUser,
  onSubmit,
  onBack,
  isLoading,
}: PasswordInputPageProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Empêcher la propagation de l'événement
    setError("");

    if (!password.trim()) {
      setError("Veuillez saisir un mot de passe");
      return;
    }

    // Appel asynchrone sécurisé avec await
    try {
      await onSubmit(password.trim());
    } catch (error) {
      console.error("Erreur lors de la soumission du mot de passe:", error);
    }
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

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Connectez-vous
            </h1>
            <p className="text-gray-600 mb-4">
              Saisissez votre mot de passe pour accéder à votre compte
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mot de passe */}
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
                  placeholder="Saisir votre mot de passe"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {isNewUser && (
                <p className="mt-1 text-xs text-gray-500">
                  Au moins 6 caractères
                </p>
              )}
            </div>

            {/* Confirmation du mot de passe (seulement pour nouveaux utilisateurs) */}
            {isNewUser && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer votre mot de passe"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !password.trim() ||
                (isNewUser && !confirmPassword.trim())
              }
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Indicateur de progression */}
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <div
                onClick={onBack}
                className="w-2 h-2 bg-blue-600 rounded-full"
              ></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              {isNewUser && (
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              )}
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
