import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // zonas públicas
  const publicPaths = ['/((auth))/','/login','/_next','/api/public','/public','/robots.txt'];
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('auth_token')?.value;
  if (!token && pathname.startsWith('/')) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api/public|robots.txt).*)'],
};
