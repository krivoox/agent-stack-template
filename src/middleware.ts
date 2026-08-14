import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/** Auth forms. Public, but a signed-in user is bounced away by the page itself. */
const AUTH_FORM_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

/** Public routes that both guests and signed-in users may visit. */
const ALWAYS_PUBLIC_PREFIXES: string[] = [];

const PUBLIC_EXACT = new Set([
  "/",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
]);

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (matchesPrefix(pathname, AUTH_FORM_ROUTES)) return true;
  if (matchesPrefix(pathname, ALWAYS_PUBLIC_PREFIXES)) return true;
  return false;
}

/**
 * Cheap gate, not the security boundary.
 *
 * It only looks at cookie *presence* — it never validates the session, because
 * that would put a database round-trip in front of every request. Real
 * authorisation happens in layouts, services and Server Actions.
 *
 * It deliberately does not redirect signed-in users away from auth forms: a
 * stale cookie would then bounce `/login → /dashboard → /login` forever. The
 * page does that check with a real session.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!getSessionCookie(request) && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Layouts have no access to the URL; this header is how they read it.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
