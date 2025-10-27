import { useState } from "react";
import {
  useSimpleVerifyPhone,
  useSimpleLogin,
  useChangePassword,
  useSimpleAuthState,
} from "../../hooks/useSimpleAuth";
import { useAuth } from "../../contexts/AuthContext";
import { getAuthErrorMessage } from "../../utils/errorHandling";
import { PhoneInputPage } from "./PhoneInputPage";
import { PasswordInputPage } from "./PasswordInputPage";
import { ChangePasswordPage } from "./ChangePasswordPage";

interface SimpleAuthFlowProps {
  onAuthSuccess: () => void;
}

export function SimpleAuthFlow({ onAuthSuccess }: SimpleAuthFlowProps) {
  const { authState, updateAuthState } = useSimpleAuthState();
  const { login, refreshUserInfo } = useAuth();
  const [phone, setPhone] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Mutations
  const verifyPhoneMutation = useSimpleVerifyPhone();
  const loginMutation = useSimpleLogin();
  const changePasswordMutation = useChangePassword();

  // Étape 1 : Vérification du téléphone
  const handlePhoneSubmit = async (phoneNumber: string) => {
    try {
      const response = await verifyPhoneMutation.mutateAsync({
        phone: phoneNumber,
      });

      setPhone(phoneNumber);
      updateAuthState({
        currentStep: "password_input",
        isNewUser: response.isNewUser,
        phone: phoneNumber,
        isPhoneVerified: true, // Marquer le téléphone comme vérifié
      });
    } catch (error) {
      handleAuthError(error);
    }
  };

  // Étape 2 : Connexion avec mot de passe
  const handlePasswordSubmit = async (password: string) => {
    console.log("🔄 handlePasswordSubmit - DÉBUT");
    try {
      console.log("🔄 handlePasswordSubmit - Avant mutateAsync");
      const response = await loginMutation.mutateAsync({
        phone,
        password,
      });

      console.log("✅ handlePasswordSubmit - Réponse reçue:", response);

      // Récupérer les vraies informations utilisateur depuis l'API
      await login(response.user, response.token);

      // Actualiser les informations utilisateur depuis l'API
      await refreshUserInfo();

      // Vérifier si c'est la première connexion (first_login = is_firstlogin de l'API)
      if (response.first_login) {
        console.log("🔄 handlePasswordSubmit - Première connexion détectée");
        updateAuthState({
          currentStep: "change_password",
        });
      } else {
        console.log("🔄 handlePasswordSubmit - Connexion normale, succès");
        onAuthSuccess();
      }
    } catch (error) {
      console.log("❌ handlePasswordSubmit - ERREUR CAPTURÉE:", error);
      handleAuthError(error);
    }
    console.log("🔄 handlePasswordSubmit - FIN");
  };

  // Étape 3 : Changement de mot de passe (première connexion)
  const handleChangePassword = async (newPassword: string) => {
    try {
      await changePasswordMutation.mutateAsync({
        phone,
        newPassword,
      });
      onAuthSuccess();
    } catch (error) {
      handleAuthError(error);
    }
  };

  // Retour à l'étape précédente
  const handleGoBack = () => {
    switch (authState.currentStep) {
      case "password_input":
        updateAuthState({
          currentStep: "phone_input",
          isPhoneVerified: false, // Réinitialiser la vérification
        });
        break;
      case "change_password":
        // Pas de retour possible depuis le changement de mot de passe
        break;
      default:
        break;
    }
  };

  // Gestion d'erreur avec vérification d'étape
  const handleAuthError = (error: unknown) => {
    console.log("🚨 SimpleAuthFlow handleAuthError - Début");
    const errorMessage = getAuthErrorMessage(error);
    console.log("📝 SimpleAuthFlow handleAuthError - Message:", errorMessage);

    // Gérer l'erreur localement au lieu de la passer au parent
    setErrorMessage(errorMessage);
    console.log("✅ SimpleAuthFlow handleAuthError - Erreur gérée localement");
  };

  // Rendu conditionnel des pages
  return (
    <div className="relative">
      {/* Notification d'erreur */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="flex-shrink-0 text-red-200 hover:text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Pages d'authentification */}
      {(() => {
        switch (authState.currentStep) {
          case "phone_input":
            return (
              <PhoneInputPage
                onSubmit={handlePhoneSubmit}
                isLoading={verifyPhoneMutation.isPending}
              />
            );

          case "password_input":
            // Protection simple : rediriger vers phone_input si pas de vérification
            if (!authState.isPhoneVerified) {
              return (
                <PhoneInputPage
                  onSubmit={handlePhoneSubmit}
                  isLoading={verifyPhoneMutation.isPending}
                />
              );
            }
            return (
              <PasswordInputPage
                phone={phone}
                isNewUser={false} // Toujours false maintenant
                onSubmit={handlePasswordSubmit}
                onBack={handleGoBack}
                isLoading={loginMutation.isPending}
              />
            );

          case "change_password":
            // Protection simple : rediriger vers phone_input si pas de vérification
            if (!authState.isPhoneVerified) {
              return (
                <PhoneInputPage
                  onSubmit={handlePhoneSubmit}
                  isLoading={verifyPhoneMutation.isPending}
                />
              );
            }
            return (
              <ChangePasswordPage
                phone={phone}
                onSubmit={handleChangePassword}
                isLoading={changePasswordMutation.isPending}
              />
            );

          default:
            return null;
        }
      })()}
    </div>
  );
}
