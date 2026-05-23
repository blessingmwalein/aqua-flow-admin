import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/redux/store";
import { setCredentials, clearCredentials } from "@/redux/slices/authSlice";
import type { AuthUser } from "@/types";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3005/api/v1",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Unwrap the { success, data, timestamp } envelope the backend adds to every 2xx response
const baseQueryWithEnvelopeUnwrap: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.data !== undefined &&
    result.data !== null &&
    typeof result.data === "object" &&
    "success" in result.data &&
    "data" in result.data
  ) {
    return {
      ...result,
      data: (result.data as { success: boolean; data: unknown }).data,
    };
  }

  return result;
};

// Serializes concurrent token refreshes — a single in-flight refresh is shared
// by all requests that receive a 401 simultaneously.
let refreshing: Promise<boolean> | null = null;

function clearAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie =
      "aquaflow_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

function setAuthCookie(token: string) {
  if (typeof document !== "undefined") {
    document.cookie = `aquaflow_access_token=${token}; path=/; SameSite=Lax`;
  }
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQueryWithEnvelopeUnwrap(args, api, extraOptions);

  if (result.error?.status !== 401) return result;

  // Only one refresh attempt at a time; all concurrent 401s wait on the same promise
  if (!refreshing) {
    refreshing = (async (): Promise<boolean> => {
      const rt = (api.getState() as RootState).auth.refreshToken;
      if (!rt) return false;

      const res = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken: rt } },
        api,
        extraOptions,
      );

      // rawBaseQuery returns the raw envelope: { success, data: { accessToken, ... } }
      const envelope = res.data as
        | { data?: { accessToken: string; refreshToken: string; user: AuthUser } }
        | undefined;

      if (!envelope?.data?.accessToken) return false;

      const { accessToken, refreshToken: newRt, user } = envelope.data;
      api.dispatch(setCredentials({ user, accessToken, refreshToken: newRt }));
      setAuthCookie(accessToken);
      return true;
    })().finally(() => {
      refreshing = null;
    });
  }

  const refreshed = await refreshing;

  if (refreshed) {
    // Retry the original request — prepareHeaders will attach the new token
    return baseQueryWithEnvelopeUnwrap(args, api, extraOptions);
  }

  // Refresh failed: clear session and send to login
  api.dispatch(clearCredentials());
  clearAuthCookie();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  tagTypes: [
    "Auth",
    "Dashboard",
    "Users",
    "Drivers",
    "Orders",
    "Revenue",
    "Depots",
    "Inventory",
    "StockMovements",
    "Pricing",
    "Notifications",
  ],
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
