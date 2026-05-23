'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't render on login page
  if (pathname === ROUTES.LOGIN || pathname === '/login') {
    return null;
  }

  // Split pathname into non-empty segments
  const rawSegments = pathname.split('/').filter(Boolean);

  // Always start with Dashboard, then append path segments (max 3 total)
  const allSegments: { label: string; href: string }[] = [
    { label: 'Dashboard', href: ROUTES.DASHBOARD },
  ];

  // Build subsequent segments from path (skip 'dashboard' since it's already first)
  const pathSegments = rawSegments.filter((s) => s !== 'dashboard');

  pathSegments.slice(0, 2).forEach((segment) => {
    const href = '/' + rawSegments.slice(0, rawSegments.indexOf(segment) + 1).join('/');
    allSegments.push({ label: capitalize(segment), href });
  });

  // Trim to max 3
  const segments = allSegments.slice(0, 3);
  const lastIdx = segments.length - 1;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center">
      <ol className="flex items-center gap-1">
        {segments.map((segment, idx) => {
          const isLast = idx === lastIdx;

          return (
            <li key={segment.href} className="flex items-center gap-1">
              {idx === 0 && (
                <Home className="mr-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
              )}
              {isLast ? (
                <span
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                  aria-current="page"
                >
                  {segment.label}
                </span>
              ) : (
                <Link
                  href={segment.href}
                  className={cn(
                    'text-sm font-medium text-gray-500 transition-colors hover:text-gray-900',
                    'dark:text-gray-400 dark:hover:text-gray-100'
                  )}
                >
                  {segment.label}
                </Link>
              )}
              {!isLast && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
