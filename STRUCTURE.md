# Structure du projet de gestion de stocks

## 📁 Architecture des dossiers

```
src/
├── types/                    # Types TypeScript
│   ├── auth.ts              # Types pour l'authentification
│   ├── product.ts           # Types pour les produits
│   ├── stock.ts             # Types pour le stock et inventaire
│   ├── order.ts             # Types pour les commandes
│   ├── api.ts               # Types génériques pour l'API
│   └── index.ts             # Export de tous les types
│
├── services/                 # Services API
│   └── api/
│       ├── client.ts        # Client HTTP configuré (Axios)
│       ├── authService.ts   # Service d'authentification
│       ├── productService.ts # Service des produits
│       ├── stockService.ts  # Service du stock
│       ├── orderService.ts  # Service des commandes
│       └── index.ts         # Export de tous les services
│
├── hooks/                    # Hooks React Query
│   ├── useAuth.ts           # Hooks d'authentification
│   ├── useProducts.ts       # Hooks des produits
│   ├── useStock.ts          # Hooks du stock
│   ├── useOrders.ts         # Hooks des commandes
│   └── index.ts             # Export de tous les hooks
│
├── router/                   # Configuration du routing
│   ├── index.ts             # Configuration React Router
│   └── routes.ts            # Définition des chemins de routes
│
├── components/               # Composants réutilisables
│   ├── ui/                  # Composants UI de base (Button, Input, etc.)
│   ├── auth/                # Composants d'authentification
│   ├── products/            # Composants spécifiques aux produits
│   ├── stock/               # Composants spécifiques au stock
│   └── orders/              # Composants spécifiques aux commandes
│
├── layouts/                  # Layouts de l'application
│   ├── RootLayout.tsx       # Layout principal
│   ├── AuthLayout.tsx       # Layout pour les pages d'auth
│   └── DashboardLayout.tsx  # Layout du dashboard
│
├── pages/                    # Pages de l'application
│   ├── auth/                # Pages d'authentification
│   ├── dashboard/           # Page du dashboard
│   ├── products/            # Pages des produits
│   ├── suppliers/           # Pages des fournisseurs
│   ├── stock/               # Pages du stock
│   ├── inventory/           # Pages d'inventaire
│   ├── orders/              # Pages des commandes
│   ├── reports/             # Pages de rapports
│   ├── settings/            # Pages de paramètres
│   ├── profile/             # Page de profil
│   └── errors/              # Pages d'erreur
│
├── context/                  # Contextes React
│   ├── AuthContext.tsx      # Contexte d'authentification
│   └── ThemeContext.tsx     # Contexte du thème
│
└── utils/                    # Utilitaires
    ├── api.ts               # Utilitaires API
    ├── auth.ts              # Utilitaires d'authentification
    ├── format.ts            # Fonctions de formatage
    └── validation.ts        # Schémas de validation
```

## 🔧 Technologies utilisées

- **React** + **TypeScript** - Interface utilisateur
- **React Router** - Navigation
- **React Query** - Gestion des requêtes HTTP et cache
- **Axios** - Client HTTP
- **Vite** - Build tool

## 📋 Fonctionnalités principales

### 🔐 Authentification

- **Processus en 3 étapes pour nouveaux utilisateurs :**
  1. Saisie du numéro de téléphone
  2. Vérification OTP par SMS
  3. Configuration du compte (nom, prénom, email optionnel, mot de passe)
- **Connexion directe pour utilisateurs existants :**
  - Numéro de téléphone + mot de passe
  - Ou email + mot de passe (si configuré)
- Gestion des rôles utilisateur
- Protection des routes
- Tokens JWT avec refresh automatique

### 📦 Gestion des produits

- CRUD des produits
- Gestion des catégories
- Gestion des fournisseurs
- Upload d'images
- Code-barres

### 📊 Gestion du stock

- Suivi des niveaux de stock
- Mouvements de stock (entrées/sorties)
- Alertes de stock bas
- Rapports de stock

### 📋 Inventaire

- Contrôles d'inventaire
- Ajustements de stock
- Historique des inventaires

### 🛒 Commandes

- Commandes fournisseurs
- Suivi des livraisons
- Réception des marchandises

### 📈 Rapports

- Tableaux de bord
- Statistiques
- Exports

## ⚙️ Configuration

### Variables d'environnement

```env
VITE_API_URL=http://localhost:3000/api
```

### Scripts disponibles

- `pnpm dev` - Démarrage en mode développement
- `pnpm build` - Build de production
- `pnpm preview` - Aperçu du build

## 🚀 Prochaines étapes

1. Implémenter les méthodes des services API
2. Créer les composants UI de base
3. Développer les pages principales
4. Ajouter la validation des formulaires
5. Implémenter l'authentification
6. Configurer Tailwind CSS pour le styling
