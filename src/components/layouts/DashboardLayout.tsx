'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { setSidebarOpen } from '@/redux/slices/uiSlice';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useAppDispatch();
  const isMobileSidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  // Close mobile sidebar when viewport reaches desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        dispatch(setSidebarOpen(false));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar — always visible on lg+ */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar — Sheet drawer */}
      <Sheet
        open={isMobileSidebarOpen}
        onOpenChange={(open) => dispatch(setSidebarOpen(open))}
      >
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <motion.div
        className="flex min-w-0 flex-1 flex-col overflow-hidden"
        // No margin animation needed — flex layout handles the shift
      >
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key="page-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full p-4 sm:p-6"
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
