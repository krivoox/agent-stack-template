/**
 * Single source for public vs authenticated path prefixes.
 *
 * Middleware, Cache-Control headers and docs read from here. Navigation labels
 * still live in `nav-config.ts`; when you add an authenticated page, add its
 * prefix here too (or reuse an existing one).
 */

export const AUTH_FORM_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
] as const;

/** Public routes both guests and signed-in users may visit. */
export const ALWAYS_PUBLIC_PREFIXES: readonly string[] = [];

export const PUBLIC_EXACT = [
  "/",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
] as const;

/**
 * Authenticated App Router prefixes. Served with `private, no-store`.
 * Keep in sync with segments under `src/app/(app)`.
 */
export const PRIVATE_ROUTE_PREFIXES = ["/dashboard", "/settings"] as const;

export function matchesPrefix(
  pathname: string,
  prefixes: readonly string[],
): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isPublicPath(pathname: string): boolean {
  if ((PUBLIC_EXACT as readonly string[]).includes(pathname)) return true;
  if (matchesPrefix(pathname, AUTH_FORM_ROUTES)) return true;
  if (matchesPrefix(pathname, ALWAYS_PUBLIC_PREFIXES)) return true;
  return false;
}
