// Helper pour la gestion des erreurs d'API

import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types/api-magasins";

/**
 * Interface pour les erreurs formatées
 */
export interface FormattedError {
  message: string;
  details?: string[];
  status?: number;
  code?: string;
}

/**
 * Extrait et formate les erreurs d'API
 */
export function extractApiError(error: unknown): FormattedError {
  // Erreur Axios
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorResponse;

    // Messages d'erreur par défaut selon le code de statut
    const defaultMessages: Record<number, string> = {
      400: "Données invalides",
      401: "Non autorisé - Veuillez vous connecter",
      403: "Accès interdit",
      404: "Ressource non trouvée",
      409: "Conflit - La ressource existe déjà",
      422: "Données non valides",
      500: "Erreur interne du serveur",
      502: "Service temporairement indisponible",
      503: "Service indisponible",
    };

    let message = defaultMessages[status || 0] || "Erreur de connexion";
    const details: string[] = [];

    // Extraire le message depuis la réponse API
    if (data) {
      if (data.detail) {
        message = data.detail;
      } else if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = data.error;
      }

      // Extraire les erreurs de validation
      if (data.errors) {
        Object.entries(data.errors).forEach(([field, fieldErrors]) => {
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((err) => details.push(`${field}: ${err}`));
          } else {
            details.push(`${field}: ${fieldErrors}`);
          }
        });
      }

      // Erreurs non liées à des champs spécifiques
      if (data.non_field_errors) {
        details.push(...data.non_field_errors);
      }
    }

    return {
      message,
      details: details.length > 0 ? details : undefined,
      status,
      code: error.code,
    };
  }

  // Erreur réseau ou autre
  if (error instanceof Error) {
    return {
      message: error.message || "Une erreur inattendue s'est produite",
    };
  }

  // Erreur inconnue
  return {
    message: "Une erreur inattendue s'est produite",
  };
}

/**
 * Type guard pour vérifier si une erreur est une AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Formate une erreur pour l'affichage utilisateur
 */
export function formatErrorForDisplay(error: FormattedError): string {
  let message = error.message;

  if (error.details && error.details.length > 0) {
    message += ":\n" + error.details.join("\n");
  }

  return message;
}

/**
 * Logs une erreur avec le contexte approprié
 */
export function logApiError(
  operation: string,
  error: FormattedError,
  context?: Record<string, unknown>
): void {
  console.group(`❌ Erreur API - ${operation}`);
  console.error("Message:", error.message);
  if (error.status) {
    console.error("Status:", error.status);
  }
  if (error.code) {
    console.error("Code:", error.code);
  }
  if (error.details) {
    console.error("Détails:", error.details);
  }
  if (context) {
    console.error("Contexte:", context);
  }
  console.groupEnd();
}

/**
 * Helper pour retry automatique avec backoff exponentiel
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break; // Last attempt failed
      }

      // Check if the error is retryable
      const formattedError = extractApiError(error);
      if (formattedError.status && formattedError.status < 500) {
        // Client errors (4xx) are not retryable
        throw error;
      }

      // Wait with exponential backoff
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.warn(
        `⚠️ Tentative ${attempt + 1}/${
          maxRetries + 1
        } échouée, retry dans ${delay}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Wrapper pour les opérations API avec gestion d'erreurs standardisée
 */
export async function withApiErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const formattedError = extractApiError(error);
    logApiError(operationName, formattedError, context);
    throw formattedError;
  }
}
