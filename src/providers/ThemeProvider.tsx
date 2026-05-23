'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { setTheme as setThemeAction } from '@/redux/slices/themeSlice';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Applies the correct class to <html> whenever theme state changes.
// Avoids next-themes' blocking <script> injection that Next.js 16 flags.
export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useAppSelector((state) => state.theme.theme);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    root.classList.toggle('dark', isDark);
  }, [theme]);

  // Also react to OS preference changes when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return <>{children}</>;
}

// Drop-in replacement for the next-themes useTheme hook
export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  return {
    theme,
    setTheme: (t: Theme) => dispatch(setThemeAction(t)),
    resolvedTheme:
      theme === 'system'
        ? typeof window !== 'undefined' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme,
  };
}
