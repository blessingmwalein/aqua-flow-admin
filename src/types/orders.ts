export type OrderStatus =
  | "pending"
  | "matching"
  | "driver_assigned"
  | "accepted"
  | "picked_up"
  | "delivering"
  | "delivered"
  | "completed"
  | "cancelled";

export type CancellationReason =
  | "customer_request"
  | "driver_unavailable"
  | "out_of_stock"
  | "payment_failed"
  | "driver_rejected"
  | "admin_action"
  | "timeout"
  | "other";

export interface OrderItem {
  bottleSize: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatusEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  actorId?: string;
}

export interface Order {
  id: string;
  customerId: string;
  depotId: string;
  driverId?: string;
  items: OrderItem[];
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  status: OrderStatus;
  statusHistory: OrderStatusEntry[];
  totalAmount: number;
  paymentIntentId?: string;
  cancellationReason?: string;
  cancellationNote?: string;
  estimatedDeliveryAt?: string;
  actualDeliveryAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  customerId?: string;
  driverId?: string;
  depotId?: string;
}

export interface CancelOrderRequest {
  note?: string;
}
