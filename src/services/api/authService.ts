import { MockAuthService } from "./mockService";
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

// Utiliser le service mock si la vérification est désactivée OU en développement
const useVerification = import.meta.env.VITE_ENABLE_VERIFICATION === "false";
const isDevelopment = import.meta.env.VITE_APP_ENV === "development";
const useMockService = useVerification || isDevelopment;

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
    refreshToken: string | undefined;
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
    throw new Error("API not implemented");
  }

  async simpleLogin(data: SimpleLoginRequest): Promise<SimpleLoginResponse> {
    if (useMockService) {
      return mockService.simpleLogin(data);
    }
    throw new Error("API not implemented");
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
    throw new Error("API not implemented");
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
