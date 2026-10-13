/**
 * Canonical origin of the site.
 *
 * A constant on purpose. It used to be read from NEXT_PUBLIC_BASE_URL, and a
 * stale value there (a retired vercel.app alias) silently pointed the sitemap,
 * the social image and the JSON-LD at a domain that answers 404.
 */
export const SITE_URL = 'https://william-lin.com';
