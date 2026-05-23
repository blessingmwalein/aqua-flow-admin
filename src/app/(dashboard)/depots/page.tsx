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
} from 'lucide-react';

import {
  useGetDepotsQuery,
  useUpdateDepotMutation,
  useDeleteDepotMutation,
} from '@/redux/api/depotsApi';
import type { Depot } from '@/types';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DepotsPage() {
  const router = useRouter();
  const toast = useToast();

  const [page, setPage] = React.useState(1);
  const [confirmApprove, setConfirmApprove] = React.useState<Depot | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = React.useState<Depot | null>(null);

  const { data, isLoading, isFetching } = useGetDepotsQuery({ page, limit: 20 });
  const [updateDepot, { isLoading: approving }] = useUpdateDepotMutation();
  const [deleteDepot, { isLoading: deactivating }] = useDeleteDepotMutation();

  const depots = data?.data ?? [];
  const meta = data?.meta;

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

  const canApprove = (d: Depot) => d.applicationStatus === 'pending' || (!d.isActive && d.applicationStatus !== 'rejected');
  const canDeactivate = (d: Depot) => d.isActive;

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
          {meta && (
            <Badge variant="secondary" className="self-start mt-1">
              {meta.total.toLocaleString()}
            </Badge>
          )}
        </div>
      </div>

      {/* Table card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-gray-400" />
            All Depots
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Depot</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-gray-400">
                        No depots found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    depots.map((depot) => (
                      <TableRow key={depot.id}>
                        {/* Depot name + company */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {depot.name}
                              </p>
                              {depot.companyName && depot.companyName !== depot.name && (
                                <p className="text-xs text-gray-400">{depot.companyName}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Location */}
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span>{depot.city}</span>
                          </div>
                          <p className="text-xs text-gray-400 max-w-[180px] truncate mt-0.5">
                            {depot.address}
                          </p>
                        </TableCell>

                        {/* Contact */}
                        <TableCell>
                          <div className="flex flex-col gap-0.5 text-sm text-gray-500 dark:text-gray-400">
                            {depot.phoneNumber && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                {depot.phoneNumber}
                              </span>
                            )}
                            {depot.contactEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate max-w-[160px]">{depot.contactEmail}</span>
                              </span>
                            )}
                            {!depot.phoneNumber && !depot.contactEmail && '—'}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <StatusBadge depot={depot} />
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(depot.applicationSubmittedAt ?? depot.createdAt)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Depot actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => router.push(ROUTES.DEPOT_DETAIL(depot.id))}
                              >
                                <Eye className="h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              {canApprove(depot) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setConfirmApprove(depot)}
                                    className="text-green-600 focus:text-green-600 dark:text-green-400"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Approve depot
                                  </DropdownMenuItem>
                                </>
                              )}
                              {canDeactivate(depot) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setConfirmDeactivate(depot)}
                                    className="text-red-600 focus:text-red-600 dark:text-red-400"
                                  >
                                    <PowerOff className="h-4 w-4" />
                                    Deactivate
                                  </DropdownMenuItem>
                                </>
                              )}
                              {!canApprove(depot) && !canDeactivate(depot) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setConfirmApprove(depot)}
                                    className="text-green-600 focus:text-green-600 dark:text-green-400"
                                  >
                                    <Power className="h-4 w-4" />
                                    Reactivate
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} depots
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Approve confirm dialog */}
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

      {/* Deactivate confirm dialog */}
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
