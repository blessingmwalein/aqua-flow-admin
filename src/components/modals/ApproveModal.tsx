import * as React from 'react';
import { ConfirmModal } from './ConfirmModal';

interface ApproveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverName: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function ApproveModal({
  open,
  onOpenChange,
  driverName,
  onConfirm,
  isLoading = false,
}: ApproveModalProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Approve Driver"
      description={`Are you sure you want to approve ${driverName}? They will be granted access to accept delivery orders on the platform.`}
      confirmLabel="Approve"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      variant="default"
      isLoading={isLoading}
    />
  );
}
