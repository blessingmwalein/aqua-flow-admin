'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import {
  Eye,
  MoreHorizontal,
  Star,
  UserX,
  UserCheck,
  X,
  SlidersHorizontal,
} from 'lucide-react';

import { useGetUsersQuery, useUpdateUserMutation } from '@/redux/api/usersApi';
import type { UserProfile, UserStatus, UserRole } from '@/types';
import { formatDate, getInitials } from '@/utils';
import { useToast } from '@/hooks/useToast';

import { DataTable } from '@/components/tables/DataTable';
import { DetailsDrawer } from '@/components/drawers/DetailsDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { Separator } from '@/components/ui/separator';

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------
function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<UserRole, { variant: React.ComponentProps<typeof Badge>['variant']; label: string }> = {
    admin: { variant: 'default', label: 'Admin' },
    super_admin: { variant: 'default', label: 'Super Admin' },
    customer: { variant: 'secondary', label: 'Customer' },
    driver: { variant: 'success', label: 'Driver' },
  };
  const { variant, label } = map[role] ?? { variant: 'outline', label: role };
  return <Badge variant={variant}>{label}</Badge>;
}

function StatusBadge({ status }: { status: UserStatus }) {
  const map: Record<UserStatus, { variant: React.ComponentProps<typeof Badge>['variant']; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    suspended: { variant: 'destructive', label: 'Suspended' },
    inactive: { variant: 'secondary', label: 'Inactive' },
    pending_verification: { variant: 'warning', label: 'Pending' },
  };
  const { variant, label } = map[status] ?? { variant: 'outline', label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

// ---------------------------------------------------------------------------
// Drawer content — user detail preview
// ---------------------------------------------------------------------------
function UserDrawerContent({ user }: { user: UserProfile }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {user.photoUrl && <AvatarImage src={user.photoUrl} alt={user.firstName} />}
          <AvatarFallback className="text-lg">
            {getInitials(user.firstName, user.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Info grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoRow label="Phone" value={user.phoneNumber ?? '—'} />
        <InfoRow
          label="Email verified"
          value={
            user.emailVerified ? (
              <span className="text-green-600 dark:text-green-400 font-medium">Yes</span>
            ) : (
              <span className="text-red-500 dark:text-red-400 font-medium">No</span>
            )
          }
        />
        <InfoRow label="Joined" value={formatDate(user.createdAt)} />
        <InfoRow label="Last updated" value={formatDate(user.updatedAt)} />
        <InfoRow
          label="Rating"
          value={
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {(user.averageRating ?? 0).toFixed(1)}
              <span className="text-gray-400 dark:text-gray-500">
                ({user.totalRatings ?? 0} reviews)
              </span>
            </span>
          }
        />
        {user.address?.city && (
          <InfoRow
            label="Location"
            value={[user.address.city, user.address.country].filter(Boolean).join(', ')}
          />
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <div className="text-sm text-gray-800 dark:text-gray-200">{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
const columnHelper = createColumnHelper<UserProfile>();

function buildColumns(
  onView: (user: UserProfile) => void,
  onSuspend: (user: UserProfile) => void,
  onActivate: (user: UserProfile) => void,
): ColumnDef<UserProfile, unknown>[] {
  return [
    columnHelper.accessor(
      (row) => `${row.firstName} ${row.lastName}`,
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                {user.photoUrl && <AvatarImage src={user.photoUrl} alt={user.firstName} />}
                <AvatarFallback className="text-xs">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
                {user.firstName} {user.lastName}
              </span>
            </div>
          );
        },
      },
    ) as ColumnDef<UserProfile, unknown>,
    columnHelper.accessor('email', {
      header: 'Email',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px] block">
          {getValue()}
        </span>
      ),
    }) as ColumnDef<UserProfile, unknown>,
    columnHelper.accessor('role', {
      header: 'Role',
      cell: ({ getValue }) => <RoleBadge role={getValue()} />,
    }) as ColumnDef<UserProfile, unknown>,
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    }) as ColumnDef<UserProfile, unknown>,
    columnHelper.accessor('averageRating', {
      header: 'Rating',
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1 text-sm">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
          {(getValue() ?? 0).toFixed(1)}
        </span>
      ),
    }) as ColumnDef<UserProfile, unknown>,
    columnHelper.accessor('createdAt', {
      header: 'Joined',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {formatDate(getValue())}
        </span>
      ),
    }) as ColumnDef<UserProfile, unknown>,
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        const canSuspend = user.status === 'active';
        const canActivate = user.status === 'suspended' || user.status === 'inactive' || user.status === 'pending_verification';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(user)}>
                <Eye className="h-4 w-4" />
                View details
              </DropdownMenuItem>
              {canSuspend && (
                <DropdownMenuItem
                  onClick={() => onSuspend(user)}
                  className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                >
                  <UserX className="h-4 w-4" />
                  Suspend
                </DropdownMenuItem>
              )}
              {canActivate && (
                <DropdownMenuItem
                  onClick={() => onActivate(user)}
                  className="text-green-600 focus:text-green-600 dark:text-green-400 dark:focus:text-green-400"
                >
                  <UserCheck className="h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    } as ColumnDef<UserProfile, unknown>,
  ];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const PAGE_SIZE_DEFAULT = 20;

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending_verification', label: 'Pending Verification' },
];

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'driver', label: 'Driver' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

export default function UsersPage() {
  const router = useRouter();
  const toast = useToast();

  // Pagination
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE_DEFAULT);

  // Filters
  const [statusFilter, setStatusFilter] = React.useState<UserStatus | ''>('');
  const [roleFilter, setRoleFilter] = React.useState<UserRole | ''>('');

  // Client-side search (API does not support full-text search)
  const [searchQuery, setSearchQuery] = React.useState('');

  // Drawer state
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(roleFilter ? { role: roleFilter } : {}),
    }),
    [page, pageSize, statusFilter, roleFilter],
  );

  const { data, isLoading, isFetching } = useGetUsersQuery(queryParams);
  const [updateUser] = useUpdateUserMutation();

  // Client-side name filter — applied on top of server-side results
  const displayData = React.useMemo(() => {
    if (!data?.data) return [];
    if (!searchQuery.trim()) return data.data;
    const q = searchQuery.toLowerCase();
    return data.data.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [data?.data, searchQuery]);

  const totalCount = searchQuery.trim() ? displayData.length : (data?.meta?.total ?? 0);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, roleFilter]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const handleView = React.useCallback((user: UserProfile) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  }, []);

  const handleStatusChange = React.useCallback(
    async (user: UserProfile, newStatus: 'suspended' | 'active') => {
      try {
        await updateUser({ id: user.id, data: { status: newStatus } }).unwrap();
        toast.success(
          newStatus === 'suspended'
            ? `${user.firstName} has been suspended.`
            : `${user.firstName} is now active.`,
        );
      } catch {
        toast.error('Failed to update user status. Please try again.');
      }
    },
    [updateUser, toast],
  );

  const handleSuspend = React.useCallback(
    (user: UserProfile) => void handleStatusChange(user, 'suspended'),
    [handleStatusChange],
  );

  const handleActivate = React.useCallback(
    (user: UserProfile) => void handleStatusChange(user, 'active'),
    [handleStatusChange],
  );

  const handleViewDetail = React.useCallback(
    (user: UserProfile) => {
      router.push(`/users/${user.id}`);
    },
    [router],
  );

  const columns = React.useMemo(
    () => buildColumns(handleView, handleSuspend, handleActivate),
    [handleView, handleSuspend, handleActivate],
  );

  const hasFilters = statusFilter !== '' || roleFilter !== '';

  const clearFilters = () => {
    setStatusFilter('');
    setRoleFilter('');
    setPage(1);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Users
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Manage platform users, roles and statuses
            </p>
          </div>
          {data?.meta?.total !== undefined && (
            <Badge variant="secondary" className="self-start mt-1 sm:self-auto sm:mt-0">
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
          onValueChange={(v) =>
            setStatusFilter(v === '__all__' ? '' : (v as UserStatus))
          }
        >
          <SelectTrigger className="h-9 w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={roleFilter || '__all__'}
          onValueChange={(v) =>
            setRoleFilter(v === '__all__' ? '' : (v as UserRole))
          }
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All roles</SelectItem>
            {ROLE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1.5">
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Data table */}
      <DataTable<UserProfile, unknown>
        columns={columns}
        data={displayData}
        isLoading={isLoading || isFetching}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by name or email…"
        emptyMessage="No users match the current filters."
      />

      {/* Details drawer */}
      <DetailsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="User Details"
        description="View profile and account information"
        footer={
          selectedUser ? (
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setDrawerOpen(false);
                  handleViewDetail(selectedUser);
                }}
              >
                <Eye className="h-4 w-4" />
                Full profile
              </Button>
              {selectedUser.status === 'active' && (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setDrawerOpen(false);
                    handleSuspend(selectedUser);
                  }}
                >
                  <UserX className="h-4 w-4" />
                  Suspend
                </Button>
              )}
              {(selectedUser.status === 'suspended' || selectedUser.status === 'inactive' || selectedUser.status === 'pending_verification') && (
                <Button
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                  onClick={() => {
                    setDrawerOpen(false);
                    handleActivate(selectedUser);
                  }}
                >
                  <UserCheck className="h-4 w-4" />
                  Activate
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedUser && <UserDrawerContent user={selectedUser} />}
      </DetailsDrawer>
    </div>
  );
}
