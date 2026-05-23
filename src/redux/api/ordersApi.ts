import { baseApi } from "./baseApi";
import type { Order, OrderListParams, PaginatedResult } from "@/types";

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<PaginatedResult<Order>, OrderListParams>({
      query: (params) => ({
        url: "/admin/orders",
        params,
      }),
      providesTags: ["Orders"],
    }),
    cancelOrder: builder.mutation<Order, { id: string; note?: string }>({
      query: ({ id, note }) => ({
        url: `/admin/orders/${id}/cancel`,
        method: "POST",
        body: { note },
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetOrdersQuery, useCancelOrderMutation } = ordersApi;
