import axiosInstance from "./api";
import { storage, TOKEN_KEYS } from "@/utils/storage";
import type { LoginRequest, LoginResponse, LoginData } from "@/types";

export async function login(data: LoginRequest): Promise<LoginData> {
  // rememberMe is client-side only — backend only accepts email + password
  const { rememberMe: _rememberMe, ...payload } = data;
  const response = await axiosInstance.post<LoginResponse>("/auth/login", payload);
  // Unwrap the { success, data, timestamp } envelope
  return response.data.data;
}

export async function logout(): Promise<void> {
  try {
    await axiosInstance.post("/auth/logout");
  } catch {
    // fire-and-forget — swallow errors
  } finally {
    storage.remove(TOKEN_KEYS.ACCESS);
    storage.remove(TOKEN_KEYS.REFRESH);
  }
}

export async function refreshToken(
  token: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await axiosInstance.post<{
    accessToken: string;
    refreshToken: string;
  }>("/auth/refresh", { refreshToken: token });
  return response.data;
}

export function isAuthenticated(): boolean {
  return !!storage.get(TOKEN_KEYS.ACCESS);
}

const authService = {
  login,
  logout,
  refreshToken,
  isAuthenticated,
};

export default authService;
