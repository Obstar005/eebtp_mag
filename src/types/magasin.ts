// Types pour la gestion des magasins
export interface Magasin {
  id: number;
  name: string;
  project_id?: number;
  adresse?: string;
  description?: string;
  actions?: string; // JSON des actions possibles
  date_creation?: Date;
  date_mise_a_jour?: Date;

  // Relations
  projet?: {
    id: number;
    name: string;
  };
  stockItems?: StockArticle[];
  articlesCount?: number;
}

export interface CreateMagasinData {
  name: string;
  adresse?: string;
  project_id?: number;
}

export interface CreateMagasinRequest {
  name: string;
  adresse?: string;
  description?: string;
  projetId?: number;
}

export interface UpdateMagasinData {
  id: number;
  name?: string;
  adresse?: string;
}

export interface UpdateMagasinRequest {
  name?: string;
  adresse?: string;
  description?: string;
  projetId?: number;
}

// Types pour les articles de stock
export interface StockArticle {
  id: number;
  name: string;
  description?: string;
  quantite: number; // Quantité disponible
  quantite_seuil: number; // Quantité seuil
  etat: ArticleEtat;
  type_enum?: ArticleType;
  date_creation: Date;
  date_modif: Date;
  user_id: number; // Utilisateur responsable
  magasin_id: number;
  project_id?: number;
  prix_unitaire?: number;

  // Relations
  magasin?: Magasin;
  user?: {
    id: number;
    name: string;
    surname: string;
  };
  projet?: {
    id: number;
    name: string;
  };
}

export interface CreateStockArticleData {
  name: string;
  description?: string;
  quantite: number;
  quantite_seuil: number;
  etat: ArticleEtat;
  type_enum?: ArticleType;
  magasin_id: number;
  project_id?: number;
  prix_unitaire?: number;
}

export interface UpdateStockArticleData {
  id: number;
  name?: string;
  description?: string;
  quantite?: number;
  quantite_seuil?: number;
  etat?: ArticleEtat;
  type_enum?: ArticleType;
  prix_unitaire?: number;
}

// Énumérations pour les états des articles
export const ArticleEtat = {
  NEUF: "Neuf",
  USAGE: "Usagé",
  ABANDONNE: "Abandonné",
} as const;

export type ArticleEtat = (typeof ArticleEtat)[keyof typeof ArticleEtat];

export const ArticleType = {
  MATIERE_PREMIERE: "matiere_premiere",
  PRODUIT_FINI: "produit_fini",
  CONSOMMABLE: "consommable",
  EQUIPEMENT: "equipement",
} as const;

export type ArticleType = (typeof ArticleType)[keyof typeof ArticleType];

// Interface pour les actions sur les articles (modales)
export interface ArticleAction {
  type: "view" | "edit" | "delete";
  label: string;
  icon: string;
  color: string;
}

// Types pour les filtres
export interface MagasinFilter {
  search?: string;
  project_id?: number;
}

export interface StockArticleFilter {
  search?: string;
  magasin_id?: number;
  etat?: ArticleEtat;
  type_enum?: ArticleType;
}

// Types pour les statistiques des magasins
export interface MagasinStats {
  totalMagasins: number;
  totalArticles: number;
  articlesNeuf: number;
  articlesUsage: number;
  articlesAbandonne: number;
}
