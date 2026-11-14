import { NextRequest, NextResponse } from 'next/server';

/** Routes that only admins can access; teachers get redirected to /teacher */
const ADMIN_ONLY_PATHS = [
  '/settings',
  '/students',
  '/reports',
  '/payments',
  '/academics',
  '/examinations',
  '/teachers',
];

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow the login page and static assets
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/thumbnails') ||
    pathname.startsWith('/icons')
  ) {
    return NextResponse.next();
  }

  // Read the Supabase auth cookie
  let accessToken = req.cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    // Check JSON cookie format used by supabase-js v2
    const allCookies = req.cookies.getAll();
    const sbCookie = allCookies.find(
      (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    );
    if (sbCookie?.value) {
      try {
        const parsed = JSON.parse(sbCookie.value);
        accessToken = parsed?.access_token || (Array.isArray(parsed) ? parsed[0] : null);
      } catch {
        accessToken = sbCookie.value;
      }
    }
  }

  // If no token found at all, redirect to login
  if (!accessToken) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT payload locally (instant, zero network latency)
  const payload = decodeJwtPayload(accessToken);
  if (!payload) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check token expiration
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Get user role from payload or fallback cookie
  const role =
    (payload.app_metadata?.role as string | undefined) ||
    req.cookies.get('icc-role')?.value ||
    'admin';

  // Teachers cannot access admin-only sections
  if (role === 'teacher') {
    const isAdminOnly = ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
    if (isAdminOnly || pathname === '/') {
      const teacherUrl = new URL('/teacher', req.url);
      return NextResponse.redirect(teacherUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)'],
};
