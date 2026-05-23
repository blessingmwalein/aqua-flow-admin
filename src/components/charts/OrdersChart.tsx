'use client';

import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatDate } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface OrdersChartProps {
  data: Array<{ date: string; completed: number; cancelled: number }>;
  isLoading?: boolean;
}

interface TooltipEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function OrdersTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
        {formatDate(label as string)}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-gray-600 dark:text-gray-300">{entry.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function OrdersChart({ data, isLoading = false }: OrdersChartProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDate(v, 'MMM d')}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<OrdersTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 13 }}
          formatter={(value) => (
            <span className="text-gray-600 dark:text-gray-300">{value}</span>
          )}
        />
        <Bar dataKey="completed" name="Completed" stackId="orders" fill="#3b82f6" radius={[0, 0, 0, 0]} />
        <Bar dataKey="cancelled" name="Cancelled" stackId="orders" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
