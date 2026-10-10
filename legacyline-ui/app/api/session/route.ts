import { NextResponse } from "next/server";
import { clearCookies, sameOrigin, type Kind } from "../../../lib/session-server";

// DELETE /api/session[?kind=staff|org|individual] — sign out (clears httpOnly cookies).
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, code: "bad_origin" }, { status: 403 });
  }
  const k = new URL(req.url).searchParams.get("kind") as Kind | null;
  const kinds: Kind[] = k && ["staff", "org", "individual"].includes(k) ? [k] : ["staff", "org", "individual"];
  const res = NextResponse.json({ ok: true });
  clearCookies(res, kinds);
  return res;
}
