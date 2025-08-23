# Flux d'Authentification Simplifié

## 🔄 Nouveau flux (Version 1.0)

Le nouveau flux d'authentification simplifié **supprime l'OTP** pour une expérience plus directe :

```
Téléphone → Mot de passe → (Inscription si nouveau) → Authentifié
```

## 📱 Étapes du processus

### 1. Saisie du téléphone

- Utilisateur sélectionne son pays (avec drapeaux)
- Saisit son numéro de téléphone
- Validation du format automatique

### 2. Vérification et mot de passe

- Le système vérifie si le numéro existe
- **Utilisateur existant** : Demande du mot de passe
- **Nouvel utilisateur** : Demande de création du mot de passe + confirmation

### 3. Inscription (nouveaux utilisateurs uniquement)

- Saisie des informations personnelles (prénom, nom, email optionnel)
- Création du compte automatique

## 🛠️ Architecture technique

### Nouveaux composants créés

- `SimpleAuthFlow` : Orchestrateur principal
- `PasswordInputPage` : Page de saisie/création du mot de passe
- `useSimpleAuth` : Hooks pour le nouveau flux

### Services utilisés

- `countriesService` : Gestion des pays avec API REST Countries
- `MockAuthService` : Service simulé avec utilisateurs de test
- Types TypeScript pour la sécurité

### Utilisateurs de test

```
Téléphone: +22890123456 | Mot de passe: 123456 | Nom: John Doe
Téléphone: +22891234567 | Mot de passe: password | Nom: Marie Dupont
```

## 🎯 Avantages

✅ **Plus simple** : Seulement 2-3 étapes vs 4-5 avec OTP  
✅ **Plus rapide** : Pas d'attente SMS  
✅ **Moins d'erreurs** : Pas de codes à taper  
✅ **Réutilisable** : Architecture modulaire  
✅ **Test facile** : Utilisateurs mock intégrés

## 🔧 Pour tester

1. Lancer `pnpm run dev`
2. Utiliser un des comptes de test ou créer un nouveau
3. Le flux s'adapte automatiquement (nouveau vs existant)

## 📦 Fichiers modifiés/créés

**Nouveaux fichiers :**

- `/src/components/auth/SimpleAuthFlow.tsx`
- `/src/components/auth/PasswordInputPage.tsx`
- `/src/hooks/useSimpleAuth.ts`

**Fichiers modifiés :**

- `/src/types/auth.ts` (nouveaux types)
- `/src/services/api/authService.ts` (nouvelles méthodes)
- `/src/services/api/mockService.ts` (support simplifié + utilisateurs test)
- `/src/App.tsx` (utilise SimpleAuthFlow)

**Fichiers conservés :**

- Tous les anciens composants restent disponibles
- `AuthFlow` original intact pour compatibilité
- Services existants préservés
