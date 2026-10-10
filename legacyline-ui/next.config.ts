import type { NextConfig } from "next";

// P1 security headers. The API origin is read at build time so preview and
// production builds each allow the backend they actually call.
function origin(u: string | undefined): string | null {
  if (!u) return null;
  try {
    return new URL(u).origin;
  } catch {
    return null;
  }
}

const apiOrigins = Array.from(
  new Set(
    [
      origin(process.env.NEXT_PUBLIC_API_URL),
      origin(process.env.NEXT_PUBLIC_CORE_API_URL),
      "https://legacyline-core-production.up.railway.app",
    ].filter(Boolean) as string[]
  )
);

const csp = [
  "default-src 'self'",
  // Next.js App Router inlines bootstrap scripts; nonce-based CSP is a P2 item.
  "script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com https://vercel.live",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' ${apiOrigins.join(" ")} https://*.supabase.co https://vercel.live wss://ws-us3.pusher.com https://vitals.vercel-insights.com`,
  "frame-src 'self' https://vercel.live",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Phase S: the old /login/individual accepted any password. Send everyone to
  // the real participant sign-in, which verifies credentials against the API.
  async redirects() {
    return [
      { source: "/login/individual", destination: "/app/login", permanent: false },
      // Composer's readiness-assessment invites link to /assessment/begin,
      // which never existed (404). Send them to the readiness intake.
      { source: "/assessment", destination: "/intake", permanent: false },
      { source: "/assessment/begin", destination: "/intake", permanent: false },
    ];
  },
};

export default nextConfig;
