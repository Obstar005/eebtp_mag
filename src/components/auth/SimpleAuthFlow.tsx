import { useState } from "react";
import {
  useSimpleVerifyPhone,
  useSimpleLogin,
  useSimpleAuthState,
} from "../../hooks/useSimpleAuth";
import { PhoneInputPage } from "./PhoneInputPage";
import { PasswordInputPage } from "./PasswordInputPage";


interface SimpleAuthFlowProps {
  onAuthSuccess: () => void
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
      await loginMutation.mutateAsync({
        phone,
        password,
      });
      onAuthSuccess();
    } catch {
      onAuthError("Mot de passe incorrect");
    }
  };

  // Retour à l'étape précédente
  const handleGoBack = () => {
    switch (authState.currentStep) {
      case "password_input":
        updateAuthState({ currentStep: "phone_input" });
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

    default:
      return null;
  }
}
