import { baseApi } from "./baseApi";
import type { Driver, DriverDocument, DriverListParams, PaginatedResult } from "@/types";

export const driversApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDrivers: builder.query<PaginatedResult<Driver>, DriverListParams>({
      query: (params) => ({
        url: "/admin/drivers",
        params,
      }),
      providesTags: ["Drivers"],
    }),
    approveDriver: builder.mutation<Driver, string>({
      query: (id) => ({
        url: `/admin/drivers/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["Drivers"],
    }),
    rejectDriver: builder.mutation<Driver, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/drivers/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Drivers"],
    }),
    getDriverDocuments: builder.query<DriverDocument[], string>({
      query: (id) => `/drivers/${id}/documents`,
      providesTags: (_r, _e, id) => [{ type: "Drivers", id: `docs-${id}` }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDriversQuery,
  useApproveDriverMutation,
  useRejectDriverMutation,
  useGetDriverDocumentsQuery,
} = driversApi;
