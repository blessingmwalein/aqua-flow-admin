import { baseApi } from "./baseApi";
import type {
  AppNotification,
  NotificationListParams,
  MarkReadRequest,
  PaginatedResult,
} from "@/types";

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      PaginatedResult<AppNotification>,
      NotificationListParams
    >({
      query: (params) => ({ url: "/notifications", params }),
      providesTags: ["Notifications"],
    }),
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notifications"],
    }),
    markNotificationsRead: builder.mutation<void, MarkReadRequest>({
      query: (body) => ({
        url: "/notifications/read",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationsReadMutation,
} = notificationsApi;
