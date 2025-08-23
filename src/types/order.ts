// Types pour les commandes et fournisseurs
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier?: Supplier;
  status: OrderStatus;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  totalAmount: number;
  notes?: string;
  items: PurchaseOrderItem[];
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
}

export const OrderStatus = {
  DRAFT: "draft",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PARTIALLY_RECEIVED: "partially_received",
  RECEIVED: "received",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// Types pour les alertes de stock
export interface StockAlert {
  id: string;
  productId: string;
  product?: Product;
  type: AlertType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const AlertType = {
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
  EXPIRED: "expired",
  EXPIRING_SOON: "expiring_soon",
} as const;

export type AlertType = (typeof AlertType)[keyof typeof AlertType];

import type { Supplier, Product } from "./product";
import type { User } from "./auth";
