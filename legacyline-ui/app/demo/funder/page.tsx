import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DEMO_CASES } from "../../../lib/demo";

export const metadata: Metadata = { title: "Funder view (sample)", robots: { index: false, follow: false } };

// Phase 1 funder view: counts only, built from the same fictional cases as the
// other demo screens. Phase 4 adds the 30/90/180-day checkpoints and
// organization readiness. Never served on production.
const STAGES: { key: string; label: string }[] = [
  { key: "registered", label: "Enrolled" },
  { key: "data_collecting", label: "Building their record" },
  { key: "under_review", label: "With an evaluator" },
  { key: "evaluated", label: "Reviewed" },
  { key: "certified", label: "Certified" },
];

export default function DemoFunder() {
  if (process.env.VERCEL_ENV === "production") notFound();
  const programs = Array.from(new Set(DEMO_CASES.map((c) => c.program)));
  const count = (prog: string | null, stage: string) => DEMO_CASES.filter((c) => (prog === null || c.program === prog) && c.status === stage).length;
  return (
    <main className="ao-paper min-h-screen px-5 py-12">
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <p className="ao-eyebrow">Funder view · sample</p>
        <h1 className="ao-h1 mt-2">Readiness across the programs you fund</h1>
        <p className="ao-body-2 mt-3" style={{ fontSize: 16, maxWidth: 700 }}>
          Counts only. A funder sees how many people are at each step, never names or files.
        </p>
        <div className="ao-card mt-8" style={{ overflowX: "auto", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
            <caption className="ao-meta" style={{ textAlign: "left", padding: "12px 16px" }}>People at each step, by program (sample data)</caption>
            <thead>
              <tr>
                <th scope="col" style={{ textAlign: "left", padding: "10px 16px", borderBottom: "1px solid var(--linen)" }}>Program</th>
                <th scope="col" style={{ textAlign: "right", padding: "10px 16px", borderBottom: "1px solid var(--linen)" }}>Total</th>
                {STAGES.map((s) => <th key={s.key} scope="col" style={{ textAlign: "right", padding: "10px 16px", borderBottom: "1px solid var(--linen)" }}>{s.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {[...programs, null].map((p) => (
                <tr key={p ?? "all"} style={p === null ? { fontWeight: 600 } : undefined}>
                  <th scope="row" style={{ textAlign: "left", padding: "10px 16px", borderBottom: "1px solid var(--linen)", fontWeight: p === null ? 600 : 400 }}>{p ?? "All programs"}</th>
                  <td className="ao-mono" style={{ textAlign: "right", padding: "10px 16px", borderBottom: "1px solid var(--linen)" }}>{DEMO_CASES.filter((c) => p === null || c.program === p).length}</td>
                  {STAGES.map((s) => <td key={s.key} className="ao-mono" style={{ textAlign: "right", padding: "10px 16px", borderBottom: "1px solid var(--linen)" }}>{count(p, s.key)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ao-body-2 mt-6">Coming next in the demo: day 30, 90 and 180 checkpoints with follow-up results, and each organization&apos;s readiness rating.</p>
      </div>
    </main>
  );
}
