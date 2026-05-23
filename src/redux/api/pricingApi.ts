import { baseApi } from "./baseApi";
import type {
  PricingConfig,
  PricingCalculation,
  CreatePricingConfigBody,
  PricingConfigListParams,
  PaginatedResult,
  BottleSize,
} from "@/types";

export const pricingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivePricingConfig: builder.query<PricingConfig, void>({
      query: () => "/pricing/config/active",
      providesTags: ["Pricing"],
    }),
    getPricingHistory: builder.query<PaginatedResult<PricingConfig>, PricingConfigListParams>({
      query: (params) => ({ url: "/pricing/config/history", params }),
      providesTags: ["Pricing"],
    }),
    getPricingConfigById: builder.query<PricingConfig, string>({
      query: (id) => `/pricing/config/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Pricing", id }],
    }),
    createPricingConfig: builder.mutation<PricingConfig, CreatePricingConfigBody>({
      query: (body) => ({ url: "/pricing/config", method: "POST", body }),
      invalidatesTags: ["Pricing"],
    }),
    updatePricingConfig: builder.mutation<
      PricingConfig,
      { id: string; body: Partial<CreatePricingConfigBody> }
    >({
      query: ({ id, body }) => ({ url: `/pricing/config/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Pricing"],
    }),
    activatePricingConfig: builder.mutation<PricingConfig, string>({
      query: (id) => ({ url: `/pricing/config/${id}/activate`, method: "POST" }),
      invalidatesTags: ["Pricing"],
    }),
    calculatePrice: builder.mutation<
      PricingCalculation,
      { items: { bottleSize: BottleSize; quantity: number }[] }
    >({
      query: (body) => ({ url: "/pricing/calculate", method: "POST", body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetActivePricingConfigQuery,
  useGetPricingHistoryQuery,
  useGetPricingConfigByIdQuery,
  useCreatePricingConfigMutation,
  useUpdatePricingConfigMutation,
  useActivatePricingConfigMutation,
  useCalculatePriceMutation,
} = pricingApi;
