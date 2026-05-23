'use client';

import * as React from 'react';
import {
  Users,
  Truck,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  ShoppingBag,
  Clock,
  Building2,
  BarChart3,
} from 'lucide-react';

import { useGetDashboardQuery } from '@/redux/api/dashboardApi';
import { formatCurrency, formatDate, timeAgo } from '@/utils';
import { StatsCard } from '@/components/cards';
import { CardSkeleton } from '@/components/loaders';
import { ErrorState } from '@/components/common';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { OrderStatusPie } from '@/components/charts/OrderStatusPie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

// ---------------------------------------------------------------------------
// Mock time-series data generator
// NOTE: This should be replaced with a real /admin/dashboard/revenue-trends
// endpoint that returns per-day aggregates once the backend supports it.
// ---------------------------------------------------------------------------
function buildMockRevenueSeries(
  netRevenue: number,
  platformRevenue: number,
): Array<{ date: string; revenue: number; platformRevenue: number }> {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    // Spread the totals across 7 days with a mild sine-wave variation so the
    // chart looks realistic rather than a flat line.
    const factor = 0.7 + 0.3 * Math.sin((i / 6) * Math.PI);
    return {
      date: d.toISOString().slice(0, 10),
      revenue: Math.round((netRevenue / 7) * factor),
      platformRevenue: Math.round((platformRevenue / 7) * factor),
    };
  });
}

// ---------------------------------------------------------------------------
// Order status summary rows
// ---------------------------------------------------------------------------
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  matching: 'Matching',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_BADGE_VARIANT: Record<
  string,
  'warning' | 'default' | 'success' | 'destructive' | 'secondary' | 'outline'
> = {
  pending: 'warning',
  matching: 'outline',
  active: 'default',
  completed: 'success',
  cancelled: 'destructive',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetDashboardQuery(undefined, { pollingInterval: 30_000 });

  // Derived chart data — only computed once stats arrives
  const revenueData = React.useMemo(() => {
    if (!stats) return [];
    return buildMockRevenueSeries(stats.revenue.netRevenue, stats.revenue.platformRevenue);
  }, [stats]);

  const pieData = React.useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Pending', value: stats.orders.pending, color: '#f59e0b' },
      { name: 'Active', value: stats.orders.active, color: '#3b82f6' },
      { name: 'Completed', value: stats.orders.completed, color: '#10b981' },
      { name: 'Cancelled', value: stats.orders.cancelled, color: '#ef4444' },
    ];
  }, [stats]);

  // Guard: render nothing until data arrives — avoids stats! assertion crashes
  if (isLoading || !stats) {
    return (
      <div className="flex flex-col gap-6">
        <CardSkeleton count={4} />
        <CardSkeleton count={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <ErrorState
          title="Failed to load dashboard"
          description="Could not fetch platform statistics. Please try again."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ------------------------------------------------------------------ */}
      {/* Page header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Platform overview
            {stats?.generatedAt && (
              <span className="ml-2 text-gray-400 dark:text-gray-500">
                · Last updated: {timeAgo(stats.generatedAt)}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="mt-2 self-start sm:mt-0 sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Primary stats — 4 columns                                           */}
      {/* ------------------------------------------------------------------ */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            iconColor="text-blue-500"
            iconBg="bg-blue-50 dark:bg-blue-900/20"
            trend={{
              value: 0,
              label: `Active: ${stats.activeUsers.toLocaleString()}`,
              direction: 'neutral',
            }}
          />
          <StatsCard
            title="Total Drivers"
            value={stats.totalDrivers.toLocaleString()}
            icon={Truck}
            iconColor="text-green-500"
            iconBg="bg-green-50 dark:bg-green-900/20"
            trend={{
              value: 0,
              label: `Pending: ${stats.pendingDrivers}`,
              direction: 'neutral',
            }}
          />
          <StatsCard
            title="Total Orders"
            value={stats.orders.total.toLocaleString()}
            icon={ShoppingCart}
            iconColor="text-purple-500"
            iconBg="bg-purple-50 dark:bg-purple-900/20"
          />
          <StatsCard
            title="Net Revenue"
            value={formatCurrency(stats.revenue.netRevenue)}
            icon={DollarSign}
            iconColor="text-orange-500"
            iconBg="bg-orange-50 dark:bg-orange-900/20"
          />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Secondary stats — 4 columns                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <CardContent className="p-0 flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-3.5 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <SecondaryStatCard
              label="Active Orders"
              value={stats.orders.active}
              colorClass="text-orange-600 dark:text-orange-400"
              icon={ShoppingBag}
            />
            <SecondaryStatCard
              label="Pending Orders"
              value={stats.orders.pending}
              colorClass="text-yellow-600 dark:text-yellow-400"
              icon={Clock}
            />
            <SecondaryStatCard
              label="Platform Revenue"
              value={formatCurrency(stats.revenue.platformRevenue)}
              colorClass="text-blue-600 dark:text-blue-400"
              icon={DollarSign}
            />
            <SecondaryStatCard
              label="Active Depots"
              value={stats.activeDepots}
              colorClass="text-teal-600 dark:text-teal-400"
              icon={Building2}
            />
          </>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Charts row — 7/5 split on desktop                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Revenue Trends */}
        <Card className="lg:col-span-7">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue Trends</CardTitle>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Last 7 days · estimated from aggregate totals
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <Skeleton className="h-80 w-full rounded-lg" />
            ) : (
              <RevenueChart data={revenueData} />
            )}
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card className="lg:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Order Status</CardTitle>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Distribution by current status
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="h-48 w-48 rounded-full" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-28" />
                ))}
              </div>
            ) : (
              <OrderStatusPie data={pieData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Orders summary table                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <CardTitle className="text-base font-semibold">Orders by Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(['pending', 'matching', 'active', 'completed', 'cancelled'] as const).map(
                    (key) => {
                      const count = stats.orders[key];
                      const pct =
                        stats.orders.total > 0
                          ? ((count / stats.orders.total) * 100).toFixed(1)
                          : '0.0';
                      return (
                        <TableRow key={key}>
                          <TableCell>
                            <Badge variant={STATUS_BADGE_VARIANT[key]}>
                              {STATUS_LABELS[key]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {count.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-gray-500 dark:text-gray-400">
                            {pct}%
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                  <TableRow className="font-semibold bg-gray-50 dark:bg-gray-800/50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {stats.orders.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Secondary stat card (inline component — small enough not to split out)
// ---------------------------------------------------------------------------
function SecondaryStatCard({
  label,
  value,
  colorClass,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  colorClass: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="p-5">
      <CardContent className="p-0 flex items-center gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
          <p className={`text-xl font-bold tracking-tight ${colorClass}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
