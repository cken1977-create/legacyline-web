import { NextResponse } from "next/server";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "https://legacyline-core-production.up.railway.app").replace(/\/$/, "");

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE}/auth/individual/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || "Unable to create account." },
        { status: res.status }
      );
    }

    const email = String(body.email || "").trim().toLowerCase();

    const response = NextResponse.json(
      {
        success: true,
        user: data?.user || null,
      },
      { status: 201 }
    );

    response.cookies.set("ll_user", email, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create account." },
      { status: 500 }
    );
  }
}
