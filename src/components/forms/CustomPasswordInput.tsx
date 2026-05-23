'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface CustomPasswordInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CustomPasswordInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  disabled = false,
}: CustomPasswordInputProps<T>) {
  const [visible, setVisible] = React.useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5 w-full">
          <label
            htmlFor={name}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
          <div className="relative">
            <input
              {...field}
              id={name}
              type={visible ? 'text' : 'password'}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={fieldState.error ? 'true' : undefined}
              className={cn(
                'flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 pr-10 text-sm text-gray-900 shadow-sm transition-colors duration-200',
                'placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
                fieldState.error &&
                  'border-red-500 focus-visible:ring-red-500 dark:border-red-500',
              )}
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              disabled={disabled}
              aria-label={visible ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300 disabled:pointer-events-none"
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldState.error && (
            <p className="text-xs text-red-500 dark:text-red-400" role="alert">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
