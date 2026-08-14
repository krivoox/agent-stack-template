import { env } from "@/lib/env";

/** Canonical absolute origin for SEO, OG, sitemap, and llms.txt. */
export function getSiteUrl(): string {
  return env.BETTER_AUTH_URL.replace(/\/$/, "");
}
