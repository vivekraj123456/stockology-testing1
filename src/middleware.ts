import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/admin/login',
    },
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname === '/admin/login') {
          return true;
        }

        return !!token;
      },
    },
  }
);

// Protect admin routes
export const config = {
  matcher: ['/admin/:path*'],
};
