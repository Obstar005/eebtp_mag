# TODO : Intégration API Réelle pour les Profils Utilisateurs

## État Actuel

L'implémentation actuelle utilise une simulation temporaire des profils utilisateurs basée sur le champ `user.role` du contexte d'authentification.

### Mapping Temporaire

```typescript
// Dans src/utils/permissions.ts
function getUserProfileFromRole(userRole: string): AuthorizedProfile | null {
  switch (userRole) {
    case "admin":
      return "dg"; // Directeur Général
    case "manager":
      return "chef_appro"; // Chef Approvisionnement
    case "employee":
      return "dt"; // Directeur Technique
    default:
      return null;
  }
}
```

## Intégration API Réelle - Plan d'Action

### 1. Analyse de la Structure API

**Endpoint d'informations utilisateur** : `GET /Users/authentication/user-info/`

**Réponse attendue** :

```json
{
  "id": 1,
  "username": "john.doe",
  "first_name": "John",
  "last_name": "Doe",
  "profil": 3, // ← ID du profil à résoudre
  "telephone": "+33123456789"
  // ... autres champs
}
```

**Endpoint de détail profil** : `GET /Users/profil-detail/{id}`

**Réponse attendue** :

```json
{
  "id": 3,
  "libelle": "chef_appro", // ← Libellé utilisé pour les permissions
  "description": "Chef Approvisionnement",
  "is_active": true
  // ... autres champs
}
```

### 2. Service API à Créer

```typescript
// Dans src/services/api/userProfileService.ts

interface UserProfile {
  id: string;
  libelle: string;
  description: string;
  isActive: boolean;
}

interface UserWithProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  profileId?: number;
  profile?: UserProfile;
}

export class UserProfileService {
  /**
   * Récupérer les informations utilisateur complètes avec profil
   */
  async getCurrentUserWithProfile(): Promise<UserWithProfile | null> {
    try {
      // 1. Récupérer les infos utilisateur de base
      const userInfo = await authApiService.getUserInfo();

      // 2. Si un profil est assigné, le récupérer
      let profile: UserProfile | undefined;
      if (userInfo.profil) {
        const profileResponse = await apiClient.get<ApiProfil>(
          `/Users/profil-detail/${userInfo.profil}`
        );
        profile = apiProfilToProfile(profileResponse.data);
      }

      return {
        id: userInfo.id.toString(),
        username: userInfo.username,
        firstName: userInfo.first_name,
        lastName: userInfo.last_name,
        phone: userInfo.telephone,
        profileId: userInfo.profil,
        profile,
      };
    } catch (error) {
      console.error("Erreur récupération profil utilisateur:", error);
      return null;
    }
  }

  /**
   * Récupérer uniquement le libellé du profil pour les permissions
   */
  async getCurrentUserProfileLabel(): Promise<AuthorizedProfile | null> {
    const userWithProfile = await this.getCurrentUserWithProfile();
    return (userWithProfile?.profile?.libelle as AuthorizedProfile) || null;
  }
}
```

### 3. Mise à Jour du Context d'Authentification

```typescript
// Dans src/contexts/AuthContext.tsx

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null; // ← Ajouter le profil
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  refreshUserInfo: () => Promise<void>;
  refreshUserProfile: () => Promise<void>; // ← Nouvelle méthode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const userProfileService = new UserProfileService();

  const refreshUserProfile = async () => {
    try {
      const userWithProfile =
        await userProfileService.getCurrentUserWithProfile();
      setUserProfile(userWithProfile?.profile || null);
    } catch (error) {
      console.error("Erreur refresh profil:", error);
      setUserProfile(null);
    }
  };

  // Appeler lors du login et refresh
  const login = async (userData: User, token: string) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setUser(userData);

    // Récupérer le profil après connexion
    await refreshUserProfile();
  };
}
```

### 4. Mise à Jour des Fonctions de Permissions

```typescript
// Dans src/utils/permissions.ts

/**
 * Version mise à jour utilisant l'API réelle
 */
export function getAvailableTreatmentActions(
  user: User | null,
  requestStatus: string,
  userProfile?: UserProfile | null // ← Nouveau paramètre
): AvailableAction[] {
  if (!user) return [];

  // Utiliser le profil réel s'il est fourni
  const profileLabel =
    userProfile?.libelle || getUserProfileFromRole(user.role);
  if (!profileLabel) return [];

  // ... reste de la logique inchangée
}
```

### 5. Utilisation dans les Composants

```typescript
// Dans src/components/requests/RequestTreatmentModal.tsx

export default function RequestTreatmentModal({ ... }: RequestTreatmentModalProps) {
  const { user, userProfile } = useAuth();  // ← Récupérer le profil

  const availableActions = useMemo(() => {
    return getAvailableTreatmentActions(user, requestStatus, userProfile);
  }, [user, requestStatus, userProfile]);  // ← Ajouter userProfile aux dépendances
}
```

## Plan de Migration

### Phase 1 : Préparation

- [ ] Créer `UserProfileService`
- [ ] Tester les endpoints API manuellement
- [ ] Créer les types TypeScript appropriés

### Phase 2 : Intégration

- [ ] Mettre à jour `AuthContext` pour inclure le profil
- [ ] Modifier les fonctions de permissions
- [ ] Tester avec des données réelles

### Phase 3 : Migration

- [ ] Remplacer progressivement la simulation
- [ ] Ajouter gestion d'erreurs robuste
- [ ] Tests de non-régression

### Phase 4 : Finalisation

- [ ] Supprimer le code de simulation
- [ ] Documentation mise à jour
- [ ] Tests complets

## Points d'Attention

1. **Gestion des erreurs** : Que faire si l'API profil échoue ?
2. **Cache** : Faut-il mettre en cache le profil utilisateur ?
3. **Performance** : Éviter les appels API répétés
4. **Sécurité** : Validation côté serveur des permissions
5. **Tests** : Mocking pour les tests unitaires

## Questions pour l'équipe

- Les libellés de profils sont-ils standardisés dans la base de données ?
- Y a-t-il des profils avec des permissions spéciales non documentées ?
- Comment gérer les utilisateurs sans profil assigné ?
- Faut-il un fallback vers les rôles simples en cas d'échec ?
