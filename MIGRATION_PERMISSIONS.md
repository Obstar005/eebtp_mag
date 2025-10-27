# Guide de Migration - Système de Permissions avec Profils API

## 📋 Vue d'ensemble

Ce guide explique comment migrer vers le nouveau système de permissions basé sur les profils réels de l'API EEBTP.

### Ancienne approche vs Nouvelle approche

**🔴 Ancienne approche (à supprimer)**

- Permissions basées sur des rôles fictifs (`admin`, `manager`, `employee`)
- Mapping manuel hardcodé dans `permissions.ts`
- Logique synchrone limitée

**🟢 Nouvelle approche (à adopter)**

- Permissions basées sur les profils réels API (`dtx`, `dt`, `dga`, `Admin`, `magasinier`)
- Configuration centralisée dans `permissionConfig.ts`
- Service de permissions avec cache et gestion d'erreurs
- Hook personnalisé pour faciliter l'utilisation

## 🗂️ Architecture du Nouveau Système

### 1. Structure des Fichiers

```
src/
├── services/
│   └── profilePermissionService.ts    # Service principal pour les permissions
├── utils/
│   ├── permissionsNew.ts             # Nouvelles fonctions utilitaires (async)
│   ├── permissionConfig.ts           # Configuration des permissions par profil
│   └── permissions.ts                # ❌ À SUPPRIMER après migration
├── hooks/
│   └── usePermissions.ts             # Hook personnalisé pour les composants
└── pages/
    ├── PermissionTestPage.tsx        # Page de test du système
    └── RequestDetailPageNew.tsx      # Exemple d'usage du nouveau système
```

### 2. Flux de Données

```
API EEBTP
    ↓
/Users/authentication/user-info/ → profil (id)
    ↓
/Users/profil-detail/{id} → libelle (dtx, dt, dga, Admin, magasinier)
    ↓
permissionConfig.ts → permissions par profil
    ↓
Composant React (via usePermissions hook)
```

## 🔧 Guide de Migration Étape par Étape

### Étape 1: Mise à jour du Type User

**Fichier:** `src/types/auth.ts`

```typescript
// AVANT
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string; // ❌ Rôle générique
  // ... autres propriétés
}

// APRÈS
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string; // Garder pour compatibilité temporaire
  profileId?: string; // 🟢 NOUVEAU: ID du profil API
  profileLibelle?: string; // 🟢 NOUVEAU: Libelle du profil (dtx, dt, etc.)
  // ... autres propriétés
}
```

### Étape 2: Mise à jour du Service d'Authentification

**Fichier:** `src/services/api/authApiService.ts`

```typescript
// Modifier getUserInfo() pour inclure les informations de profil
async getUserInfo(): Promise<User> {
  try {
    const response = await apiClient.get<ApiCustomUser>(
      "/Users/authentication/user-info/"
    );

    const apiUser = response.data;
    let profileLibelle: string | undefined;

    // Récupérer les détails du profil si id_profil est présent
    if (apiUser.id_profil) {
      try {
        const profileResponse = await apiClient.get<ApiProfil>(
          `/Users/profil-detail/${apiUser.id_profil}`
        );
        profileLibelle = profileResponse.data.libelle;
      } catch (profileError) {
        console.warn("Impossible de récupérer les détails du profil:", profileError);
      }
    }

    const user: User = {
      ...apiUserToUser(apiUser),
      profileId: apiUser.id_profil?.toString(),
      profileLibelle,
    };

    return user;
  } catch (error) {
    console.error("Erreur lors de la récupération des infos utilisateur:", error);
    throw error;
  }
}
```

### Étape 3: Mise à jour du Service de Permissions

**Fichier:** `src/services/profilePermissionService.ts`

```typescript
// Modifier getUserPermissions() pour utiliser le vrai profileId
async getUserPermissions(user: User): Promise<ProfilePermissions | null> {
  // 🟢 NOUVEAU: Utiliser le profileId de l'utilisateur
  if (user.profileId) {
    return this.getProfilePermissions(user.profileId);
  }

  // 🟢 NOUVEAU: Utiliser le profileLibelle directement si disponible
  if (user.profileLibelle) {
    const mockProfileId = `profile_${user.profileLibelle}`;
    const mockProfile: Profile = {
      id: mockProfileId,
      nom: user.profileLibelle,
      description: `Profil ${user.profileLibelle}`
    };

    // Mettre en cache le profil
    this.profilesCache.set(mockProfileId, mockProfile);

    return this.getProfilePermissions(mockProfileId);
  }

  // ❌ FALLBACK TEMPORAIRE: Mapping basé sur le rôle (à supprimer)
  const roleToProfileMapping: Record<string, string> = {
    "admin": "Admin",
    "manager": "dt",
    "employee": "magasinier",
  };

  const profileLibelle = roleToProfileMapping[user.role];
  if (profileLibelle) {
    const mockProfileId = `profile_${profileLibelle}`;
    const mockProfile: Profile = {
      id: mockProfileId,
      nom: profileLibelle,
      description: `Profil ${profileLibelle} (mappé depuis rôle)`
    };

    this.profilesCache.set(mockProfileId, mockProfile);
    return this.getProfilePermissions(mockProfileId);
  }

  console.warn(`Aucun profil mappé pour l'utilisateur:`, user);
  return null;
}
```

### Étape 4: Migration des Composants

**Avant (ancien système):**

```typescript
import { canUserTreatRequest } from "../utils/permissions";

const canTreat = useMemo(() => {
  return canUserTreatRequest(user, request?.status || "");
}, [user, request]);
```

**Après (nouveau système):**

```typescript
import { useTreatmentActions } from "../hooks/usePermissions";

const { actions, canTreat, isLoading } = useTreatmentActions(
  request?.status || ""
);
```

### Étape 5: Mise à jour du Contexte d'Authentification

**Fichier:** `src/contexts/AuthContext.tsx`

```typescript
// Ajouter une fonction pour recharger les permissions
const refreshUserInfo = async () => {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("Aucun token d'authentification");
    }

    // 🟢 NOUVEAU: Récupérer les infos complètes avec profil
    const userInfo = await authApiService.getUserInfo();
    localStorage.setItem("user_data", JSON.stringify(userInfo));
    setUser(userInfo);

    // 🟢 NOUVEAU: Vider le cache des permissions pour forcer le rechargement
    profilePermissionService.clearCache();
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des infos utilisateur:",
      error
    );
    logout();
  }
};
```

## 🧪 Tests et Validation

### Page de Test

Utilisez la page `PermissionTestPage` pour:

1. Vérifier la configuration des permissions
2. Tester les scénarios de traitement
3. Valider le mapping des profils
4. Déboguer les problèmes de permissions

**URL:** `/test-permissions` (à ajouter aux routes)

### Tests Console

```javascript
// Dans la console du navigateur
window.PermissionTester.testAllProfiles();
window.PermissionTester.showPermissionMatrix();
window.PermissionTester.simulateTreatmentScenarios();
```

### Tests Unitaires

```typescript
// Exemple de test pour le service de permissions
describe("ProfilePermissionService", () => {
  it("should return correct permissions for dtx profile", async () => {
    const permissions = await profilePermissionService.getProfilePermissions(
      "dtx-profile-id"
    );
    expect(permissions?.permissions.canApproveRequest).toBe(true);
    expect(permissions?.permissions.canValidateRequest).toBe(false);
  });
});
```

## 🚀 Plan de Déploiement

### Phase 1: Préparation (🟡 En cours)

- [x] Créer le nouveau service de permissions
- [x] Créer les hooks personnalisés
- [x] Créer la page de test
- [x] Documenter le système

### Phase 2: Intégration API (🔄 Prochaine étape)

- [ ] Mettre à jour le type User
- [ ] Modifier authApiService.getUserInfo()
- [ ] Tester avec de vrais profils API
- [ ] Valider la récupération des permissions

### Phase 3: Migration des Composants

- [ ] Migrer RequestTreatmentModal
- [ ] Migrer RequestDetailPage
- [ ] Migrer autres composants utilisant les permissions
- [ ] Mettre à jour les tests existants

### Phase 4: Nettoyage

- [ ] Supprimer l'ancien système (`permissions.ts`)
- [ ] Supprimer les mappings temporaires
- [ ] Optimiser les performances
- [ ] Documentation finale

## 🔍 Points d'Attention

### 1. Performance

- Le service utilise un cache pour éviter les appels API répétés
- Les hooks sont optimisés avec useMemo/useCallback
- Prévoir un système de fallback en cas d'erreur API

### 2. Gestion d'Erreurs

- Permissions par défaut très restrictives en cas d'erreur
- Logs détaillés pour le débogage
- Messages d'erreur utilisateur appropriés

### 3. Sécurité

- Validation côté serveur obligatoire
- Les permissions frontend sont pour l'UX uniquement
- Ne jamais faire confiance aux permissions côté client pour la sécurité

### 4. Compatibilité

- Maintenir l'ancien système en parallèle pendant la migration
- Tests de régression complets
- Rollback possible en cas de problème

## 📚 Ressources

- **Configuration des permissions:** `src/utils/permissionConfig.ts`
- **Service principal:** `src/services/profilePermissionService.ts`
- **Hook d'utilisation:** `src/hooks/usePermissions.ts`
- **Page de test:** `src/pages/PermissionTestPage.tsx`
- **Documentation API:** `api-docs.json` (endpoints `/Users/`)

## 🤝 Support

Pour toute question sur la migration:

1. Consulter la page de test `/test-permissions`
2. Vérifier les logs de la console
3. Examiner les exemples dans `permissionConfig.ts`
4. Tester avec différents profils utilisateur
