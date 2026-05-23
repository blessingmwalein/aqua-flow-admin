import { baseApi } from "./baseApi";
import type { RevenueReport, RevenueParams } from "@/types";

export const revenueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRevenue: builder.query<RevenueReport, RevenueParams | void>({
      query: (params) => ({
        url: "/admin/revenue",
        params: params ?? undefined,
      }),
      providesTags: ["Revenue"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetRevenueQuery } = revenueApi;
