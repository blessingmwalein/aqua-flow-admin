'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Warehouse,
  Package,
  CreditCard,
  CheckCircle2,
  Truck,
  CheckCheck,
} from 'lucide-react';

import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationsReadMutation,
} from '@/redux/api/notificationsApi';
import type { AppNotification } from '@/types';
import { ROUTES } from '@/constants/routes';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getNotificationRoute(notification: AppNotification): string | null {
  const { depotId, orderId, driverId } = notification.data ?? {};
  if (depotId) return ROUTES.DEPOT_DETAIL(depotId);
  if (orderId) return ROUTES.ORDER_DETAIL(orderId);
  if (driverId) return `${ROUTES.DRIVERS}?driverId=${driverId}`;
  return null;
}

function NotificationIcon({ title }: { title: string }) {
  const t = title.toLowerCase();
  const cls = 'h-4 w-4 flex-shrink-0';
  if (t.includes('depot')) return <Warehouse className={`${cls} text-blue-500`} />;
  if (t.includes('payment')) return <CreditCard className={`${cls} text-green-500`} />;
  if (t.includes('approved')) return <CheckCircle2 className={`${cls} text-emerald-500`} />;
  if (t.includes('driver') || t.includes('delivery')) return <Truck className={`${cls} text-purple-500`} />;
  if (t.includes('order')) return <Package className={`${cls} text-orange-500`} />;
  return <Bell className={`${cls} text-gray-400`} />;
}

// ---------------------------------------------------------------------------
// Notification row (used in both dropdown and modal)
// ---------------------------------------------------------------------------
function NotificationItem({
  notification,
  onRead,
  onNavigate,
}: {
  notification: AppNotification;
  onRead: (ids: string[]) => void;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const route = getNotificationRoute(notification);

  function handleClick() {
    if (!notification.isRead) onRead([notification.id]);
    onNavigate?.();
    if (route) router.push(route);
  }

  return (
    <div
      role={route ? 'button' : undefined}
      tabIndex={route ? 0 : undefined}
      onClick={route ? handleClick : undefined}
      onKeyDown={route ? (e) => e.key === 'Enter' && handleClick() : undefined}
      className={[
        'flex gap-3 px-4 py-3 transition-colors',
        route ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : '',
        !notification.isRead
          ? 'bg-blue-50/70 dark:bg-blue-950/25'
          : 'bg-white dark:bg-transparent',
      ].join(' ')}
    >
      {/* Icon bubble */}
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <NotificationIcon title={notification.title} />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-tight ${
              !notification.isRead
                ? 'font-semibold text-gray-900 dark:text-gray-100'
                : 'font-medium text-gray-700 dark:text-gray-300'
            }`}
          >
            {notification.title}
          </p>
          <span className="flex-shrink-0 text-[11px] text-gray-400 whitespace-nowrap">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
          {notification.body}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="mt-2 h-2 w-2 flex-shrink-0 self-start rounded-full bg-blue-500" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full notifications modal
// ---------------------------------------------------------------------------
function NotificationsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useGetNotificationsQuery(
    { page, limit: 15 },
    { skip: !open },
  );
  const [markRead] = useMarkNotificationsReadMutation();

  const notifications = data?.data ?? [];
  const meta = data?.meta;
  const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);

  React.useEffect(() => {
    if (!open) setPage(1);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between px-5 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-400" />
            All Notifications
          </DialogTitle>
          {unreadIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={() => void markRead({ ids: unreadIds })}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          {isLoading ? (
            <div className="flex flex-col gap-1 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
              <Bell className="h-10 w-10 text-gray-300" />
              <p className="text-sm">No notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={(ids) => void markRead({ ids })}
                  onNavigate={() => onOpenChange(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-3 text-sm text-gray-500">
            <span>
              Page {meta.page} of {meta.totalPages} · {meta.total} total
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
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Dropdown component (used in Topbar)
// ---------------------------------------------------------------------------
export function NotificationDropdown() {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  // Poll unread count every 30 s
  const { data: countData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30_000,
  });
  const unreadCount = countData?.count ?? 0;

  // Only fetch the list when the dropdown is open
  const { data: recentData, isLoading: recentLoading } = useGetNotificationsQuery(
    { page: 1, limit: 8 },
    { skip: !dropdownOpen },
  );
  const [markRead] = useMarkNotificationsReadMutation();

  const notifications = recentData?.data ?? [];
  const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold leading-none text-white dark:bg-blue-500">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-gray-500 hover:text-gray-700"
                onClick={() => void markRead({ ids: unreadIds })}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto">
            {recentLoading ? (
              <div className="flex flex-col gap-1 p-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
                <Bell className="h-8 w-8 text-gray-300" />
                <p className="text-xs">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={(ids) => void markRead({ ids })}
                    onNavigate={() => setDropdownOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
              onClick={() => {
                setDropdownOpen(false);
                setModalOpen(true);
              }}
            >
              View all notifications
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationsModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
