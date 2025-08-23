import { useState, useEffect, useRef } from "react";
import { ChevronRight, ArrowLeft, RotateCcw } from "lucide-react";
import logoPng from "../../assets/eebtp.png";
import logoPngBg from "../../assets/logo_eebtp.png";

interface OtpInputPageProps {
  phone: string;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
  isLoading: boolean;
  isResending: boolean;
}

export function OtpInputPage({
  phone,
  onSubmit,
  onResend,
  onBack,
  isLoading,
  isResending,
}: OtpInputPageProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Compte à rebours pour le renvoi
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Soumission automatique si tous les champs sont remplis
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      onSubmit(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length === 6) {
      onSubmit(otpCode);
    }
  };

  const handleResend = () => {
    if (canResend && !isResending) {
      onResend();
      setCountdown(60);
      setCanResend(false);
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
              Vérification
            </h1>
            <p className="text-gray-600">
              Entrez le code de vérification envoyé au{" "}
              <span className="font-medium text-gray-900">
                +228 {formatPhone(phone)}
              </span>
            </p>
          </div>

          {/* Formulaire OTP */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Code de vérification
              </label>
              <div className="flex justify-between space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    disabled={isLoading}
                    aria-label={`Chiffre ${index + 1} du code OTP`}
                  />
                ))}
              </div>
            </div>

            {/* Bouton principal */}
            <button
              type="submit"
              disabled={isLoading || otp.join("").length < 6}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Vérifier
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            {/* Bouton renvoyer */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || isResending}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center mx-auto"
              >
                {isResending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Renvoi en cours...
                  </>
                ) : canResend ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Renvoyer le code
                  </>
                ) : (
                  <>Renvoyer le code dans {countdown}s</>
                )}
              </button>
            </div>
          </form>

          {/* Indicateur de progression */}
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-6 h-2 bg-blue-600 rounded-full"></div>
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
            className="w-32 h-32 mx-auto mb-8 filter brightness-0 invert"
          />
        </div>
      </div>
    </div>
  );
}
