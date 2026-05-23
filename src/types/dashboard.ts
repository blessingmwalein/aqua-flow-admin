export interface OrderCounts {
  pending: number;
  matching: number;
  active: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface RevenueSummary {
  totalCaptured: number;
  totalRefunded: number;
  netRevenue: number;
  platformRevenue: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDrivers: number;
  approvedDrivers: number;
  pendingDrivers: number;
  orders: OrderCounts;
  revenue: RevenueSummary;
  activeDepots: number;
  generatedAt: string;
}
