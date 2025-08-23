# Documentation du processus d'authentification

## 🔐 Flux d'authentification à deux étapes

### Pour les nouveaux utilisateurs

1. **Étape 1 : Vérification du téléphone**

   - L'utilisateur saisit son numéro de téléphone
   - Le système vérifie si le numéro existe déjà
   - Un SMS avec code OTP est envoyé
   - Retour : `sessionId` et `isNewUser: true`

2. **Étape 2 : Vérification OTP**

   - L'utilisateur saisit le code reçu par SMS
   - Le système valide le code avec le `sessionId`
   - Si valide : retour d'un `tempToken` pour la configuration

3. **Étape 3 : Configuration du compte**
   - Saisie des informations personnelles (nom, prénom)
   - Email optionnel
   - Création du mot de passe
   - Finalisation avec le `tempToken`
   - Retour : tokens d'authentification finaux

### Pour les utilisateurs existants

1. **Étape 1 : Vérification du téléphone**

   - L'utilisateur saisit son numéro de téléphone
   - Le système reconnaît le numéro existant
   - Un SMS avec code OTP est envoyé
   - Retour : `sessionId` et `isNewUser: false`

2. **Étape 2 : Vérification OTP**

   - L'utilisateur saisit le code reçu par SMS
   - Le système valide le code
   - Redirection vers la connexion directe

3. **Étape 3 : Connexion directe**
   - Saisie du mot de passe uniquement
   - Authentification immédiate
   - Retour : tokens d'authentification

## 📱 Types d'interface

### AuthStep

- `PHONE_INPUT` : Saisie du numéro
- `OTP_VERIFICATION` : Vérification du code
- `ACCOUNT_SETUP` : Configuration pour nouveaux utilisateurs
- `DIRECT_LOGIN` : Connexion directe pour utilisateurs existants
- `AUTHENTICATED` : Utilisateur connecté

### Données utilisateur

```typescript
interface User {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  hasCompletedSetup: boolean;
  // ...
}
```

## 🛠️ Services API

### AuthService

- `verifyPhone()` : Envoie OTP au numéro
- `verifyOtp()` : Valide le code OTP
- `setupAccount()` : Configure le compte (nouveaux utilisateurs)
- `login()` : Connexion directe (utilisateurs existants)
- `checkPhoneExists()` : Vérifie l'existence du numéro
- `resendOtp()` : Renvoie un nouveau code

## 🎯 Hooks React Query

### Hooks principaux

- `useVerifyPhone()` : Vérification téléphone
- `useVerifyOtp()` : Vérification OTP
- `useSetupAccount()` : Configuration compte
- `useDirectLogin()` : Connexion directe
- `useResendOtp()` : Renvoi OTP

### Hook d'état

- `useAuthState()` : Gestion de l'état complet du processus

## 🎨 Composants

### AuthFlow

Composant principal orchestrant tout le processus :

- Gestion des étapes
- Transition entre les vues
- Gestion des erreurs
- Callbacks de succès/échec

### Sous-composants

- `PhoneInput` : Saisie du téléphone
- `OtpInput` : Saisie et vérification OTP
- `AccountSetup` : Configuration nouveaux comptes
- `DirectLogin` : Connexion utilisateurs existants

## 🔒 Sécurité

### Tokens

- **Token d'accès** : JWT court terme (15-30 min)
- **Refresh token** : Longue durée, stocké sécurisé
- **Temp token** : Token temporaire pour configuration compte

### Validation

- Numéro de téléphone au format international
- Code OTP à 6 chiffres
- Mot de passe sécurisé (min 8 caractères)
- Validation côté client et serveur

### Session

- Session OTP valide 5 minutes
- Possibilité de renvoyer le code (max 3 fois)
- Nettoyage automatique des sessions expirées
