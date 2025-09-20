import { useState } from "react";
import {
  useSimpleVerifyPhone,
  useSimpleLogin,
  useChangePassword,
  useSimpleAuthState,
} from "../../hooks/useSimpleAuth";
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
  const [phone, setPhone] = useState<string>("");

  // Mutations
  const verifyPhoneMutation = useSimpleVerifyPhone();
  const loginMutation = useSimpleLogin();
  const changePasswordMutation = useChangePassword();

  // Étape 1 : Vérification du téléphone
  const handlePhoneSubmit = async (phoneNumber: string) => {
    try {
      await verifyPhoneMutation.mutateAsync({
        phone: phoneNumber,
      });

      setPhone(phoneNumber);
      updateAuthState({
        currentStep: "password_input",
        isNewUser: false, // Toujours false maintenant
        phone: phoneNumber,
      });
    } catch {
      onAuthError("Erreur lors de la vérification du téléphone");
    }
  };

  // Étape 2 : Connexion avec mot de passe
  const handlePasswordSubmit = async (password: string) => {
    try {
      const response = await loginMutation.mutateAsync({
        phone,
        password,
      });

      // Vérifier si c'est la première connexion (isFirstLogin = is_firstlogin de l'API)
      if (response.isFirstLogin) {
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
        updateAuthState({ currentStep: "phone_input" });
        break;
      case "change_password":
        // Pas de retour possible depuis le changement de mot de passe
        break;
      default:
        break;
    }
  };

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
