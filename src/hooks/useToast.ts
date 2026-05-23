'use client';

import { toast } from 'sonner';

interface PromiseOptions<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((err: unknown) => string);
}

interface UseToastReturn {
  success(message: string, description?: string): void;
  error(message: string, description?: string): void;
  warning(message: string, description?: string): void;
  info(message: string, description?: string): void;
  promise<T>(promise: Promise<T>, opts: PromiseOptions<T>): void;
}

export function useToast(): UseToastReturn {
  return {
    success(message: string, description?: string): void {
      toast.success(message, { description });
    },

    error(message: string, description?: string): void {
      toast.error(message, { description });
    },

    warning(message: string, description?: string): void {
      toast.warning(message, { description });
    },

    info(message: string, description?: string): void {
      toast.info(message, { description });
    },

    promise<T>(promise: Promise<T>, opts: PromiseOptions<T>): void {
      toast.promise(promise, {
        loading: opts.loading,
        success: opts.success,
        error: opts.error,
      });
    },
  };
}
