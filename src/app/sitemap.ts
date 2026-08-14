import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

/** Public routes only — authenticated pages have nothing to index. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: env.BETTER_AUTH_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
