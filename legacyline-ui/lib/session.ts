// P1: browser-side session helpers. Bearer tokens now live only in httpOnly
// cookies set by our own /api/core/* login routes; client code can never read
// them. These helpers read the non-secret hint cookies (role flags / ids) and
// clear the server session on sign-out.

export const CORE_PROXY = "/api/core";

export type SessionKind = "staff" | "org" | "individual";

const HINT: Record<SessionKind, string> = {
  staff: "ll_staff",
  org: "ll_org",
  individual: "ll_user",
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/** True if a (non-secret) hint says this kind of session exists. The API is
 * still the authority: a 401 means the httpOnly session is gone. */
export function hasSession(kind: SessionKind): boolean {
  return !!readCookie(HINT[kind]);
}

/** Clears the httpOnly session cookie(s) on the server. */
export async function clearSession(kind?: SessionKind): Promise<void> {
  try {
    await fetch(`/api/session${kind ? `?kind=${kind}` : ""}`, { method: "DELETE" });
  } catch {
    /* best effort */
  }
}
