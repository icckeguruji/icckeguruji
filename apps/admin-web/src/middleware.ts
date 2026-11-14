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

  // Read cookies
  let accessToken = req.cookies.get('sb-access-token')?.value;
  const iccRole = req.cookies.get('icc-role')?.value;

  if (!accessToken) {
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

  // If no auth token and no role cookie, redirect to login
  if (!accessToken && !iccRole) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  let role = iccRole || 'admin';

  if (accessToken && accessToken.includes('.')) {
    const payload = decodeJwtPayload(accessToken);
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    if (payload?.app_metadata?.role) {
      role = payload.app_metadata.role;
    }
  }

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
