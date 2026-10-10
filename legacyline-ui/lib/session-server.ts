import { NextResponse } from "next/server";

// P1: server-side session cookie handling for the web BFF.

export const CORE_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "https://legacyline-core-production.up.railway.app"
).replace(/\/+$/, "");

export type Kind = "staff" | "org" | "individual";

export const TOKEN_COOKIE: Record<Kind, string> = {
  staff: "ll_tok_staff",
  org: "ll_tok_org",
  individual: "ll_tok_ind",
};

// Non-secret hints readable by client code and the page middleware.
export const HINT_COOKIE: Record<Kind, string> = {
  staff: "ll_staff",
  org: "ll_org",
  individual: "ll_user",
};

const secure = process.env.NODE_ENV === "production";

function jwtMaxAge(token: string, fallback: number): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    if (typeof payload.exp === "number") {
      return Math.max(0, Math.floor(payload.exp - Date.now() / 1000));
    }
  } catch {
    /* fall through */
  }
  return fallback;
}

/** Forward a login/signup call to core; on success move the token into an
 * httpOnly cookie and strip it from the JSON the browser sees. */
export async function proxyLogin(req: Request, corePath: string, kind: Kind): Promise<NextResponse> {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, code: "bad_origin", error: "cross-site request refused" }, { status: 403 });
  }
  const body = await req.text();
  const fwd = req.headers.get("x-forwarded-for");
  let res: Response;
  try {
    res = await fetch(`${CORE_ORIGIN}${corePath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(fwd ? { "X-Forwarded-For": fwd } : {}),
      },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ ok: false, code: "upstream_unreachable", error: "API unreachable" }, { status: 502 });
  }
  const text = await res.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  const passthrough = (status: number) => {
    const out = new NextResponse(text, { status, headers: { "Content-Type": "application/json" } });
    const ra = res.headers.get("retry-after");
    if (ra) out.headers.set("Retry-After", ra);
    return out;
  };
  if (!res.ok || !data || typeof data.token !== "string") {
    return passthrough(res.status);
  }
  const token = data.token as string;
  const { token: _omit, ...safe } = data;
  void _omit;
  const out = NextResponse.json(safe, { status: res.status });
  const maxAge = jwtMaxAge(token, typeof data.expires_in === "number" ? (data.expires_in as number) : 86400);
  out.cookies.set(TOKEN_COOKIE[kind], token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  const hint =
    kind === "individual" ? String(data.participant_id ?? "1") : "1";
  out.cookies.set(HINT_COOKIE[kind], hint, { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge });
  return out;
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers / server calls
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clearCookies(res: NextResponse, kinds: Kind[]) {
  for (const k of kinds) {
    res.cookies.set(TOKEN_COOKIE[k], "", { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 0 });
    res.cookies.set(HINT_COOKIE[k], "", { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge: 0 });
  }
}
