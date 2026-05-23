'use client';

import * as React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderStatusPieProps {
  data: Array<{ name: string; value: number; color: string }>;
  isLoading?: boolean;
}

interface PiePayloadItem {
  name: string;
  value: number;
  payload: { color: string; total: number };
}

interface PieTooltipProps {
  active?: boolean;
  payload?: PiePayloadItem[];
}

function PieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const total = (entry.payload as { total?: number }).total ?? 0;
  const pct = total > 0 ? ((entry.value ?? 0) / total * 100).toFixed(1) : '0.0';
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-2 text-sm">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: entry.payload.color }}
        />
        <span className="text-gray-600 dark:text-gray-300">{entry.name}:</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {entry.value} ({pct}%)
        </span>
      </div>
    </div>
  );
}

export function OrderStatusPie({ data, isLoading = false }: OrderStatusPieProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-48 w-48 rounded-full" />
        <div className="flex flex-col gap-2 w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-28" />
          ))}
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  // Attach total to each payload item so tooltip can compute percentage
  const enrichedData = data.map((d) => ({ ...d, total }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={enrichedData}
          cx="50%"
          cy="50%"
          innerRadius={64}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
        >
          {enrichedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 13 }}
          formatter={(value) => (
            <span className="text-gray-600 dark:text-gray-300">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
