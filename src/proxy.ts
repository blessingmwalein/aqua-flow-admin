// NOTE: In Next.js 16, `middleware.ts` has been deprecated and renamed to
// `proxy.ts`. This file is the canonical route-protection entry point.
// Run `npx @next/codemod@canary middleware-to-proxy .` to migrate any
// remaining references if needed.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Token cookie name — must match TOKEN_KEYS.ACCESS in src/utils/storage.ts.
// The auth hook mirrors the localStorage token to this cookie on every login.
const ACCESS_TOKEN_COOKIE = 'aquaflow_access_token';

// Route prefixes that require an authenticated session.
// Matched as exact OR with a trailing slash to avoid false positives
// (e.g. "/users" must not match "/usersettings").
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/users',
  '/drivers',
  '/orders',
  '/revenue',
  '/depots',
  '/pricing',
  '/settings',
  '/profile',
];

// Public-only routes — authenticated users are redirected away from these
const AUTH_ROUTES = ['/login'];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route);
}

function getToken(request: NextRequest): string | undefined {
  // 1. Check the mirrored cookie (set by useAuth.login / baseApi refresh)
  const cookie = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (cookie) return cookie;

  // 2. Fall back to Authorization header (useful for API clients / SSR requests)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return undefined;
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const token = getToken(request);

  // Root path: redirect to dashboard (server component handles this too, but
  // belt-and-suspenders so unauthenticated users go to login immediately)
  if (pathname === '/') {
    const dest = token ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Unauthenticated user accessing a protected route → redirect to /login
  if (isProtected(pathname) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user accessing /login → redirect to /dashboard
  if (isAuthRoute(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
