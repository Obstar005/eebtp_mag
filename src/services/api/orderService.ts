// import { apiClient } from './client';
import type {
  PurchaseOrder,
  PurchaseOrderItem,
  StockAlert,
  PaginatedResponse,
  OrderFilter,
  DashboardStats,
} from "../../types";

export class OrderService {
  // private readonly basePath = '/orders';

  // TODO: Implémenter les méthodes pour les commandes
  async getPurchaseOrders(
    _filter?: OrderFilter
  ): Promise<PaginatedResponse<PurchaseOrder>> {
    throw new Error("Not implemented");
  }

  async getPurchaseOrder(_id: string): Promise<PurchaseOrder> {
    throw new Error("Not implemented");
  }

  async createPurchaseOrder(
    _data: Omit<PurchaseOrder, "id" | "createdAt" | "updatedAt">
  ): Promise<PurchaseOrder> {
    throw new Error("Not implemented");
  }

  async updatePurchaseOrder(
    _id: string,
    _data: Partial<PurchaseOrder>
  ): Promise<PurchaseOrder> {
    throw new Error("Not implemented");
  }

  async deletePurchaseOrder(_id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async confirmPurchaseOrder(_id: string): Promise<PurchaseOrder> {
    throw new Error("Not implemented");
  }

  async cancelPurchaseOrder(_id: string): Promise<PurchaseOrder> {
    throw new Error("Not implemented");
  }

  async receivePurchaseOrder(
    _id: string,
    _items: { itemId: string; receivedQuantity: number }[]
  ): Promise<PurchaseOrder> {
    throw new Error("Not implemented");
  }

  // Méthodes pour les alertes
  async getStockAlerts(): Promise<StockAlert[]> {
    throw new Error("Not implemented");
  }

  async markAlertAsRead(_id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async markAllAlertsAsRead(): Promise<void> {
    throw new Error("Not implemented");
  }

  // Méthodes pour le dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    throw new Error("Not implemented");
  }
}

export const orderService = new OrderService();
