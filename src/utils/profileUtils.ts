// Utilitaires pour la gestion des profils

/**
 * Valide qu'un ID de profil est valide avant de faire un appel API
 */
export function isValidProfileId(
  profileId: number | undefined | null
): profileId is number {
  return profileId !== undefined && profileId !== null && profileId > 0;
}

/**
 * Sécurise un appel API vers profil-detail en validant l'ID
 */
export function validateProfileIdForApiCall(
  profileId: number | undefined | null
): number {
  if (!isValidProfileId(profileId)) {
    throw new Error(
      `ID de profil invalide: ${profileId}. Les appels API vers /Users/profil-detail/ nécessitent un ID valide.`
    );
  }
  return profileId;
}

/**
 * Retourne un ID de profil par défaut sûr
 */
export function getDefaultProfileId(): number {
  return 0; // ID par défaut pour un profil non défini
}
