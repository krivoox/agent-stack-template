import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments must never be indexed; they share content with
  // production and would compete with it in search results.
  if (env.VERCEL_ENV !== "production") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/settings"] }],
    sitemap: `${env.BETTER_AUTH_URL}/sitemap.xml`,
  };
}
