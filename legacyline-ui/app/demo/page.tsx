import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND } from "../../lib/brand";
import { DEMO_ROLES, isDemoMode } from "../../lib/demo-mode";

export const metadata: Metadata = { title: "Demo", robots: { index: false, follow: false } };

// Entry point for the standing Kamili demo. Never served on production.
export default function DemoHome() {
  if (process.env.VERCEL_ENV === "production") notFound();
  const on = isDemoMode();
  return (
    <main className="ao-paper min-h-screen px-5 py-12">
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <p className="ao-eyebrow">{BRAND.name} demo</p>
        <h1 className="ao-h1 mt-2">See how {BRAND.name} works, one role at a time</h1>
        <p className="ao-body-2 mt-3" style={{ fontSize: 16, maxWidth: 680 }}>
          The program, the scoring rules and the evaluator steps are the real {BRAND.name} program. Only the people,
          organizations and numbers are sample data. Pick a view to start.
        </p>
        {!on && <p className="ao-body-2 mt-3" role="note"><strong>Note:</strong> demo mode is off on this deployment, so the banner and sign-in redirects are not active.</p>}
        <ul className="mt-8" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, listStyle: "none", padding: 0 }}>
          {DEMO_ROLES.map((r) => (
            <li key={r.key}>
              <Link href={r.href} className="ao-card" style={{ display: "block", padding: 20, textDecoration: "none", color: "inherit", height: "100%" }}>
                <span className="ao-h2" style={{ display: "block", fontSize: 20, lineHeight: "26px" }}>{r.label}</span>
                <span className="ao-body-2 mt-2" style={{ display: "block" }}>{r.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
