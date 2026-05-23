import { baseApi } from "./baseApi";
import type { LoginRequest, LoginResponse, LoginData, RefreshResponse } from "@/types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginData, LoginRequest>({
      query: ({ rememberMe: _rememberMe, ...credentials }) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      // Unwrap the { success, data, timestamp } envelope before storing
      transformResponse: (response: LoginResponse) => response.data,
      invalidatesTags: ["Auth"],
    }),
    refreshToken: builder.mutation<RefreshResponse, string>({
      query: (refreshToken) => ({
        url: "/auth/refresh",
        method: "POST",
        body: { refreshToken },
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRefreshTokenMutation } = authApi;
