import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type { ApiResponse } from "../../types";

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    const baseURL =
      import.meta.env.VITE_API_URL || "http://185.197.195.209:8000";
    console.log("🌐 Configuration du client API avec baseURL:", baseURL);

    this.axiosInstance = axios.create({
      baseURL,
      timeout: 15000, // Augmenté à 15 secondes pour l'upload de fichiers
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor pour authentification hybride Basic Auth → JWT
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Gestion automatique du Content-Type
        if (config.data instanceof FormData) {
          // Ne pas définir Content-Type pour FormData, le navigateur gère automatiquement les boundaries
          // Axios ajoutera automatiquement le bon Content-Type avec boundary
          delete config.headers["Content-Type"];
          console.log(
            "📦 Détection de FormData: Content-Type sera géré automatiquement"
          );
        }

        // Permettre de désactiver l'authentification explicitement
        if (config.headers?.["X-No-Auth"] === "true") {
          delete config.headers.Authorization;
          delete config.headers["X-No-Auth"];
          return config;
        }

        // 1. Priorité au JWT token si disponible (authToken ou auth_token)
        const jwtToken =
          localStorage.getItem("authToken") ||
          localStorage.getItem("auth_token");
        if (jwtToken) {
          console.log("🔑 Authentification avec JWT Token");
          config.headers.Authorization = `Bearer ${jwtToken}`;
          return config;
        }

        // 2. Fallback vers Basic Auth pour les endpoints non-auth
        const username = import.meta.env.VITE_API_USERNAME;
        const password = import.meta.env.VITE_API_PASSWORD;
        if (username && password && username !== "your_username") {
          console.log("🔑 Authentification avec Basic Auth");
          const basicAuth = btoa(`${username}:${password}`);
          config.headers.Authorization = `Basic ${basicAuth}`;
        } else {
          console.warn("⚠️ Aucune méthode d'authentification disponible");
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor pour gestion des erreurs avec refresh automatique JWT
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<unknown>>) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Tentative de refresh du JWT token
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              // Import dynamique pour éviter les dépendances circulaires
              const { authService } = await import("./authService");
              const { token, refreshToken: newRefreshToken } =
                await authService.refreshToken();

              // Mise à jour des tokens
              localStorage.setItem("authToken", token);
              localStorage.setItem("refreshToken", newRefreshToken);

              // Retry la requête originale avec le nouveau token
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.axiosInstance.request(originalRequest);
            } catch (refreshError) {
              console.error("Échec du refresh token:", refreshError);
              // Échec du refresh, déconnexion complète
              this.clearAuthAndRedirect();
            }
          } else {
            // Pas de refresh token disponible
            this.clearAuthAndRedirect();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private clearAuthAndRedirect() {
    // Nettoyage de tous les tokens et données utilisateur
    localStorage.removeItem("authToken");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user_data");

    // Redirection vers la page de connexion
    if (window.location.pathname !== "/auth/login") {
      window.location.href = "/auth/login";
    }
  }

  public getInstance() {
    return this.axiosInstance;
  }
}

export const apiClient = new ApiClient().getInstance();
