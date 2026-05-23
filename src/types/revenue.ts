export interface RevenueReport {
  from: string;
  to: string;
  totalPayments: number;
  totalCaptured: number;
  totalRefunded: number;
  netRevenue: number;
  platformRevenue: number;
  driverPayouts: number;
}

export interface RevenueParams {
  from?: string;
  to?: string;
}
