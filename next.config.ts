import type { NextConfig } from "next";
import { PRIVATE_ROUTE_PREFIXES } from "./src/lib/routes";

/**
 * Authenticated prefixes come from `src/lib/routes.ts` so headers, middleware
 * and docs stay aligned. Served with `private, no-store`.
 */

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
