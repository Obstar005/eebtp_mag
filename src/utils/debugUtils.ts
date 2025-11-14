// Utilitaire pour déboguer les réponses d'API

/**
 * Analyse et affiche la structure d'une réponse API pour débogage
 */
export function debugApiResponse(response: unknown, context: string = "API Response"): void {
  console.group(`🔍 DEBUG: ${context}`);
  
  if (response === null) {
    console.warn("❌ Réponse null");
  } else if (response === undefined) {
    console.warn("❌ Réponse undefined");
  } else if (typeof response !== 'object') {
    console.log("📝 Type:", typeof response);
    console.log("📝 Valeur:", response);
  } else {
    console.log("📝 Type:", typeof response);
    console.log("📝 Clés disponibles:", Object.keys(response));
    
    // Analyser des propriétés importantes
    if ('id' in response) {
      console.log("🆔 ID:", {
        value: response.id,
        type: typeof response.id,
        exists: response.id !== null && response.id !== undefined
      });
    } else {
      console.warn("⚠️ Propriété 'id' manquante");
    }
    
    if ('status' in response) {
      console.log("📊 Status:", response.status);
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
    
    console.log("📋 Objet complet:", response);
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