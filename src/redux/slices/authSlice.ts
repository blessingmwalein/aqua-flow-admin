import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { TOKEN_KEYS, storage } from "@/utils/storage";
import type { AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface SetCredentialsPayload {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

const initialState: AuthState = {
  user: null,
  accessToken: storage.get(TOKEN_KEYS.ACCESS),
  refreshToken: storage.get(TOKEN_KEYS.REFRESH),
  isAuthenticated: Boolean(storage.get(TOKEN_KEYS.ACCESS)),
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<SetCredentialsPayload>) {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      storage.set(TOKEN_KEYS.ACCESS, accessToken);
      storage.set(TOKEN_KEYS.REFRESH, refreshToken);
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      storage.remove(TOKEN_KEYS.ACCESS);
      storage.remove(TOKEN_KEYS.REFRESH);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setLoading } =
  authSlice.actions;

export default authSlice.reducer;
