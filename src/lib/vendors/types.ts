// Common types for all food delivery vendors

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "unknown";

export interface OrderItem {
  name: string;
  quantity: number;
}

export interface Restaurant {
  id: string;
  name: string;
  imageUrl?: string;
  rating?: number;
  ratingCount?: string;
  locality?: string;
  address?: string;
  url?: string;
}

export interface Order {
  id: string;
  vendorId: string;
  accountId: string; // Linked to a specific account
  orderId: string;
  totalCost: string;
  orderDate: Date;
  orderDateFormatted: string;
  status: OrderStatus;
  statusLabel: string;
  items: OrderItem[];
  itemsSummary: string;
  restaurant: Restaurant;
  deliveryAddress: string;
  reorderUrl?: string;
  rawData?: unknown;
}

export interface PaginatedOrders {
  orders: Order[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export interface VendorCredentials {
  cookie: string;
}

export interface VendorInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Account {
  id: string;
  vendorId: string;
  name: string; // User-defined name like "Home", "Office"
  credentials: VendorCredentials;
  lastSync?: Date;
}

export interface VendorAdapter {
  // Metadata
  info: VendorInfo;

  // Authentication
  getAuthInstructions(): string;

  // Orders
  fetchOrders(
    credentials: VendorCredentials,
    page?: number,
  ): Promise<PaginatedOrders>;
}

// Error types
export class VendorError extends Error {
  constructor(
    message: string,
    public code:
      | "AUTH_FAILED"
      | "RATE_LIMITED"
      | "NETWORK_ERROR"
      | "PARSE_ERROR"
      | "UNKNOWN",
    public vendorId: string,
  ) {
    super(message);
    this.name = "VendorError";
  }
}
