export type BottleSize = '5L' | '10L' | '20L';
export type StockMovementType = 'restock' | 'dispatch' | 'adjustment' | 'return';

export interface PeakHourRange {
  start: number;
  end: number;
}

export interface SurgeConfig {
  enabled: boolean;
  multiplier: number;
  peakHours: PeakHourRange[];
}

export interface PricingConfig {
  id: string;
  name: string;
  isActive: boolean;
  baseDeliveryFee: number;
  bottlePrices: Record<string, number>;
  surgeConfig: SurgeConfig;
  effectiveFrom: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricingCalculationItem {
  bottleSize: BottleSize;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PricingCalculation {
  items: PricingCalculationItem[];
  subtotal: number;
  baseDeliveryFee: number;
  surgeMultiplier: number;
  surgeReason: string | null;
  total: number;
  configId: string;
  calculatedAt: string;
}

export interface CreatePricingConfigBody {
  name: string;
  baseDeliveryFee: number;
  bottlePrices: Record<string, number>;
  surgeConfig: SurgeConfig;
  effectiveFrom: string;
}

export interface PricingConfigListParams {
  page?: number;
  limit?: number;
}
