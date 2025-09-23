import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { authApiService } from "../services/api/authApiService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'authentification est désactivée pour le débogage
  const isAuthDisabled = import.meta.env.VITE_ENABLE_VERIFICATION === "false";

  // Vérifier le token au chargement
  useEffect(() => {
    // Si l'authentification est désactivée, connecter automatiquement un utilisateur de test
    if (isAuthDisabled) {
      const testUser: User = {
        id: "debug-user",
        firstName: "Debug",
        lastName: "User",
        email: "debug@test.com",
        phone: "+1234567890",
        role: "admin",
        isActive: true,
        isPhoneVerified: true,
        isEmailVerified: true,
        hasCompletedSetup: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(testUser);
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch {
        // Token/données corrompus, on les supprime
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }
    }

    setIsLoading(false);
  }, [isAuthDisabled]);

  const login = (userData: User, token: string) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setUser(userData);
  };

  // Récupérer les informations utilisateur depuis l'API
  const refreshUserInfo = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Aucun token d'authentification");
      }

      const userInfo = await authApiService.getUserInfo();
      localStorage.setItem("user_data", JSON.stringify(userInfo));
      setUser(userInfo);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des infos utilisateur:",
        error
      );
      // En cas d'erreur, déconnecter l'utilisateur
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
