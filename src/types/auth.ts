// Types de base pour l'authentification
export interface User {
  id: string;
  email?: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  hasCompletedSetup: boolean; // Indique si l'utilisateur a terminé la configuration initiale
  createdAt: string;
  updatedAt: string;
}

export const UserRole = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
  VIEWER: "viewer",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  requiresSetup?: boolean; // Indique si l'utilisateur doit compléter sa configuration
}

// Étape 1 : Vérification du numéro de téléphone
export interface PhoneVerificationRequest {
  phone: string;
}

export interface PhoneVerificationResponse {
  message: string;
  sessionId: string; // ID de session pour l'OTP
  isNewUser: boolean; // Indique si c'est un nouvel utilisateur
}

// Étape 2 : Vérification de l'OTP
export interface OtpVerificationRequest {
  sessionId: string;
  otpCode: string;
}

export interface OtpVerificationResponse {
  isValid: boolean;
  message: string;
  tempToken?: string; // Token temporaire pour compléter l'inscription
}

// Étape 3 : Configuration du compte (pour nouveaux utilisateurs)
export interface AccountSetupData {
  tempToken: string;
  firstName: string;
  lastName: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

// Connexion directe (pour utilisateurs existants)
export interface DirectLoginCredentials {
  phone: string;
  password: string;
}

// Alternative : connexion par email si configuré
export interface EmailLoginCredentials {
  email: string;
  password: string;
}

export type LoginCredentials = DirectLoginCredentials | EmailLoginCredentials;

// Types pour les étapes d'authentification
export const AuthStep = {
  PHONE_INPUT: "phone_input",
  OTP_VERIFICATION: "otp_verification",
  PASSWORD_INPUT: "password_input", // Nouveau : saisie du mot de passe après téléphone
  CHANGE_PASSWORD: "change_password", // Nouveau : changement de mot de passe obligatoire
  ACCOUNT_SETUP: "account_setup",
  DIRECT_LOGIN: "direct_login",
  AUTHENTICATED: "authenticated",
} as const;

export type AuthStep = (typeof AuthStep)[keyof typeof AuthStep];

// Nouvelle interface pour la vérification simplifiée du téléphone
export interface SimplePhoneVerificationRequest {
  phone: string;
}

export interface SimplePhoneVerificationResponse {
  success: boolean;
  isNewUser: boolean;
  message: string;
}

// Interface pour la connexion simplifiée (téléphone + mot de passe)
export interface SimpleLoginRequest {
  phone: string;
  password: string;
}

export interface SimpleLoginResponse {
  success: boolean;
  user: User;
  token: string;
  refreshToken: string;
  isFirstLogin: boolean; // Indique si c'est la première connexion de l'utilisateur
}

export interface ChangePasswordRequest {
  phone: string;
  newPassword: string;
}

export interface AuthState {
  currentStep: AuthStep;
  sessionId?: string;
  tempToken?: string;
  isNewUser?: boolean;
  phone?: string;
}
