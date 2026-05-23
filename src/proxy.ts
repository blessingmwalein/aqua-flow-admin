// NOTE: In Next.js 16, `middleware.ts` has been deprecated and renamed to
// `proxy.ts`. This file is the canonical route-protection entry point.
// Run `npx @next/codemod@canary middleware-to-proxy .` to migrate any
// remaining references if needed.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Token cookie name — must match TOKEN_KEYS.ACCESS in src/utils/storage.ts.
// The auth hook mirrors the localStorage token to this cookie on every login.
const ACCESS_TOKEN_COOKIE = 'aquaflow_access_token';

// Route prefixes that require an authenticated session
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

// Public-only routes — authenticated users should be redirected away
const AUTH_ROUTES = ['/login'];

function getToken(request: NextRequest): string | undefined {
  // 1. Check the mirrored cookie (set by useAuth.login)
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

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  const token = getToken(request);

  // Unauthenticated user accessing a protected route → redirect to /login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user accessing /login → redirect to /dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
