export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    USER: (id: string) => `/admin/users/${id}`,
    DRIVERS: "/admin/drivers",
    APPROVE_DRIVER: (id: string) => `/admin/drivers/${id}/approve`,
    REJECT_DRIVER: (id: string) => `/admin/drivers/${id}/reject`,
    ORDERS: "/admin/orders",
    CANCEL_ORDER: (id: string) => `/admin/orders/${id}/cancel`,
    REVENUE: "/admin/revenue",
  },
} as const;
