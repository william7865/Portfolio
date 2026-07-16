import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  // Scoped to clickjacking / base-tag / plugin / exfiltration defenses. script-src is
  // still omitted: locking it down needs a per-request nonce, which needs middleware on
  // every route, and middleware currently skips /dashboard and /api by design. Until
  // then this is defense in depth around an app with no known injection sink, not an
  // XSS mitigation — treat input validation as the actual control.
  //
  // form-action/frame-src add no risk here: the login posts via fetch (not a form
  // action) and the app embeds no frames — verified before narrowing.
  {
    key: 'Content-Security-Policy',
    value: [
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'",
      "frame-src 'none'"
    ].join('; ')
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: import.meta.dirname,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  }
};

export default withNextIntl(nextConfig);
