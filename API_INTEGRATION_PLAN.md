# Plan d'Intégration API EEBTP_MAG - Frontend

## 📋 Vue d'ensemble

Ce document détaille le plan d'intégration de l'API EEBTP_MAG avec le frontend React TypeScript existant. L'intégration se fera par étapes, en commençant par la gestion des projets et magasins.

## 🎯 API Analysée

- **Host**: `185.197.195.209:8000`
- **Protocole**: HTTP
- **Authentification**: Basic Auth (actuellement)
- **Format**: JSON
- **Version**: v3.7

## 🔍 Points Clés Identifiés

### 1. Différences de Structure
- **API**: Utilise `nom` pour les projets et magasins
- **Frontend**: Utilise `name` 
- **API**: Les IDs sont des entiers
- **Frontend**: Certains types utilisent des strings pour les IDs

### 2. Authentification
- **Actuel**: Basic Auth dans l'API
- **Frontend**: Système de tokens JWT préparé
- **Migration**: Le client est déjà configuré pour envoyer des tokens Bearer

### 3. Endpoints Disponibles pour Projets/Magasins

#### Projets
- `GET /Projets/liste-projets` - Liste des projets
- `GET /Projets/projet-detail/{id}` - Détails d'un projet
- `POST /Projets/projet-create` - Créer un projet
- `PUT /Projets/projet-update/{id}` - Mettre à jour un projet
- `DELETE /Projets/projet-delete/{id}` - Supprimer un projet

#### Magasins
- `GET /Projets/liste-magasins` - Liste des magasins
- `GET /Projets/magasin-detail/{id}` - Détails d'un magasin
- `POST /Projets/magasin-create` - Créer un magasin
- `PUT /Projets/magasin-update/{id}` - Mettre à jour un magasin
- `DELETE /Projets/magasin-delete/{id}` - Supprimer un magasin

#### Photos de Projets
- `GET /Projets/liste-photos-by-projet/{id}` - Photos d'un projet
- `POST /Projets/projet-photo-create/{id}` - Ajouter photo
- `PUT /Projets/projet-photo-update/{id}` - Mettre à jour photo
- `DELETE /Projets/projet-photo-delete/{id}` - Supprimer photo

## 🔧 Adaptations Nécessaires

### 1. Mapping des Types

#### Projet (API → Frontend)
```typescript
// API Definition
interface ProjetAPI {
  id: number;
  creator: number;
  comptes: number[];
  pays: string; // Nom complet du pays
  nom: string;
  description?: string;
  date_debut: string; // Format date
  date_fin?: string;
  date_creation: string; // ISO datetime
  date_modification: string;
  is_active: boolean;
}

// Frontend Type (à adapter)
interface Projet {
  id: number; // ✅ Compatible
  name: string; // ⚠️ Mapper depuis 'nom'
  description?: string; // ✅ Compatible
  date_debut: string; // ✅ Compatible
  date_fin?: string; // ✅ Compatible
  pays: string; // ⚠️ Convertir code pays → nom complet
  chef_projet_user_id: number; // ⚠️ Utiliser 'creator' ou système 'comptes'
  // ... autres champs de rôles
}
```

#### Magasin (API → Frontend)
```typescript
// API Definition
interface MagasinAPI {
  id: number;
  creator: number;
  nom: string;
  adresse?: string;
  projet?: number; // ID du projet
  date_creation: string;
  date_modification: string;
  is_active: boolean;
}

// Frontend Type (à adapter)
interface Magasin {
  id: number; // ✅ Compatible
  name: string; // ⚠️ Mapper depuis 'nom'
  adresse?: string; // ✅ Compatible
  project_id?: number; // ⚠️ Mapper depuis 'projet'
  // ... autres champs
}
```

### 2. Configuration du Client API

#### Authentification Hybride
```typescript
// client.ts - Mise à jour nécessaire
private setupInterceptors() {
  this.axiosInstance.interceptors.request.use(
    (config) => {
      // Vérifier d'abord si on a un token JWT
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Fallback vers Basic Auth si pas de token
        const username = import.meta.env.VITE_API_USERNAME;
        const password = import.meta.env.VITE_API_PASSWORD;
        if (username && password) {
          const basicAuth = btoa(`${username}:${password}`);
          config.headers.Authorization = `Basic ${basicAuth}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}
```

## 📋 Plan d'Intégration par Étapes

### ✅ Étape 1 : Préparation et Analyse
- [x] Analyser la documentation API
- [x] Examiner le code frontend existant
- [x] Identifier les écarts et adaptations nécessaires
- [x] Créer le plan d'intégration

### 🔄 Étape 2 : Adaptation des Types
- [ ] Créer des types API pour mapper les réponses
- [ ] Créer des fonctions de transformation API ↔ Frontend
- [ ] Mettre à jour les types existants si nécessaire

### 🔄 Étape 3 : Services API Réels
- [ ] Remplacer `projetService` mock par implémentation réelle
- [ ] Remplacer `magasinService` mock par implémentation réelle
- [ ] Implémenter la gestion des photos de projets

### 🔄 Étape 4 : Configuration Authentification
- [ ] Modifier le client API pour l'authentification hybride
- [ ] Tester avec Basic Auth d'abord
- [ ] Préparer la migration vers tokens JWT

### 🔄 Étape 5 : Tests et Validation
- [ ] Tester toutes les opérations CRUD
- [ ] Valider la gestion d'erreurs
- [ ] Tester l'upload de photos

## ⚠️ Points d'Attention

### 1. Gestion des Rôles dans les Projets
L'API semble utiliser un système de `comptes` (array d'IDs) plutôt que des rôles spécifiques. Il faudra :
- Clarifier comment mapper les rôles (chef_projet, directeur_travaux, etc.)
- Comprendre la structure du champ `comptes`
- Éventuellement adapter l'interface utilisateur

### 2. Gestion des Pays
- API utilise les noms complets de pays
- Frontend utilise des codes (TG, FR, etc.)
- Nécessite une fonction de mapping bidirectionnelle

### 3. Upload de Photos
L'API supporte l'upload de photos pour les projets mais la structure exacte n'est pas claire dans la documentation Swagger.

### 4. Articles/Stock
L'API a des endpoints pour les articles (`/Stocks/`) mais le frontend appelle ça "stock articles". Vérifier la cohérence.

## 🎯 Questions à Clarifier

### Sur l'API
1. **Authentification** : Quand et comment passer de Basic Auth à JWT ?
2. **Rôles Projets** : Comment le système `comptes` mappe-t-il aux rôles spécifiques ?
3. **Upload Photos** : Quel est le format exact pour l'upload d'images ?
4. **Pagination** : L'API supporte-t-elle la pagination ? Format des réponses ?
5. **Filtres** : Quels paramètres de filtrage sont supportés ?

### Sur l'Intégration
1. **Migration Progressive** : Garder les mocks en parallèle pendant les tests ?
2. **Gestion d'Erreurs** : Format des erreurs retournées par l'API ?
3. **Variables d'Environnement** : Quelles configs pour Basic Auth en attendant JWT ?

## 🚀 Prochaines Étapes

**Avant de continuer, j'ai besoin de clarifications sur :**

1. **Le système d'authentification** : Devons-nous commencer avec Basic Auth ou attendre l'implémentation JWT ?

2. **La structure des rôles** : Comment les `comptes` dans l'API correspondent-ils aux rôles spécifiques du frontend ?

3. **La stratégie de migration** : Voulez-vous que je commence par créer les services API réels en parallèle des mocks, ou remplacer directement ?

4. **Les variables d'environnement** : Dois-je ajouter des variables pour les credentials Basic Auth ?

Une fois ces points clarifiés, nous pourrons passer à l'étape 2 d'adaptation des types et commencer l'implémentation.