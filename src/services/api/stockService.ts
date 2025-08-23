// import { apiClient } from './client';
import type {
  StockMovement,
  CreateStockMovementData,
  InventoryCheck,
  InventoryItem,
  PaginatedResponse,
  StockMovementFilter,
  StockReport,
} from "../../types";

export class StockService {
  // private readonly basePath = '/stock';

  // TODO: Implémenter les méthodes pour les mouvements de stock
  async getStockMovements(
    _filter?: StockMovementFilter
  ): Promise<PaginatedResponse<StockMovement>> {
    throw new Error("Not implemented");
  }

  async createStockMovement(
    _data: CreateStockMovementData
  ): Promise<StockMovement> {
    throw new Error("Not implemented");
  }

  async getProductStock(_productId: string): Promise<number> {
    throw new Error("Not implemented");
  }

  async getStockReport(): Promise<StockReport[]> {
    throw new Error("Not implemented");
  }

  // Méthodes pour l'inventaire
  async getInventoryChecks(): Promise<InventoryCheck[]> {
    throw new Error("Not implemented");
  }

  async createInventoryCheck(
    _data: Omit<InventoryCheck, "id" | "createdAt" | "updatedAt" | "items">
  ): Promise<InventoryCheck> {
    throw new Error("Not implemented");
  }

  async updateInventoryCheck(
    _id: string,
    _data: Partial<InventoryCheck>
  ): Promise<InventoryCheck> {
    throw new Error("Not implemented");
  }

  async deleteInventoryCheck(_id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async updateInventoryItem(
    _id: string,
    _data: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    throw new Error("Not implemented");
  }

  async completeInventoryCheck(_id: string): Promise<InventoryCheck> {
    throw new Error("Not implemented");
  }
}

export const stockService = new StockService();
