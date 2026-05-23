import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  isLoading?: boolean;
}

export function MetricCard({ label, value, subLabel, isLoading = false }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <CardContent className="p-0 flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-36" />
          {subLabel !== undefined && <Skeleton className="h-3.5 w-20" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardContent className="p-0 flex flex-col gap-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {value}
        </p>
        {subLabel && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
