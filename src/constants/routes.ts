export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  USERS: "/users",
  USER_DETAIL: (id: string) => `/users/${id}`,
  DRIVERS: "/drivers",
  ORDERS: "/orders",
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  REVENUE: "/revenue",
  DEPOTS: "/depots",
  DEPOT_DETAIL: (id: string) => `/depots/${id}`,
  PRICING: "/pricing",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

export const PUBLIC_ROUTES = [ROUTES.LOGIN];
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.USERS,
  ROUTES.DRIVERS,
  ROUTES.ORDERS,
  ROUTES.REVENUE,
  ROUTES.DEPOTS,
  ROUTES.PRICING,
  ROUTES.SETTINGS,
  ROUTES.PROFILE,
];
