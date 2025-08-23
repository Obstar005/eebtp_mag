import { MockAuthService } from "./mockService";
import type {
  PhoneVerificationRequest,
  PhoneVerificationResponse,
  OtpVerificationRequest,
  OtpVerificationResponse,
  AccountSetupData,
  DirectLoginCredentials,
  User,
} from "../../types";

// Utiliser le service mock en développement
const isDevelopment = import.meta.env.VITE_APP_ENV === "development";
const mockService = new MockAuthService();

export class AuthService {
  async verifyPhone(
    data: PhoneVerificationRequest
  ): Promise<PhoneVerificationResponse> {
    if (isDevelopment) {
      return mockService.verifyPhone(data);
    }
    throw new Error("API not implemented");
  }

  async verifyOtp(
    data: OtpVerificationRequest
  ): Promise<OtpVerificationResponse> {
    if (isDevelopment) {
      return mockService.verifyOtp(data);
    }
    throw new Error("API not implemented");
  }

  async setupAccount(
    data: AccountSetupData
  ): Promise<{ success: boolean; user: User; token: string }> {
    if (isDevelopment) {
      return mockService.setupAccount(data);
    }
    throw new Error("API not implemented");
  }

  async directLogin(
    data: DirectLoginCredentials
  ): Promise<{ success: boolean; user: User; token: string }> {
    if (isDevelopment) {
      return mockService.directLogin(data);
    }
    throw new Error("API not implemented");
  }

  async resendOtp(
    sessionId: string
  ): Promise<{ success: boolean; message: string }> {
    if (isDevelopment) {
      return mockService.resendOtp(sessionId);
    }
    throw new Error("API not implemented");
  }

  async logout(): Promise<void> {
    if (isDevelopment) {
      return Promise.resolve();
    }
    throw new Error("API not implemented");
  }

  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    if (isDevelopment) {
      return Promise.resolve({
        token: `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        refreshToken: `refresh_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      });
    }
    throw new Error("API not implemented");
  }
}

export const authService = new AuthService();
