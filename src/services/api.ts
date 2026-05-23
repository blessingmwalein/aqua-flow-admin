import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { storage, TOKEN_KEYS } from "@/utils/storage";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = storage.get(TOKEN_KEYS.ACCESS);
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = storage.get(TOKEN_KEYS.REFRESH);

      if (!refreshToken) {
        storage.remove(TOKEN_KEYS.ACCESS);
        storage.remove(TOKEN_KEYS.REFRESH);
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axiosInstance.post<{
          accessToken: string;
          refreshToken: string;
        }>("/auth/refresh", { refreshToken });

        storage.set(TOKEN_KEYS.ACCESS, data.accessToken);
        storage.set(TOKEN_KEYS.REFRESH, data.refreshToken);

        originalRequest.headers.set(
          "Authorization",
          `Bearer ${data.accessToken}`
        );

        return axiosInstance(originalRequest);
      } catch {
        storage.remove(TOKEN_KEYS.ACCESS);
        storage.remove(TOKEN_KEYS.REFRESH);
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
