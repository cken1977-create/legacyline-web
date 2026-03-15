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

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            data?.error ||
            data?.message ||
            text ||
            "Unable to create account.",
        },
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
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Unable to create account.",
      },
      { status: 500 }
    );
  }
}
