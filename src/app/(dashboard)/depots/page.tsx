'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  PowerOff,
  Power,
  MoreHorizontal,
  Warehouse,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import {
  useGetDepotsQuery,
  useUpdateDepotMutation,
  useDeleteDepotMutation,
} from '@/redux/api/depotsApi';
import type { Depot, ApplicationStatus } from '@/types';
import { formatDate } from '@/utils';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/constants/routes';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataTable } from '@/components/tables';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const colHelper = createColumnHelper<Depot>();

function StatusBadge({ depot }: { depot: Depot }) {
  if (depot.applicationStatus === 'pending') {
    return (
      <Badge variant="warning" className="gap-1 whitespace-nowrap">
        <Clock className="h-3 w-3" />
        Pending Review
      </Badge>
    );
  }
  if (depot.applicationStatus === 'rejected') {
    return (
      <Badge variant="destructive" className="gap-1 whitespace-nowrap">
        <XCircle className="h-3 w-3" />
        Rejected
      </Badge>
    );
  }
  if (depot.isActive) {
    return (
      <Badge variant="success" className="gap-1 whitespace-nowrap">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    );
  }
  return <Badge variant="secondary">Inactive</Badge>;
}

const APPLICATION_STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

// ---------------------------------------------------------------------------
// Column builder
// ---------------------------------------------------------------------------
function buildColumns(
  onView: (d: Depot) => void,
  onApprove: (d: Depot) => void,
  onDeactivate: (d: Depot) => void,
): ColumnDef<Depot, unknown>[] {
  return [
    colHelper.accessor('name', {
      header: 'Depot',
      enableSorting: true,
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex items-center gap-2 min-w-[160px]">
            <Warehouse className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{d.name}</p>
              {d.companyName && d.companyName !== d.name && (
                <p className="text-xs text-gray-400">{d.companyName}</p>
              )}
            </div>
          </div>
        );
      },
    }) as ColumnDef<Depot, unknown>,

    colHelper.accessor('city', {
      header: 'Location',
      enableSorting: true,
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div>
            <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
              <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              {d.city}
            </div>
            <p className="text-xs text-gray-400 max-w-[180px] truncate mt-0.5">{d.address}</p>
          </div>
        );
      },
    }) as ColumnDef<Depot, unknown>,

    colHelper.accessor('phoneNumber', {
      id: 'contact',
      header: 'Contact',
      enableSorting: false,
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex flex-col gap-0.5 text-sm text-gray-500 dark:text-gray-400">
            {d.phoneNumber && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 flex-shrink-0" />
                {d.phoneNumber}
              </span>
            )}
            {d.contactEmail && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate max-w-[160px]">{d.contactEmail}</span>
              </span>
            )}
            {!d.phoneNumber && !d.contactEmail && '—'}
          </div>
        );
      },
    }) as ColumnDef<Depot, unknown>,

    colHelper.accessor('applicationStatus', {
      header: 'Status',
      enableSorting: true,
      cell: ({ row }) => <StatusBadge depot={row.original} />,
    }) as ColumnDef<Depot, unknown>,

    colHelper.accessor('createdAt', {
      header: 'Date',
      enableSorting: true,
      cell: ({ row }) => {
        const d = row.original;
        return (
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatDate(d.applicationSubmittedAt ?? d.createdAt)}
          </span>
        );
      },
    }) as ColumnDef<Depot, unknown>,

    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => {
        const d = row.original;
        const canApprove = d.applicationStatus === 'pending' || (!d.isActive && d.applicationStatus !== 'rejected');
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Depot actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(d)}>
                <Eye className="h-4 w-4" />
                View details
              </DropdownMenuItem>
              {canApprove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onApprove(d)}
                    className="text-green-600 focus:text-green-600 dark:text-green-400"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve depot
                  </DropdownMenuItem>
                </>
              )}
              {d.isActive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeactivate(d)}
                    className="text-red-600 focus:text-red-600 dark:text-red-400"
                  >
                    <PowerOff className="h-4 w-4" />
                    Deactivate
                  </DropdownMenuItem>
                </>
              )}
              {!canApprove && !d.isActive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onApprove(d)}
                    className="text-green-600 focus:text-green-600 dark:text-green-400"
                  >
                    <Power className="h-4 w-4" />
                    Reactivate
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    } as ColumnDef<Depot, unknown>,
  ];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DepotsPage() {
  const router = useRouter();
  const toast = useToast();

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [statusFilter, setStatusFilter] = React.useState<ApplicationStatus | ''>('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [confirmApprove, setConfirmApprove] = React.useState<Depot | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = React.useState<Depot | null>(null);

  const { data, isLoading, isFetching } = useGetDepotsQuery({ page, limit: pageSize });
  const [updateDepot, { isLoading: approving }] = useUpdateDepotMutation();
  const [deleteDepot, { isLoading: deactivating }] = useDeleteDepotMutation();

  // Client-side search: name, companyName, city, address
  const displayData = React.useMemo(() => {
    let rows = data?.data ?? [];
    if (statusFilter) {
      rows = rows.filter((d) => d.applicationStatus === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.companyName ?? '').toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q) ||
          (d.phoneNumber ?? '').toLowerCase().includes(q) ||
          (d.contactEmail ?? '').toLowerCase().includes(q),
      );
    }
    return rows;
  }, [data?.data, statusFilter, searchQuery]);

  const totalCount = statusFilter || searchQuery.trim()
    ? displayData.length
    : (data?.meta?.total ?? 0);

  React.useEffect(() => { setPage(1); }, [statusFilter]);

  async function handleApprove() {
    if (!confirmApprove) return;
    try {
      await updateDepot({ id: confirmApprove.id, body: { isActive: true } }).unwrap();
      toast.success(`${confirmApprove.name} approved and activated.`);
    } catch {
      toast.error('Failed to approve depot.');
    } finally {
      setConfirmApprove(null);
    }
  }

  async function handleDeactivate() {
    if (!confirmDeactivate) return;
    try {
      await deleteDepot(confirmDeactivate.id).unwrap();
      toast.success(`${confirmDeactivate.name} deactivated.`);
    } catch {
      toast.error('Failed to deactivate depot.');
    } finally {
      setConfirmDeactivate(null);
    }
  }

  const columns = React.useMemo(
    () => buildColumns(
      (d) => router.push(ROUTES.DEPOT_DETAIL(d.id)),
      (d) => setConfirmApprove(d),
      (d) => setConfirmDeactivate(d),
    ),
    [router],
  );

  const hasFilters = statusFilter !== '';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Depots
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Review and manage water distribution depot applications
            </p>
          </div>
          {data?.meta?.total !== undefined && (
            <Badge variant="secondary" className="self-start mt-1">
              {data.meta.total.toLocaleString()}
            </Badge>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <SlidersHorizontal className="h-4 w-4" />
          Filters:
        </div>
        <Select
          value={statusFilter || '__all__'}
          onValueChange={(v) => setStatusFilter(v === '__all__' ? '' : (v as ApplicationStatus))}
        >
          <SelectTrigger className="h-9 w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {APPLICATION_STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className="h-9 gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Data table */}
      <DataTable<Depot, unknown>
        columns={columns}
        data={displayData}
        isLoading={isLoading || isFetching}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by name, city, address or contact…"
        emptyMessage="No depots match the current filters."
      />

      {/* Approve confirm */}
      <AlertDialog open={!!confirmApprove} onOpenChange={(v) => { if (!v) setConfirmApprove(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve depot?</AlertDialogTitle>
            <AlertDialogDescription>
              This will activate <strong>{confirmApprove?.name}</strong> and make it available for
              operations. You can deactivate it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleApprove()}
              disabled={approving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {approving ? 'Approving…' : 'Approve & activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate confirm */}
      <AlertDialog open={!!confirmDeactivate} onOpenChange={(v) => { if (!v) setConfirmDeactivate(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate depot?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{confirmDeactivate?.name}</strong> will be deactivated and removed from
              active operations. This action can be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeactivate()}
              disabled={deactivating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deactivating ? 'Deactivating…' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
