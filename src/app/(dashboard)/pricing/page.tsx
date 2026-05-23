'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Plus,
  CheckCircle2,
  Pencil,
  Zap,
  Tag,
  Clock,
  DollarSign,
} from 'lucide-react';

import {
  useGetActivePricingConfigQuery,
  useGetPricingHistoryQuery,
  useCreatePricingConfigMutation,
  useUpdatePricingConfigMutation,
  useActivatePricingConfigMutation,
} from '@/redux/api/pricingApi';
import type { PricingConfig, CreatePricingConfigBody } from '@/types';
import { formatDate } from '@/utils';
import { useToast } from '@/hooks/useToast';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------
const pricingSchema = yup.object({
  name: yup.string().required('Name is required').min(3).max(100),
  baseDeliveryFee: yup
    .number()
    .required('Base delivery fee is required')
    .min(0)
    .typeError('Must be a number'),
  price5L: yup.number().required().min(0).typeError('Must be a number'),
  price10L: yup.number().required().min(0).typeError('Must be a number'),
  price20L: yup.number().required().min(0).typeError('Must be a number'),
  surgeEnabled: yup.boolean().default(false),
  surgeMultiplier: yup
    .number()
    .required()
    .min(1)
    .max(5)
    .typeError('Must be between 1 and 5'),
  effectiveFrom: yup.string().required('Effective date is required'),
});

type PricingFormValues = yup.InferType<typeof pricingSchema>;

function configToForm(config: PricingConfig): PricingFormValues {
  return {
    name: config.name,
    baseDeliveryFee: config.baseDeliveryFee,
    price5L: config.bottlePrices['5L'] ?? 0,
    price10L: config.bottlePrices['10L'] ?? 0,
    price20L: config.bottlePrices['20L'] ?? 0,
    surgeEnabled: config.surgeConfig.enabled,
    surgeMultiplier: config.surgeConfig.multiplier,
    effectiveFrom: config.effectiveFrom.slice(0, 10),
  };
}

function formToBody(values: PricingFormValues): CreatePricingConfigBody {
  return {
    name: values.name,
    baseDeliveryFee: values.baseDeliveryFee,
    bottlePrices: {
      '5L': values.price5L,
      '10L': values.price10L,
      '20L': values.price20L,
    },
    surgeConfig: {
      enabled: values.surgeEnabled ?? false,
      multiplier: values.surgeMultiplier,
      peakHours: [
        { start: 7, end: 9 },
        { start: 17, end: 20 },
      ],
    },
    effectiveFrom: new Date(values.effectiveFrom).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Pricing form dialog
// ---------------------------------------------------------------------------
function PricingFormDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialValues?: PricingFormValues;
  onSubmit: (data: PricingFormValues) => Promise<void>;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PricingFormValues>({
    resolver: yupResolver(pricingSchema),
    defaultValues: {
      surgeEnabled: false,
      surgeMultiplier: 1.5,
      ...initialValues,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          surgeEnabled: false,
          surgeMultiplier: 1.5,
          baseDeliveryFee: 1.5,
          price5L: 2,
          price10L: 3.5,
          price20L: 6,
        },
      );
    }
  }, [open, initialValues, reset]);

  const surgeEnabled = watch('surgeEnabled');
  const isEditing = !!initialValues;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Pricing Config' : 'New Pricing Config'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update an existing config. Changes take effect immediately if the config is active.'
              : 'New configs are inactive by default. Activate them explicitly.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 py-2"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Config name *</Label>
            <Input id="name" placeholder="Standard 2025-Q2" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="baseDeliveryFee">Base delivery fee (USD) *</Label>
            <Input
              id="baseDeliveryFee"
              type="number"
              step="0.01"
              placeholder="1.50"
              {...register('baseDeliveryFee')}
            />
            {errors.baseDeliveryFee && (
              <p className="text-xs text-red-500">{errors.baseDeliveryFee.message}</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bottle prices (USD per unit)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(['5L', '10L', '20L'] as const).map((size, i) => {
                const key = `price${size.replace('L', 'L')}` as keyof PricingFormValues;
                const fieldNames = ['price5L', 'price10L', 'price20L'] as const;
                const field = fieldNames[i];
                return (
                  <div key={size} className="flex flex-col gap-1.5">
                    <Label htmlFor={field}>{size}</Label>
                    <Input
                      id={field}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register(field)}
                    />
                    {errors[field] && (
                      <p className="text-xs text-red-500">{errors[field]?.message}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Surge pricing</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Apply a multiplier during peak hours (07–09, 17–20)
                </p>
              </div>
              <Switch
                id="surgeEnabled"
                checked={!!surgeEnabled}
                onCheckedChange={(v) => setValue('surgeEnabled', v)}
              />
            </div>

            {surgeEnabled && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="surgeMultiplier">Surge multiplier (1.0–5.0)</Label>
                <Input
                  id="surgeMultiplier"
                  type="number"
                  step="0.1"
                  min={1}
                  max={5}
                  {...register('surgeMultiplier')}
                />
                {errors.surgeMultiplier && (
                  <p className="text-xs text-red-500">{errors.surgeMultiplier.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="effectiveFrom">Effective from *</Label>
            <Input id="effectiveFrom" type="date" {...register('effectiveFrom')} />
            {errors.effectiveFrom && (
              <p className="text-xs text-red-500">{errors.effectiveFrom.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading
                ? 'Saving…'
                : isEditing
                ? 'Save changes'
                : 'Create config'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Active config card
// ---------------------------------------------------------------------------
function ActiveConfigCard({ config }: { config: PricingConfig }) {
  return (
    <Card className="border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <CardTitle className="text-base text-green-800 dark:text-green-300">
              Active Config: {config.name}
            </CardTitle>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Effective from {formatDate(config.effectiveFrom)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Base Fee</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ${config.baseDeliveryFee.toFixed(2)}
            </p>
          </div>
          {(['5L', '10L', '20L'] as const).map((size) => (
            <div key={size}>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{size}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ${(config.bottlePrices[size] ?? 0).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {config.surgeConfig.enabled && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 dark:border-yellow-800 dark:bg-yellow-900/20">
            <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Surge pricing active · ×{config.surgeConfig.multiplier} during peak hours (07–09, 17–20)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PricingPage() {
  const toast = useToast();

  const [histPage, setHistPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editConfig, setEditConfig] = React.useState<PricingConfig | null>(null);
  const [activateTarget, setActivateTarget] = React.useState<PricingConfig | null>(null);

  const { data: activeConfig, isLoading: activeLoading } = useGetActivePricingConfigQuery();
  const { data: history, isLoading: histLoading } = useGetPricingHistoryQuery({
    page: histPage,
    limit: 10,
  });

  const [createConfig, { isLoading: creating }] = useCreatePricingConfigMutation();
  const [updateConfig, { isLoading: updating }] = useUpdatePricingConfigMutation();
  const [activateConfig, { isLoading: activating }] = useActivatePricingConfigMutation();

  async function handleCreate(values: PricingFormValues) {
    try {
      await createConfig(formToBody(values)).unwrap();
      toast.success('Pricing config created. Activate it to apply to orders.');
      setCreateOpen(false);
    } catch {
      toast.error('Failed to create pricing config.');
    }
  }

  async function handleEdit(values: PricingFormValues) {
    if (!editConfig) return;
    try {
      await updateConfig({ id: editConfig.id, body: formToBody(values) }).unwrap();
      toast.success('Pricing config updated.');
      setEditConfig(null);
    } catch {
      toast.error('Failed to update pricing config.');
    }
  }

  async function handleActivate() {
    if (!activateTarget) return;
    try {
      await activateConfig(activateTarget.id).unwrap();
      toast.success(`"${activateTarget.name}" is now the active pricing config.`);
      setActivateTarget(null);
    } catch {
      toast.error('Failed to activate pricing config.');
    }
  }

  const configs = history?.data ?? [];
  const meta = history?.meta;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Pricing
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Manage bottle prices, delivery fees, and surge config
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Config
        </Button>
      </div>

      {/* Active config */}
      {activeLoading ? (
        <Skeleton className="h-44 w-full" />
      ) : activeConfig ? (
        <ActiveConfigCard config={activeConfig} />
      ) : (
        <Card className="border-yellow-300 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10">
          <CardContent className="p-6 flex items-center gap-3">
            <Tag className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              No active pricing config. Create one and activate it.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Config history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            Config History
          </CardTitle>
          <CardDescription>All pricing configurations — newest first</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {histLoading ? (
            <div className="flex flex-col gap-3 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Base Fee</TableHead>
                    <TableHead className="text-right">5L</TableHead>
                    <TableHead className="text-right">10L</TableHead>
                    <TableHead className="text-right">20L</TableHead>
                    <TableHead>Surge</TableHead>
                    <TableHead>Effective</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-12 text-center text-gray-400">
                        No pricing configs yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    configs.map((cfg) => (
                      <TableRow key={cfg.id}>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {cfg.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cfg.isActive ? 'success' : 'secondary'}>
                            {cfg.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${cfg.baseDeliveryFee.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-gray-600 dark:text-gray-300">
                          ${(cfg.bottlePrices['5L'] ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-gray-600 dark:text-gray-300">
                          ${(cfg.bottlePrices['10L'] ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-gray-600 dark:text-gray-300">
                          ${(cfg.bottlePrices['20L'] ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {cfg.surgeConfig.enabled ? (
                            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-sm">
                              <Zap className="h-3.5 w-3.5" />
                              ×{cfg.surgeConfig.multiplier}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">Off</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(cfg.effectiveFrom)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-400 whitespace-nowrap">
                          {formatDate(cfg.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setEditConfig(cfg)}
                              aria-label="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {!cfg.isActive && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-green-600 hover:text-green-700 dark:text-green-400"
                                onClick={() => setActivateTarget(cfg)}
                                aria-label="Activate"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
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
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage}
              onClick={() => setHistPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setHistPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create dialog */}
      <PricingFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isLoading={creating}
      />

      {/* Edit dialog */}
      <PricingFormDialog
        open={!!editConfig}
        onOpenChange={(v) => { if (!v) setEditConfig(null); }}
        initialValues={editConfig ? configToForm(editConfig) : undefined}
        onSubmit={handleEdit}
        isLoading={updating}
      />

      {/* Activate confirm */}
      <AlertDialog open={!!activateTarget} onOpenChange={(v) => { if (!v) setActivateTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate "{activateTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will atomically deactivate the current config and activate this one. New order
              price calculations will use these rates immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleActivate()} disabled={activating}>
              {activating ? 'Activating…' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
