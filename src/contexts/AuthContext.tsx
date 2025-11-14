import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { authApiService } from "../services/api/authApiService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
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
    // Plus d'utilisateur de test automatique
    // L'utilisateur doit passer par le vrai flux d'authentification
    if (isAuthDisabled) {
      console.log(
        "🔧 Mode développement: Authentification désactivée mais pas d'auto-connexion"
      );
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
      // En cas d'erreur, déconnecter l'utilisateur localement
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      setUser(null);
    }
  };

  const logout = async () => {
    // Appeler l'endpoint de déconnexion sur l'API
    await authApiService.logout();

    // Supprimer le token et les données utilisateur du stockage local
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
