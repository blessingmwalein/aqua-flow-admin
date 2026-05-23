'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets,
  LayoutDashboard,
  Users,
  Truck,
  ShoppingCart,
  DollarSign,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  Tag,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { toggleSidebarCollapsed } from '@/redux/slices/uiSlice';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants/routes';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Users', href: ROUTES.USERS, icon: Users },
  { label: 'Drivers', href: ROUTES.DRIVERS, icon: Truck },
  { label: 'Orders', href: ROUTES.ORDERS, icon: ShoppingCart },
  { label: 'Revenue', href: ROUTES.REVENUE, icon: DollarSign },
  { label: 'Depots', href: ROUTES.DEPOTS, icon: Warehouse },
  { label: 'Pricing', href: ROUTES.PRICING, icon: Tag },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
  { label: 'Profile', href: ROUTES.PROFILE, icon: User },
];

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 64;

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const { logout } = useAuth();

  const isActive = (href: string) =>
    href === ROUTES.DASHBOARD
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="relative flex h-screen flex-col overflow-hidden border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        style={{ minWidth: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-3 dark:border-gray-800">
          <Link
            href={ROUTES.DASHBOARD}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.span
                  key="logo-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden whitespace-nowrap text-lg font-bold text-gray-900 dark:text-white"
                >
                  AquaFlow
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isCollapsed && 'justify-center px-2',
                  active
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    active
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      key={`label-${item.label}`}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 px-2 pb-4">
          <Separator className="mb-4 bg-gray-200 dark:bg-gray-800" />

          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void logout()}
                  className="w-full text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={() => void logout()}
              className="w-full justify-start gap-3 text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.span
                    key="logout-label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden whitespace-nowrap text-sm font-medium"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          )}

          <div className="mt-2">
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dispatch(toggleSidebarCollapsed())}
                    className="w-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    aria-label="Expand sidebar"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                onClick={() => dispatch(toggleSidebarCollapsed())}
                className="w-full justify-start gap-3 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-medium"
                >
                  Collapse
                </motion.span>
              </Button>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
