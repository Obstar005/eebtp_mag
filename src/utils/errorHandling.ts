/**
 * Utilitaires pour la gestion des erreurs dans l'application
 */

// Type pour les erreurs API
export interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      detail?: string;
    };
  };
  status?: number;
  message?: string;
}

/**
 * Fonction pour extraire et formater un message d'erreur utilisateur
 */
export function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError;

  // Erreur 403 - Permissions
  if (apiError?.response?.status === 403 || apiError?.status === 403) {
    return "❌ Permission refusée\n\nVous n'avez pas les droits nécessaires pour effectuer cette action.\nVeuillez contacter votre administrateur.";
  }

  // Erreur 401 - Authentification
  if (apiError?.response?.status === 401 || apiError?.status === 401) {
    return "❌ Non authentifié\n\nVotre session a expiré. Veuillez vous reconnecter.";
  }

  // Erreur 404 - Ressource non trouvée
  if (apiError?.response?.status === 404 || apiError?.status === 404) {
    return "❌ Ressource non trouvée\n\nL'élément demandé n'existe pas ou a été supprimé.";
  }

  // Erreur 500 - Erreur serveur
  if (apiError?.response?.status === 500 || apiError?.status === 500) {
    return "❌ Erreur serveur\n\nUn problème technique est survenu. Veuillez réessayer plus tard.";
  }

  // Erreur réseau
  if (
    apiError?.message?.includes("Network Error") ||
    apiError?.message?.includes("fetch")
  ) {
    return "❌ Problème de connexion\n\nVérifiez votre connexion internet et réessayez.";
  }

  // Message spécifique du serveur si disponible
  if (apiError?.response?.data?.message) {
    return `❌ Erreur\n\n${apiError.response.data.message}`;
  }

  if (apiError?.response?.data?.detail) {
    return `❌ Erreur\n\n${apiError.response.data.detail}`;
  }

  if (apiError?.message) {
    return `❌ Erreur\n\n${apiError.message}`;
  }

  // Message générique par défaut
  return "❌ Une erreur inattendue s'est produite\n\nVeuillez réessayer plus tard ou contacter le support technique.";
}

/**
 * Fonction pour afficher une erreur à l'utilisateur
 */
export function showErrorMessage(error: unknown): void {
  const message = getErrorMessage(error);
  alert(message);
}

/**
 * Fonction pour logger les erreurs de façon structurée
 */
export function logError(context: string, error: unknown): void {
  console.error(`❌ [${context}] Erreur:`, error);
}
