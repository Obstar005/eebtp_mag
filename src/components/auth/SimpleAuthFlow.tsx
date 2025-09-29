import { useState } from "react";
import {
  useSimpleVerifyPhone,
  useSimpleLogin,
  useChangePassword,
  useSimpleAuthState,
} from "../../hooks/useSimpleAuth";
import { useAuth } from "../../contexts/AuthContext";
import { PhoneInputPage } from "./PhoneInputPage";
import { PasswordInputPage } from "./PasswordInputPage";
import { ChangePasswordPage } from "./ChangePasswordPage";

interface SimpleAuthFlowProps {
  onAuthSuccess: () => void;
  onAuthError: (error: string) => void;
}

export function SimpleAuthFlow({
  onAuthSuccess,
  onAuthError,
}: SimpleAuthFlowProps) {
  const { authState, updateAuthState } = useSimpleAuthState();
  const { login, refreshUserInfo } = useAuth();
  const [phone, setPhone] = useState<string>("");

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
    } catch {
      onAuthError("Erreur lors de la vérification du numéro");
    }
  };

  // Étape 2 : Connexion avec mot de passe
  const handlePasswordSubmit = async (password: string) => {
    try {
      const response = await loginMutation.mutateAsync({
        phone,
        password,
      });

      // Stocker le token et récupérer les vraies informations utilisateur
      localStorage.setItem("auth_token", response.token);

      // Récupérer les vraies informations utilisateur depuis l'API
      await login(response.user, response.token);

      // Actualiser les informations utilisateur depuis l'API
      await refreshUserInfo();

      // Vérifier si c'est la première connexion (first_login = is_firstlogin de l'API)
      if (response.first_login) {
        updateAuthState({
          currentStep: "change_password",
        });
      } else {
        onAuthSuccess();
      }
    } catch {
      onAuthError("Mot de passe incorrect");
    }
  };

  // Étape 3 : Changement de mot de passe (première connexion)
  const handleChangePassword = async (newPassword: string) => {
    try {
      await changePasswordMutation.mutateAsync({
        phone,
        newPassword,
      });
      onAuthSuccess();
    } catch {
      onAuthError("Erreur lors du changement de mot de passe");
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

  // Protection : Vérifier que le numéro est vérifié avant d'afficher la page de mot de passe
  const isCurrentStepAllowed = () => {
    switch (authState.currentStep) {
      case "phone_input":
        return true; // Toujours autorisé
      case "password_input":
        return authState.isPhoneVerified === true; // Nécessite vérification
      case "change_password":
        return authState.isPhoneVerified === true; // Nécessite vérification
      default:
        return false;
    }
  };

  // Si l'étape actuelle n'est pas autorisée, rediriger vers la vérification du téléphone
  if (!isCurrentStepAllowed()) {
    updateAuthState({
      currentStep: "phone_input",
      isPhoneVerified: false,
    });
  }

  // Rendu conditionnel des pages
  switch (authState.currentStep) {
    case "phone_input":
      return (
        <PhoneInputPage
          onSubmit={handlePhoneSubmit}
          isLoading={verifyPhoneMutation.isPending}
        />
      );

    case "password_input":
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
}
