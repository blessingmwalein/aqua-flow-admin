'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Eye,
  XCircle,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  CircleDot,
  Ban,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/tables';
import { DetailsDrawer } from '@/components/drawers';
import { CancelOrderModal } from '@/components/modals';
import {
  Badge,
  Button,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Tabs,
  TabsList,
  TabsTrigger,
  Separator,
} from '@/components/ui';
import { useGetOrdersQuery, useCancelOrderMutation } from '@/redux/api/ordersApi';
import { useToast } from '@/hooks';
import { formatDate, formatDateTime, formatCurrency } from '@/utils';
import type { Order, OrderStatus, OrderStatusEntry } from '@/types';

type FilterTab = 'all' | OrderStatus;

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'accepted' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const TERMINAL_STATUSES: OrderStatus[] = ['delivered', 'completed', 'cancelled'];

function orderStatusClass(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400';
    case 'matching':
    case 'driver_assigned':
    case 'accepted':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
    case 'picked_up':
    case 'delivering':
      return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400';
    case 'delivered':
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
  }
}

function statusLabel(status: OrderStatus): string {
  return status.replace(/_/g, ' ');
}

const ALL_STATUSES: OrderStatus[] = [
  'pending',
  'matching',
  'driver_assigned',
  'accepted',
  'picked_up',
  'delivering',
  'delivered',
  'completed',
  'cancelled',
];

function StatusTimelineIcon({ status }: { status: OrderStatus }) {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'matching':
    case 'driver_assigned':
      return <CircleDot className="h-4 w-4" />;
    case 'accepted':
    case 'picked_up':
      return <Package className="h-4 w-4" />;
    case 'delivering':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
    case 'completed':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'cancelled':
      return <Ban className="h-4 w-4" />;
  }
}

function StatusTimeline({ history }: { history: OrderStatusEntry[] }) {
  if (!history.length) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">No status history.</p>;
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const latestStatus = sortedHistory[sortedHistory.length - 1]?.status;

  return (
    <ol className="relative flex flex-col gap-0">
      {sortedHistory.map((entry, i) => {
        const isLast = i === sortedHistory.length - 1;
        const isCurrent = entry.status === latestStatus && isLast;
        return (
          <li key={i} className="flex gap-3">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 flex-shrink-0',
                  isCurrent
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-emerald-400 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                ].join(' ')}
              >
                <StatusTimelineIcon status={entry.status} />
              </span>
              {!isLast && (
                <span className="mt-1 mb-1 w-0.5 flex-1 min-h-[16px] bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
            {/* Content */}
            <div className="pb-4 flex flex-col gap-0.5">
              <span className="text-sm font-medium capitalize text-gray-900 dark:text-gray-100">
                {statusLabel(entry.status)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDateTime(entry.timestamp)}
              </span>
              {entry.note && (
                <span className="text-xs text-gray-600 dark:text-gray-300 italic">{entry.note}</span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-gray-100">{value ?? '—'}</span>
    </div>
  );
}

export default function OrdersPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = React.useState<FilterTab>('all');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [customerIdFilter, setCustomerIdFilter] = React.useState('');
  const [driverIdFilter, setDriverIdFilter] = React.useState('');

  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = React.useState<Order | null>(null);

  const queryParams = {
    page,
    limit: pageSize,
    ...(activeTab !== 'all' ? { status: activeTab } : {}),
    ...(customerIdFilter.trim() ? { customerId: customerIdFilter.trim() } : {}),
    ...(driverIdFilter.trim() ? { driverId: driverIdFilter.trim() } : {}),
  };

  const { data, isLoading, isFetching } = useGetOrdersQuery(queryParams);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const orders = data?.data ?? [];
  const totalCount = data?.meta.total ?? 0;

  function handleTabChange(value: string) {
    setActiveTab(value as FilterTab);
    setPage(1);
  }

  async function handleCancelOrder(note?: string) {
    if (!cancelTarget) return;
    try {
      await cancelOrder({ id: cancelTarget.id, note }).unwrap();
      toast.success('Order cancelled', `Order #${cancelTarget.id.slice(0, 8)} has been cancelled.`);
      setCancelTarget(null);
    } catch {
      toast.error('Failed to cancel order', 'Please try again.');
    }
  }

  const columns: ColumnDef<Order>[] = [
    {
      id: 'orderId',
      header: 'Order ID',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
          #{row.original.id.slice(0, 8)}
        </span>
      ),
    },
    {
      id: 'customerId',
      header: 'Customer',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
          {row.original.customerId.slice(0, 8)}…
        </span>
      ),
    },
    {
      id: 'items',
      header: 'Items',
      cell: ({ row }) => {
        const o = row.original;
        return (
          <div className="flex flex-col gap-0.5 min-w-[140px]">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {o.items.length} item{o.items.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatCurrency(o.totalAmount)}
            </span>
          </div>
        );
      },
    },
    {
      id: 'deliveryAddress',
      header: 'Delivery Address',
      cell: ({ row }) => {
        const addr = row.original.deliveryAddress;
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400 max-w-[200px] block truncate" title={addr}>
            {addr.length > 30 ? `${addr.slice(0, 30)}…` : addr}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={orderStatusClass(status)}>
            {statusLabel(status)}
          </Badge>
        );
      },
    },
    {
      id: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'estimatedDelivery',
      header: 'Est. Delivery',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {row.original.estimatedDeliveryAt ? formatDate(row.original.estimatedDeliveryAt) : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => {
        const o = row.original;
        const isTerminal = TERMINAL_STATUSES.includes(o.status);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setSelectedOrder(o)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {!isTerminal && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setCancelTarget(o)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Order
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orders</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View and manage all customer orders across the platform.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-shrink-0">
          <TabsList>
            {FILTER_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Filter by customer ID…"
            value={customerIdFilter}
            onChange={(e) => { setCustomerIdFilter(e.target.value); setPage(1); }}
            className="w-52 h-9 text-sm"
          />
          <Input
            placeholder="Filter by driver ID…"
            value={driverIdFilter}
            onChange={(e) => { setDriverIdFilter(e.target.value); setPage(1); }}
            className="w-48 h-9 text-sm"
          />
          {(customerIdFilter || driverIdFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setCustomerIdFilter(''); setDriverIdFilter(''); setPage(1); }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading || isFetching}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        emptyMessage="No orders found."
      />

      {/* Order details drawer */}
      <DetailsDrawer
        open={!!selectedOrder}
        onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}
        title="Order Details"
        description={selectedOrder ? `#${selectedOrder.id.slice(0, 8)}` : ''}
        footer={
          selectedOrder && !TERMINAL_STATUSES.includes(selectedOrder.status) ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                setCancelTarget(selectedOrder);
                setSelectedOrder(null);
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
          ) : undefined
        }
      >
        {selectedOrder && (
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                  #{selectedOrder.id}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>
              <Badge className={orderStatusClass(selectedOrder.status)}>
                {statusLabel(selectedOrder.status)}
              </Badge>
            </div>

            <Separator />

            {/* Items */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Items
              </h3>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Size</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">Qty</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">Unit</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, i) => (
                      <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{item.bottleSize}</td>
                        <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 text-right">Total</td>
                      <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-gray-100">{formatCurrency(selectedOrder.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <Separator />

            {/* Delivery info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Delivery
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <DetailRow label="Address" value={selectedOrder.deliveryAddress} />
                </div>
                <DetailRow label="Latitude" value={selectedOrder.deliveryLatitude} />
                <DetailRow label="Longitude" value={selectedOrder.deliveryLongitude} />
                {selectedOrder.estimatedDeliveryAt && (
                  <DetailRow label="Est. Delivery" value={formatDateTime(selectedOrder.estimatedDeliveryAt)} />
                )}
                {selectedOrder.actualDeliveryAt && (
                  <DetailRow label="Actual Delivery" value={formatDateTime(selectedOrder.actualDeliveryAt)} />
                )}
              </div>
            </div>

            <Separator />

            {/* Payment info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Payment
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow
                  label="Payment Intent"
                  value={
                    selectedOrder.paymentIntentId ? (
                      <span className="font-mono text-xs break-all">{selectedOrder.paymentIntentId}</span>
                    ) : '—'
                  }
                />
                <DetailRow label="Total Amount" value={formatCurrency(selectedOrder.totalAmount)} />
              </div>
            </div>

            <Separator />

            {/* Status timeline */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Status Timeline
              </h3>
              <StatusTimeline history={selectedOrder.statusHistory} />
            </div>

            {/* Cancellation info */}
            {selectedOrder.status === 'cancelled' && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 uppercase tracking-wide">
                    Cancellation
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedOrder.cancellationReason && (
                      <DetailRow label="Reason" value={selectedOrder.cancellationReason.replace(/_/g, ' ')} />
                    )}
                    {selectedOrder.cancellationNote && (
                      <DetailRow label="Note" value={selectedOrder.cancellationNote} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DetailsDrawer>

      {/* Cancel order modal */}
      <CancelOrderModal
        open={!!cancelTarget}
        onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
        orderId={cancelTarget ? cancelTarget.id.slice(0, 8) : ''}
        onConfirm={handleCancelOrder}
        isLoading={isCancelling}
      />
    </div>
  );
}
