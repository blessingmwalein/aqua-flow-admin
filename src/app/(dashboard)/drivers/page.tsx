'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  ThumbsDown,
  FileText,
  ImageIcon,
  X,
  Star,
  Truck,
  User,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  ExternalLink,
  SlidersHorizontal,
  Warehouse,
  MapPin,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataTable } from '@/components/tables';
import { StatsCard } from '@/components/cards';
import { ApproveModal, RejectModal } from '@/components/modals';
import {
  Badge,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetDriversQuery,
  useGetDriverByIdQuery,
  useApproveDriverMutation,
  useRejectDriverMutation,
  useGetDriverDocumentsQuery,
} from '@/redux/api/driversApi';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks';
import { formatDate, formatCurrency, getInitials } from '@/utils';
import type { Driver, DriverApprovalStatus, DriverDocument } from '@/types';

const APPROVAL_STATUS_OPTIONS: { value: DriverApprovalStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const DOC_TYPE_LABELS: Record<string, string> = {
  drivers_license: "Driver's License",
  national_id: 'National ID',
  vehicle_registration: 'Vehicle Registration',
  insurance: 'Insurance Certificate',
  police_clearance: 'Police Clearance',
};

function approvalBadgeClass(status: DriverApprovalStatus) {
  switch (status) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400';
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
    case 'under_review':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
  }
}

function onlineStatusClass(status: Driver['onlineStatus']) {
  switch (status) {
    case 'online':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'offline':
      return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400';
    case 'busy':
      return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
    case 'suspended':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
  }
}

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

function docStatusClass(status: DriverDocument['status']) {
  switch (status) {
    case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  }
}

function InfoRow({ label, value, icon: Icon }: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-gray-100">{value ?? '—'}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// File viewer modal
// ---------------------------------------------------------------------------
function FileViewerModal({
  url,
  label,
  open,
  onOpenChange,
}: {
  url: string;
  label: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const isPdf = url.toLowerCase().includes('.pdf');
  const isImage = /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between">
          <DialogTitle className="text-base">{label}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 min-h-64">
          {isPdf ? (
            <iframe
              src={url}
              className="w-full h-[70vh]"
              title={label}
            />
          ) : isImage ? (
            <div className="flex items-center justify-center p-4 min-h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={label}
                className="max-w-full max-h-[65vh] rounded object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-500">
              <FileText className="h-12 w-12 text-gray-300" />
              <p className="text-sm">Cannot preview this file.</p>
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
          )}
        </div>
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in new tab
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Documents tab
// ---------------------------------------------------------------------------
function DocumentsTab({ driverId }: { driverId: string }) {
  const { data: docs, isLoading } = useGetDriverDocumentsQuery(driverId);
  const [viewer, setViewer] = React.useState<{ url: string; label: string } | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 pt-2">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
      </div>
    );
  }

  if (!docs || docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
        <FileText className="h-10 w-10 text-gray-300" />
        <p className="text-sm">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 pt-2">
        {docs.map((doc) => {
          const label = DOC_TYPE_LABELS[doc.type] ?? doc.type.replace(/_/g, ' ');
          const isImage = /\.(jpe?g|png|gif|webp)(\?|$)/i.test(doc.fileUrl);

          return (
            <div
              key={doc.id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {isImage ? (
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <FileText className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Uploaded {formatDate(doc.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={`text-xs ${docStatusClass(doc.status)}`}>
                  {doc.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs gap-1"
                  onClick={() => setViewer({ url: resolveFileUrl(doc.fileUrl), label })}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {viewer && (
        <FileViewerModal
          url={viewer.url}
          label={viewer.label}
          open={!!viewer}
          onOpenChange={(v) => { if (!v) setViewer(null); }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Driver detail drawer
// ---------------------------------------------------------------------------
function DriverDrawer({
  driver,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onViewDepot,
}: {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApprove: (d: Driver) => void;
  onReject: (d: Driver) => void;
  onViewDepot: (depotId: string) => void;
}) {
  const canActOnApproval =
    driver?.approvalStatus === 'pending' || driver?.approvalStatus === 'under_review';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-[50vw]"
      >
        {driver && (
          <>
            <SheetHeader className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 flex-shrink-0">
                  {driver.photoUrl && (
                    <AvatarImage src={driver.photoUrl} alt={`${driver.firstName} ${driver.lastName}`} />
                  )}
                  <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {getInitials(driver.firstName, driver.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="text-lg">
                    {driver.firstName} {driver.lastName}
                  </SheetTitle>
                  <SheetDescription className="truncate">{driver.email}</SheetDescription>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge className={`text-xs ${approvalBadgeClass(driver.approvalStatus)}`}>
                      {driver.approvalStatus.replace('_', ' ')}
                    </Badge>
                    <Badge className={`text-xs ${onlineStatusClass(driver.onlineStatus)}`}>
                      {driver.onlineStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="px-6 py-5">
                {/* Metric strip */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="flex flex-col items-center gap-0.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 py-3">
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {(driver.averageRating ?? 0).toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      Rating
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 py-3">
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {driver.totalDeliveries}
                    </span>
                    <span className="text-xs text-gray-400">Deliveries</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 py-3">
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(driver.totalEarnings)}
                    </span>
                    <span className="text-xs text-gray-400">Earned</span>
                  </div>
                </div>

                <Tabs defaultValue="basic">
                  <TabsList className="w-full mb-5">
                    <TabsTrigger value="basic" className="flex-1 gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="vehicle" className="flex-1 gap-1.5">
                      <Truck className="h-3.5 w-3.5" />
                      Vehicle
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex-1 gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Documents
                    </TabsTrigger>
                    {driver.depot && (
                      <TabsTrigger value="depot" className="flex-1 gap-1.5">
                        <Warehouse className="h-3.5 w-3.5" />
                        Depot
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {/* ── Basic Info ── */}
                  <TabsContent value="basic" className="mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow icon={Mail} label="Email" value={driver.email} />
                      <InfoRow icon={Phone} label="Phone" value={driver.phoneNumber} />
                      <InfoRow
                        icon={Calendar}
                        label="Registered"
                        value={formatDate(driver.createdAt)}
                      />
                      <InfoRow label="User ID" value={
                        <span className="font-mono text-xs break-all text-gray-500">
                          {driver.userId}
                        </span>
                      } />
                      {driver.approvedAt && (
                        <InfoRow label="Approved At" value={formatDate(driver.approvedAt)} />
                      )}
                      {driver.approvedBy && (
                        <InfoRow label="Approved By" value={
                          <span className="font-mono text-xs">{driver.approvedBy}</span>
                        } />
                      )}
                      {driver.rejectionReason && (
                        <div className="col-span-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-red-400 mb-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Rejection Reason
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            {driver.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* ── Vehicle ── */}
                  <TabsContent value="vehicle" className="mt-0">
                    {driver.vehicle ? (
                      <div className="grid grid-cols-2 gap-4">
                        <InfoRow label="Make" value={driver.vehicle.make} />
                        <InfoRow label="Model" value={driver.vehicle.model} />
                        <InfoRow label="Year" value={driver.vehicle.year} />
                        <InfoRow label="Plate No." value={
                          <span className="font-mono font-semibold tracking-wider">
                            {driver.vehicle.plateNumber}
                          </span>
                        } />
                        <InfoRow label="Type" value={
                          <span className="capitalize">{driver.vehicle.type}</span>
                        } />
                        {driver.vehicle.color && (
                          <InfoRow label="Colour" value={driver.vehicle.color} />
                        )}
                        {driver.vehicle.capacity !== undefined && (
                          <InfoRow
                            label="Capacity (L)"
                            value={driver.vehicle.capacity.toLocaleString()}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
                        <Truck className="h-10 w-10 text-gray-300" />
                        <p className="text-sm">No vehicle registered.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* ── Documents ── */}
                  <TabsContent value="documents" className="mt-0">
                    <DocumentsTab driverId={driver.id} />
                  </TabsContent>

                  {/* ── Depot ── */}
                  {driver.depot && (
                    <TabsContent value="depot" className="mt-0">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
                              <Warehouse className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                {driver.depot.name}
                              </p>
                              {driver.depot.companyName && driver.depot.companyName !== driver.depot.name && (
                                <p className="text-xs text-gray-400">{driver.depot.companyName}</p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              driver.depot.applicationStatus === 'approved' || driver.depot.isActive
                                ? 'success'
                                : driver.depot.applicationStatus === 'rejected'
                                ? 'destructive'
                                : 'warning'
                            }
                            className="flex-shrink-0 text-xs"
                          >
                            {driver.depot.applicationStatus ?? (driver.depot.isActive ? 'active' : 'inactive')}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <InfoRow
                            icon={MapPin}
                            label="Address"
                            value={driver.depot.address}
                          />
                          <InfoRow label="City" value={driver.depot.city} />
                          {driver.depot.phoneNumber && (
                            <InfoRow icon={Phone} label="Phone" value={driver.depot.phoneNumber} />
                          )}
                          {driver.depot.contactEmail && (
                            <InfoRow icon={Mail} label="Email" value={driver.depot.contactEmail} />
                          )}
                          {driver.depot.companyRegistrationNumber && (
                            <InfoRow label="Reg. Number" value={
                              <span className="font-mono text-xs">{driver.depot.companyRegistrationNumber}</span>
                            } />
                          )}
                          {driver.depot.taxId && (
                            <InfoRow label="Tax ID" value={
                              <span className="font-mono text-xs">{driver.depot.taxId}</span>
                            } />
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 mt-1"
                          onClick={() => {
                            onViewDepot(driver.depot!.id);
                            onOpenChange(false);
                          }}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View depot page
                        </Button>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </ScrollArea>

            {canActOnApproval && (
              <SheetFooter className="border-t border-gray-200 px-6 py-4 dark:border-gray-700 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => onReject(driver)}
                >
                  <ThumbsDown className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600"
                  onClick={() => onApprove(driver)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Approve
                </Button>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Column helper (defined outside the component to avoid recreation on render)
// ---------------------------------------------------------------------------
const colHelper = createColumnHelper<Driver>();

function buildColumns(
  onView: (d: Driver) => void,
  onApprove: (d: Driver) => void,
  onReject: (d: Driver) => void,
  onViewDepot: (depotId: string) => void,
): ColumnDef<Driver, unknown>[] {
  return [
    colHelper.accessor(
      (row) => `${row.firstName} ${row.lastName}`,
      {
        id: 'name',
        header: 'Driver',
        enableSorting: true,
        cell: ({ row }) => {
          const d = row.original;
          return (
            <div className="flex items-center gap-3 min-w-[180px]">
              <Avatar className="h-9 w-9 flex-shrink-0">
                {d.photoUrl && <AvatarImage src={d.photoUrl} alt={`${d.firstName} ${d.lastName}`} />}
                <AvatarFallback className="text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {getInitials(d.firstName, d.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[140px] text-sm">
                  {d.firstName} {d.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate max-w-[140px]">{d.email}</p>
              </div>
            </div>
          );
        },
      },
    ) as ColumnDef<Driver, unknown>,
    colHelper.accessor('phoneNumber', {
      id: 'contact',
      header: 'Contact & Vehicle',
      enableSorting: false,
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex flex-col gap-0.5 min-w-[160px]">
            <span className="text-sm text-gray-700 dark:text-gray-300">{d.phoneNumber ?? '—'}</span>
            {d.vehicle ? (
              <span className="text-xs text-gray-400">
                {d.vehicle.make} {d.vehicle.model} · {d.vehicle.plateNumber}
              </span>
            ) : (
              <span className="text-xs text-gray-400">No vehicle</span>
            )}
          </div>
        );
      },
    }) as ColumnDef<Driver, unknown>,
    colHelper.accessor('depot', {
      id: 'depot',
      header: 'Depot',
      enableSorting: false,
      cell: ({ row }) => {
        const d = row.original;
        if (!d.depot) {
          return <span className="text-xs text-gray-400">Independent</span>;
        }
        return (
          <button
            type="button"
            onClick={() => onViewDepot(d.depot!.id)}
            className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50 transition-colors max-w-[160px]"
          >
            <Warehouse className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{d.depot.name}</span>
          </button>
        );
      },
    }) as ColumnDef<Driver, unknown>,
    colHelper.accessor('approvalStatus', {
      header: 'Approval',
      enableSorting: true,
      cell: ({ getValue }) => (
        <Badge className={`text-xs w-fit ${approvalBadgeClass(getValue())}`}>
          {getValue().replace('_', ' ')}
        </Badge>
      ),
    }) as ColumnDef<Driver, unknown>,
    colHelper.accessor('onlineStatus', {
      header: 'Online',
      enableSorting: true,
      cell: ({ getValue }) => (
        <Badge className={`text-xs w-fit ${onlineStatusClass(getValue())}`}>
          {getValue()}
        </Badge>
      ),
    }) as ColumnDef<Driver, unknown>,
    colHelper.accessor('averageRating', {
      header: 'Rating',
      enableSorting: true,
      cell: ({ getValue, row }) => (
        <span className="text-sm">{(getValue() ?? 0).toFixed(1)}★ · {row.original.totalRatings ?? 0} reviews</span>
      ),
    }) as ColumnDef<Driver, unknown>,
    colHelper.accessor('createdAt', {
      header: 'Registered',
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-500 whitespace-nowrap">{formatDate(getValue())}</span>
      ),
    }) as ColumnDef<Driver, unknown>,
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => {
        const d = row.original;
        const canAct = d.approvalStatus === 'pending' || d.approvalStatus === 'under_review';
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onView(d)}>
                <Eye className="h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {canAct && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onApprove(d)}
                    className="text-emerald-600 dark:text-emerald-400"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onReject(d)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    } as ColumnDef<Driver, unknown>,
  ];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DriversPage() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [approvalFilter, setApprovalFilter] = React.useState<DriverApprovalStatus | ''>('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [selectedDriver, setSelectedDriver] = React.useState<Driver | null>(null);
  const [approveTarget, setApproveTarget] = React.useState<Driver | null>(null);
  const [rejectTarget, setRejectTarget] = React.useState<Driver | null>(null);

  // Deep-link from notification: ?driverId=xxx opens the drawer for that driver
  const pendingDriverId = searchParams.get('driverId');
  const { data: pendingDriver } = useGetDriverByIdQuery(pendingDriverId ?? '', {
    skip: !pendingDriverId,
  });
  React.useEffect(() => {
    if (pendingDriver && pendingDriverId) {
      setSelectedDriver(pendingDriver);
      router.replace(ROUTES.DRIVERS);
    }
  }, [pendingDriver, pendingDriverId, router]);

  const queryParams = React.useMemo(() => ({
    page,
    limit: pageSize,
    ...(approvalFilter ? { approvalStatus: approvalFilter } : {}),
  }), [page, pageSize, approvalFilter]);

  const { data, isLoading, isFetching } = useGetDriversQuery(queryParams);
  const [approveDriver, { isLoading: isApproving }] = useApproveDriverMutation();
  const [rejectDriver, { isLoading: isRejecting }] = useRejectDriverMutation();

  const displayData = React.useMemo(() => {
    if (!data?.data) return [];
    if (!searchQuery.trim()) return data.data;
    const q = searchQuery.toLowerCase();
    return data.data.filter(
      (d) =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        (d.phoneNumber ?? '').toLowerCase().includes(q) ||
        (d.vehicle?.make ?? '').toLowerCase().includes(q) ||
        (d.vehicle?.model ?? '').toLowerCase().includes(q) ||
        (d.vehicle?.plateNumber ?? '').toLowerCase().includes(q),
    );
  }, [data?.data, searchQuery]);

  const totalCount = searchQuery.trim() ? displayData.length : (data?.meta?.total ?? 0);

  const approvedCount = displayData.filter((d) => d.approvalStatus === 'approved').length;
  const pendingCount = displayData.filter(
    (d) => d.approvalStatus === 'pending' || d.approvalStatus === 'under_review',
  ).length;
  const rejectedCount = displayData.filter((d) => d.approvalStatus === 'rejected').length;

  async function handleApprove() {
    if (!approveTarget) return;
    try {
      await approveDriver(approveTarget.id).unwrap();
      toast.success('Driver approved', `${approveTarget.firstName} ${approveTarget.lastName} can now accept orders.`);
      setApproveTarget(null);
      setSelectedDriver(null);
    } catch {
      toast.error('Failed to approve driver', 'Please try again.');
    }
  }

  async function handleReject(reason?: string) {
    if (!rejectTarget) return;
    try {
      await rejectDriver({ id: rejectTarget.id, reason }).unwrap();
      toast.success('Driver rejected', `${rejectTarget.firstName} ${rejectTarget.lastName} has been rejected.`);
      setRejectTarget(null);
      setSelectedDriver(null);
    } catch {
      toast.error('Failed to reject driver', 'Please try again.');
    }
  }

  const columns = React.useMemo(
    () => buildColumns(
      setSelectedDriver,
      setApproveTarget,
      setRejectTarget,
      (depotId) => router.push(ROUTES.DEPOT_DETAIL(depotId)),
    ),
    [router],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Drivers</h1>
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm px-2.5 py-0.5">
          {totalCount}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Approved Drivers"
          value={isLoading ? '—' : approvedCount}
          icon={CheckCircle}
          isLoading={isLoading}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatsCard
          title="Pending Review"
          value={isLoading ? '—' : pendingCount}
          icon={Clock}
          isLoading={isLoading}
          iconColor="text-amber-500"
          iconBg="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatsCard
          title="Rejected"
          value={isLoading ? '—' : rejectedCount}
          icon={XCircle}
          isLoading={isLoading}
          iconColor="text-red-500"
          iconBg="bg-red-50 dark:bg-red-900/20"
        />
      </div>

      {/* Filter bar + table */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <SlidersHorizontal className="h-4 w-4" />
            Filters:
          </div>
          <Select
            value={approvalFilter || '__all__'}
            onValueChange={(v) => {
              setApprovalFilter(v === '__all__' ? '' : (v as DriverApprovalStatus));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-48">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              {APPROVAL_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {approvalFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setApprovalFilter(''); setPage(1); }}
              className="h-9 gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={displayData}
          isLoading={isLoading || isFetching}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          onSearch={setSearchQuery}
          searchPlaceholder="Search by name, email, phone or vehicle…"
          emptyMessage="No drivers found."
        />
      </div>

      {/* Driver details drawer */}
      <DriverDrawer
        driver={selectedDriver}
        open={!!selectedDriver}
        onOpenChange={(v) => { if (!v) setSelectedDriver(null); }}
        onApprove={(d) => { setApproveTarget(d); }}
        onReject={(d) => { setRejectTarget(d); }}
        onViewDepot={(depotId) => { setSelectedDriver(null); router.push(ROUTES.DEPOT_DETAIL(depotId)); }}
      />

      {/* Approve modal */}
      <ApproveModal
        open={!!approveTarget}
        onOpenChange={(open) => { if (!open) setApproveTarget(null); }}
        driverName={approveTarget ? `${approveTarget.firstName} ${approveTarget.lastName}` : ''}
        onConfirm={handleApprove}
        isLoading={isApproving}
      />

      {/* Reject modal */}
      <RejectModal
        open={!!rejectTarget}
        onOpenChange={(open) => { if (!open) setRejectTarget(null); }}
        driverName={rejectTarget ? `${rejectTarget.firstName} ${rejectTarget.lastName}` : ''}
        onConfirm={handleReject}
        isLoading={isRejecting}
      />
    </div>
  );
}
