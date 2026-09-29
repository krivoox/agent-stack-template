import type { NextConfig } from "next";
import { PRIVATE_ROUTE_PREFIXES } from "./src/lib/routes";

const NO_STORE = [{ key: "Cache-Control", value: "private, no-store" }];

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },
  async headers() {
    const security =
      process.env.NODE_ENV === "production"
        ? [
            ...SECURITY_HEADERS,
            {
              key: "Strict-Transport-Security",
              value: "max-age=31536000; includeSubDomains",
            },
          ]
        : SECURITY_HEADERS;
    return [
      { source: "/:path*", headers: security },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      ...PRIVATE_ROUTE_PREFIXES.flatMap((prefix) => [
        { source: prefix, headers: NO_STORE },
        { source: `${prefix}/:path*`, headers: NO_STORE },
      ]),
    ];
  },
};

export default nextConfig;
