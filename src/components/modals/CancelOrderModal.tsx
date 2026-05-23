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

interface CancelOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onConfirm: (note?: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function CancelOrderModal({
  open,
  onOpenChange,
  orderId,
  onConfirm,
  isLoading = false,
}: CancelOrderModalProps) {
  const [note, setNote] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(note.trim() || undefined);
  };

  const handleOpenChange = (val: boolean) => {
    if (!isLoading) {
      if (!val) setNote('');
      onOpenChange(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            You are about to cancel order <strong>#{orderId}</strong>. This action cannot be
            undone. Optionally add a note explaining why this order is being cancelled.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cancel-note"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Cancellation note <span className="text-gray-400 dark:text-gray-500">(optional)</span>
            </label>
            <Textarea
              id="cancel-note"
              placeholder="Enter cancellation note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
              Keep Order
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Cancel Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
