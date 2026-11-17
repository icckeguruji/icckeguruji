import { NextRequest, NextResponse } from 'next/server';

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

  // 1. If someone visits /teacher route, redirect to home or admin
  if (pathname.startsWith('/teacher')) {
    const homeUrl = new URL('/', req.url);
    return NextResponse.redirect(homeUrl);
  }

  // 2. Allow all public routes, static assets, APIs, and login
  if (
    !pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/thumbnails') ||
    pathname.startsWith('/icons')
  ) {
    return NextResponse.next();
  }

  // 3. Admin routes (/admin and /admin/*) require authentication
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

  // If no auth token and no admin role cookie, redirect to login
  if (!accessToken && iccRole !== 'admin') {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (accessToken && accessToken.includes('.')) {
    const payload = decodeJwtPayload(accessToken);
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)'],
};
