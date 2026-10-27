import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { DEMO_COHORT, DEMO_COHORT_FOLLOWUP, DEMO_PILOTS, DEMO_TODAY, DEMO_TODAY_ISO, PILOT_TARGETS, RELATED_PARTY_NOTE } from "../../../lib/demo";
import { bandFor } from "../../../lib/bands";
import { demoPagesAllowed } from "../../../lib/demo-mode";

export const metadata: Metadata = { title: "Pilot overview (sample)", robots: { index: false, follow: false } };

// Clarence's overview: every pilot organization at a glance. Counts only, no names or files.
// Targets are the proposals in the pilot terms v3. Never served on production.
const TODAY = Date.parse(DEMO_TODAY_ISO);
const fmt = (iso: string) => new Date(iso + "T16:00:00Z").toLocaleDateString("en-US", { timeZone: "America/Denver", month: "short", day: "numeric", year: "numeric" });
const th = { textAlign: "right" as const, padding: "10px 12px", borderBottom: "1px solid var(--linen)", fontWeight: 600, fontSize: 14 };
const td = { textAlign: "right" as const, padding: "10px 12px", borderBottom: "1px solid var(--linen)", fontSize: 15 };

function median(xs: number[]) { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); }

function stats(name: string, start: string) {
  const day = Math.round((TODAY - Date.parse(start + "T16:00:00Z")) / 864e5);
  const ppl = DEMO_COHORT.filter((p) => p.program === name);
  const complete = ppl.filter((p) => p.intakeNow >= 12).length;
  const reviews = ppl.filter((p) => p.stageNow === "evaluated" || p.stageNow === "certified").length;
  const certified = ppl.filter((p) => p.stageNow === "certified").length;
  const scores = ppl.map((p) => p.checkins.at(-1)?.score).filter((x): x is number => x != null);
  const fus = ppl.flatMap((p) => Object.values(DEMO_COHORT_FOLLOWUP[p.id] ?? {}));
  const onTime = fus.length ? Math.round((fus.filter((f) => f!.onTime).length / fus.length) * 100) : null;
  const flagged = ppl.filter((p) => p.flagged).length;
  const checkpoint: 30 | 90 | 180 | null = day >= 180 ? 180 : day >= 90 ? 90 : day >= 30 ? 30 : null;
  const next = day < 30 ? 30 : day < 90 ? 90 : day < 180 ? 180 : null;
  return { day, enrolled: ppl.length, complete, reviews, certified, median: median(scores), onTime, flagged, checkpoint, next };
}

function vsTarget(actual: number, target: number) {
  const ok = actual >= target;
  return <span style={{ color: ok ? "var(--pine)" : "#8a5a00", fontWeight: 600 }}>{actual}<span className="ao-meta" style={{ fontWeight: 400 }}> / {target}</span></span>;
}

export default function PilotOverview() {
  if (!demoPagesAllowed()) notFound();
  const rows = DEMO_PILOTS.map((p) => ({ p, s: stats(p.name, p.start) }));
  return (
    <main className="ao-paper min-h-screen px-5 py-12">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="ao-eyebrow">Pilot overview · sample · as of {DEMO_TODAY}</p>
        <h1 className="ao-h1 mt-2">Every pilot at a glance</h1>
        <p className="ao-body-2 mt-3" style={{ fontSize: 16, maxWidth: 760 }}>Counts only: no names, no files. Each pilot runs about 180 days. Targets are the checkpoint goals in the pilot terms (still proposals). Green means on target, amber means below.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {rows.map(({ p, s }) => (
            <section key={p.name} className="ao-card p-5" aria-label={p.name}>
              <p className="ao-meta">Started {fmt(p.start)} · {p.city}</p>
              <h2 className="ao-h3 mt-1" style={{ fontSize: 18 }}>{p.name}</h2>
              <p className="ao-serif mt-2" style={{ fontSize: 26, fontWeight: 600 }}>Day {Math.min(s.day, 180)}<span className="ao-meta" style={{ fontSize: 14 }}> of 180{s.day > 180 ? ` (day ${s.day}, past the pilot)` : ""}</span></p>
              <div className="mt-2" style={{ height: 8, borderRadius: 4, background: "var(--vellum)" }}><div style={{ width: `${Math.min(100, (s.day / 180) * 100)}%`, height: 8, borderRadius: 4, background: "var(--ink)" }} /></div>
              <dl className="mt-4 grid gap-1.5" style={{ gridTemplateColumns: "1fr auto", fontSize: 14 }}>
                <dt>Enrolled</dt><dd className="ao-mono">{s.enrolled}</dd>
                <dt>Records complete</dt><dd className="ao-mono">{s.complete}</dd>
                <dt>Reviews done</dt><dd className="ao-mono">{s.reviews}</dd>
                <dt>Certified</dt><dd className="ao-mono">{s.certified}</dd>
                <dt>Median score</dt><dd className="ao-mono">{s.median != null ? <>{s.median} <span className="ao-meta">{bandFor(s.median).label}</span></> : "—"}</dd>
                <dt>Check-ins on time</dt><dd className="ao-mono">{s.onTime != null ? `${s.onTime}%` : "—"}</dd>
                <dt>Flagged (went quiet)</dt><dd className="ao-mono">{s.flagged}</dd>
                <dt>Staff evaluators certified</dt><dd className="ao-mono">{p.evaluatorsCertified}</dd>
              </dl>
              <p className="mt-3" style={{ fontSize: 14 }}><strong>Org rating:</strong> {p.org.note}</p>
              <p className="mt-1" style={{ fontSize: 14 }}><strong>Basic tool:</strong> {p.toolLive ? <>live since {fmt(p.toolLive)} · free 30 days, then the running rate ($__/mo)</> : "not built yet"}</p>
              <p className="ao-meta mt-2">{s.next ? `Next checkpoint: day ${s.next}` : "180-day checkpoint reached: end-of-pilot review"}</p>
              {p.related && <p className="ao-meta mt-2" style={{ color: "#8a5a00" }}>{RELATED_PARTY_NOTE}</p>}
            </section>
          ))}
        </div>

        <section className="ao-card mt-8" style={{ overflowX: "auto", padding: 0 }} aria-labelledby="targets">
          <h2 id="targets" className="ao-h3" style={{ padding: "14px 16px 0", fontSize: 18 }}>Against the checkpoint targets</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <caption className="ao-meta" style={{ textAlign: "left", padding: "4px 16px 10px" }}>Actual / target at the latest checkpoint each pilot has reached (targets are proposals in the pilot terms)</caption>
            <thead><tr><th scope="col" style={{ ...th, textAlign: "left" }}>Pilot</th><th scope="col" style={th}>Checkpoint</th><th scope="col" style={th}>Enrolled</th><th scope="col" style={th}>Records complete</th><th scope="col" style={th}>Reviews</th><th scope="col" style={th}>Evaluators certified</th><th scope="col" style={th}>Org rated</th></tr></thead>
            <tbody>{rows.map(({ p, s }) => { const t = s.checkpoint ? PILOT_TARGETS[s.checkpoint] : null; return (
              <tr key={p.name}><th scope="row" style={{ ...td, textAlign: "left", fontWeight: 500 }}>{p.name}</th>
                <td className="ao-mono" style={td}>{s.checkpoint ? `Day ${s.checkpoint}` : "Before day 30"}</td>
                {t ? <><td className="ao-mono" style={td}>{vsTarget(s.enrolled, t.enrolled)}</td><td className="ao-mono" style={td}>{vsTarget(s.complete, t.complete)}</td><td className="ao-mono" style={td}>{vsTarget(s.reviews, t.reviews)}</td><td className="ao-mono" style={td}>{vsTarget(p.evaluatorsCertified, t.evaluators)}</td><td style={td}>{s.checkpoint === 180 ? (p.org.status === "rated" ? "Yes" : "Not yet") : "—"}</td></>
                  : <td colSpan={5} className="ao-meta" style={{ ...td, textAlign: "left" }}>First checkpoint at day 30</td>}
              </tr>); })}</tbody>
          </table>
        </section>
        <p className="ao-meta mt-3">The same people appear on the Program Desk, in the Reading Room and in the funder view. Riverside&apos;s numbers here are Maya, Samuel, Andre and the rest of its desk. <Link className="ao-link" href="/demo/funder">Open the funder view</Link></p>
      </div>
    </main>
  );
}
