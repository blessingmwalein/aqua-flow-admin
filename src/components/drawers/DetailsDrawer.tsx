'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function DetailsDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: DetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-[480px]"
      >
        <SheetHeader className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-5">{children}</div>
        </ScrollArea>

        {footer && (
          <SheetFooter className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
