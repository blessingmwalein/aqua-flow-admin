'use client';

import * as React from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Banknote,
  Users,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MetricCard } from '@/components/cards';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Skeleton,
} from '@/components/ui';
import { useGetRevenueQuery } from '@/redux/api/revenueApi';
import { useToast } from '@/hooks';
import { formatCurrency, formatDate } from '@/utils';
import { subDays, format } from 'date-fns';

function toInputDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export default function RevenuePage() {
  const toast = useToast();

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  const [fromInput, setFromInput] = React.useState(toInputDate(defaultFrom));
  const [toInput, setToInput] = React.useState(toInputDate(defaultTo));
  const [appliedFrom, setAppliedFrom] = React.useState(toInputDate(defaultFrom));
  const [appliedTo, setAppliedTo] = React.useState(toInputDate(defaultTo));

  const { data, isLoading, isFetching, isError, refetch } = useGetRevenueQuery({
    from: appliedFrom,
    to: appliedTo,
  });

  function handleApply() {
    if (!fromInput || !toInput) {
      toast.warning('Please set both from and to dates.');
      return;
    }
    if (new Date(fromInput) > new Date(toInput)) {
      toast.warning('From date must be before to date.');
      return;
    }
    setAppliedFrom(fromInput);
    setAppliedTo(toInput);
  }

  function handleReset() {
    const to = new Date();
    const from = subDays(to, 30);
    const fromStr = toInputDate(from);
    const toStr = toInputDate(to);
    setFromInput(fromStr);
    setToInput(toStr);
    setAppliedFrom(fromStr);
    setAppliedTo(toStr);
  }

  function handleExportCSV() {
    if (!data) {
      toast.warning('No data to export.');
      return;
    }
    const rows = [
      ['Metric', 'Value'],
      ['Period From', formatDate(data.from)],
      ['Period To', formatDate(data.to)],
      ['Total Payments', data.totalPayments],
      ['Total Captured', data.totalCaptured],
      ['Total Refunded', data.totalRefunded],
      ['Net Revenue', data.netRevenue],
      ['Platform Revenue (20%)', data.platformRevenue],
      ['Driver Payouts (80%)', data.driverPayouts],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_${appliedFrom}_${appliedTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported', 'Revenue report downloaded successfully.');
  }

  const chartData = data
    ? [
        { name: 'Captured', value: data.totalCaptured, fill: '#3b82f6' },
        { name: 'Refunded', value: data.totalRefunded, fill: '#ef4444' },
        { name: 'Net Revenue', value: data.netRevenue, fill: '#10b981' },
        { name: 'Platform', value: data.platformRevenue, fill: '#8b5cf6' },
        { name: 'Driver Payouts', value: data.driverPayouts, fill: '#f59e0b' },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Revenue</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Financial analytics and revenue breakdown for the platform.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!data || isLoading}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Date range filter */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rev-from" className="text-sm font-medium">From</Label>
              <Input
                id="rev-from"
                type="date"
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rev-to" className="text-sm font-medium">To</Label>
              <Input
                id="rev-to"
                type="date"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleApply} disabled={isLoading || isFetching} size="sm">
                {isFetching && <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Apply
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
          {appliedFrom && appliedTo && (
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              Showing data from <strong>{formatDate(appliedFrom)}</strong> to{' '}
              <strong>{formatDate(appliedTo)}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex flex-1 flex-col gap-1">
            <span className="font-medium">Failed to load revenue data</span>
            <span className="text-sm opacity-80">Check your connection and try again.</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Metric cards — row 1 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Total Captured"
          value={isLoading ? '—' : formatCurrency(data?.totalCaptured ?? 0)}
          subLabel="Gross payment volume"
          isLoading={isLoading}
        />
        <MetricCard
          label="Total Refunded"
          value={isLoading ? '—' : formatCurrency(data?.totalRefunded ?? 0)}
          subLabel="Refunds issued"
          isLoading={isLoading}
        />
        <MetricCard
          label="Net Revenue"
          value={isLoading ? '—' : formatCurrency(data?.netRevenue ?? 0)}
          subLabel="Captured minus refunded"
          isLoading={isLoading}
        />
      </div>

      {/* Metric cards — row 2 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Platform Revenue (20%)"
          value={isLoading ? '—' : formatCurrency(data?.platformRevenue ?? 0)}
          subLabel="AquaFlow platform cut"
          isLoading={isLoading}
        />
        <MetricCard
          label="Driver Payouts (80%)"
          value={isLoading ? '—' : formatCurrency(data?.driverPayouts ?? 0)}
          subLabel="Amount paid to drivers"
          isLoading={isLoading}
        />
        <MetricCard
          label="Total Payments"
          value={isLoading ? '—' : (data?.totalPayments ?? 0)}
          subLabel="Transactions processed"
          isLoading={isLoading}
        />
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-72 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={288}>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                barCategoryGap="35%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v).replace('.00', '')}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  width={84}
                />
                <Tooltip
                  formatter={(value: unknown) => [
                    formatCurrency(typeof value === 'number' ? value : 0),
                    'Amount',
                  ] as [string, string]}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Revenue metrics table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Revenue Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-6">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : data ? (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Metric</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  { label: 'Total Payments', value: data.totalPayments.toLocaleString() },
                  { label: 'Total Captured', value: formatCurrency(data.totalCaptured) },
                  { label: 'Total Refunded', value: formatCurrency(data.totalRefunded) },
                  { label: 'Net Revenue', value: formatCurrency(data.netRevenue) },
                  { label: 'Platform Revenue (20%)', value: formatCurrency(data.platformRevenue) },
                  { label: 'Driver Payouts (80%)', value: formatCurrency(data.driverPayouts) },
                  { label: 'Period', value: `${formatDate(data.from)} — ${formatDate(data.to)}` },
                ].map(({ label, value }) => (
                  <tr key={label} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">{label}</td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
