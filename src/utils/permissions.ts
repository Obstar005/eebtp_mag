// Utilitaires pour gérer les permissions avec l'API EEBTP

import type { User } from "../types/auth";
import { UserProfil } from "../types/auth";
import { profilePermissionService } from "../services/profilePermissionService";
import type { ProfilePermissions } from "../services/profilePermissionService";
import type { UserPermission } from "../services/api/accessService";
import { DEMANDE_ACCESS_CODES } from "../services/api/accessService";

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
    // Chef Approvisionnement
    "chef approvisionnement": UserProfil.CHEF_APPRO,
    "chef appro": UserProfil.CHEF_APPRO,
    chef_appro: UserProfil.CHEF_APPRO,

    // Directeur des Travaux
    "directeur des travaux": UserProfil.DTX,
    dtx: UserProfil.DTX,

    // Directeur Technique
    "directeur technique": UserProfil.DT,
    dt: UserProfil.DT,

    // Directeur Général
    "directeur général": UserProfil.DG,
    dg: UserProfil.DG,

    // Directeur Général Adjoint
    "directeur général adjoint": UserProfil.DGA,
    dga: UserProfil.DGA,

    // Directeur Financier
    "directeur financier": UserProfil.DF,
    df: UserProfil.DF,

    // Administrateur
    administrateur: UserProfil.ADMIN,
    admin: UserProfil.ADMIN,
    // Super Administrateur
    
    "super administrateur": UserProfil.SUPER_ADMIN,
    superadmin: UserProfil.SUPER_ADMIN,

    // Magasinier
    magasinier: UserProfil.MAGASINIER,
  };

  return mapping[normalizedLibelle] || null;
}

/**
 * ORDRE STRICT DES TRAITEMENTS:
 * Émise (mobile) → Confirmée (Chef Appro) → Approuvée (DTX/DT) → Validée (DG/DGA/DF) → Livrée (mobile)
 *
 * RÈGLES:
 * - Chaque étape ne peut être traitée QUE si l'étape précédente est complétée
 * - Pas de saut d'étape autorisé
 * - Chaque profil a UN SEUL rôle dans le processus
 */
const LEGACY_PROFILE_MAPPING: Record<
  string,
  {
    canConfirm: boolean; // Confirmée (après Émise)
    canApprove: boolean; // Approuvée (après Confirmée)
    canValidate: boolean; // Validée (après Approuvée)
    canReject: boolean; // Rejet possible (uniquement DGA, DF, DG)
  }
> = {
  // Chef Approvisionnement - SEUL autorisé à confirmer
  chef_appro: {
    canConfirm: true, // Confirme les demandes émises
    canApprove: false,
    canValidate: false,
    canReject: false, // NE peut PAS rejeter (selon API)
  },

  // Directeur des Travaux - SEUL autorisé à approuver (après confirmation)
  dtx: {
    canConfirm: false, // NE peut PAS confirmer
    canApprove: true, // Approuve les demandes confirmées
    canValidate: false,
    canReject: false, // NE peut PAS rejeter (selon API)
  },

  // Directeur Technique - SEUL autorisé à approuver (après confirmation)
  dt: {
    canConfirm: false, // NE peut PAS confirmer
    canApprove: true, // Approuve les demandes confirmées
    canValidate: false,
    canReject: false, // NE peut PAS rejeter (selon API)
  },

  // Directeur Général - SEUL autorisé à valider (après approbation)
  dg: {
    canConfirm: false,
    canApprove: false,
    canValidate: true, // Valide les demandes approuvées
    canReject: true, // Peut rejeter (selon API)
  },

  // Directeur Général Adjoint - SEUL autorisé à valider (après approbation)
  dga: {
    canConfirm: false,
    canApprove: false,
    canValidate: true, // Valide les demandes approuvées
    canReject: true, // Peut rejeter (selon API)
  },

  // Directeur Financier - SEUL autorisé à valider (après approbation)
  df: {
    canConfirm: false,
    canApprove: false,
    canValidate: true, // Valide les demandes approuvées
    canReject: true, // Peut rejeter (selon API)
  },

  // Administrateur - Permissions complètes pour supervision
  Admin: {
    canConfirm: true,
    canApprove: true,
    canValidate: true,
    canReject: true,
  },

  // Magasinier - AUCUN traitement de demande (seulement émission sur mobile)
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
/**
 * Version synchrone avec RESPECT STRICT de l'ordre des traitements
 * ORDRE: Émise → Confirmée (Chef Appro) → Approuvée (DTX/DT) → Validée (DG/DGA/DF)
 */
export function getAvailableTreatmentActionsSync(
  user: User | null,
  requestStatus: string
): AvailableAction[] {
  if (!user) {
    return [];
  }

  const legacyPermissions = LEGACY_PROFILE_MAPPING[user.profil];
  if (!legacyPermissions) {
    return [];
  }

  const actions: AvailableAction[] = [];

  // ÉTAPE 1: Confirmation (UNIQUEMENT si statut = Émise)
  // Profils autorisés: Chef Appro, Admin
  if (legacyPermissions.canConfirm && requestStatus === REQUEST_STATUS.EMISE) {
    actions.push({
      value: TREATMENT_ACTIONS.CONFIRMER,
      label: "Confirmer la demande",
      requiredStatus: REQUEST_STATUS.EMISE,
    });
  }

  // ÉTAPE 2: Approbation (UNIQUEMENT si statut = Confirmée)
  // Profils autorisés: DTX, DT, Admin
  // PAS D'ACTION POSSIBLE AVANT QUE LE STATUT SOIT "Confirmée"
  if (
    legacyPermissions.canApprove &&
    requestStatus === REQUEST_STATUS.CONFIRMEE
  ) {
    actions.push({
      value: TREATMENT_ACTIONS.APPROUVER,
      label: "Approuver la demande",
      requiredStatus: REQUEST_STATUS.CONFIRMEE,
    });
  }

  // ÉTAPE 3: Validation (UNIQUEMENT si statut = Approuvée)
  // Profils autorisés: DG, DGA, DF, Admin
  // PAS D'ACTION POSSIBLE AVANT QUE LE STATUT SOIT "Approuvée"
  if (
    legacyPermissions.canValidate &&
    requestStatus === REQUEST_STATUS.APPROUVEE
  ) {
    actions.push({
      value: TREATMENT_ACTIONS.VALIDER,
      label: "Valider la demande",
      requiredStatus: REQUEST_STATUS.APPROUVEE,
    });
  }

  // Rejet possible UNIQUEMENT aux étapes non finales
  // Et UNIQUEMENT à l'étape où le profil a le droit d'agir
  const finalStatuses = [
    REQUEST_STATUS.VALIDEE,
    REQUEST_STATUS.REJETEE,
    REQUEST_STATUS.LIVREE,
  ];

  if (
    legacyPermissions.canReject &&
    !finalStatuses.some((status) => status === requestStatus)
  ) {
    // Vérifier que l'utilisateur peut agir à cette étape
    const canActAtThisStage =
      (legacyPermissions.canConfirm &&
        requestStatus === REQUEST_STATUS.EMISE) ||
      (legacyPermissions.canApprove &&
        requestStatus === REQUEST_STATUS.CONFIRMEE) ||
      (legacyPermissions.canValidate &&
        requestStatus === REQUEST_STATUS.APPROUVEE);

    if (canActAtThisStage || user.profil === "Admin") {
      actions.push({
        value: TREATMENT_ACTIONS.REJETER,
        label: "Rejeter la demande",
      });
    }
  }

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

// ==================== NOUVEAU SYSTÈME BASÉ SUR LES ACCÈS API ====================

/**
 * Interface pour les permissions de traitement des demandes
 * basées sur les codes d'accès de l'API
 */
export interface DemandeAccessPermissions {
  canView: boolean;
  canCreate: boolean;
  canConfirm: boolean;
  canApprove: boolean;
  canValidate: boolean;
}

/**
 * Extraire les permissions de demande depuis les permissions utilisateur de l'API
 */
export function extractDemandePermissions(
  userPermissions: UserPermission[]
): DemandeAccessPermissions {
  const hasAccess = (code: string) =>
    userPermissions.some((p) => p.code === code);

  return {
    canView: hasAccess(DEMANDE_ACCESS_CODES.VIEW),
    canCreate: hasAccess(DEMANDE_ACCESS_CODES.CREATE),
    canConfirm: hasAccess(DEMANDE_ACCESS_CODES.CONFIRM),
    canApprove: hasAccess(DEMANDE_ACCESS_CODES.APPROVE),
    canValidate: hasAccess(DEMANDE_ACCESS_CODES.VALIDATE),
  };
}

/**
 * Obtenir les actions de traitement disponibles basées sur les accès API
 * C'est la nouvelle version qui remplace getAvailableTreatmentActionsSync
 * 
 * @param userPermissions - Les permissions de l'utilisateur depuis l'API
 * @param requestStatus - Le statut actuel de la demande
 * @returns Liste des actions disponibles
 */
export function getAvailableTreatmentActionsWithAccess(
  userPermissions: UserPermission[],
  requestStatus: string
): AvailableAction[] {
  if (!userPermissions || userPermissions.length === 0) {
    return [];
  }

  const permissions = extractDemandePermissions(userPermissions);
  const actions: AvailableAction[] = [];

  // ÉTAPE 1: Confirmation (UNIQUEMENT si statut = Émise)
  // Autorisé si l'utilisateur a l'accès "demande.confirm"
  if (permissions.canConfirm && requestStatus === REQUEST_STATUS.EMISE) {
    actions.push({
      value: TREATMENT_ACTIONS.CONFIRMER,
      label: "Confirmer la demande",
      requiredStatus: REQUEST_STATUS.EMISE,
    });
  }

  // ÉTAPE 2: Approbation (UNIQUEMENT si statut = Confirmée)
  // Autorisé si l'utilisateur a l'accès "demande.approuv"
  if (permissions.canApprove && requestStatus === REQUEST_STATUS.CONFIRMEE) {
    actions.push({
      value: TREATMENT_ACTIONS.APPROUVER,
      label: "Approuver la demande",
      requiredStatus: REQUEST_STATUS.CONFIRMEE,
    });
  }

  // ÉTAPE 3: Validation (UNIQUEMENT si statut = Approuvée)
  // Autorisé si l'utilisateur a l'accès "demande.valid"
  if (permissions.canValidate && requestStatus === REQUEST_STATUS.APPROUVEE) {
    actions.push({
      value: TREATMENT_ACTIONS.VALIDER,
      label: "Valider la demande",
      requiredStatus: REQUEST_STATUS.APPROUVEE,
    });
  }

  // Rejet possible UNIQUEMENT aux étapes non finales
  // Et UNIQUEMENT si l'utilisateur peut agir à cette étape (validation uniquement selon API)
  const finalStatuses = [
    REQUEST_STATUS.VALIDEE,
    REQUEST_STATUS.REJETEE,
    REQUEST_STATUS.LIVREE,
  ];

  if (!finalStatuses.some((status) => status === requestStatus)) {
    // Le rejet est autorisé uniquement pour ceux qui peuvent valider (DGA, DF, DG)
    // selon la documentation API
    if (permissions.canValidate && requestStatus === REQUEST_STATUS.APPROUVEE) {
      actions.push({
        value: TREATMENT_ACTIONS.REJETER,
        label: "Rejeter la demande",
      });
    }
  }

  return actions;
}

/**
 * Vérifier si l'utilisateur peut traiter une demande avec le nouveau système d'accès
 */
export function canUserTreatRequestWithAccess(
  userPermissions: UserPermission[],
  requestStatus: string
): boolean {
  return getAvailableTreatmentActionsWithAccess(userPermissions, requestStatus).length > 0;
}
