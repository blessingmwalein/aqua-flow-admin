import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storageLib from "redux-persist/lib/storage";

// SSR-safe storage: use noop on server, localStorage on client
const createNoopStorage = () => ({
  getItem(_key: string): Promise<null> { return Promise.resolve(null); },
  setItem(_key: string, value: string): Promise<string> { return Promise.resolve(value); },
  removeItem(_key: string): Promise<void> { return Promise.resolve(); },
});
const storage = typeof window !== "undefined" ? storageLib : createNoopStorage();
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

import { baseApi } from "./api/baseApi";

// Slice reducers
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import uiReducer from "./slices/uiSlice";
import notificationReducer from "./slices/notificationSlice";

// redux-persist configs
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "accessToken", "refreshToken", "isAuthenticated"],
};

const themePersistConfig = {
  key: "theme",
  storage,
};

const rootReducer = combineReducers({
  // RTK Query — single baseApi with all injected endpoints
  [baseApi.reducerPath]: baseApi.reducer,

  // Persisted slices
  auth: persistReducer(authPersistConfig, authReducer),
  theme: persistReducer(themePersistConfig, themeReducer),

  // Non-persisted slices
  ui: uiReducer,
  notifications: notificationReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
