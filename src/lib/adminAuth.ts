import { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

export function isAdminRequest(req: NextRequest): boolean {
  const iccRole = req.cookies.get('icc-role')?.value;
  if (iccRole !== 'admin') return false;

  let accessToken = req.cookies.get('sb-access-token')?.value;
  if (!accessToken) {
    const sbCookie = req.cookies
      .getAll()
      .find((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
    if (sbCookie?.value) {
      try {
        const parsed = JSON.parse(sbCookie.value);
        accessToken = parsed?.access_token || (Array.isArray(parsed) ? parsed[0] : null);
      } catch {
        accessToken = sbCookie.value;
      }
    }
  }

  if (!accessToken) return false;
  if (accessToken.includes('.')) {
    const payload = decodeJwtPayload(accessToken);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      return false;
    }
    return true;
  }
  return accessToken.startsWith('icc-admin-session-');
}
