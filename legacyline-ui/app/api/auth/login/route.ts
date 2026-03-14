import { NextRequest, NextResponse } from "next/server";

const ORGS: Record<string, { password: string; slug: string; name: string }> = {
  vizionz: {
    password: "Godfirst",
    slug: "vizionz_sankofa",
    name: "Vizionz Sankofa",
  },
};

export async function POST(req: NextRequest) {
  const { org, password } = await req.json();

  const match = ORGS[org?.toLowerCase()?.trim()];

  if (!match || match.password !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, org: match.slug, name: match.name });

  res.cookies.set("ll_org", match.slug, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  res.cookies.set("ll_org_name", match.name, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return res;
}
