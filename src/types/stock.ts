// Types pour la gestion des mouvements de stock
export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  type: StockMovementType;
  quantity: number;
  unitPrice?: number;
  totalValue?: number;
  reason: string;
  reference?: string; // Référence du document (commande, facture, etc.)
  userId: string;
  user?: User;
  createdAt: string;
}

export const StockMovementType = {
  IN: "in", // Entrée de stock
  OUT: "out", // Sortie de stock
  ADJUSTMENT: "adjustment", // Ajustement d'inventaire
  TRANSFER: "transfer", // Transfert entre entrepôts
  LOSS: "loss", // Perte/Casse
  RETURN: "return", // Retour
} as const;

export type StockMovementType =
  (typeof StockMovementType)[keyof typeof StockMovementType];

export interface CreateStockMovementData {
  productId: string;
  type: StockMovementType;
  quantity: number;
  unitPrice?: number;
  reason: string;
  reference?: string;
}

// Types pour l'inventaire
export interface InventoryCheck {
  id: string;
  name: string;
  description?: string;
  status: InventoryStatus;
  startDate: string;
  endDate?: string;
  userId: string;
  user?: User;
  items: InventoryItem[];
  createdAt: string;
  updatedAt: string;
}

export const InventoryStatus = {
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type InventoryStatus =
  (typeof InventoryStatus)[keyof typeof InventoryStatus];

export interface InventoryItem {
  id: string;
  inventoryCheckId: string;
  productId: string;
  product?: Product;
  expectedQuantity: number;
  actualQuantity?: number;
  variance?: number;
  notes?: string;
  checkedAt?: string;
  checkedBy?: string;
}

import type { Product } from "./product";
import type { User } from "./auth";
