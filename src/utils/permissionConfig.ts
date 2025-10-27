// Configuration et test des permissions par profil
// Cet exemple montre comment configurer les permissions pour chaque profil

import type { ProfilePermissions } from "../services/profilePermissionService";

/**
 * Exemple de configuration des permissions par profil
 * Basé sur les profils fournis: dtx, dt, dga, Admin, magasinier
 */
export const PROFILE_PERMISSIONS_CONFIG: Record<
  string,
  Omit<ProfilePermissions, "profileId">
> = {
  // Directeur des Travaux (dtx)
  dtx: {
    libelle: "Directeur des Travaux",
    permissions: {
      // Actions sur les demandes
      canConfirmRequest: true, // ✅ Peut confirmer les demandes émises
      canApproveRequest: true, // ✅ Peut approuver les demandes confirmées
      canValidateRequest: false, // ❌ Seuls DGA/Admin peuvent valider
      canRejectRequest: true, // ✅ Peut rejeter une demande

      // Gestion des stocks
      canManageStock: true, // ✅ Peut gérer les stocks
      canCreateEntry: true, // ✅ Peut créer des entrées
      canCreateExit: true, // ✅ Peut créer des sorties

      // Gestion des utilisateurs
      canManageUsers: false, // ❌ Pas de gestion d'utilisateurs
      canManageProfiles: false, // ❌ Seul Admin peut gérer les profils

      // Administration
      canAccessAdminPanel: false, // ❌ Pas d'accès admin
      canViewReports: true, // ✅ Peut voir les rapports
      canExportData: true, // ✅ Peut exporter des données
    },
  },

  // Directeur Technique (dt)
  dt: {
    libelle: "Directeur Technique",
    permissions: {
      // Actions sur les demandes
      canConfirmRequest: true, // ✅ Peut confirmer les demandes émises
      canApproveRequest: true, // ✅ Peut approuver les demandes confirmées
      canValidateRequest: false, // ❌ Seuls DGA/Admin peuvent valider
      canRejectRequest: true, // ✅ Peut rejeter une demande

      // Gestion des stocks
      canManageStock: true, // ✅ Peut gérer les stocks
      canCreateEntry: true, // ✅ Peut créer des entrées
      canCreateExit: true, // ✅ Peut créer des sorties

      // Gestion des utilisateurs
      canManageUsers: false, // ❌ Pas de gestion d'utilisateurs
      canManageProfiles: false, // ❌ Seul Admin peut gérer les profils

      // Administration
      canAccessAdminPanel: false, // ❌ Pas d'accès admin
      canViewReports: true, // ✅ Peut voir les rapports
      canExportData: true, // ✅ Peut exporter des données
    },
  },

  // Directeur Général Adjoint (dga)
  dga: {
    libelle: "Directeur Général Adjoint",
    permissions: {
      // Actions sur les demandes
      canConfirmRequest: true, // ✅ Peut confirmer (niveau supérieur)
      canApproveRequest: true, // ✅ Peut approuver (niveau supérieur)
      canValidateRequest: true, // ✅ Peut valider les demandes - PRIVILÈGE DE HAUT NIVEAU
      canRejectRequest: true, // ✅ Peut rejeter une demande

      // Gestion des stocks
      canManageStock: true, // ✅ Peut gérer les stocks
      canCreateEntry: true, // ✅ Peut créer des entrées
      canCreateExit: true, // ✅ Peut créer des sorties

      // Gestion des utilisateurs
      canManageUsers: true, // ✅ Peut gérer les utilisateurs - PRIVILÈGE DE HAUT NIVEAU
      canManageProfiles: false, // ❌ Seul Admin peut gérer les profils

      // Administration
      canAccessAdminPanel: false, // ❌ Seul Admin a accès complet
      canViewReports: true, // ✅ Peut voir tous les rapports
      canExportData: true, // ✅ Peut exporter toutes les données
    },
  },

  // Administrateur du système (Admin)
  Admin: {
    libelle: "Administrateur du système",
    permissions: {
      // Actions sur les demandes - TOUS LES DROITS
      canConfirmRequest: true, // ✅ Peut tout faire
      canApproveRequest: true, // ✅ Peut tout faire
      canValidateRequest: true, // ✅ Peut tout faire
      canRejectRequest: true, // ✅ Peut tout faire

      // Gestion des stocks - TOUS LES DROITS
      canManageStock: true, // ✅ Peut tout faire
      canCreateEntry: true, // ✅ Peut tout faire
      canCreateExit: true, // ✅ Peut tout faire

      // Gestion des utilisateurs - TOUS LES DROITS
      canManageUsers: true, // ✅ Peut gérer tous les utilisateurs
      canManageProfiles: true, // ✅ Seul lui peut gérer les profils

      // Administration - TOUS LES DROITS
      canAccessAdminPanel: true, // ✅ Accès complet au système
      canViewReports: true, // ✅ Peut voir tous les rapports
      canExportData: true, // ✅ Peut tout exporter
    },
  },

  // Magasinier
  magasinier: {
    libelle: "Magasinier",
    permissions: {
      // Actions sur les demandes - AUCUN DROIT DE TRAITEMENT
      canConfirmRequest: false, // ❌ Ne peut pas traiter les demandes
      canApproveRequest: false, // ❌ Ne peut pas traiter les demandes
      canValidateRequest: false, // ❌ Ne peut pas traiter les demandes
      canRejectRequest: false, // ❌ Ne peut pas traiter les demandes

      // Gestion des stocks - SA SPÉCIALITÉ
      canManageStock: true, // ✅ Principale responsabilité
      canCreateEntry: true, // ✅ Peut enregistrer les entrées
      canCreateExit: true, // ✅ Peut enregistrer les sorties

      // Gestion des utilisateurs - AUCUN DROIT
      canManageUsers: false, // ❌ Pas de gestion d'utilisateurs
      canManageProfiles: false, // ❌ Pas de gestion de profils

      // Administration - ACCÈS LIMITÉ
      canAccessAdminPanel: false, // ❌ Pas d'accès admin
      canViewReports: false, // ❌ Accès limité aux rapports
      canExportData: false, // ❌ Pas d'export de données
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
      console.error(`❌ Profil non trouvé: ${profileLibelle}`);
      return;
    }

    console.log(
      `\n🔍 Test des permissions pour: ${config.libelle} (${profileLibelle})`
    );
    console.log("=".repeat(50));

    const permissions = config.permissions;

    // Test des permissions de traitement des demandes
    console.log("\n📋 TRAITEMENT DES DEMANDES:");
    console.log(`  Confirmer: ${permissions.canConfirmRequest ? "✅" : "❌"}`);
    console.log(`  Approuver: ${permissions.canApproveRequest ? "✅" : "❌"}`);
    console.log(`  Valider: ${permissions.canValidateRequest ? "✅" : "❌"}`);
    console.log(`  Rejeter: ${permissions.canRejectRequest ? "✅" : "❌"}`);

    // Test des permissions de gestion des stocks
    console.log("\n📦 GESTION DES STOCKS:");
    console.log(`  Gérer stock: ${permissions.canManageStock ? "✅" : "❌"}`);
    console.log(`  Créer entrée: ${permissions.canCreateEntry ? "✅" : "❌"}`);
    console.log(`  Créer sortie: ${permissions.canCreateExit ? "✅" : "❌"}`);

    // Test des permissions d'administration
    console.log("\n👥 GESTION & ADMINISTRATION:");
    console.log(
      `  Gérer utilisateurs: ${permissions.canManageUsers ? "✅" : "❌"}`
    );
    console.log(
      `  Gérer profils: ${permissions.canManageProfiles ? "✅" : "❌"}`
    );
    console.log(
      `  Panneau admin: ${permissions.canAccessAdminPanel ? "✅" : "❌"}`
    );
    console.log(`  Voir rapports: ${permissions.canViewReports ? "✅" : "❌"}`);
    console.log(
      `  Exporter données: ${permissions.canExportData ? "✅" : "❌"}`
    );

    // Résumé du niveau d'autorisation
    const totalPermissions = Object.values(permissions).length;
    const grantedPermissions = Object.values(permissions).filter(
      (p) => p
    ).length;
    const permissionLevel = Math.round(
      (grantedPermissions / totalPermissions) * 100
    );

    console.log(
      `\n📊 Niveau d'autorisation: ${grantedPermissions}/${totalPermissions} (${permissionLevel}%)`
    );

    if (permissionLevel >= 80) {
      console.log("🔴 Niveau TRÈS ÉLEVÉ - Accès quasi-complet");
    } else if (permissionLevel >= 60) {
      console.log("🟠 Niveau ÉLEVÉ - Accès étendu");
    } else if (permissionLevel >= 40) {
      console.log("🟡 Niveau MOYEN - Accès modéré");
    } else if (permissionLevel >= 20) {
      console.log("🔵 Niveau FAIBLE - Accès limité");
    } else {
      console.log("⚫ Niveau MINIMAL - Accès très restreint");
    }
  }

  /**
   * Teste tous les profils configurés
   */
  static testAllProfiles(): void {
    console.log("\n🧪 TEST DE TOUS LES PROFILS");
    console.log("=".repeat(80));

    Object.keys(PROFILE_PERMISSIONS_CONFIG).forEach((profileKey) => {
      this.testProfilePermissions(profileKey);
    });

    console.log("\n✅ Tests terminés");
  }

  /**
   * Affiche un résumé comparatif des profils
   */
  static showPermissionMatrix(): void {
    console.log("\n📊 MATRICE DES PERMISSIONS");
    console.log("=".repeat(80));

    const profiles = Object.keys(PROFILE_PERMISSIONS_CONFIG);
    const permissionKeys = Object.keys(
      PROFILE_PERMISSIONS_CONFIG[profiles[0]].permissions
    ) as Array<keyof ProfilePermissions["permissions"]>;

    // En-tête
    console.log(
      "Permission".padEnd(25) + profiles.map((p) => p.padEnd(12)).join("")
    );
    console.log("-".repeat(25 + profiles.length * 12));

    // Lignes des permissions
    permissionKeys.forEach((permission) => {
      let row = permission.padEnd(25);
      profiles.forEach((profile) => {
        const hasPermission =
          PROFILE_PERMISSIONS_CONFIG[profile].permissions[permission];
        row += (hasPermission ? "✅" : "❌").padEnd(12);
      });
      console.log(row);
    });

    console.log("\n💡 Légende: ✅ = Autorisé, ❌ = Interdit");
  }

  /**
   * Simule le test d'actions de traitement pour différents profils et états
   */
  static simulateTreatmentScenarios(): void {
    console.log("\n🎬 SIMULATION DES SCÉNARIOS DE TRAITEMENT");
    console.log("=".repeat(80));

    const statuses = ["Emise", "Confirmée", "Approuvée", "Validée", "Rejetée"];
    const profiles = Object.keys(PROFILE_PERMISSIONS_CONFIG);

    profiles.forEach((profileKey) => {
      const config = PROFILE_PERMISSIONS_CONFIG[profileKey];
      console.log(`\n👤 ${config.libelle} (${profileKey}):`);

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
        console.log(`  ${status.padEnd(12)} → ${actionText}`);
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
