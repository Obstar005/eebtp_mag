import { MockAuthService } from "./mockService";
import { authApiService } from "./authApiService";
import type {
  PhoneVerificationRequest,
  PhoneVerificationResponse,
  OtpVerificationRequest,
  OtpVerificationResponse,
  AccountSetupData,
  DirectLoginCredentials,
  SimplePhoneVerificationRequest,
  SimplePhoneVerificationResponse,
  SimpleLoginRequest,
  SimpleLoginResponse,
  ChangePasswordRequest,
  User,
  EmailLoginCredentials,
} from "../../types";

// Utiliser l'API réelle si la vérification est activée
const enableVerification = import.meta.env.VITE_ENABLE_VERIFICATION === "true";
const useMockService = !enableVerification;

const mockService = new MockAuthService();

export class AuthService {
  async verifyPhone(
    data: PhoneVerificationRequest
  ): Promise<PhoneVerificationResponse> {
    if (useMockService) {
      return mockService.verifyPhone(data);
    }
    throw new Error("API not implemented");
  }

  async verifyOtp(
    data: OtpVerificationRequest
  ): Promise<OtpVerificationResponse> {
    if (useMockService) {
      return mockService.verifyOtp(data);
    }
    throw new Error("API not implemented");
  }

  async setupAccount(
    data: AccountSetupData
  ): Promise<{ success: boolean; user: User; token: string }> {
    if (useMockService) {
      return mockService.setupAccount(data);
    }
    throw new Error("API not implemented");
  }

  async directLogin(
    data: DirectLoginCredentials | EmailLoginCredentials
  ): Promise<{
    success: boolean;
    user: User;
    token: string;
    refreshToken?: string;
  }> {
    if (useMockService) {
      return mockService.directLogin(data);
    }
    throw new Error("API not implemented");
  }

  async resendOtp(
    sessionId: string
  ): Promise<{ success: boolean; message: string }> {
    if (useMockService) {
      return mockService.resendOtp(sessionId);
    }
    throw new Error("API not implemented");
  }

  async logout(): Promise<void> {
    if (useMockService) {
      return Promise.resolve();
    }
    throw new Error("API not implemented");
  }

  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    if (useMockService) {
      return Promise.resolve({
        token: `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        refreshToken: `refresh_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      });
    }
    throw new Error("API not implemented");
  }

  // === NOUVELLES MÉTHODES POUR LE FLUX SIMPLIFIÉ ===

  async simpleVerifyPhone(
    data: SimplePhoneVerificationRequest
  ): Promise<SimplePhoneVerificationResponse> {
    if (useMockService) {
      return mockService.simpleVerifyPhone(data);
    }

    try {
      // Utiliser l'API pour vérifier si l'utilisateur existe
      const userExists = await authApiService.checkUserExists(data.phone);

      return {
        success: true,
        isNewUser: !userExists.exists,
        message: userExists.message, // Utiliser le message de l'API
      };
    } catch (error) {
      console.error("Erreur lors de la vérification du téléphone:", error);
      // Propager l'erreur avec son message original
      throw error;
    }
  }

  async simpleLogin(data: SimpleLoginRequest): Promise<SimpleLoginResponse> {
    if (useMockService) {
      return mockService.simpleLogin(data);
    }

    try {
      // Utiliser le service API et transformer la réponse
      const authResponse = await authApiService.loginByPhone(data);
      return {
        success: true,
        user: authResponse.user,
        token: authResponse.token,
        refreshToken: authResponse.refreshToken,
        first_login: authResponse.requiresSetup ?? false, // Mapper requiresSetup vers first_login
      };
    } catch (error) {
      console.error("Erreur lors de la connexion simple:", error);
      // Préserver le message d'erreur original si disponible
      if (error instanceof Error) {
        throw error; // Re-lancer l'erreur originale avec son message
      }
      throw new Error("Erreur lors de la connexion");
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<{
    success: boolean;
    user: User;
    token: string;
    refreshToken: string;
  }> {
    if (useMockService) {
      return mockService.changePassword(data);
    }

    try {
      // Utiliser oldPassword s'il est fourni, sinon chaîne vide pour première connexion
      const setPasswordResponse = await authApiService.setPassword({
        telephone: data.phone,
        old_password: data.oldPassword || "", // Utiliser l'ancien mot de passe fourni
        new_password: data.newPassword,
        confirm_password: data.newPassword,
      });

      // L'API retourne success: undefined mais message de succès
      // Vérifier que success n'est pas explicitement false
      const isSuccess = setPasswordResponse.success !== false && 
        (setPasswordResponse.success === true || 
         setPasswordResponse.message?.toLowerCase().includes("succès"));
      
      if (isSuccess) {
        // Reconnecter l'utilisateur après changement de mot de passe
        const loginResponse = await authApiService.loginByPhone({
          phone: data.phone,
          password: data.newPassword,
        });
        return {
          success: true,
          user: loginResponse.user,
          token: loginResponse.token,
          refreshToken: loginResponse.refreshToken || "",
        };
      } else {
        throw new Error(setPasswordResponse.message);
      }
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      // Préserver le message d'erreur original si disponible
      if (error instanceof Error) {
        throw error; // Re-lancer l'erreur originale avec son message
      }
      throw new Error("Erreur lors du changement de mot de passe");
    }
  }

  async simpleSetupAccount(data: {
    phone: string;
    firstName: string;
    lastName: string;
    email?: string;
    password: string;
  }): Promise<{
    success: boolean;
    user: User;
    token: string;
    refreshToken: string;
  }> {
    if (useMockService) {
      return mockService.simpleSetupAccount(data);
    }
    throw new Error("API not implemented");
  }
}

export const authService = new AuthService();
