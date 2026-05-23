'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Building2,
  FileText,
  Hash,
  CheckCircle2,
  PowerOff,
  ExternalLink,
  AlertTriangle,
  Car,
} from 'lucide-react';

import {
  useGetDepotByIdQuery,
  useUpdateDepotMutation,
  useDeleteDepotMutation,
} from '@/redux/api/depotsApi';
import { useGetDepotDriversQuery } from '@/redux/api/driversApi';
import { formatDate } from '@/utils';
import { useToast } from '@/hooks/useToast';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function resolveFileUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005/api/v1';
    const { origin } = new URL(apiBase);
    return `${origin}${path}`;
  } catch {
    return path;
  }
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <div className="text-sm text-gray-800 dark:text-gray-200">{value ?? '—'}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// File viewer modal (PDF or image)
// ---------------------------------------------------------------------------
function FileViewerModal({
  url,
  title,
  open,
  onOpenChange,
}: {
  url: string;
  title: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [imgError, setImgError] = React.useState(false);
  const isPdf = url.toLowerCase().includes('.pdf');

  React.useEffect(() => {
    if (open) setImgError(false);
  }, [open, url]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full" style={{ height: '72vh' }}>
          {isPdf ? (
            <iframe
              src={url}
              className="w-full h-full border-0"
              title={title}
            />
          ) : imgError ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <AlertTriangle className="h-8 w-8" />
              <p className="text-sm">Unable to preview this file.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Open in new tab
              </a>
            </div>
          ) : (
            <img
              src={url}
              alt={title}
              className="w-full h-full object-contain"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Document card
// ---------------------------------------------------------------------------
function DocumentCard({
  label,
  url,
}: {
  label: string;
  url?: string;
}) {
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const resolved = url ? resolveFileUrl(url) : '';

  if (!url) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
            <p className="text-xs text-gray-400">Not uploaded</p>
          </div>
        </div>
      </div>
    );
  }

  const isPdf = url.toLowerCase().includes('.pdf');
  const ext = isPdf ? 'PDF' : 'Image';

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
            <p className="text-xs text-gray-400">{ext} document</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setViewerOpen(true)}>
          View
        </Button>
      </div>
      <FileViewerModal
        url={resolved}
        title={label}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Drivers tab
// ---------------------------------------------------------------------------
function DriversTab({ depotId }: { depotId: string }) {
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useGetDepotDriversQuery({ id: depotId, page, limit: 15 });
  const drivers = data?.data ?? [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Approval</TableHead>
            <TableHead>Online</TableHead>
            <TableHead>Deliveries</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-gray-400">
                <Car className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                No drivers found for this depot.
              </TableCell>
            </TableRow>
          ) : (
            drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {driver.firstName} {driver.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{driver.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {driver.phoneNumber ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      driver.approvalStatus === 'approved'
                        ? 'success'
                        : driver.approvalStatus === 'rejected'
                        ? 'destructive'
                        : 'warning'
                    }
                  >
                    {driver.approvalStatus.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={driver.onlineStatus === 'online' ? 'success' : 'secondary'}>
                    {driver.onlineStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {driver.totalDeliveries}
                </TableCell>
                <TableCell className="text-sm text-gray-400 whitespace-nowrap">
                  {formatDate(driver.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DepotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();

  const [confirmApprove, setConfirmApprove] = React.useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = React.useState(false);

  const { data: depot, isLoading } = useGetDepotByIdQuery(id);
  const [updateDepot, { isLoading: approving }] = useUpdateDepotMutation();
  const [deleteDepot, { isLoading: deactivating }] = useDeleteDepotMutation();

  async function handleApprove() {
    try {
      await updateDepot({ id, body: { isActive: true } }).unwrap();
      toast.success('Depot approved and activated.');
    } catch {
      toast.error('Failed to approve depot.');
    } finally {
      setConfirmApprove(false);
    }
  }

  async function handleDeactivate() {
    try {
      await deleteDepot(id).unwrap();
      toast.success('Depot deactivated.');
    } catch {
      toast.error('Failed to deactivate depot.');
    } finally {
      setConfirmDeactivate(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!depot) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-gray-500">Depot not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const isPending = depot.applicationStatus === 'pending';
  const isActive = depot.isActive;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {depot.name}
            </h1>
            {depot.applicationStatus ? (
              <Badge
                variant={
                  depot.applicationStatus === 'pending'
                    ? 'warning'
                    : depot.applicationStatus === 'approved'
                    ? 'success'
                    : 'destructive'
                }
              >
                {depot.applicationStatus}
              </Badge>
            ) : (
              <Badge variant={isActive ? 'success' : 'secondary'}>
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {depot.city} · {depot.address}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          {(isPending || (!isActive && depot.applicationStatus !== 'rejected')) && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
              onClick={() => setConfirmApprove(true)}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Depot
            </Button>
          )}
          {isActive && (
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 gap-2"
              onClick={() => setConfirmDeactivate(true)}
            >
              <PowerOff className="h-4 w-4" />
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
        </TabsList>

        {/* ── Overview tab ──────────────────────────────────────────────── */}
        <TabsContent value="overview" className="flex flex-col gap-5 mt-5">
          {/* Depot info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                Depot Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <InfoRow
                  label="Address"
                  value={
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      {depot.address}
                    </span>
                  }
                />
                <InfoRow label="City" value={depot.city} />
                <InfoRow
                  label="Coordinates"
                  value={
                    depot.latitude !== 0 || depot.longitude !== 0
                      ? `${depot.latitude.toFixed(5)}, ${depot.longitude.toFixed(5)}`
                      : undefined
                  }
                />
                <InfoRow
                  label="Phone"
                  value={
                    depot.phoneNumber ? (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {depot.phoneNumber}
                      </span>
                    ) : undefined
                  }
                />
                <InfoRow
                  label="Contact Email"
                  value={
                    depot.contactEmail ? (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {depot.contactEmail}
                      </span>
                    ) : undefined
                  }
                />
                {depot.managerId && (
                  <InfoRow
                    label="Manager ID"
                    value={
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-mono text-xs">{depot.managerId}</span>
                      </span>
                    }
                  />
                )}
                <InfoRow
                  label="Created"
                  value={
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {formatDate(depot.createdAt)}
                    </span>
                  }
                />
                {depot.applicationSubmittedAt && (
                  <InfoRow
                    label="Application Submitted"
                    value={formatDate(depot.applicationSubmittedAt)}
                  />
                )}
                {depot.notes && (
                  <div className="col-span-2 sm:col-span-3">
                    <InfoRow label="Notes" value={depot.notes} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company info (application depots only) */}
          {(depot.companyName || depot.companyRegistrationNumber || depot.taxId || depot.applicantUserId) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {depot.companyName && (
                    <InfoRow
                      label="Company Name"
                      value={
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          {depot.companyName}
                        </span>
                      }
                    />
                  )}
                  {depot.companyRegistrationNumber && (
                    <InfoRow
                      label="Registration Number"
                      value={
                        <span className="flex items-center gap-1 font-mono text-xs">
                          <Hash className="h-3.5 w-3.5 text-gray-400" />
                          {depot.companyRegistrationNumber}
                        </span>
                      }
                    />
                  )}
                  {depot.taxId && (
                    <InfoRow
                      label="Tax ID"
                      value={
                        <span className="font-mono text-xs">{depot.taxId}</span>
                      }
                    />
                  )}
                  {depot.applicantUserId && (
                    <InfoRow
                      label="Applicant User ID"
                      value={
                        <span className="font-mono text-xs">{depot.applicantUserId}</span>
                      }
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {(depot.companyRegDocUrl !== undefined || depot.taxClearanceDocUrl !== undefined) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Supporting Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <DocumentCard
                    label="Company Registration Document"
                    url={depot.companyRegDocUrl}
                  />
                  <DocumentCard
                    label="Tax Clearance Certificate"
                    url={depot.taxClearanceDocUrl}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Drivers tab ───────────────────────────────────────────────── */}
        <TabsContent value="drivers" className="mt-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-400" />
                Depot Drivers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-4 px-6">
              <DriversTab depotId={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve confirm */}
      <AlertDialog open={confirmApprove} onOpenChange={setConfirmApprove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this depot?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{depot.name}</strong> will be activated and made available for operations.
              You can deactivate it later if needed.
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
      <AlertDialog open={confirmDeactivate} onOpenChange={setConfirmDeactivate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate this depot?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{depot.name}</strong> will be removed from active operations. This can be
              reversed.
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
