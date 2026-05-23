'use client';

import * as React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface CustomInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  icon?: React.ElementType;
}

export function CustomInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  icon: Icon,
}: CustomInputProps<T>) {
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
            {Icon && (
              <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            )}
            <input
              {...field}
              id={name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={fieldState.error ? 'true' : undefined}
              className={cn(
                'flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-900 shadow-sm transition-colors duration-200',
                'placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
                fieldState.error &&
                  'border-red-500 focus-visible:ring-red-500 dark:border-red-500',
                Icon && 'pl-9',
              )}
            />
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
