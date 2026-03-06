// Configuration et test des permissions par profil
// Cet exemple montre comment configurer les permissions pour chaque profil

import type { ProfilePermissions } from "../services/profilePermissionService";

/**
 * Configuration des permissions par profil
 * ORDRE STRICT: Émise → Confirmée (Chef Appro) → Approuvée (DTX/DT) → Validée (DG/DGA/DF)
 * Basé sur les profils: chef_appro, dtx, dt, dg, dga, df, Admin, magasinier
 */
export const PROFILE_PERMISSIONS_CONFIG: Record<
  string,
  Omit<ProfilePermissions, "profileId">
> = {
  // Chef Approvisionnement - SEUL à confirmer les demandes émises
  chef_appro: {
    libelle: "Chef Approvisionnement",
    permissions: {
      // Actions sur les demandes - CONFIRMATION UNIQUEMENT
      canConfirmRequest: true, // Confirme les demandes ÉMISES
      canApproveRequest: false, // NE peut PAS approuver
      canValidateRequest: false, // NE peut PAS valider
      canRejectRequest: true, // Peut rejeter à l'étape Émise

      // Gestion des stocks
      canManageStock: true,
      canCreateEntry: true,
      canCreateExit: true,

      // Gestion des utilisateurs
      canManageUsers: false,
      canManageProfiles: false,

      // Administration
      canAccessAdminPanel: false,
      canViewReports: true,
      canExportData: true,
    },
  },

  // Directeur des Travaux - SEUL à approuver les demandes confirmées
  dtx: {
    libelle: "Directeur des Travaux",
    permissions: {
      // Actions sur les demandes - APPROBATION UNIQUEMENT
      canConfirmRequest: false, // NE peut PAS confirmer
      canApproveRequest: true, // Approuve les demandes CONFIRMÉES
      canValidateRequest: false, // NE peut PAS valider
      canRejectRequest: true, // Peut rejeter à l'étape Confirmée

      // Gestion des stocks
      canManageStock: true,
      canCreateEntry: true,
      canCreateExit: true,

      // Gestion des utilisateurs
      canManageUsers: false,
      canManageProfiles: false,

      // Administration
      canAccessAdminPanel: false,
      canViewReports: true,
      canExportData: true,
    },
  },

  // Directeur Technique - SEUL à approuver les demandes confirmées
  dt: {
    libelle: "Directeur Technique",
    permissions: {
      // Actions sur les demandes - APPROBATION UNIQUEMENT
      canConfirmRequest: false, // NE peut PAS confirmer
      canApproveRequest: true, // Approuve les demandes CONFIRMÉES
      canValidateRequest: false, // NE peut PAS valider
      canRejectRequest: true, // Peut rejeter à l'étape Confirmée

      // Gestion des stocks
      canManageStock: true,
      canCreateEntry: true,
      canCreateExit: true,

      // Gestion des utilisateurs
      canManageUsers: false,
      canManageProfiles: false,

      // Administration
      canAccessAdminPanel: false,
      canViewReports: true,
      canExportData: true,
    },
  },

  // Directeur Général - SEUL à valider les demandes approuvées
  dg: {
    libelle: "Directeur Général",
    permissions: {
      // Actions sur les demandes - VALIDATION UNIQUEMENT
      canConfirmRequest: false, // NE peut PAS confirmer
      canApproveRequest: false, // NE peut PAS approuver
      canValidateRequest: true, // Valide les demandes APPROUVÉES
      canRejectRequest: true, // Peut rejeter à l'étape Approuvée

      // Gestion des stocks
      canManageStock: true,
      canCreateEntry: true,
      canCreateExit: true,

      // Gestion des utilisateurs
      canManageUsers: true,
      canManageProfiles: false,

      // Administration
      canAccessAdminPanel: false,
      canViewReports: true,
      canExportData: true,
    },
  },

  // Directeur Général Adjoint - SEUL à valider les demandes approuvées
  dga: {
    libelle: "Directeur Général Adjoint",
    permissions: {
      // Actions sur les demandes - VALIDATION UNIQUEMENT
      canConfirmRequest: false, // NE peut PAS confirmer
      canApproveRequest: false, // NE peut PAS approuver
      canValidateRequest: true, // Valide les demandes APPROUVÉES
      canRejectRequest: true, // Peut rejeter à l'étape Approuvée

      // Gestion des stocks
      canManageStock: true,
      canCreateEntry: true,
      canCreateExit: true,

      // Gestion des utilisateurs
      canManageUsers: true,
      canManageProfiles: false,

      // Administration
      canAccessAdminPanel: false,
      canViewReports: true,
      canExportData: true,
    },
  },

  // Directeur Financier - SEUL à valider les demandes approuvées
  df: {
    libelle: "Directeur Financier",
    permissions: {
      // Actions sur les demandes - VALIDATION UNIQUEMENT
      canConfirmRequest: false, // NE peut PAS confirmer
      canApproveRequest: false, // NE peut PAS approuver
      canValidateRequest: true, // Valide les demandes APPROUVÉES
      canRejectRequest: true, // Peut rejeter à l'étape Approuvée

      // Gestion des stocks
      canManageStock: true,
      canCreateEntry: true,
      canCreateExit: true,

      // Gestion des utilisateurs
      canManageUsers: true,
      canManageProfiles: false,

      // Administration
      canAccessAdminPanel: false,
      canViewReports: true,
      canExportData: true,
    },
  },

  // Administrateur du système - Permissions complètes
  Admin: {
    libelle: "Administrateur du système",
    permissions: {
      // Actions sur les demandes - TOUS LES DROITS
      canConfirmRequest: true,
      canApproveRequest: true,
      canValidateRequest: true,
      canRejectRequest: true,

      // Gestion des stocks - TOUS LES DROITS
      canManageStock: true,
      canCreateEntry: true,
      canCreateExit: true,

      // Gestion des utilisateurs - TOUS LES DROITS
      canManageUsers: true,
      canManageProfiles: true,

      // Administration - TOUS LES DROITS
      canAccessAdminPanel: true,
      canViewReports: true,
      canExportData: true,
    },
  },

  // Magasinier - Gestion stocks uniquement
  magasinier: {
    libelle: "Magasinier",
    permissions: {
      // Actions sur les demandes - AUCUN DROIT
      canConfirmRequest: false,
      canApproveRequest: false,
      canValidateRequest: false,
      canRejectRequest: false,

      // Gestion des stocks - SA SPÉCIALITÉ
      canManageStock: true,
      canCreateEntry: true,
      canCreateExit: true,

      // Gestion des utilisateurs - AUCUN DROIT
      canManageUsers: false,
      canManageProfiles: false,

      // Administration - ACCÈS LIMITÉ
      canAccessAdminPanel: false,
      canViewReports: false,
      canExportData: false,
    },
  },
};

/**
 * Utilitaire pour tester les permissions d'un profil
 */
export class PermissionTester {
  /**
   * Teste toutes les permissions d'un profil donné
   */
  static testProfilePermissions(profileLibelle: string): void {
    const config = PROFILE_PERMISSIONS_CONFIG[profileLibelle];

    if (!config) {
      return;
    }

    // Test des permissions silencieux
    const permissions = config.permissions;
    const totalPermissions = Object.values(permissions).length;
    const grantedPermissions = Object.values(permissions).filter(
      (p) => p
    ).length;
    // Calcul du niveau d'autorisation pour usage interne
    Math.round((grantedPermissions / totalPermissions) * 100);
  }

  /**
   * Teste tous les profils configurés
   */
  static testAllProfiles(): void {
    Object.keys(PROFILE_PERMISSIONS_CONFIG).forEach((profileKey) => {
      this.testProfilePermissions(profileKey);
    });
  }

  /**
   * Affiche un résumé comparatif des profils
   */
  static showPermissionMatrix(): void {
    // Méthode de debug désactivée
  }

  /**
   * Simule le test d'actions de traitement pour différents profils et états
   */
  static simulateTreatmentScenarios(): void {
    const statuses = ["Emise", "Confirmée", "Approuvée", "Validée", "Rejetée"];
    const profiles = Object.keys(PROFILE_PERMISSIONS_CONFIG);

    profiles.forEach((profileKey) => {
      const config = PROFILE_PERMISSIONS_CONFIG[profileKey];

      statuses.forEach((status) => {
        const actions: string[] = [];

        if (config.permissions.canConfirmRequest && status === "Emise") {
          actions.push("Confirmer");
        }
        if (config.permissions.canApproveRequest && status === "Confirmée") {
          actions.push("Approuver");
        }
        if (config.permissions.canValidateRequest && status === "Approuvée") {
          actions.push("Valider");
        }
        if (
          config.permissions.canRejectRequest &&
          !["Validée", "Rejetée", "Livrée"].includes(status)
        ) {
          actions.push("Rejeter");
        }

        const actionText =
          actions.length > 0 ? actions.join(", ") : "Aucune action";
      });
    });
  }
}

// Exporter pour utilisation dans les tests ou la console
declare global {
  interface Window {
    PermissionTester?: typeof PermissionTester;
    PROFILE_PERMISSIONS_CONFIG?: typeof PROFILE_PERMISSIONS_CONFIG;
  }
}

if (typeof window !== "undefined") {
  window.PermissionTester = PermissionTester;
  window.PROFILE_PERMISSIONS_CONFIG = PROFILE_PERMISSIONS_CONFIG;
}
