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
    description?: string;
    date_debut?: Date;
    date_fin?: Date;
    status?: string;
    budget?: number;
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
  article_id?: number; // ID du produit catalogue
  name: string;
  description?: string;
  type_enum?: ArticleType;
  unite?: ArticleUnite; // Unité de mesure
  etat?: string; // État de l'article (neuf, usagé, abandonné)
  quantite?: number;
  quantite_seuil?: number;
  prix_unitaire?: number;
  date_creation: Date;
  date_modif: Date;
  user_id: number; // Utilisateur responsable
  magasin_id: number;
  project_id?: number;

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
  type_enum?: ArticleType;
  unite?: ArticleUnite;
  etat?: string;
  quantite?: number;
  quantite_seuil?: number;
  prix_unitaire?: number;
  magasin_id: number;
  project_id?: number;
  article_id?: number;
}

export interface UpdateStockArticleData {
  id: number;
  name?: string;
  description?: string;
  quantite?: number;
  quantite_seuil?: number;
  type_enum?: ArticleType;
  unite?: ArticleUnite;
  etat?: string;
  prix_unitaire?: number;
  magasin_id?: number;
  article_id?: number;
}

// Énumérations pour les états des articles
export const ArticleEtat = {
  NEUF: "neuf",
  USAGE: "usagé",
  ENDOMMAGE: "endommagé",
} as const;

export type ArticleEtat = (typeof ArticleEtat)[keyof typeof ArticleEtat];

// Types d'articles
export const ArticleType = {
  MATIERE_PREMIERE: "matiere_premiere",
  EQUIPEMENT: "equipement",
  CONSOMMABLE: "consommable",
  PRODUIT_FINI: "produit_fini",
} as const;

export type ArticleType = (typeof ArticleType)[keyof typeof ArticleType];

// Unités de mesure pour les articles (correspond à l'API)
export const ArticleUnite = {
  LITRE: "litre",
  KG: "kg",
  M3: "m3",
  UNITE: "unite",
  M: "m",
  AUTRE: "autre",
} as const;

export type ArticleUnite = (typeof ArticleUnite)[keyof typeof ArticleUnite];

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
  type_enum?: ArticleType;
}

// Types pour les statistiques des magasins
export interface MagasinStats {
  totalMagasins: number;
  totalArticles: number;
  articlesNeuf: number;
  articlesUsage: number;
  articlesEndommage: number;
}
