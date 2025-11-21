import { useState, useEffect } from "react";
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

const RenderPopup = ({
  message,
  type = "error",
  onClose,
}: {
  message: string;
  type?: "error" | "success";
  onClose: () => void;
}) => {
  setTimeout(() => {
    onClose();
  }, 3000);

  const isError = type === "error";
  const bgColor = isError ? "bg-red-500" : "bg-green-500";
  const textColor = isError ? "text-red-200" : "text-green-200";
  const hoverColor = isError ? "hover:text-white" : "hover:text-white";

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3`}
      >
        <div className="flex-shrink-0">
          {isError ? (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${textColor} ${hoverColor}`}
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
  );
};

export function SimpleAuthFlow({ onAuthSuccess }: SimpleAuthFlowProps) {
  const { authState, updateAuthState } = useSimpleAuthState();
  const { login, refreshUserInfo, user } = useAuth();
  const [phone, setPhone] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [hasCheckedInitialState, setHasCheckedInitialState] = useState(false);

  // Mutations
  const verifyPhoneMutation = useSimpleVerifyPhone();
  const loginMutation = useSimpleLogin();
  const changePasswordMutation = useChangePassword();

  // Vérifier UNE SEULE FOIS au chargement si l'utilisateur est déjà connecté sans config complète
  useEffect(() => {
    // Ne vérifier qu'une seule fois au montage du composant
    if (hasCheckedInitialState) return;
    if (user && !user.hasCompletedSetup) {
      const hasPendingPassword = localStorage.getItem("pending_old_password");

      if (hasPendingPassword) {
        const storedPhone = localStorage.getItem("pending_phone") || user.phone;
        setPhone(storedPhone);
        updateAuthState({
          currentStep: "change_password",
          isPhoneVerified: true,
        });
      }
      // Sinon, on reste sur phone_input (l'utilisateur doit se connecter d'abord)
    }

    setHasCheckedInitialState(true);
  }, [user, hasCheckedInitialState, updateAuthState, authState.currentStep]);

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
    try {
      const response = await loginMutation.mutateAsync({
        phone,
        password,
      });

      // Vérifier si c'est la première connexion (first_login de l'API)
      if (response.first_login) {
        // Stocker le téléphone ET le mot de passe pour le changement ultérieur
        localStorage.setItem("pending_phone", phone);
        localStorage.setItem("pending_old_password", password); // Stocker l'ancien mot de passe

        // Stocker temporairement les informations de connexion
        await login(response.user, response.token);

        // NE PAS appeler refreshUserInfo() pour préserver hasCompletedSetup = false
        // Rediriger vers changement de mot de passe
        updateAuthState({
          currentStep: "change_password",
        });
      } else {
        // Connexion normale : utiliser directement les données de la réponse de login
        // qui contiennent déjà hasCompletedSetup correctement calculé depuis is_firstlogin
        await login(response.user, response.token);

        // NE PAS appeler refreshUserInfo() ici car cela écraserait hasCompletedSetup
        // La réponse de login contient déjà toutes les infos nécessaires

        onAuthSuccess();
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  // Étape 3 : Changement de mot de passe (première connexion)
  const handleChangePassword = async (newPassword: string) => {
    try {
      // Récupérer l'ancien mot de passe depuis localStorage
      const oldPassword = localStorage.getItem("pending_old_password") || "";

      const response = await changePasswordMutation.mutateAsync({
        phone,
        oldPassword, // Passer l'ancien mot de passe
        newPassword,
      });

      // Mettre à jour les informations de connexion avec les nouvelles données
      await login(response.user, response.token);

      // Afficher message de succès
      setSuccessMessage("Mot de passe changé avec succès !");

      // Nettoyer le téléphone et le mot de passe en attente
      localStorage.removeItem("pending_phone");
      localStorage.removeItem("pending_old_password");

      // Actualiser les informations utilisateur depuis l'API après changement de mot de passe
      // Cela devrait mettre à jour hasCompletedSetup à true
      try {
        await refreshUserInfo();
      } catch (error) {
        // En cas d'erreur de récupération des infos, on laisse quand même continuer
        // Le modal s'affichera dans AppLayout pour permettre un retry
      }

      // Redirection vers le dashboard après un court délai
      setTimeout(() => {
        setSuccessMessage(""); // Nettoyer le message
        onAuthSuccess();
      }, 1500); // Petite pause pour voir le message de succès
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
        // Si on revient en arrière depuis change_password, déconnecter l'utilisateur
        // et nettoyer le localStorage
        localStorage.removeItem("pending_phone");
        localStorage.removeItem("pending_old_password");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");

        // Retourner à la saisie du téléphone
        updateAuthState({
          currentStep: "phone_input",
          isPhoneVerified: false,
        });

        // Recharger la page pour réinitialiser complètement l'état
        window.location.reload();
        break;
      default:
        break;
    }
  };

  // Gestion d'erreur avec vérification d'étape
  const handleAuthError = (error: unknown) => {
    const errorMessage = getAuthErrorMessage(error);

    // Gérer l'erreur localement au lieu de la passer au parent
    setErrorMessage(errorMessage);
  };

  // Rendu conditionnel des pages
  return (
    <div className="relative">
      {/* Notification d'erreur */}
      {errorMessage && (
        <RenderPopup
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage("")}
        />
      )}

      {/* Notification de succès */}
      {successMessage && (
        <RenderPopup
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage("")}
        />
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
                onBack={handleGoBack}
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
