import { NextRequest, NextResponse } from "next/server";
import { DEMO_REDIRECTS, isDemoMode } from "./lib/demo-mode";

// P1 BFF: /api/core/* is rewritten to legacyline-core with the bearer token
// taken from the httpOnly session cookie. Login/signup paths are served by
// route handlers in app/api/core/** (they set the cookie), so skip those.
const CORE_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "https://legacyline-core-production.up.railway.app"
).replace(/\/+$/, "");

const LOGIN_PATHS = new Set([
  "/api/core/auth/staff/login",
  "/api/core/auth/individual/login",
  "/api/core/auth/individual/signup",
  "/api/core/auth/individual/signup-from-intake",
  "/api/core/orgs/login",
]);

function proxyCore(req: NextRequest): NextResponse {
  const { pathname, search } = req.nextUrl;
  if (LOGIN_PATHS.has(pathname.replace(/\/+$/, ""))) return NextResponse.next();

  // CSRF guard: state-changing calls must come from our own origin.
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.headers.get("origin");
    let ok = !origin;
    try {
      ok = ok || new URL(origin as string).host === req.nextUrl.host;
    } catch {
      ok = false;
    }
    if (!ok) {
      return NextResponse.json({ ok: false, code: "bad_origin" }, { status: 403 });
    }
  }

  // Staff wins over org over individual (same precedence as before Phase P1).
  const token =
    req.cookies.get("ll_tok_staff")?.value ||
    req.cookies.get("ll_tok_org")?.value ||
    req.cookies.get("ll_tok_ind")?.value;

  const headers = new Headers(req.headers);
  headers.delete("authorization");
  headers.delete("cookie"); // core never needs browser cookies
  if (token) headers.set("authorization", `Bearer ${token}`);

  const target = new URL(CORE_ORIGIN + pathname.slice("/api/core".length) + search);
  return NextResponse.rewrite(target, { request: { headers } });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Standing demo: never touch the live scoring service, and send sign-in or
  // live screens to their sample versions. Off on production by construction.
  if (isDemoMode()) {
    if (pathname.startsWith("/api/core/") || pathname.startsWith("/api/auth/")) {
      return NextResponse.json(
        { ok: false, error: "demo_mode", message: "This is the Kamili demo. Nothing is saved and no live data is used." },
        { status: 403 },
      );
    }
    const dest = DEMO_REDIRECTS[pathname.replace(/\/+$/, "") || "/"];
    if (dest) {
      const url = req.nextUrl.clone();
      url.pathname = dest;
      if (dest !== "/verify/demo") url.search = ""; // a shared ?rid= link still works on the sample verify page
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/core/")) return proxyCore(req);

  const org = req.cookies.get("ll_org")?.value;
  const user = req.cookies.get("ll_user")?.value;

  // Protect individual dashboard — requires ll_user cookie
  if (pathname.startsWith("/dashboard/individual")) {
    if (!user) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/app/login";
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Generic /dashboard — route based on what session exists
  if (pathname === "/dashboard") {
    if (user) {
      const dest = req.nextUrl.clone();
      dest.pathname = `/dashboard/individual/${user}`;
      return NextResponse.redirect(dest);
    }
    if (org) {
      return NextResponse.next();
    }
    // No session — send to evaluator as default
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/evaluator";
    return NextResponse.redirect(loginUrl);
  }

  // Protect org dashboard paths
  if (pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/individual")) {
    if (!org) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login/organization";
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/core/:path*",
    "/api/auth/:path*",
    "/login/:path*",
    "/app/:path*",
    "/review",
    "/evaluator",
    "/verify",
  ],
};
