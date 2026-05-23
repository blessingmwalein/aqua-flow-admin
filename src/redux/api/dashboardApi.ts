import { baseApi } from "./baseApi";
import type { DashboardStats } from "@/types";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardStats, void>({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardQuery } = dashboardApi;
