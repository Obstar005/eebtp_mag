# Hiérarchie des Traitements de Demandes de Ravitaillement

Ce document explique la hiérarchie et les permissions pour le traitement des demandes de ravitaillement digitalisées dans l'application EEBTP.

## Processus de Validation Hiérarchique

Basé sur l'image du processus fournie, la hiérarchie suit ces étapes :

```
Émission → Confirmation → Approbation → Validation/Rejet → Livraison
```

### 1. Émission

- **Responsable** : Magasinier
- **Action** : Créer une demande de ravitaillement
- **État résultant** : "Émise"

### 2. Confirmation

- **Responsables** : Chef Approvisionnement (`chef_appro`)
- **Prérequis** : Demande à l'état "Émise"
- **Action** : Confirmer la demande
- **État résultant** : "Confirmée"

### 3. Approbation

- **Responsables** :
  - Directeur Technique (`dt`)
  - Directeur des Travaux (`dtx`)
- **Prérequis** : Demande à l'état "Confirmée"
- **Action** : Approuver la demande
- **État résultant** : "Approuvée"

### 4. Validation/Rejet

- **Responsables** :
  - Directeur Général (`dg`)
  - Directeur Général Adjoint (`dga`)
  - Directeur Financier (`df`)
- **Prérequis** : Demande à l'état "Approuvée"
- **Actions possibles** :
  - Valider → État "Validée"
  - Rejeter → État "Rejetée"

### 5. Livraison

- **État final** : "Livrée"
- Une demande passe au statut livré lorsque le magasin a bien été ravitaillé

## Permissions Spéciales

### Hiérarchie de Permissions

Selon l'API backend, certains profils ont des permissions étendues :

- **Chef Approvisionnement** : Peut également approuver et valider (permissions de niveau supérieur)
- **Tous les profils autorisés** : Peuvent rejeter une demande à tout moment (sauf si état final)

### Règles de Rejet

- Possible à tout moment avant l'état final
- États finaux (pas de rejet possible) : "Validée", "Rejetée", "Livrée"
- Motif obligatoire pour un rejet

## Implémentation Technique

### Fichiers concernés

- `src/utils/permissions.ts` : Logique de permissions centralisée
- `src/components/requests/RequestTreatmentModal.tsx` : Interface de traitement
- `src/pages/RequestDetailPage.tsx` : Page de détail avec bouton conditionnel

### API Backend correspondante

```
POST /Demandes/demande/confirmer/{id}    - Chef Appro
POST /Demandes/demande/approuver/{id}    - Directeurs Technique/Travaux
POST /Demandes/demande/valider/{id}      - Directeurs Généraux/Financier
POST /Demandes/demande/rejeter/{id}      - Tous les profils autorisés
```

### Récupération du Profil Utilisateur

**Actuel (temporaire)** :

- Simulation basée sur `user.role` du contexte d'authentification
- Mapping : admin → dg, manager → chef_appro, employee → dt

**À implémenter** :

1. `GET /Users/authentication/user-info/` → récupérer `profil` (ID)
2. `GET /Users/profil-detail/{id}` → récupérer `libelle` du profil
3. Utiliser le `libelle` pour déterminer les permissions

## Tests et Validation

Pour tester la hiérarchie :

1. **Utilisateur "manager" (chef_appro)** sur demande "Émise" → doit voir "Confirmer"
2. **Utilisateur "employee" (dt)** sur demande "Confirmée" → doit voir "Approuver"
3. **Utilisateur "admin" (dg)** sur demande "Approuvée" → doit voir "Valider"
4. **Utilisateur sans permission** → ne doit pas voir le bouton "Traiter la demande"
5. **Demande en état final** → aucune action possible

## TODO : Intégration API Réelle

```typescript
// À implémenter dans src/utils/permissions.ts
export async function getUserProfileFromApi(): Promise<AuthorizedProfile | null> {
  try {
    // 1. Récupérer les infos utilisateur
    const userInfo = await authApiService.getUserInfo();

    // 2. Récupérer le profil complet
    if (userInfo.profil) {
      const profileResponse = await apiClient.get(
        `/Users/profil-detail/${userInfo.profil}`
      );
      return profileResponse.data.libelle; // "chef_appro", "dg", etc.
    }

    return null;
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    return null;
  }
}
```
