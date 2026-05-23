// Check at call-time, not module-load time, to avoid stale SSR capture
export const storage = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },
  set(key: string, value: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },
  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },
};

export const TOKEN_KEYS = {
  ACCESS: "aquaflow_access_token",
  REFRESH: "aquaflow_refresh_token",
} as const;
