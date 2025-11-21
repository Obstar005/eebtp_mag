import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/api";
import type {
  SimplePhoneVerificationRequest,
  SimpleLoginRequest,
  ChangePasswordRequest,
  AuthStep,
} from "../types";

// === HOOKS POUR LE FLUX D'AUTHENTIFICATION SIMPLIFIÉ ===

// Hook pour la vérification simple du téléphone (sans OTP)
export function useSimpleVerifyPhone() {
  return useMutation({
    mutationFn: (request: SimplePhoneVerificationRequest) =>
      authService.simpleVerifyPhone(request),
    onError: (error) => {
    },
  });
}

// Hook pour la connexion simple (téléphone + mot de passe)
export function useSimpleLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: SimpleLoginRequest) =>
      authService.simpleLogin(credentials),
    onSuccess: (authResponse) => {
      // Stocker les tokens
      localStorage.setItem("authToken", authResponse.token);
      localStorage.setItem("refreshToken", authResponse.refreshToken);
      // Mettre à jour le cache avec les données utilisateur
      queryClient.setQueryData(["user"], authResponse.user);
    },
    onError: (error) => {
    },
  });
}

// Hook pour la configuration simple du compte (nouveaux utilisateurs)
export function useSimpleSetupAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      phone: string;
      firstName: string;
      lastName: string;
      email?: string;
      password: string;
    }) => authService.simpleSetupAccount(data),
    onSuccess: (authResponse) => {
      // Stocker les tokens
      localStorage.setItem("authToken", authResponse.token);
      localStorage.setItem("refreshToken", authResponse.refreshToken);
      // Mettre à jour le cache avec les données utilisateur
      queryClient.setQueryData(["user"], authResponse.user);
    },
    onError: (error) => {
    },
  });
}

// Hook pour le changement de mot de passe (première connexion)
export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ChangePasswordRequest) =>
      authService.changePassword(request),
    onSuccess: (authResponse) => {
      // Stocker les tokens
      localStorage.setItem("authToken", authResponse.token);
      localStorage.setItem("refreshToken", authResponse.refreshToken);
      // Mettre à jour le cache avec les données utilisateur
      queryClient.setQueryData(["user"], authResponse.user);
    },
    onError: (error) => {
    },
  });
}

// === HOOK POUR GÉRER L'ÉTAT D'AUTHENTIFICATION SIMPLIFIÉ ===

interface SimpleAuthState {
  currentStep: AuthStep;
  isNewUser?: boolean;
  phone?: string;
  isPhoneVerified?: boolean;
}

export function useSimpleAuthState() {
  const [authState, setAuthState] = useState<SimpleAuthState>({
    currentStep: "phone_input",
  });

  const updateAuthState = useCallback((updates: Partial<SimpleAuthState>) => {
    setAuthState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetAuthState = useCallback(() => {
    setAuthState({
      currentStep: "phone_input",
    });
  }, []);

  return {
    authState,
    updateAuthState,
    resetAuthState,
  };
}
