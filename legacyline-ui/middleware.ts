import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const org = req.cookies.get("ll_org")?.value;
  const user = req.cookies.get("ll_user")?.value;

  // Protect individual dashboard — requires ll_user cookie
  if (pathname.startsWith("/dashboard/individual")) {
    if (!user) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login/individual";
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
  matcher: ["/dashboard/:path*"],
};
