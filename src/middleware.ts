import { NextRequest, NextResponse } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

const locales = ['en', 'zh'];
const defaultLocale = 'en';

// Language mapping for Chinese variants
const languageMap: Record<string, string> = {
  'zh-CN': 'zh',
  'zh-SG': 'zh',
  'zh-TW': 'zh',
  'zh-HK': 'zh',
  'zh-MO': 'zh',
};

function getLocale(request: NextRequest): string {
  // Check if there is any supported locale in the cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const languages = new Negotiator({
      headers: { 'accept-language': acceptLanguage }
    }).languages();

    // Map browser languages to supported locales
    const mappedLanguages = languages.map(lang => languageMap[lang] || lang);
    
    try {
      return matchLocale(mappedLanguages, locales, defaultLocale);
    } catch {
      return defaultLocale;
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    
    // Create response with redirect
    const response = NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
    
    // Set locale cookie for 1 year
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}; 