import { NextRequest, NextResponse } from 'next/server';
import type { Locale } from '@configs/i18n'; // Adjust this import based on your project structure

// Update these based on your actual supported locales
const SUPPORTED_LOCALES: Locale[] = ['ar', 'en'];
const DEFAULT_LOCALE: Locale = 'ar';

// Routes that should be accessible without language prefix (they'll be redirected)
const REDIRECT_ROUTES = [
  '/login',
  '/reset-password',
  '/forgot-password',
  '/register',
  '/confirm-email',
  '/confirm-reset',
  '/new-login',
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if pathname already starts with a supported locale
  const hasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (hasLocale) {
    // Path already has locale, continue
    return NextResponse.next();
  }

  // Check if this is a redirect route that needs language prefix
  const isRedirectRoute = REDIRECT_ROUTES.some((route) => pathname === route);

  if (isRedirectRoute) {
    // Get preferred language from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferredLanguage = acceptLanguage
      .split(',')[0]
      .split('-')[0]
      .toLowerCase();

    // Use preferred language if supported, otherwise use default
    const locale = SUPPORTED_LOCALES.includes(preferredLanguage as Locale)
      ? (preferredLanguage as Locale)
      : DEFAULT_LOCALE;

    // Preserve query parameters (important for auth tokens, codes, etc.)
    const queryString = request.nextUrl.search;
    const hash = request.nextUrl.hash;

    return NextResponse.redirect(
      new URL(`/${locale}${pathname}${queryString}${hash}`, request.url)
    );
  }

  // For root path, redirect to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url));
  }

  // Allow other paths (API routes, static files, etc.)
  return NextResponse.next();
}

export const config = {
  // Match all paths except API routes, static files, and Next.js internals
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
