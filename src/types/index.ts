// Export de tous les types
export * from "./auth";
export * from "./product";
export * from "./stock";
export * from "./order";
export * from "./request";
export * from "./api";
export * from "./account";
export * from "./api-users";
export * from "./api-magasins";
export * from "./api-transformers-magasins";
export * from "./api-declarations";
export * from "./api-transformers-declarations";
export * from "./api-articles";
export * from "./api-transformers-articles";

// Export explicite pour éviter les conflits de noms
export type {
  Projet,
  CompteAssocie,
  ProjetRole,
  ProjetRoleLabels,
  CreateProjetData,
  UpdateProjetData,
  ProjetFilters,
  ProjetStatus,
  ProjetStatusLabels,
  ProjetStatusColors,
  ProjetWithDetails,
  ProjetStats,
  ProjetListResponse,
} from "./project";

export type {
  Magasin,
  CreateMagasinData,
  CreateMagasinRequest,
  UpdateMagasinData,
  UpdateMagasinRequest,
  StockArticle,
  CreateStockArticleData,
  UpdateStockArticleData,
  ArticleEtat,
  ArticleType,
  ArticleAction,
  MagasinFilter,
  StockArticleFilter,
  MagasinStats,
} from "./magasin";

export * from "./declaration";
