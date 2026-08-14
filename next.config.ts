import type { NextConfig } from "next";

/**
 * Authenticated route prefixes served with `private, no-store`.
 *
 * Anything showing per-user data must never be cached by a CDN or a shared
 * proxy. Add a prefix here when you add a segment under `(app)`; both the bare
 * path and its children are covered.
 */
const PRIVATE_ROUTE_PREFIXES = ["/dashboard", "/settings"];

const NO_STORE = [{ key: "Cache-Control", value: "private, no-store" }];

const nextConfig: NextConfig = {
  reactCompiler: true,
  /**
   * Client Router Cache. `dynamic: 0` means a soft-nav back to a list always
   * re-fetches, so a mutation is never followed by a stale screen. Perceived
   * speed comes from `loading.tsx` and prefetch, not from serving old data.
   */
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },
  async headers() {
    return [
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
