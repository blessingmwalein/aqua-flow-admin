import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/redux/store";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1",
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

export const baseApi = createApi({
  reducerPath: "baseApi",
  tagTypes: ["Auth", "Dashboard", "Users", "Drivers", "Orders", "Revenue", "Depots", "Inventory", "StockMovements", "Pricing"],
  baseQuery: baseQueryWithEnvelopeUnwrap,
  endpoints: () => ({}),
});
