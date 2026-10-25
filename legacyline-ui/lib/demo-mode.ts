// Kamili standing demo: one switch for the whole deployment.
//
// Demo mode is ON only when ALL of these hold:
//   - the deployment is NOT production (VERCEL_ENV !== "production"), and
//   - either KAMILI_DEMO_MODE=1 is set, or the deployment was built from a
//     branch whose name starts with "demo/".
// Production can never turn it on, even if this code is merged.
//
// In demo mode every screen shows a "Sample data, all fictional" banner, the
// "View as" switch picks a role, sign-in pages go to sample views, and calls to
// the live scoring service (/api/core, /api/auth) are refused, so no real data
// can be read or written.

export function isDemoMode(): boolean {
  if (process.env.VERCEL_ENV === "production") return false;
  if (process.env.KAMILI_DEMO_MODE === "1") return true;
  const ref = process.env.VERCEL_GIT_COMMIT_REF || "";
  return ref.startsWith("demo/");
}

export type DemoRole = { key: string; label: string; href: string; blurb: string };

export const DEMO_ROLES: DemoRole[] = [
  { key: "person", label: "Person", href: "/app/demo", blurb: "A participant's own readiness record: score, areas, what's still missing." },
  { key: "staff", label: "Program staff", href: "/demo/desk", blurb: "The Program Desk: everyone in the program, where each person stands." },
  { key: "evaluator", label: "Evaluator", href: "/review/demo", blurb: "The Reading Room: review evidence, record findings, two-person sign-off." },
  { key: "org", label: "Organization", href: "/demo/org", blurb: "The organization's own readiness record (OBR)." },
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
};
