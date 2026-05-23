'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface RejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverName: string;
  onConfirm: (reason?: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function RejectModal({
  open,
  onOpenChange,
  driverName,
  onConfirm,
  isLoading = false,
}: RejectModalProps) {
  const [reason, setReason] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(reason.trim() || undefined);
  };

  const handleOpenChange = (val: boolean) => {
    if (!isLoading) {
      if (!val) setReason('');
      onOpenChange(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Driver</DialogTitle>
          <DialogDescription>
            You are about to reject <strong>{driverName}</strong>. They will not be permitted to
            accept orders. Optionally provide a reason for the rejection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reject-reason"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Reason <span className="text-gray-400 dark:text-gray-500">(optional)</span>
            </label>
            <Textarea
              id="reject-reason"
              placeholder="Enter rejection reason…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Reject Driver
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
