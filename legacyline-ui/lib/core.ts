// One client for legacyline-core used by the Kamili screens.
// Today: direct to core with the bearer token from lib/api's authHeaders().
// After the P1 httpOnly-session PR lands, CORE_BASE becomes "/api/core" and
// authHeaders() returns {} — nothing here needs to change.
import { CORE_BASE, authHeaders } from "./api";

export class CoreError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

export async function core<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  const res = await fetch(`${CORE_BASE}${path}`, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: { ...(isForm || !init.body ? {} : { "Content-Type": "application/json" }), ...authHeaders(), ...(init.headers || {}) },
  });
  const text = await res.text().catch(() => "");
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) throw new CoreError(res.status, body?.error ?? String(res.status), body?.message ?? body?.error ?? res.statusText);
  return body as T;
}

export const coreSafe = async <T = any>(path: string, init?: RequestInit): Promise<T | null> => { try { return await core<T>(path, init); } catch { return null; } };

function cookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
const ls = (k: string) => { try { return typeof window === "undefined" ? null : window.localStorage.getItem(k); } catch { return null; } };

/** Participant id of the signed-in person (localStorage today, ll_user hint cookie after P1). */
export function currentParticipantId() { return ls("participant_id") || cookie("ll_user"); }
export function hasIndividualSession() { return !!(ls("individual_token") || cookie("ll_user")); }
export function hasStaffSession() { return !!(ls("staff_token") || cookie("ll_staff")); }
export function hasOrgSession() { return !!(ls("org_token") || cookie("ll_org")); }

export async function signOut(kind: "individual" | "staff" | "org") {
  const keys = { individual: ["individual_token", "participant_id", "user_first_name", "user_last_name", "user_email"], staff: ["staff_token", "staff_email", "evaluator_id", "evaluator_email"], org: ["org_token", "org_slug", "org_name"] }[kind];
  keys.forEach((k) => { try { localStorage.removeItem(k); } catch {} });
  try { await fetch(`/api/session?kind=${kind}`, { method: "DELETE" }); } catch {}
}
