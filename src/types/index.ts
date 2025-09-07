// Export de tous les types
export * from "./auth";
export * from "./product";
export * from "./stock";
export * from "./order";
export * from "./request";
export * from "./api";
export * from "./account";

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
