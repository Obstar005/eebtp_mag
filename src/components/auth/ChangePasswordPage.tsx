import { useState } from "react";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import logoPng from "../../assets/eebtp.png";
import logoPngBg from "../../assets/logo_eebtp.png";

interface ChangePasswordPageProps {
  phone: string;
  onSubmit: (newPassword: string) => void;
  onBack?: () => void; // Optionnel pour permettre le retour
  isLoading: boolean;
}

export function ChangePasswordPage({
  phone,
  onSubmit,
  onBack,
  isLoading,
}: ChangePasswordPageProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword.trim()) {
      setError("Veuillez saisir un nouveau mot de passe");
      return;
    }

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    // Appeler directement le parent sans afficher de succès local
    onSubmit(newPassword.trim());
  };

  const formatPhone = (phoneNumber: string) => {
    return phoneNumber.replace(
      /(\+\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/,
      "$1 $2 $3 $4 $5"
    );
  };

  return (
    <div className="max-h-screen flex max-lg:flex-col-reverse overflow-hidden">
      {/* Partie gauche - Formulaire */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 overflow-scroll inline-scroll">
        <div className="w-full max-w-md">
          {/* Logo en haut */}
          <div className="my-12">
            {onBack && (
              <button
                onClick={onBack}
                className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                type="button"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Retour
              </button>
            )}
            <img src={logoPngBg} alt="EEBTP" className="w-16 h-16 mb-6" />
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Créer un nouveau mot de passe
            </h1>
            <p className="text-gray-600 mb-4">
              Saisissez votre nouveau mot de passe
            </p>
            <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">⚠️ Première connexion :</span>{" "}
                Veuillez créer un nouveau mot de passe pour sécuriser votre
                compte
              </p>
            </div>
          </div>

          {/* Critères du mot de passe */}
          <div className="mb-6 bg-gray-100 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Le mot de passe doit comporter au minimum de huit caractères sans
              espaces avec :
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Au moins une lettre majuscule</li>
              <li>• Au moins une lettre minuscule</li>
              <li>• Au moins un chiffre</li>
              <li>• Au moins un caractère spécial (ex: !@#$%^&*)</li>
              <li>• Ne doit ressembler ni contenir vos informations personnelles</li>
            </ul>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nouveau mot de passe */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmer le mot de passe */}
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
                  placeholder="••••••••••••"
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

            {/* Se souvenir de moi */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Se souvenir de moi
              </label>
            </div>

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
                isLoading || !newPassword.trim() || !confirmPassword.trim()
              }
              className="w-full text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              style={{ backgroundColor: "#007AFF" }}
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
        </div>
      </div>

      {/* Partie droite - Design bleu avec logo */}
      <div
        className="flex-1 flex items-center justify-center p-8 relative overflow-hidden h-screen max-lg:h-64"
        style={{ backgroundColor: "#007AFF" }}
      >
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
