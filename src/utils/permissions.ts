// Utilitaires pour gérer les permissions avec l'API EEBTP

import type { User } from "../types/auth";
import { UserProfil } from "../types/auth";
import { profilePermissionService } from "../services/profilePermissionService";
import type { ProfilePermissions } from "../services/profilePermissionService";

/**
 * États possibles des demandes de ravitaillement
 */
export const REQUEST_STATUS = {
  EMISE: "Emise",
  CONFIRMEE: "Confirmée",
  APPROUVEE: "Approuvée",
  VALIDEE: "Validée",
  REJETEE: "Rejetée",
  LIVREE: "Livrée",
} as const;

/**
 * Mapper les statuts de l'API (minuscules) vers les statuts de permissions (avec accents)
 */
export function mapApiStatusToPermissionStatus(apiStatus: string): string {
  const mapping: Record<string, string> = {
    emis: REQUEST_STATUS.EMISE,
    confirme: REQUEST_STATUS.CONFIRMEE,
    approuve: REQUEST_STATUS.APPROUVEE,
    valide: REQUEST_STATUS.VALIDEE,
    refuse: REQUEST_STATUS.REJETEE,
    livre: REQUEST_STATUS.LIVREE,
    // Mapping pour les variantes possibles
    emise: REQUEST_STATUS.EMISE,
    confirmee: REQUEST_STATUS.CONFIRMEE,
    approuvee: REQUEST_STATUS.APPROUVEE,
    validee: REQUEST_STATUS.VALIDEE,
    rejetee: REQUEST_STATUS.REJETEE,
    livree: REQUEST_STATUS.LIVREE,
  };

  const normalizedStatus = apiStatus.toLowerCase().trim();
  const mappedStatus = mapping[normalizedStatus] || apiStatus;

  console.log("🔄 mapApiStatusToPermissionStatus:", {
    input: apiStatus,
    normalized: normalizedStatus,
    mapped: mappedStatus,
  });

  return mappedStatus;
}

export type RequestStatus =
  (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

/**
 * Actions de traitement possibles
 */
export const TREATMENT_ACTIONS = {
  CONFIRMER: "confirmer",
  APPROUVER: "approuver",
  VALIDER: "valider",
  REJETER: "rejeter",
} as const;

export type TreatmentAction =
  (typeof TREATMENT_ACTIONS)[keyof typeof TREATMENT_ACTIONS];

/**
 * Structure d'une action de traitement disponible
 */
export interface AvailableAction {
  value: TreatmentAction;
  label: string;
  requiredStatus?: RequestStatus;
}

// Réexporter le type ProfilePermissions pour faciliter l'usage
export type { ProfilePermissions } from "../services/profilePermissionService";

/**
 * Détermine les actions de traitement disponibles pour un utilisateur sur une demande donnée
 * Utilise le nouveau système de permissions basé sur l'API
 */
export async function getAvailableTreatmentActions(
  user: User | null,
  requestStatus: string
): Promise<AvailableAction[]> {
  if (!user) return [];

  try {
    // Récupérer les permissions de l'utilisateur depuis l'API
    const userPermissions = await profilePermissionService.getUserPermissions(
      user
    );
    if (!userPermissions) {
      console.warn("Aucune permission trouvée pour l'utilisateur:", user);
      return [];
    }

    const actions: AvailableAction[] = [];

    // Logique basée sur la hiérarchie de validation et les permissions du profil
    const { permissions } = userPermissions;

    // Action "Confirmer" - disponible pour les profils autorisés sur les demandes émises
    if (
      permissions.canConfirmRequest &&
      requestStatus === REQUEST_STATUS.EMISE
    ) {
      actions.push({
        value: TREATMENT_ACTIONS.CONFIRMER,
        label: "Confirmer la demande",
        requiredStatus: REQUEST_STATUS.EMISE,
      });
    }

    // Action "Approuver" - disponible pour les profils autorisés sur les demandes confirmées
    if (
      permissions.canApproveRequest &&
      requestStatus === REQUEST_STATUS.CONFIRMEE
    ) {
      actions.push({
        value: TREATMENT_ACTIONS.APPROUVER,
        label: "Approuver la demande",
        requiredStatus: REQUEST_STATUS.CONFIRMEE,
      });
    }

    // Action "Valider" - disponible pour les profils autorisés sur les demandes approuvées
    if (
      permissions.canValidateRequest &&
      requestStatus === REQUEST_STATUS.APPROUVEE
    ) {
      actions.push({
        value: TREATMENT_ACTIONS.VALIDER,
        label: "Valider la demande",
        requiredStatus: REQUEST_STATUS.APPROUVEE,
      });
    }

    // Action "Rejeter" - disponible pour tous les profils autorisés (sauf états finaux)
    const finalStatuses = [
      REQUEST_STATUS.VALIDEE,
      REQUEST_STATUS.REJETEE,
      REQUEST_STATUS.LIVREE,
    ];

    if (
      permissions.canRejectRequest &&
      !finalStatuses.some((status) => status === requestStatus)
    ) {
      actions.push({
        value: TREATMENT_ACTIONS.REJETER,
        label: "Rejeter la demande",
      });
    }

    return actions;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des actions disponibles:",
      error
    );
    return [];
  }
}

/**
 * Vérifie si un utilisateur peut traiter une demande (au moins une action disponible)
 */
export async function canUserTreatRequest(
  user: User | null,
  requestStatus: string
): Promise<boolean> {
  const actions = await getAvailableTreatmentActions(user, requestStatus);
  return actions.length > 0;
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export async function checkUserPermission(
  user: User | null,
  permission: keyof ProfilePermissions["permissions"]
): Promise<boolean> {
  if (!user) return false;

  try {
    return await profilePermissionService.checkPermission(user, permission);
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    return false;
  }
}

/**
 * Fonction utilitaire pour récupérer toutes les permissions d'un utilisateur
 */
export async function getUserPermissions(
  user: User | null
): Promise<ProfilePermissions | null> {
  if (!user) return null;

  try {
    return await profilePermissionService.getUserPermissions(user);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des permissions utilisateur:",
      error
    );
    return null;
  }
}

/**
 * Fonctions de compatibilité avec l'ancien système (version synchrone)
 * Utilisent des mappings temporaires en attendant la migration complète
 */

/**
 * Mapper le libellé du profil API vers le profil EEBTP
 */
export function mapProfilLibelleToUserProfil(
  libelle: string
): UserProfil | null {
  // Normaliser le libellé (enlever espaces, mettre en minuscules)
  const normalizedLibelle = libelle.toLowerCase().trim();

  // Mapping des libellés possibles vers les profils EEBTP
  const mapping: Record<string, UserProfil> = {
    // Directeur des Travaux
    "directeur des travaux": UserProfil.DTX,
    dtx: UserProfil.DTX,

    // Directeur Technique
    "directeur technique": UserProfil.DT,
    dt: UserProfil.DT,

    // Directeur Général Adjoint
    "directeur général adjoint": UserProfil.DGA,
    dga: UserProfil.DGA,

    // Administrateur
    administrateur: UserProfil.ADMIN,
    admin: UserProfil.ADMIN,

    // Magasinier
    magasinier: UserProfil.MAGASINIER,
  };

  return mapping[normalizedLibelle] || null;
}

// Mapping temporaire pour maintenir la compatibilité
// Basé sur le processus de validation EEBTP et les profils réels
const LEGACY_PROFILE_MAPPING: Record<
  string,
  {
    canConfirm: boolean;
    canApprove: boolean;
    canValidate: boolean;
    canReject: boolean;
  }
> = {
  // Administrateur - Permissions complètes
  Admin: {
    canConfirm: true,
    canApprove: true,
    canValidate: true,
    canReject: true,
  },

  // Directeur Général Adjoint - Toutes actions + Validation finale
  dga: {
    canConfirm: true,
    canApprove: true,
    canValidate: true,
    canReject: true,
  },

  // Directeur des Travaux - Confirmation + Approbation
  dtx: {
    canConfirm: true,
    canApprove: true,
    canValidate: false,
    canReject: true,
  },

  // Directeur Technique - Confirmation + Approbation
  dt: {
    canConfirm: true,
    canApprove: true,
    canValidate: false,
    canReject: true,
  },

  // Magasinier - Gestion stocks uniquement (pas de traitement de demandes)
  magasinier: {
    canConfirm: false,
    canApprove: false,
    canValidate: false,
    canReject: false,
  },
};

/**
 * Version synchrone pour compatibilité avec l'ancien système
 * @deprecated Utiliser getAvailableTreatmentActions() à la place
 */
export function getAvailableTreatmentActionsSync(
  user: User | null,
  requestStatus: string
): AvailableAction[] {
  if (!user) {
    console.log(
      "🚫 getAvailableTreatmentActionsSync: Utilisateur non connecté"
    );
    return [];
  }

  console.log("🔍 getAvailableTreatmentActionsSync: Vérification permissions", {
    userProfil: user.profil,
    requestStatus: requestStatus,
    availableProfiles: Object.keys(LEGACY_PROFILE_MAPPING),
  });

  const legacyPermissions = LEGACY_PROFILE_MAPPING[user.profil];
  if (!legacyPermissions) {
    console.warn(
      "⚠️ getAvailableTreatmentActionsSync: Profil non trouvé dans LEGACY_PROFILE_MAPPING",
      {
        userProfil: user.profil,
        availableProfiles: Object.keys(LEGACY_PROFILE_MAPPING),
      }
    );
    return [];
  }

  console.log("✅ getAvailableTreatmentActionsSync: Permissions trouvées", {
    userProfil: user.profil,
    permissions: legacyPermissions,
  });

  const actions: AvailableAction[] = [];

  if (legacyPermissions.canConfirm && requestStatus === REQUEST_STATUS.EMISE) {
    console.log("✅ Action CONFIRMER ajoutée");
    actions.push({
      value: TREATMENT_ACTIONS.CONFIRMER,
      label: "Confirmer la demande",
      requiredStatus: REQUEST_STATUS.EMISE,
    });
  }

  if (
    legacyPermissions.canApprove &&
    requestStatus === REQUEST_STATUS.CONFIRMEE
  ) {
    console.log("✅ Action APPROUVER ajoutée");
    actions.push({
      value: TREATMENT_ACTIONS.APPROUVER,
      label: "Approuver la demande",
      requiredStatus: REQUEST_STATUS.CONFIRMEE,
    });
  }

  if (
    legacyPermissions.canValidate &&
    requestStatus === REQUEST_STATUS.APPROUVEE
  ) {
    console.log("✅ Action VALIDER ajoutée");
    actions.push({
      value: TREATMENT_ACTIONS.VALIDER,
      label: "Valider la demande",
      requiredStatus: REQUEST_STATUS.APPROUVEE,
    });
  } else if (legacyPermissions.canValidate) {
    console.log("⚠️ Action VALIDER NON ajoutée - état incorrect", {
      canValidate: legacyPermissions.canValidate,
      currentStatus: requestStatus,
      requiredStatus: REQUEST_STATUS.APPROUVEE,
      statusMatch: requestStatus === REQUEST_STATUS.APPROUVEE,
    });
  }

  const finalStatuses = [
    REQUEST_STATUS.VALIDEE,
    REQUEST_STATUS.REJETEE,
    REQUEST_STATUS.LIVREE,
  ];
  if (
    legacyPermissions.canReject &&
    !finalStatuses.some((status) => status === requestStatus)
  ) {
    console.log("✅ Action REJETER ajoutée");
    actions.push({
      value: TREATMENT_ACTIONS.REJETER,
      label: "Rejeter la demande",
    });
  }

  console.log("📋 getAvailableTreatmentActionsSync: Actions finales", {
    userProfil: user.profil,
    requestStatus: requestStatus,
    actionsCount: actions.length,
    actions: actions.map((a) => a.value),
  });

  return actions;
}

/**
 * Version synchrone pour compatibilité
 * @deprecated Utiliser canUserTreatRequest() à la place
 */
export function canUserTreatRequestSync(
  user: User | null,
  requestStatus: string
): boolean {
  return getAvailableTreatmentActionsSync(user, requestStatus).length > 0;
}
