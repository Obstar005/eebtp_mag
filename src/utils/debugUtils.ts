// Utilitaire pour déboguer les réponses d'API

/**
 * Analyse et affiche la structure d'une réponse API pour débogage
 * Note: Fonction de debug désactivée en production
 */
export function debugApiResponse(_response: unknown, _context: string = "API Response"): void {
  // Debug désactivé - fonction no-op
}

/**
 * Valide qu'un objet API User contient toutes les propriétés requises
 */
export function validateApiUser(apiUser: unknown): { isValid: boolean; missing: string[]; issues: string[] } {
  const requiredFields = ['id', 'username', 'first_name', 'last_name'];
  const missing: string[] = [];
  const issues: string[] = [];
  
  // Vérifier que c'est bien un objet
  if (!apiUser || typeof apiUser !== 'object') {
    return {
      isValid: false,
      missing: requiredFields,
      issues: ['apiUser is not an object']
    };
  }
  
  const userObj = apiUser as Record<string, unknown>;
  
  for (const field of requiredFields) {
    if (!(field in userObj)) {
      missing.push(field);
    } else if (userObj[field] === null || userObj[field] === undefined) {
      issues.push(`${field} is null/undefined`);
    }
  }
  
  // Vérifications spécifiques
  if ('id' in userObj && typeof userObj.id !== 'number') {
    issues.push(`id should be number, got ${typeof userObj.id}`);
  }
  
  return {
    isValid: missing.length === 0 && issues.length === 0,
    missing,
    issues
  };
}