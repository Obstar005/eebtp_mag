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
  User,
  EmailLoginCredentials,
} from "../../types";

// Service mock pour le développement
export class MockAuthService {
  // Simulation d'une base de données en mémoire
  private mockUsers = new Map<
    string,
    {
      phone: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      isNewUser: boolean;
    }
  >();

  constructor() {
    // Ajouter quelques utilisateurs de test
    this.mockUsers.set("+22890123456", {
      phone: "+22890123456",
      password: "123456",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      isNewUser: false,
    });

    this.mockUsers.set("+22891234567", {
      phone: "+22891234567",
      password: "password",
      firstName: "Marie",
      lastName: "Dupont",
      email: "marie.dupont@example.com",
      isNewUser: false,
    });
  }

  private mockSessions = new Map<
    string,
    {
      phone: string;
      otpCode: string;
      expiresAt: Date;
      isNewUser: boolean;
    }
  >();

  async verifyPhone(
    data: PhoneVerificationRequest
  ): Promise<PhoneVerificationResponse> {
    // Simulation d'un délai réseau
    await this.delay(1000);

    const existingUser = this.mockUsers.get(data.phone);
    const isNewUser = !existingUser;

    // Générer un code OTP (toujours 123456 pour le développement)
    const otpCode = "123456";
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Stocker la session
    this.mockSessions.set(sessionId, {
      phone: data.phone,
      otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      isNewUser,
    });

    console.log("🔐 Code OTP généré:", otpCode, "pour", data.phone);

    return {
      sessionId,
      isNewUser,
      message: `Code envoyé au ${data.phone}`,
    };
  }

  async verifyOtp(
    data: OtpVerificationRequest
  ): Promise<OtpVerificationResponse> {
    await this.delay(500);

    const session = this.mockSessions.get(data.sessionId);

    if (!session) {
      throw new Error("Session invalide ou expirée");
    }

    if (session.expiresAt < new Date()) {
      throw new Error("Code OTP expiré");
    }

    if (session.otpCode !== data.otpCode) {
      throw new Error("Code OTP invalide");
    }

    // Code valide
    return {
      isValid: true,
      tempToken: session.isNewUser ? `temp_${Date.now()}` : undefined,
      message: "Code vérifié avec succès",
    };
  }

  async setupAccount(
    data: AccountSetupData
  ): Promise<{ success: boolean; user: User; token: string }> {
    await this.delay(1000);

    // Récupérer les informations de session via le tempToken
    const sessionId = Array.from(this.mockSessions.entries()).find(
      ([, session]) => session.phone
    )?.[0];

    if (!sessionId) {
      throw new Error("Session invalide");
    }

    const session = this.mockSessions.get(sessionId);
    if (!session) {
      throw new Error("Session invalide");
    }

    // Créer un nouvel utilisateur
    const user: User = {
      id: `user_${Date.now()}`,
      phone: session.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: "employee",
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: false,
      hasCompletedSetup: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Sauvegarder l'utilisateur
    this.mockUsers.set(session.phone, {
      phone: session.phone,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      isNewUser: false,
    });

    // Nettoyer la session
    this.mockSessions.delete(sessionId);

    const token = `jwt_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      success: true,
      user,
      token,
    };
  }

  async directLogin(
    data: DirectLoginCredentials | EmailLoginCredentials
  ): Promise<{
    success: boolean;
    user: User;
    token: string;
    refreshToken?: string;
  }> {
    await this.delay(800);

    const key = "phone" in data ? data.phone : data.email;
    const mockUser = this.mockUsers.get(key);

    if (!mockUser || mockUser.password !== data.password) {
      throw new Error("Identifiants incorrects");
    }

    const user: User = {
      id: `user_${Date.now()}`,
      phone: mockUser.phone,
      firstName: mockUser.firstName || "Utilisateur",
      lastName: mockUser.lastName || "Test",
      email: mockUser.email,
      role: "employee",
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: false,
      hasCompletedSetup: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = `jwt_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      success: true,
      user,
      token,
    };
  }

  async resendOtp(
    sessionId: string
  ): Promise<{ success: boolean; message: string }> {
    await this.delay(500);

    const session = this.mockSessions.get(sessionId);

    if (!session) {
      throw new Error("Session invalide");
    }

    // Prolonger la session
    session.expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    console.log("🔐 Code OTP renvoyé:", session.otpCode, "pour", session.phone);

    return {
      success: true,
      message: "Code renvoyé avec succès",
    };
  }

  // === NOUVELLES MÉTHODES POUR LE FLUX SIMPLIFIÉ ===

  // Vérification simple du téléphone (sans OTP)
  async simpleVerifyPhone(
    data: SimplePhoneVerificationRequest
  ): Promise<SimplePhoneVerificationResponse> {
    await this.delay(1000);

    const existingUser = this.mockUsers.get(data.phone);

    // Si l'utilisateur n'existe pas, on le crée avec un mot de passe par défaut
    if (!existingUser) {
      const defaultPassword = "123456"; // Mot de passe par défaut

      this.mockUsers.set(data.phone, {
        phone: data.phone,
        password: defaultPassword,
        firstName: "Utilisateur",
        lastName: "EEBTP",
        isNewUser: false,
      });

      console.log(
        `🔐 Utilisateur créé pour ${data.phone} avec mot de passe par défaut: ${defaultPassword}`
      );
    }

    return {
      success: true,
      isNewUser: false, // Toujours false maintenant car on crée automatiquement
      message: "Numéro vérifié. Connectez-vous avec votre mot de passe.",
    };
  }

  // Connexion simple (téléphone + mot de passe)
  async simpleLogin(data: SimpleLoginRequest): Promise<{
    success: boolean;
    user: User;
    token: string;
    refreshToken: string;
  }> {
    await this.delay(1500);

    const existingUser = this.mockUsers.get(data.phone);

    if (!existingUser) {
      throw new Error("Numéro de téléphone non trouvé");
    }

    if (!existingUser.password || existingUser.password !== data.password) {
      throw new Error("Mot de passe incorrect");
    }

    const user: User = {
      id: `user_${data.phone.replace(/\D/g, "")}`,
      firstName: existingUser.firstName || "Utilisateur",
      lastName: existingUser.lastName || "Test",
      email: existingUser.email,
      phone: data.phone,
      role: "employee",
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: !!existingUser.email,
      hasCompletedSetup: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = `token_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const refreshToken = `refresh_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log("✅ Connexion réussie pour:", data.phone);

    return {
      success: true,
      user,
      token,
      refreshToken,
    };
  }

  // Configuration de compte pour nouveaux utilisateurs (flux simplifié)
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
    await this.delay(1500);

    // Créer l'utilisateur
    this.mockUsers.set(data.phone, {
      phone: data.phone,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      isNewUser: false, // Plus nouveau après la création
    });

    const user: User = {
      id: `user_${data.phone.replace(/\D/g, "")}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: "employee",
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: !!data.email,
      hasCompletedSetup: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = `token_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const refreshToken = `refresh_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log("🎉 Compte créé avec succès pour:", data.phone);

    return {
      success: true,
      user,
      token,
      refreshToken,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
