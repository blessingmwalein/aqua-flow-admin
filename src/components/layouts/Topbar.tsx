'use client';

import { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { toggleSidebar } from '@/redux/slices/uiSlice';
import { useAuth } from '@/hooks';
import { Breadcrumbs } from './Breadcrumbs';
import { ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';

function getUserInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.[0]?.toUpperCase() ?? '';
  const l = lastName?.[0]?.toUpperCase() ?? '';
  return f + l || 'U';
}

export function Topbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const unreadCount = useAppSelector(
    (state) => state.notifications.unreadCount
  );

  const [searchQuery, setSearchQuery] = useState('');

  const initials = getUserInitials(user?.firstName, user?.lastName);
  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Guest';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
      {/* Left: Mobile menu toggle + Breadcrumbs */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          className="shrink-0 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden sm:flex">
          <Breadcrumbs />
        </div>
      </div>

      {/* Center: Search bar */}
      <div className="hidden max-w-sm flex-1 md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'h-9 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm',
              'text-gray-900 placeholder-gray-400 outline-none',
              'transition-colors duration-150',
              'focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500',
              'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500',
              'dark:focus:border-blue-500 dark:focus:bg-gray-900'
            )}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          onClick={() => router.push(ROUTES.DASHBOARD)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold leading-none text-white dark:bg-blue-500">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative ml-1 h-9 w-9 rounded-full p-0 ring-2 ring-transparent transition-all hover:ring-blue-500 focus-visible:ring-blue-500"
              aria-label="User menu"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={undefined} alt={displayName} />
                <AvatarFallback className="bg-blue-600 text-sm font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {displayName}
                </span>
                <span className="truncate text-xs font-normal text-gray-500 dark:text-gray-400">
                  {user?.email ?? ''}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE)}>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(ROUTES.SETTINGS)}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => void logout()}
              className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-900/20 dark:focus:text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
