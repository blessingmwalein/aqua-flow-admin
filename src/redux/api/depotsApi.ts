import { baseApi } from "./baseApi";
import type {
  Depot,
  DepotInventory,
  DepotListParams,
  StockMovement,
  StockMovementListParams,
  CreateDepotBody,
  UpdateDepotBody,
  UpdateStockBody,
  SetThresholdBody,
  InventoryItem,
  PaginatedResult,
} from "@/types";

export const depotsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDepots: builder.query<PaginatedResult<Depot>, DepotListParams>({
      query: (params) => ({ url: "/depots", params }),
      providesTags: ["Depots"],
    }),
    getActiveDepots: builder.query<Depot[], void>({
      query: () => "/depots/active",
      providesTags: ["Depots"],
    }),
    getDepotById: builder.query<Depot, string>({
      query: (id) => `/depots/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Depots", id }],
    }),
    createDepot: builder.mutation<Depot, CreateDepotBody>({
      query: (body) => ({ url: "/depots", method: "POST", body }),
      invalidatesTags: ["Depots"],
    }),
    updateDepot: builder.mutation<Depot, { id: string; body: UpdateDepotBody }>({
      query: ({ id, body }) => ({ url: `/depots/${id}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => ["Depots", { type: "Depots", id }],
    }),
    deleteDepot: builder.mutation<void, string>({
      query: (id) => ({ url: `/depots/${id}`, method: "DELETE" }),
      invalidatesTags: ["Depots"],
    }),
    getDepotInventory: builder.query<DepotInventory, string>({
      query: (id) => `/depots/${id}/inventory`,
      providesTags: (_r, _e, id) => [{ type: "Inventory", id }],
    }),
    addStockMovement: builder.mutation<StockMovement, { id: string; body: UpdateStockBody }>({
      query: ({ id, body }) => ({ url: `/depots/${id}/stock`, method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Inventory", id },
        { type: "StockMovements", id },
      ],
    }),
    setThreshold: builder.mutation<InventoryItem, { id: string; body: SetThresholdBody }>({
      query: ({ id, body }) => ({ url: `/depots/${id}/threshold`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Inventory", id }],
    }),
    getStockMovements: builder.query<
      PaginatedResult<StockMovement>,
      { id: string; params?: StockMovementListParams }
    >({
      query: ({ id, params }) => ({ url: `/depots/${id}/stock-movements`, params }),
      providesTags: (_r, _e, { id }) => [{ type: "StockMovements", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDepotsQuery,
  useGetActiveDepotsQuery,
  useGetDepotByIdQuery,
  useCreateDepotMutation,
  useUpdateDepotMutation,
  useDeleteDepotMutation,
  useGetDepotInventoryQuery,
  useAddStockMovementMutation,
  useSetThresholdMutation,
  useGetStockMovementsQuery,
} = depotsApi;
