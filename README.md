# EEBTP_MAG Frontend - Application de Gestion des Magasins

Application frontend React + TypeScript + Vite pour la gestion des magasins et demandes de ravitaillement EEBTP.

## 🎯 Nouveau Système de Permissions - Basé sur les Profils API

### Architecture des Permissions

Cette application implémente un système de permissions sophistiqué basé sur les **profils réels de l'API EEBTP** pour le traitement des demandes de ravitaillement.

**Processus de validation hiérarchique** : Émission → Confirmation → Approbation → Validation/Rejet → Livraison

#### Profils Officiels EEBTP

- **`magasinier`** : Gestion des stocks uniquement (pas de traitement de demandes)
- **`dt`** : Directeur Technique - Confirmer et Approuver
- **`dtx`** : Directeur des Travaux - Confirmer et Approuver
- **`dga`** : Directeur Général Adjoint - Toutes actions incluant Validation
- **`Admin`** : Administrateur système - Permissions complètes

#### Fonctionnalités Implementées

✅ **Service de permissions centralisé** : `ProfilePermissionService` avec cache et gestion d'erreurs  
✅ **Hook personnalisés** : `usePermissions`, `useTreatmentActions`, `usePermissionCheck`  
✅ **Configuration modulaire** : Permissions par profil dans `permissionConfig.ts`  
✅ **Modal intelligent** : Actions filtrées selon profil + état de demande  
✅ **Rendu conditionnel** : UI adaptée aux permissions utilisateur  
✅ **Validation asynchrone** : Intégration avec API pour récupérer profils  
✅ **Page de test complète** : Interface de debug et validation du système

### Architecture des Fichiers

#### 🎯 Services Core

- `src/services/profilePermissionService.ts` - Service principal avec cache
- `src/utils/permissionsNew.ts` - Fonctions utilitaires asynchrones
- `src/utils/permissionConfig.ts` - Configuration des permissions par profil

#### 🪝 Hooks Personnalisés

- `src/hooks/usePermissions.ts` - Hook complet pour permissions
  - `usePermissions()` - État complet + méthodes de vérification
  - `usePermissionCheck()` - Vérification simple synchrone
  - `useTreatmentActions()` - Actions de traitement disponibles
  - `useConditionalRender()` - Composants conditionnels

#### 🎨 Composants Mis à Jour

- `src/components/requests/RequestTreatmentModal.tsx` - Modal avec actions filtrées
- `src/pages/RequestDetailPageNew.tsx` - Exemple d'utilisation du nouveau système
- `src/pages/PermissionTestPage.tsx` - Interface de test et debug
- `src/pages/PermissionDemoPage.tsx` - Démonstrations d'utilisation

#### � Documentation

- `MIGRATION_PERMISSIONS.md` - Guide de migration détaillé
- `PERMISSIONS_HIERARCHY.md` - Documentation de l'ancien système
- Ce README mis à jour

### Utilisation du Nouveau Système

#### Exemple 1: Hook de base

```typescript
import { usePermissions } from "../hooks/usePermissions";

function MyComponent() {
  const { permissions, canApproveRequests, canManageUsers, isLoading } =
    usePermissions();

  if (canApproveRequests) {
    return <ApprovalButton />;
  }
}
```

#### Exemple 2: Actions de traitement

```typescript
import { useTreatmentActions } from "../hooks/usePermissions";

function RequestActions({ status }) {
  const { actions, canTreat, isLoading } = useTreatmentActions(status);

  return (
    <div>
      {actions.map((action) => (
        <button key={action.value}>{action.label}</button>
      ))}
    </div>
  );
}
```

#### Exemple 3: Vérification simple

```typescript
import { usePermissionCheck } from "../hooks/usePermissions";

function StockManagement() {
  const canManage = usePermissionCheck("canManageStock");

  if (!canManage) return <AccessDenied />;
  return <StockInterface />;
}
```

### Configuration des Permissions

Chaque profil dispose de permissions granulaires :

```typescript
// Exemple: Directeur des Travaux (dtx)
{
  canConfirmRequest: true,     // ✅ Peut confirmer
  canApproveRequest: true,     // ✅ Peut approuver
  canValidateRequest: false,   // ❌ Seuls DGA/Admin peuvent valider
  canRejectRequest: true,      // ✅ Peut rejeter
  canManageStock: true,        // ✅ Gestion stocks autorisée
  canManageUsers: false,       // ❌ Pas de gestion utilisateurs
  canAccessAdminPanel: false,  // ❌ Pas d'accès admin
  // ... autres permissions
}
```

### API Intégration

**État actuel** : Système compatible avec mapping temporaire `user.role`
**Prochaine étape** : Intégration complète avec l'API EEBTP

````typescript
// À implémenter dans authApiService.getUserInfo()
const response = await apiClient.get("/Users/authentication/user-info/");
const profileDetail = await apiClient.get(`/Users/profil-detail/${response.data.id_profil}`);
// Utiliser profileDetail.libelle pour les permissions
```typescript
// Récupération du vrai profil depuis l'API
GET /Users/authentication/user-info/ → profil (ID)
GET /Users/profil-detail/{id} → libelle du profil
````

### Comment Tester

1. **Dans la console du navigateur** :

   ```javascript
   // Tests automatiques de la hiérarchie
   window.testPermissions.exempleTestsHierarchie();
   window.testPermissions.exempleTestsAvecProfilsSpecifiques();
   ```

2. **Interface utilisateur** :
   - Connectez-vous avec différents rôles (`admin`, `manager`, `employee`)
   - Accédez à une demande de ravitaillement
   - Observez les actions disponibles selon votre profil et l'état de la demande

## 🚀 Setup et Développement

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
