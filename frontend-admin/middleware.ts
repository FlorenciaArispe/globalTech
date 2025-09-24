import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // zonas públicas
  const publicPaths = ['/((auth))/','/login','/_next','/api/public','/public','/favicon.ico','/robots.txt'];
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // lee token desde cookie si luego migras a httpOnly; por ahora desde header opcional
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
  matcher: ['/((?!_next|api/public|favicon.ico|robots.txt).*)'],
};
