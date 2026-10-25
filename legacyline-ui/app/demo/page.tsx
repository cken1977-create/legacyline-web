import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND } from "../../lib/brand";
import { DEMO_ROLES, isDemoMode, demoPagesAllowed } from "../../lib/demo-mode";

export const metadata: Metadata = { title: "Demo", robots: { index: false, follow: false } };

// Entry point for the standing Kamili demo. Never served on production.
const STORY: [string, string, string][] = [
  ["Riverside joins and builds its own readiness record. The rules compute its rating, and a person oversees it.", "/demo/org", "Riverside's record"],
  ["Maya Rivera enrolls through Riverside and sees her record, her coaching steps and her check-ins.", "/app/demo", "Maya's record"],
  ["Riverside's staff track everyone on the Program Desk, including who has gone quiet.", "/demo/desk", "Program Desk"],
  ["An evaluator reviews Samuel Ortiz. A second evaluator signs off before he can be certified.", "/review/demo?case=ptc-demo-0004", "Reading Room"],
  ["Andre Wells is certified. Anyone he shares his Registry ID with can check his standing, but never his files.", "/verify/demo?rid=BRSA-26-7F3A0410", "Verify Andre"],
  ["A funder sees counts across programs, with the day 30, 90 and 180 follow-ups.", "/demo/funder", "Funder view"],
  ["Yakini sees every pilot at a glance, against its targets.", "/demo/pilots", "Pilot overview"],
];

export default function DemoHome() {
  if (!demoPagesAllowed()) notFound();
  const on = isDemoMode();
  return (
    <main className="ao-paper min-h-screen px-5 py-12">
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <p className="ao-eyebrow">{BRAND.name} demo</p>
        <h1 className="ao-h1 mt-2">See how {BRAND.name} works, one role at a time</h1>
        <p className="ao-body-2 mt-3" style={{ fontSize: 16, maxWidth: 680 }}>
          The program, the scoring rules and the evaluator steps are the real {BRAND.name} program. Only the people,
          organizations and numbers are sample data. Follow the story below, or pick any view.
        </p>
        {!on && <p className="ao-body-2 mt-3" role="note"><strong>Note:</strong> demo mode is off on this deployment, so the banner and sign-in redirects are not active.</p>}
        <section className="ao-card mt-8 p-5" aria-labelledby="story">
          <h2 id="story" className="ao-h2" style={{ fontSize: 20 }}>Follow one story</h2>
          <p className="ao-body-2 mt-1">Riverside Community Partners (a sample organization) joined the pilot on Apr 27, 2026. Today in the demo is Oct 24, 2026, which is day 180. The same people appear on every screen.</p>
          <ol className="mt-3 flex flex-col gap-2" style={{ fontSize: 15, paddingLeft: 20, listStyle: "decimal" }}>
            {STORY.map(([text, href, cta]) => <li key={href}>{text} <Link className="ao-link" href={href}>{cta}</Link></li>)}
          </ol>
        </section>
        <h2 className="ao-h2 mt-10" style={{ fontSize: 20 }}>Or pick a view</h2>
        <ul className="mt-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, listStyle: "none", padding: 0 }}>
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
