'use client';

import { Toaster } from 'sonner';
import { ReduxProvider } from './ReduxProvider';
import { ThemeProvider } from './ThemeProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
      <Toaster position="top-right" richColors />
    </ReduxProvider>
  );
}
