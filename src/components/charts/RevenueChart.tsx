'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatDate } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number; platformRevenue: number }>;
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

const GRAD_REVENUE = 'gradRevenue';
const GRAD_PLATFORM = 'gradPlatform';

function RevenueTooltip({ active, payload, label }: ChartTooltipProps) {
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
            {formatCurrency(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({ data, isLoading = false }: RevenueChartProps) {
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
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={GRAD_REVENUE} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={GRAD_PLATFORM} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDate(v, 'MMM d')}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v, 'USD', 'en-US').replace('.00', '')}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip content={<RevenueTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 13 }}
          formatter={(value) => (
            <span className="text-gray-600 dark:text-gray-300">{value}</span>
          )}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Total Revenue"
          stroke="#3b82f6"
          strokeWidth={2}
          fill={`url(#${GRAD_REVENUE})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="platformRevenue"
          name="Platform Revenue"
          stroke="#10b981"
          strokeWidth={2}
          fill={`url(#${GRAD_PLATFORM})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
