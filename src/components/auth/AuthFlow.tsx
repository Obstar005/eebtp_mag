import { useState } from "react";
import {
  useVerifyPhone,
  useVerifyOtp,
  useSetupAccount,
  useDirectLogin,
  useResendOtp,
} from "../../hooks/useAuth";
import { AuthStep } from "../../types";
import type {
  PhoneVerificationResponse,
  OtpVerificationResponse,
} from "../../types";
import { PhoneInputPage } from "./PhoneInputPage";
import { OtpInputPage } from "./OtpInputPage";
import { DirectLoginPage } from "./DirectLoginPage";
import { AccountSetupPage } from "./AccountSetupPage";

interface AuthFlowProps {
  onAuthSuccess: () => void;
  onAuthError: (error: string) => void;
}

export function AuthFlow({ onAuthSuccess, onAuthError }: AuthFlowProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>(
    AuthStep.PHONE_INPUT
  );
  const [sessionId, setSessionId] = useState<string>("");
  const [tempToken, setTempToken] = useState<string>("");
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");

  // Mutations
  const verifyPhoneMutation = useVerifyPhone();
  const verifyOtpMutation = useVerifyOtp();
  const setupAccountMutation = useSetupAccount();
  const directLoginMutation = useDirectLogin();
  const resendOtpMutation = useResendOtp();

  // Étape 1 : Vérification du téléphone
  const handlePhoneSubmit = async (phoneNumber: string) => {
    try {
      const response: PhoneVerificationResponse =
        await verifyPhoneMutation.mutateAsync({
          phone: phoneNumber,
        });

      setPhone(phoneNumber);
      setSessionId(response.sessionId);
      setIsNewUser(response.isNewUser);
      setCurrentStep(AuthStep.OTP_VERIFICATION);
    } catch {
      onAuthError("Erreur lors de la vérification du téléphone");
    }
  };

  // Étape 2 : Vérification OTP
  const handleOtpSubmit = async (otpCode: string) => {
    try {
      const response: OtpVerificationResponse =
        await verifyOtpMutation.mutateAsync({
          sessionId,
          otpCode,
        });

      if (response.isValid) {
        if (isNewUser) {
          // Nouvel utilisateur → Configuration du compte
          setTempToken(response.tempToken || "");
          setCurrentStep(AuthStep.ACCOUNT_SETUP);
        } else {
          // Utilisateur existant → Connexion directe
          setCurrentStep(AuthStep.DIRECT_LOGIN);
        }
      } else {
        onAuthError("Code OTP invalide");
      }
    } catch {
      onAuthError("Erreur lors de la vérification OTP");
    }
  };

  // Étape 3 : Configuration du compte (nouveaux utilisateurs)
  const handleAccountSetup = async (setupData: {
    firstName: string;
    lastName: string;
    email?: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (setupData.password !== setupData.confirmPassword) {
      onAuthError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await setupAccountMutation.mutateAsync({
        tempToken,
        firstName: setupData.firstName,
        lastName: setupData.lastName,
        email: setupData.email,
        password: setupData.password,
        confirmPassword: setupData.confirmPassword,
      });

      onAuthSuccess();
    } catch {
      onAuthError("Erreur lors de la configuration du compte");
    }
  };

  // Connexion directe (utilisateurs existants)
  const handleDirectLogin = async (password: string) => {
    try {
      await directLoginMutation.mutateAsync({
        phone,
        password,
      });

      onAuthSuccess();
    } catch {
      onAuthError("Identifiants incorrects");
    }
  };

  // Renvoyer OTP
  const handleResendOtp = async () => {
    try {
      await resendOtpMutation.mutateAsync(sessionId);
      // Afficher un message de succès
    } catch {
      onAuthError("Erreur lors du renvoi du code");
    }
  };

  // Retour à l'étape précédente
  const handleGoBack = () => {
    switch (currentStep) {
      case AuthStep.OTP_VERIFICATION:
        setCurrentStep(AuthStep.PHONE_INPUT);
        break;
      case AuthStep.ACCOUNT_SETUP:
      case AuthStep.DIRECT_LOGIN:
        setCurrentStep(AuthStep.OTP_VERIFICATION);
        break;
      default:
        break;
    }
  };

  // Rendu conditionnel des pages
  switch (currentStep) {
    case AuthStep.PHONE_INPUT:
      return (
        <PhoneInputPage
          onSubmit={handlePhoneSubmit}
          isLoading={verifyPhoneMutation.isPending}
        />
      );

    case AuthStep.OTP_VERIFICATION:
      return (
        <OtpInputPage
          phone={phone}
          onSubmit={handleOtpSubmit}
          onResend={handleResendOtp}
          onBack={handleGoBack}
          isLoading={verifyOtpMutation.isPending}
          isResending={resendOtpMutation.isPending}
        />
      );

    case AuthStep.ACCOUNT_SETUP:
      return (
        <AccountSetupPage
          onSubmit={handleAccountSetup}
          onBack={handleGoBack}
          isLoading={setupAccountMutation.isPending}
        />
      );

    case AuthStep.DIRECT_LOGIN:
      return (
        <DirectLoginPage
          phone={phone}
          onSubmit={handleDirectLogin}
          onBack={handleGoBack}
          isLoading={directLoginMutation.isPending}
        />
      );

    default:
      return null;
  }
}
