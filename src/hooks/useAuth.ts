'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { setCredentials, clearCredentials, setLoading } from '@/redux/slices/authSlice';
import authService from '@/services/auth';
import type { AuthUser, LoginRequest, UserRole } from '@/types';

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login(data: LoginRequest): Promise<void>;
  logout(): Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const role = user?.role ?? null;
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';

  const login = useCallback(
    async (data: LoginRequest): Promise<void> => {
      dispatch(setLoading(true));
      try {
        const response = await authService.login(data);
        dispatch(
          setCredentials({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          }),
        );
        // Mirror token to cookie so proxy/middleware can read it
        document.cookie = `aquaflow_access_token=${response.accessToken}; path=/; SameSite=Lax`;
        router.push('/dashboard');
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, router],
  );

  const logout = useCallback(async (): Promise<void> => {
    dispatch(setLoading(true));
    try {
      await authService.logout();
    } finally {
      dispatch(clearCredentials());
      // Clear the cookie mirror
      document.cookie =
        'aquaflow_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      dispatch(setLoading(false));
      router.push('/login');
    }
  }, [dispatch, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    role,
    isAdmin,
    isSuperAdmin,
    login,
    logout,
  };
}
