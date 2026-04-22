import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const org = req.cookies.get("ll_org")?.value;
  const user = req.cookies.get("ll_user")?.value;

  // Protect individual dashboard
  if (pathname.startsWith("/dashboard/individual")) {
    if (!user) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login/individual";
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Protect organization dashboard
  if (pathname.startsWith("/dashboard")) {
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
