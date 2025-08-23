// import { apiClient } from './client';
import type { 
  AuthResponse,
  PhoneVerificationRequest,
  PhoneVerificationResponse,
  OtpVerificationRequest,
  OtpVerificationResponse,
  AccountSetupData,
  LoginCredentials,
  User 
} from '../../types';

export class AuthService {
  // private readonly basePath = '/auth';

  // === FLUX D'AUTHENTIFICATION POUR NOUVEAUX UTILISATEURS ===
  
  // Étape 1 : Vérification du numéro de téléphone
  async verifyPhone(_request: PhoneVerificationRequest): Promise<PhoneVerificationResponse> {
    // TODO: Implémenter la vérification du téléphone
    // - Vérifier si le numéro existe déjà
    // - Envoyer un SMS avec code OTP
    // - Retourner sessionId et isNewUser
    throw new Error('Not implemented');
  }

  // Étape 2 : Vérification du code OTP
  async verifyOtp(_request: OtpVerificationRequest): Promise<OtpVerificationResponse> {
    // TODO: Implémenter la vérification OTP
    // - Vérifier le code OTP avec le sessionId
    // - Si valide et nouvel utilisateur → retourner tempToken
    // - Si valide et utilisateur existant → rediriger vers login direct
    throw new Error('Not implemented');
  }

  // Étape 3 : Configuration du compte (nouveaux utilisateurs uniquement)
  async setupAccount(_data: AccountSetupData): Promise<AuthResponse> {
    // TODO: Implémenter la configuration du compte
    // - Valider le tempToken
    // - Créer le compte utilisateur
    // - Retourner les tokens d'authentification
    throw new Error('Not implemented');
  }

  // === CONNEXION DIRECTE (UTILISATEURS EXISTANTS) ===
  
  async login(_credentials: LoginCredentials): Promise<AuthResponse> {
    // TODO: Implémenter la connexion directe
    // - Authentifier avec téléphone/mot de passe ou email/mot de passe
    // - Retourner les tokens si succès
    throw new Error('Not implemented');
  }

  // === MÉTHODES COMMUNES ===

  async logout(): Promise<void> {
    // TODO: Implémenter la déconnexion
    // - Invalider les tokens côté serveur
    throw new Error('Not implemented');
  }

  async refreshToken(): Promise<AuthResponse> {
    // TODO: Implémenter le refresh token
    throw new Error('Not implemented');
  }

  async getCurrentUser(): Promise<User> {
    // TODO: Implémenter la récupération de l'utilisateur actuel
    throw new Error('Not implemented');
  }

  async updateProfile(_userData: Partial<User>): Promise<User> {
    // TODO: Implémenter la mise à jour du profil
    throw new Error('Not implemented');
  }

  async changePassword(_oldPassword: string, _newPassword: string): Promise<void> {
    // TODO: Implémenter le changement de mot de passe
    throw new Error('Not implemented');
  }

  // === MÉTHODES UTILITAIRES ===

  // Vérifier si un numéro de téléphone existe déjà
  async checkPhoneExists(_phone: string): Promise<boolean> {
    // TODO: Vérifier l'existence du numéro
    throw new Error('Not implemented');
  }

  // Renvoyer un code OTP
  async resendOtp(_sessionId: string): Promise<{ message: string }> {
    // TODO: Renvoyer un nouveau code OTP
    throw new Error('Not implemented');
  }
}

export const authService = new AuthService();
