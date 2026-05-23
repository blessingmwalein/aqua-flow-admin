'use client';

import * as React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';

interface CustomTextareaProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export function CustomTextarea<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  rows = 4,
  disabled = false,
}: CustomTextareaProps<T>) {
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
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            error={fieldState.error?.message}
            aria-invalid={fieldState.error ? 'true' : undefined}
          />
        </div>
      )}
    />
  );
}
