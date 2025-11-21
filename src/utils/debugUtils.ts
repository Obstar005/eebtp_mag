// Utilitaire pour déboguer les réponses d'API

/**
 * Analyse et affiche la structure d'une réponse API pour débogage
 */
export function debugApiResponse(response: unknown, context: string = "API Response"): void {
  console.group(`🔍 DEBUG: ${context}`);
  
  if (response === null) {
  } else if (response === undefined) {
  } else if (typeof response !== 'object') {
  } else {
    
    // Analyser des propriétés importantes
    if ('id' in response) {
      console.log("🆔 ID:", {
        value: response.id,
        type: typeof response.id,
        exists: response.id !== null && response.id !== undefined
      });
    } else {
    }
    
    if ('status' in response) {
    }
    
    if ('data' in response) {
      console.log("📦 Data:", {
        exists: !!response.data,
        type: typeof response.data,
        keys: response.data ? Object.keys(response.data) : []
      });
      
      if (response.data && typeof response.data === 'object' && 'id' in response.data) {
        console.log("🆔 Data.ID:", {
          value: response.data.id,
          type: typeof response.data.id,
          exists: response.data.id !== null && response.data.id !== undefined
        });
      }
    }
    
  }
  
  console.groupEnd();
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