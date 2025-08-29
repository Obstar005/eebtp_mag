# Documentation des Entités - EEBTP MAG

## Vue d'ensemble

Ce document décrit la structure des différentes entités du système de gestion des stocks EEBTP MAG, basé sur le schéma de base de données fourni et l'analyse du code existant.

## 🏗️ Architecture des Entités

### 📋 Entités Principales

## 1. 👤 User (Utilisateur)

**Table :** `User`

```typescript
interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string; // Hash
  birth_date: Date;
  nationality: string; // Code pays
  secondary_date: Date;
  phone: string;
  profile_id: number;
  is_active: boolean;
  type_enum: UserType;
  created_date: Date;
  last_login_date?: Date;
  modified_date: Date;

  // Relations
  profile?: Profile;
  declarations?: Declaration[];
  stockItems?: StockItem[];
  demandes?: Demande[];
  projets?: Projet[]; // En tant que manager, chef chantier, etc.
}

enum UserType {
  INTERNE = "Interne",
  CONSULTANT = "Consultant",
}
```

**Fonctionnalités :**

- Authentification multi-étapes (téléphone + OTP + configuration)
- Gestion des profils et rôles
- Historique des connexions
- Association aux projets selon le rôle

---

## 2. 👥 Profile (Profil)

**Table :** `Profile`

```typescript
interface Profile {
  id: number;
  name: string; // Ex: Magasinier, Directeur Général, Chef Projet
  description?: string;

  // Relations
  users?: User[];
}
```

**Profils disponibles :**

- Magasinier
- Directeur Général
- Chef Projet
- Chef Chantier
- Chef Appro

---

## 3. 🏗️ Projet

**Table :** `Projet`

```typescript
interface Projet {
  id: number;
  name: string; // Nom du projet
  description?: string;
  date_creation: Date;
  date_debut: Date;
  date_fin: Date;
  date_modif: Date;
  date_mise_a_jour: Date;
  pays: string; // Code pays (ex: TG, BF)
  chef_projet_user_id: number;
  directeur_travaux_user_id: number;
  chef_chantier_user_id: number;
  coordinateur_travaux_user_id: number;
  chef_equipe_user_id: number;
  server_boolean: boolean;

  // Relations
  chefProjet?: User;
  directeurTravaux?: User;
  chefChantier?: User;
  coordinateurTravaux?: User;
  chefEquipe?: User;
  magasins?: Magasin[];
  stockItems?: StockItem[];
}
```

**Fonctionnalités :**

- Gestion complète du cycle de vie des projets
- Attribution des rôles spécialisés
- Association avec pays et magasins
- Téléchargement d'images de projet
- Comptes associés avec rôles spécifiques

---

## 4. 🏪 Magasin

**Table :** `Magasin`

```typescript
interface Magasin {
  id: number;
  name: string;
  project_id?: number;
  adresse?: string;
  actions?: string; // JSON des actions possibles

  // Relations
  projet?: Projet;
  stockItems?: StockItem[];
  demandes?: Demande[];
}
```

---

## 5. 📦 StockItem (Article en Stock)

**Table :** `StockItem`

```typescript
interface StockItem {
  id: number;
  name: string;
  description?: string;
  quantite: number; // Quantité disponible (float)
  quantite_float: number;
  type_enum: StockItemType;
  date_creation: Date;
  date_modif: Date;
  date_approuvation?: Date;
  date_reception?: Date;
  user_id: number; // Utilisateur responsable
  magasin_id: number;
  project_id?: number;
  prix_unitaire: number; // Prix unitaire (float)

  // Relations
  user?: User;
  magasin?: Magasin;
  projet?: Projet;
  demandes?: Demande[];
}

enum StockItemType {
  MATIERE_PREMIERE = "matiere_premiere",
  PRODUIT_FINI = "produit_fini",
  CONSOMMABLE = "consommable",
}
```

---

## 6. 📋 Demande (Demandes de Matériel)

**Table :** `Demande`

```typescript
interface Demande {
  id: number;
  number: number; // Numéro de demande auto-généré
  stock_item_id: number;
  magasin_id: number;
  quantite: number; // Quantité demandée (float)
  statut: DemandeStatut;
  date_creation: Date;
  emis_par: number; // User ID
  date_emission: Date;
  confirme_par?: number; // User ID
  date_confirmation?: Date;
  date_modif: Date;
  approuve_par?: number; // User ID
  date_approbation?: Date;
  valide_par?: number; // User ID
  date_validation?: Date;

  // Relations
  stockItem?: StockItem;
  magasin?: Magasin;
  emetteur?: User;
  confirmateur?: User;
  approbateur?: User;
  validateur?: User;
}

enum DemandeStatut {
  EMIS = "emis",
  CONFIRME = "confirme",
  APPROUVE = "approuve",
  VALIDE = "valide",
  LIVRE = "livre",
}
```

---

## 7. 📊 Declaration (Déclarations)

**Table :** `Declaration`

```typescript
interface Declaration {
  id: number;
  type_enum: DeclarationType;
  stock_item_id: number;
  quantite_float: number;
  date_creation: Date;
  date_modif: Date;
  date_approbation?: Date;
  date_voeux_livrer_string?: string;
  user_id: number;
  magasin_id: number;

  // Relations
  stockItem?: StockItem;
  user?: User;
  magasin?: Magasin;
}

enum DeclarationType {
  ENTREE = "entree",
  SORTIE = "sortie",
  AJUSTEMENT = "ajustement",
}
```

---

## 🔄 Relations et Flux de Données

### Workflow des Demandes

```
1. EMIS → 2. CONFIRME → 3. APPROUVE → 4. VALIDE → 5. LIVRE
```

### Hiérarchie des Projets

```
Projet
├── Chef Projet (chef_projet_user_id)
├── Directeur Travaux (directeur_travaux_user_id)
├── Chef Chantier (chef_chantier_user_id)
├── Coordinateur Travaux (coordinateur_travaux_user_id)
└── Chef Équipe (chef_equipe_user_id)
```

### Gestion des Stocks

```
StockItem
├── Appartient à un Magasin
├── Peut être associé à un Projet
├── Géré par un User (responsable)
└── Fait l'objet de Demandes
```

---

## 🎯 Fonctionnalités par Module

### Module Authentification

- ✅ Inscription multi-étapes
- ✅ Connexion sécurisée
- ✅ Gestion des profils
- ✅ Protection des routes

### Module Comptes

- ✅ CRUD des utilisateurs
- ✅ Gestion des profils
- ✅ Attribution des rôles
- ✅ Interface complète

### Module Projets

- 🔄 **À implémenter**
- Création/édition des projets
- Attribution des rôles spécialisés
- Gestion des magasins associés
- Upload d'images
- Tableau de bord projet

### Module Stock

- 🔄 **À implémenter**
- Gestion des articles
- Mouvements de stock
- Inventaires
- Alertes

### Module Demandes

- ✅ Workflow complet
- ✅ Statuts et validations
- ✅ Interface utilisateur
- ✅ Filtres et recherche

### Module Rapports

- ✅ Interface de base
- 🔄 Données dynamiques à connecter
- Export des données
- Tableaux de bord

---

## 📈 Prochaines Étapes

1. **Compléter le Module Projets**

   - Types TypeScript
   - Services API
   - Hooks React Query
   - Interface utilisateur

2. **Module Stock & Inventaire**

   - Gestion des articles
   - Mouvements et déclarations
   - Alertes automatiques

3. **Intégration Base de Données**

   - API REST conforme au schéma
   - Validation des données
   - Tests d'intégration

4. **Optimisations**
   - Performance
   - UX/UI
   - Sécurité

---

## 🔧 Technologies Utilisées

- **Frontend:** React 19 + TypeScript + Vite
- **State Management:** TanStack React Query
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Forms:** React Hook Form (à ajouter)
- **API:** REST avec Axios
