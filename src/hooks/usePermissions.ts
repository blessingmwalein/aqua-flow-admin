'use client';

import { useAppSelector } from '@/redux/store';
import { PERMISSIONS } from '@/constants/roles';
import type { UserRole } from '@/types';

interface UsePermissionsReturn {
  canManageUsers: boolean;
  canManageDrivers: boolean;
  canManageOrders: boolean;
  canViewRevenue: boolean;
  canManageSettings: boolean;
  hasRole(role: UserRole): boolean;
  hasAnyRole(roles: UserRole[]): boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role ?? null;

  const hasRole = (target: UserRole): boolean => role === target;

  const hasAnyRole = (roles: UserRole[]): boolean =>
    role !== null && roles.includes(role);

  return {
    canManageUsers: role !== null && (PERMISSIONS.MANAGE_USERS as readonly string[]).includes(role),
    canManageDrivers: role !== null && (PERMISSIONS.MANAGE_DRIVERS as readonly string[]).includes(role),
    canManageOrders: role !== null && (PERMISSIONS.MANAGE_ORDERS as readonly string[]).includes(role),
    canViewRevenue: role !== null && (PERMISSIONS.VIEW_REVENUE as readonly string[]).includes(role),
    canManageSettings: role !== null && (PERMISSIONS.MANAGE_SETTINGS as readonly string[]).includes(role),
    hasRole,
    hasAnyRole,
  };
}
