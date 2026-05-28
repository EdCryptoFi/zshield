import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Performance ─────────────────────────────────────────────────────────
  poweredByHeader: false,

  // ── External packages (not bundled) ─────────────────────────────────────
  // ioredis is only needed when STORE_ADAPTER=redis; keep it external
  // so Turbopack doesn't fail the build when it's not installed.
  serverExternalPackages: ['ioredis'],

  // ── Security headers ────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',         value: 'DENY' },
          { key: 'X-XSS-Protection',        value: '1; mode=block' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      // ── Cache OIDC discovery & JWKS aggressively ──────────────────────
      {
        source: '/api/oidc/.well-known/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=600' },
        ],
      },
      {
        source: '/api/oidc/jwks',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=600' },
        ],
      },
    ];
  },

  // ── Redirects ───────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/.well-known/openid-configuration',
        destination: '/api/oidc/.well-known/openid-configuration',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
