import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/api";
import type {
  PhoneVerificationRequest,
  OtpVerificationRequest,
  AccountSetupData,
  LoginCredentials,
  DirectLoginCredentials,
  SimplePhoneVerificationRequest,
  SimpleLoginRequest,
} from "../types";

// === HOOKS POUR LE PROCESSUS D'AUTHENTIFICATION ===

// Hook pour la vérification du numéro de téléphone (Étape 1)
export function useVerifyPhone() {
  return useMutation({
    mutationFn: (request: PhoneVerificationRequest) =>
      authService.verifyPhone(request),
    onError: (error) => {
      console.error("Erreur lors de la vérification du téléphone:", error);
    },
  });
}

// Hook pour la vérification de l'OTP (Étape 2)
export function useVerifyOtp() {
  return useMutation({
    mutationFn: (request: OtpVerificationRequest) =>
      authService.verifyOtp(request),
    onError: (error) => {
      console.error("Erreur lors de la vérification OTP:", error);
    },
  });
}

// Hook pour la configuration du compte (Étape 3 - nouveaux utilisateurs)
export function useSetupAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AccountSetupData) => authService.setupAccount(data),
    onSuccess: (authResponse) => {
      // Stocker les tokens
      localStorage.setItem("authToken", authResponse.token);
      localStorage.setItem("refreshToken", authResponse.refreshToken);

      // Mettre à jour le cache avec les données utilisateur
      queryClient.setQueryData(authKeys.user, authResponse.user);
    },
    onError: (error) => {
      console.error("Erreur lors de la configuration du compte:", error);
    },
  });
}

// Hook pour la connexion directe (utilisateurs existants)
export function useDirectLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials | DirectLoginCredentials) =>
      authService.directLogin(credentials),
    onSuccess: (authResponse) => {
      // Stocker les tokens
      localStorage.setItem("authToken", authResponse.token);
      localStorage.setItem("refreshToken", authResponse.refreshToken);

      // Mettre à jour le cache avec les données utilisateur
      queryClient.setQueryData(authKeys.user, authResponse.user);
    },
    onError: (error) => {
      console.error("Erreur lors de la connexion:", error);
    },
  });
}

// Hook pour renvoyer l'OTP
export function useResendOtp() {
  return useMutation({
    mutationFn: (sessionId: string) => authService.resendOtp(sessionId),
    onError: (error) => {
      console.error("Erreur lors du renvoi de l'OTP:", error);
    },
  });
}

// Hook pour vérifier si un téléphone existe
export function useCheckPhoneExists() {
  return useMutation({
    mutationFn: (phone: string) => authService.checkPhoneExists(phone),
    onError: (error) => {
      console.error("Erreur lors de la vérification du téléphone:", error);
    },
  });
}

// === HOOKS COMMUNS ===

// Hook pour la déconnexion
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Supprimer les tokens
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");

      // Vider le cache
      queryClient.clear();
    },
  });
}

// Hook pour mettre à jour le profil
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Partial<User>) =>
      authService.updateProfile(userData),
    onSuccess: (updatedUser) => {
      // Mettre à jour le cache
      queryClient.setQueryData(authKeys.user, updatedUser);
    },
  });
}

// Hook pour changer le mot de passe
export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      oldPassword,
      newPassword,
    }: {
      oldPassword: string;
      newPassword: string;
    }) => authService.changePassword(oldPassword, newPassword),
  });
}

// === HOOK POUR GÉRER L'ÉTAT D'AUTHENTIFICATION ===

// Hook personnalisé pour gérer l'état complet du processus d'authentification
export function useAuthState() {
  const [authState, setAuthState] = useState<AuthState>({
    currentStep: AuthStep.PHONE_INPUT,
  });

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState((prev) => ({ ...prev, ...updates }));
  };

  const resetAuthState = () => {
    setAuthState({
      currentStep: AuthStep.PHONE_INPUT,
    });
  };

  return {
    authState,
    updateAuthState,
    resetAuthState,
  };
}
