'use client';

import * as React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

export function CustomSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = 'Select an option',
  disabled = false,
}: CustomSelectProps<T>) {
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
          <Select
            value={field.value ?? ''}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={name}
              aria-invalid={fieldState.error ? 'true' : undefined}
              className={
                fieldState.error
                  ? 'border-red-500 focus:ring-red-500 dark:border-red-500'
                  : undefined
              }
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
