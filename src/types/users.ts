import type { UserRole } from "./auth";
export type { UserRole };

export type UserStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending_verification";

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneNumber?: string;
  photoUrl?: string;
  fcmToken?: string;
  address?: UserAddress;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  status?: UserStatus;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  status?: UserStatus;
  role?: UserRole;
}
