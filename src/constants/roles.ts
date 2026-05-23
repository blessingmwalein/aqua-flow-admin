import { UserRole } from "@/types";

export const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];

export const ROLE_LABELS: Record<string, string> = {
  customer: "Customer",
  driver: "Driver",
  admin: "Admin",
  super_admin: "Super Admin",
};

export const PERMISSIONS = {
  MANAGE_USERS: ["admin", "super_admin"],
  MANAGE_DRIVERS: ["admin", "super_admin"],
  MANAGE_ORDERS: ["admin", "super_admin"],
  VIEW_REVENUE: ["admin", "super_admin"],
  MANAGE_SETTINGS: ["super_admin"],
} as const;
