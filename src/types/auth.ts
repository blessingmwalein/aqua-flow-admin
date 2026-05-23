export type UserRole = "customer" | "driver" | "admin" | "super_admin";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status?: string;
  emailVerified?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// The backend wraps all successful responses in this envelope
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

// What the login endpoint actually returns
export type LoginResponse = ApiEnvelope<LoginData>;

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
