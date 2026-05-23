import type { BottleSize, StockMovementType } from './pricing';
export type { BottleSize, StockMovementType };

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface Depot {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  managerId?: string;
  phoneNumber?: string;
  notes?: string;
  // Application / company fields (present for depots submitted via the application flow)
  applicantUserId?: string;
  companyName?: string;
  companyRegistrationNumber?: string;
  taxId?: string;
  contactEmail?: string;
  companyRegDocUrl?: string;
  taxClearanceDocUrl?: string;
  applicationStatus?: ApplicationStatus;
  applicationSubmittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  bottleSize: BottleSize;
  quantity: number;
  minThreshold: number;
  updatedAt: string;
}

export interface DepotInventory {
  depotId: string;
  items: InventoryItem[];
  lowStockAlerts?: BottleSize[];
}

export interface StockMovement {
  id: string;
  depotId: string;
  bottleSize: BottleSize;
  type: StockMovementType;
  quantity: number;
  balanceAfter: number;
  orderId?: string;
  performedBy: string;
  note?: string;
  createdAt: string;
}

export interface NearestDepotResult {
  depot: Depot;
  distanceKm: number;
}

export interface CreateDepotBody {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  managerId?: string;
  phoneNumber?: string;
  notes?: string;
  isActive?: boolean;
}

export type UpdateDepotBody = Partial<CreateDepotBody>;

export interface UpdateStockBody {
  bottleSize: BottleSize;
  type: StockMovementType;
  quantity: number;
  orderId?: string;
  note?: string;
}

export interface SetThresholdBody {
  bottleSize: BottleSize;
  minThreshold: number;
}

export interface DepotListParams {
  page?: number;
  limit?: number;
  onlyActive?: boolean;
}

export interface StockMovementListParams {
  page?: number;
  limit?: number;
}
