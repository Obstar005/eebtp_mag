// Types génériques pour l'API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Types pour les filtres et recherche
export interface BaseFilter {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProductFilter extends BaseFilter {
  categoryId?: string;
  supplierId?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export interface StockMovementFilter extends BaseFilter {
  productId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderFilter extends BaseFilter {
  supplierId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Types pour les statistiques
export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  recentMovements: number;
  pendingOrders: number;
}

export interface StockReport {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  value: number;
  lastMovement?: string;
}
