'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Star,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  UserX,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

import { useGetUserByIdQuery, useUpdateUserMutation } from '@/redux/api/usersApi';
import { formatDate, formatDateTime, getInitials } from '@/utils';
import { useToast } from '@/hooks/useToast';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common';
import type { UserRole, UserStatus } from '@/types';

// ---------------------------------------------------------------------------
// Badge helpers (duplicated here to keep this page self-contained)
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
    pending_verification: { variant: 'warning', label: 'Pending Verification' },
  };
  const { variant, label } = map[status] ?? { variant: 'outline', label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

// ---------------------------------------------------------------------------
// Info row
// ---------------------------------------------------------------------------
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-medium text-gray-800 dark:text-gray-200">{value}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In Next.js 16, params is a Promise. For Client Components use React.use().
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();

  const { data: user, isLoading, isError, refetch } = useGetUserByIdQuery(id);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const handleStatusChange = async (newStatus: 'suspended' | 'active') => {
    if (!user) return;
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
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
        </div>
        <Card className="p-6">
          <div className="flex items-center gap-5">
            <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-2 mt-1">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <ErrorState
          title="User not found"
          description="This user could not be loaded. They may have been removed or the ID is invalid."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const canSuspend = user.status === 'active';
  const canActivate = user.status === 'suspended' || user.status === 'inactive' || user.status === 'pending_verification';

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5 pl-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <Avatar className="h-20 w-20 flex-shrink-0 self-center sm:self-auto">
              {user.photoUrl && <AvatarImage src={user.photoUrl} alt={user.firstName} />}
              <AvatarFallback className="text-2xl font-semibold">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-1 flex-col gap-2 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 self-start"
                  onClick={() => void refetch()}
                  aria-label="Refresh"
                >
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                <span className="font-medium">{(user.averageRating ?? 0).toFixed(1)}</span>
                <span className="text-gray-400 dark:text-gray-500">
                  ({user.totalRatings ?? 0} review{(user.totalRatings ?? 0) !== 1 ? 's' : ''})
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <DetailRow
              icon={Mail}
              label="Email address"
              value={user.email}
            />
            <DetailRow
              icon={Phone}
              label="Phone number"
              value={user.phoneNumber ?? <span className="text-gray-400 dark:text-gray-500">Not provided</span>}
            />
            <DetailRow
              icon={user.emailVerified ? ShieldCheck : ShieldAlert}
              label="Email verified"
              value={
                user.emailVerified ? (
                  <span className="text-green-600 dark:text-green-400">Verified</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400">Not verified</span>
                )
              }
            />
            <DetailRow
              icon={Star}
              label="Average rating"
              value={
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  {(user.averageRating ?? 0).toFixed(1)} · {user.totalRatings ?? 0} ratings
                </span>
              }
            />
            <DetailRow
              icon={Calendar}
              label="Member since"
              value={formatDate(user.createdAt)}
            />
            <DetailRow
              icon={Calendar}
              label="Last updated"
              value={formatDateTime(user.updatedAt)}
            />
          </div>

          {user.address && (
            <>
              <Separator className="my-5" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {user.address.street && (
                  <DetailRow icon={Calendar} label="Street" value={user.address.street} />
                )}
                {user.address.city && (
                  <DetailRow icon={Calendar} label="City" value={user.address.city} />
                )}
                {user.address.state && (
                  <DetailRow icon={Calendar} label="State / Region" value={user.address.state} />
                )}
                {user.address.country && (
                  <DetailRow icon={Calendar} label="Country" value={user.address.country} />
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account management */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Account Management</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Current status:{' '}
            <span className="font-medium">
              <StatusBadge status={user.status} />
            </span>
          </p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex flex-wrap gap-3">
            {canSuspend && (
              <Button
                variant="destructive"
                disabled={isUpdating}
                onClick={() => void handleStatusChange('suspended')}
                className="gap-2"
              >
                <UserX className="h-4 w-4" />
                Suspend account
              </Button>
            )}
            {canActivate && (
              <Button
                variant="default"
                disabled={isUpdating}
                onClick={() => void handleStatusChange('active')}
                className="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              >
                <UserCheck className="h-4 w-4" />
                Activate account
              </Button>
            )}
            {!canSuspend && !canActivate && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No actions available for the current status.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
