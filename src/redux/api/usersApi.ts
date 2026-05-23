import { baseApi } from "./baseApi";
import type {
  UserProfile,
  UserListParams,
  UpdateUserRequest,
  PaginatedResult,
} from "@/types";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResult<UserProfile>, UserListParams>({
      query: (params) => ({
        url: "/admin/users",
        params,
      }),
      providesTags: ["Users"],
    }),
    getUserById: builder.query<UserProfile, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),
    updateUser: builder.mutation<
      UserProfile,
      { id: string; data: UpdateUserRequest }
    >({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} = usersApi;
