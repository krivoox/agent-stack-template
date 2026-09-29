import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { isPublicPath } from "@/lib/routes";

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

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
