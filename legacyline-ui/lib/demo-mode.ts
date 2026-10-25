// Kamili standing demo: one switch for the whole deployment.
//
// Demo mode is ON in exactly two cases:
//
//  1. A preview (non-production) build where KAMILI_DEMO_MODE=1 is set, or the
//     branch name starts with "demo/". Previews sit behind the Vercel login.
//
//  2. The production build of the SEPARATE public demo project only. All of
//     these must hold, and they are set on that project alone:
//       - KAMILI_DEMO_MODE=1
//       - KAMILI_DEMO_PROJECT="kamili-demo"
//       - KAMILI_DEMO_HOST is on DEMO_HOSTS (demo.kamilihq.com)
//       - the project's production address is not one of the real site's
//         addresses (REAL_HOSTS)
//     The real site's project has none of these set, so even if this code is
//     merged, its production build can never turn demo mode on.
//
// At request time the middleware also refuses to serve a demo build on any of
// the real site's addresses (see isRealHost).
//
// In demo mode every screen shows a "Sample data, all fictional" banner, the
// "View as" switch picks a role, sign-in pages go to sample views, and calls to
// the live scoring service (every /api route) are refused, and live case
// screens (/subject/...) go to the sample Reading Room, so no real data
// can be read or written.

export const DEMO_PROJECT = "kamili-demo";
export const DEMO_HOSTS = ["demo.kamilihq.com"];
export const REAL_HOSTS = [
  "legacylinehq.com",
  "www.legacylinehq.com",
  "kamilihq.com",
  "www.kamilihq.com",
  "kamili.org",
  "www.kamili.org",
  "legacyline-web.vercel.app",
];

function bareHost(h: string | null | undefined): string {
  return (h || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/[/:].*$/, "").replace(/\.$/, "");
}

export function isRealHost(h: string | null | undefined): boolean {
  return REAL_HOSTS.includes(bareHost(h));
}

export function isDemoMode(env: Record<string, string | undefined> = process.env): boolean {
  const flag = env.KAMILI_DEMO_MODE === "1";
  if (env.VERCEL_ENV === "production") {
    if (!flag) return false;
    if (env.KAMILI_DEMO_PROJECT !== DEMO_PROJECT) return false;
    if (!DEMO_HOSTS.includes(bareHost(env.KAMILI_DEMO_HOST))) return false;
    if (isRealHost(env.VERCEL_PROJECT_PRODUCTION_URL)) return false;
    return true;
  }
  if (flag) return true;
  const ref = env.VERCEL_GIT_COMMIT_REF || "";
  return ref.startsWith("demo/");
}

export type DemoRole = { key: string; label: string; href: string; blurb: string };

export const DEMO_ROLES: DemoRole[] = [
  { key: "pilots", label: "Pilot overview", href: "/demo/pilots", blurb: "Every pilot organization at a glance, against its checkpoint targets. Counts only." },
  { key: "person", label: "Person", href: "/app/demo", blurb: "A participant's own readiness record: score, areas, what's still missing." },
  { key: "staff", label: "Program staff", href: "/demo/desk", blurb: "The Program Desk: everyone in the program, where each person stands." },
  { key: "evaluator", label: "Evaluator", href: "/review/demo", blurb: "The Reading Room: review evidence, record findings, two-person sign-off." },
  { key: "org", label: "Organization", href: "/demo/org", blurb: "The organization's own readiness record (OBR)." },
  { key: "orgreview", label: "Organization review (staff)", href: "/demo/org-review", blurb: "Computed organization scores and the oversight controls: flag, pause, send back, all logged." },
  { key: "verify", label: "Verify a record", href: "/verify/demo", blurb: "What a landlord or employer sees when someone shares their Registry ID: standing only, never files." },
  { key: "funder", label: "Funder", href: "/demo/funder", blurb: "Counts and readiness across programs. No names, no files." },
  { key: "training", label: "Evaluator training", href: "/demo/training", blurb: "The real 8-module course and certification steps, with one exam question per module." },
  { key: "program", label: "The standard", href: "/demo/program", blurb: "The written program itself: the definition, formulas, bands and 12 evidence domains." },
];

/** Exact paths that send to a sample view in demo mode (sign-in and live screens). */
export const DEMO_REDIRECTS: Record<string, string> = {
  "/login": "/demo",
  "/login/individual": "/demo",
  "/login/individual/signup": "/demo",
  "/login/organization": "/demo",
  "/app/login": "/demo",
  "/app/signup": "/demo",
  "/app": "/app/demo",
  "/app/report": "/app/demo/report",
  "/app/org": "/demo/org",
  "/dashboard": "/demo/desk",
  "/dashboard/individual": "/demo/desk",
  "/review": "/review/demo",
  "/evaluator": "/review/demo",
  "/verify": "/verify/demo",
  "/intake": "/demo",
};

/** The /demo sample pages exist on previews, and on production only for the separate demo project. */
export function demoPagesAllowed(): boolean {
  return process.env.VERCEL_ENV !== "production" || isDemoMode();
}
