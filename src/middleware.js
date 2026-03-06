/**
 * Next.js Edge Middleware — Route Protection
 *
 * Rules:
 *  - Unauthenticated → redirect to /login
 *  - Authenticated  → redirect away from /login to /dashboard
 *  - /master-admin/* is ONLY accessible if role_code === 'MASTER_ADMIN'
 */
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/portal-login', '/forgot-password', '/reset-password'];

// Portal route prefixes (must use trailing /  to avoid matching /students, /teachers)
const PARENT_PATHS  = ['/parent/'];
const STUDENT_PATHS = ['/student/'];
const TEACHER_PATHS = ['/teacher/'];

// Institute-type admin route prefixes — all require access_token + matching institute_type cookie
const INSTITUTE_PREFIXES = ['/school/', '/coaching/', '/academy/', '/college/', '/university/'];

// Map institute_type cookie value → allowed route prefix
const INSTITUTE_ROUTE_MAP = {
  school:     '/school/',
  coaching:   '/coaching/',
  academy:    '/academy/',
  college:    '/college/',
  university: '/university/',
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow static assets + Next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ── Portal route guards ─────────────────────────────────────────
  // Match /parent/*, /student/*, /teacher/* but NOT /parents, /students, /teachers (staff management)
  const isParentRoute  = PARENT_PATHS.some((p) => pathname.startsWith(p));
  const isStudentRoute = STUDENT_PATHS.some((p) => pathname.startsWith(p));
  const isTeacherRoute = TEACHER_PATHS.some((p) => pathname.startsWith(p));

  if (isParentRoute || isStudentRoute || isTeacherRoute) {
    const portalToken = request.cookies.get('portal_token')?.value;
    const portalType  = request.cookies.get('portal_type')?.value;

    if (!portalToken) {
      // Not logged in to portal → redirect to portal login
      const url = request.nextUrl.clone();
      url.pathname = '/portal-login';
      return NextResponse.redirect(url);
    }

    // Wrong portal type guard (parent trying to access /student and vice versa)
    if (isParentRoute  && portalType !== 'PARENT') {
      const url = request.nextUrl.clone();
      url.pathname = '/portal-login';
      return NextResponse.redirect(url);
    }
    if (isStudentRoute && portalType !== 'STUDENT') {
      const url = request.nextUrl.clone();
      url.pathname = '/portal-login';
      return NextResponse.redirect(url);
    }
    if (isTeacherRoute && portalType !== 'TEACHER') {
      const url = request.nextUrl.clone();
      url.pathname = '/portal-login';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }
  // ────────────────────────────────────────────────────────────────

  const token = request.cookies.get('access_token')?.value;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Not authenticated → force login
  if (!token && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Already authenticated → don't allow login page
  // Redirect to institute-type dashboard
  if (token && (pathname === '/login')) {
    const instituteType = request.cookies.get('institute_type')?.value;
    const PATHS = {
      school:     '/school/dashboard',
      coaching:   '/coaching/dashboard',
      academy:    '/academy/dashboard',
      college:    '/college/dashboard',
      university: '/university/dashboard',
    };
    const url = request.nextUrl.clone();
    url.pathname = PATHS[instituteType] ?? '/dashboard';
    return NextResponse.redirect(url);
  }

  // Institute-type route guard
  // e.g. a 'school' admin trying to access /coaching/* should be redirected
  const matchedPrefix = INSTITUTE_PREFIXES.find((p) => pathname.startsWith(p));
  if (matchedPrefix && token) {
    const instituteType = request.cookies.get('institute_type')?.value;
    const roleCode      = request.cookies.get('role_code')?.value;
    // MASTER_ADMIN can access any institute route
    if (roleCode !== 'MASTER_ADMIN' && instituteType) {
      const allowedPrefix = INSTITUTE_ROUTE_MAP[instituteType];
      if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
        const url = request.nextUrl.clone();
        url.pathname = INSTITUTE_ROUTE_MAP[instituteType] + 'dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  // Master Admin guard — only allow MASTER_ADMIN role on /master-admin/*
  // NOTE: We use a custom header set by the login flow, not JWT decode here
  // (edge runtime can't run heavy crypto). Instead we rely on the API to
  // reject unauthorized calls. We still redirect based on the stored cookie
  // 'role_code' that the client sets as a plain (non-httpOnly) cookie.
  if (pathname.startsWith('/master-admin')) {
    const roleCode = request.cookies.get('role_code')?.value;
    if (roleCode !== 'MASTER_ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
