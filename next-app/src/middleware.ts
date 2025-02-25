
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('currentUser');
  const isAuthPage = request.nextUrl.pathname === '/';

  if (!currentUser && !isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (currentUser && isAuthPage) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/chat/:path*'],
};
