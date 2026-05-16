import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n';

export default createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always'
});

export const config = {
  // Skip API, Next.js internals, static assets (anything with a dot in path),
  // and the file-convention metadata routes (icon, apple-icon, opengraph-image,
  // robots, sitemap) that Next.js owns at the root.
  matcher: [
    '/((?!api|_next|_vercel|icon|apple-icon|opengraph-image|robots|sitemap|.*\\..*).*)'
  ]
};
