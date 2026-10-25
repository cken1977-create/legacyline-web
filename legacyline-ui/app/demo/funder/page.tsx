import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { DEMO_COHORT, DEMO_OBR_PASSED, DEMO_ORG, DEMO_PROGRAMS } from "../../../lib/demo";
import { bandFor } from "../../../lib/bands";
import { FRARI_INDIVIDUAL, LIFECYCLE, LIFECYCLE_LABEL, obrScore, trajectory } from "../../../lib/program";

export const metadata: Metadata = { title: "Funder view (sample)", robots: { index: false, follow: false } };

// Counts only, from a fixed fictional cohort. Measures are the written program's own:
// FRARI v1.0.0 score and band, lifecycle step, and score change between check-ins.
// Never served on production.
const DAYS = [30, 90, 180] as const;
const th = { textAlign: "right" as const, padding: "10px 14px", borderBottom: "1px solid var(--linen)", fontWeight: 600 };
const td = { textAlign: "right" as const, padding: "10px 14px", borderBottom: "1px solid var(--linen)" };

function median(xs: number[]) { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); }

function checkpoint(program: string | null, day: 30 | 90 | 180) {
  const people = DEMO_COHORT.filter((p) => program === null || p.program === program);
  const reached = people.map((p) => ({ p, c: p.checkins.find((c) => c.day === day) })).filter((x) => x.c);
  const scores = reached.map((x) => x.c!.score);
  const bands = { green: 0, yellow: 0, red: 0 } as Record<string, number>;
  scores.forEach((s) => { bands[bandFor(s).key]++; });
  const certified = reached.filter((x) => x.c!.inputs.stage === "certified").length;
  const traj = { improving: 0, stable: 0, declining: 0 } as Record<string, number>;
  reached.forEach(({ p, c }) => { const i = p.checkins.indexOf(c!); if (i > 0) traj[trajectory(p.checkins[i - 1].score, c!.score)]++; });
  return { enrolled: people.length, reached: reached.length, median: median(scores), bands, certified, traj };
}

export default function DemoFunder() {
  if (process.env.VERCEL_ENV === "production") notFound();
  const programs: (string | null)[] = [...DEMO_PROGRAMS, null];
  const orgRating = obrScore(DEMO_OBR_PASSED).composite;
  const nowStage = (prog: string | null, stage: string) => DEMO_COHORT.filter((p) => (prog === null || p.program === prog) && p.checkins.at(-1)?.inputs.stage === stage).length;
  return (
    <main className="ao-paper min-h-screen px-5 py-12">
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <p className="ao-eyebrow">Funder view · sample</p>
        <h1 className="ao-h1 mt-2">Readiness across the programs you fund</h1>
        <p className="ao-body-2 mt-3" style={{ fontSize: 16, maxWidth: 740 }}>
          Counts only. A funder sees how many people are at each step and how scores change over the 180-day program, never names or files.
          Scores use the published formula ({FRARI_INDIVIDUAL.label}); Green is 70 and above, Yellow 40–69, Red below 40.
        </p>

        {DAYS.map((day) => (
          <section key={day} className="ao-card mt-8" style={{ overflowX: "auto", padding: 0 }} aria-labelledby={`d${day}`}>
            <h2 id={`d${day}`} className="ao-h3" style={{ padding: "14px 16px 0", fontSize: 18 }}>Day {day} check-in</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
              <caption className="ao-meta" style={{ textAlign: "left", padding: "4px 16px 10px" }}>People who have reached day {day}, by program (sample data)</caption>
              <thead><tr>
                <th scope="col" style={{ ...th, textAlign: "left" }}>Program</th>
                <th scope="col" style={th}>Reached day {day}</th>
                <th scope="col" style={th}>Median score</th>
                <th scope="col" style={th}>Green</th><th scope="col" style={th}>Yellow</th><th scope="col" style={th}>Red</th>
                <th scope="col" style={th}>Certified</th>
                {day > 30 && <><th scope="col" style={th}>Improving</th><th scope="col" style={th}>Steady</th><th scope="col" style={th}>Declining</th></>}
              </tr></thead>
              <tbody>{programs.map((p) => { const c = checkpoint(p, day); return (
                <tr key={p ?? "all"} style={p === null ? { fontWeight: 600 } : undefined}>
                  <th scope="row" style={{ ...td, textAlign: "left", fontWeight: p === null ? 600 : 400 }}>{p ?? "All programs"}</th>
                  <td className="ao-mono" style={td}>{c.reached} <span className="ao-meta">of {c.enrolled}</span></td>
                  <td className="ao-mono" style={td}>{c.median ?? "—"}</td>
                  <td className="ao-mono" style={td}>{c.bands.green}</td><td className="ao-mono" style={td}>{c.bands.yellow}</td><td className="ao-mono" style={td}>{c.bands.red}</td>
                  <td className="ao-mono" style={td}>{c.certified}</td>
                  {day > 30 && <><td className="ao-mono" style={td}>{c.traj.improving}</td><td className="ao-mono" style={td}>{c.traj.stable}</td><td className="ao-mono" style={td}>{c.traj.declining}</td></>}
                </tr>); })}
              </tbody>
            </table>
          </section>
        ))}
        <p className="ao-meta mt-2">Improving, steady and declining compare each person&apos;s score with their previous check-in: up more than 3 points, within 3, or down more than 3 (the live engine&apos;s rule).</p>

        <section className="ao-card mt-8" style={{ overflowX: "auto", padding: 0 }} aria-labelledby="now">
          <h2 id="now" className="ao-h3" style={{ padding: "14px 16px 0", fontSize: 18 }}>Where everyone is today</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
            <caption className="sr-only">People at each step, by program</caption>
            <thead><tr><th scope="col" style={{ ...th, textAlign: "left" }}>Program</th>{LIFECYCLE.map((s) => <th key={s} scope="col" style={th}>{LIFECYCLE_LABEL[s]}</th>)}</tr></thead>
            <tbody>{programs.map((p) => <tr key={p ?? "all"} style={p === null ? { fontWeight: 600 } : undefined}><th scope="row" style={{ ...td, textAlign: "left", fontWeight: p === null ? 600 : 400 }}>{p ?? "All programs"}</th>{LIFECYCLE.map((s) => <td key={s} className="ao-mono" style={td}>{nowStage(p, s)}</td>)}</tr>)}</tbody>
          </table>
        </section>

        <section className="ao-card mt-8 p-5" aria-labelledby="orgs">
          <h2 id="orgs" className="ao-h3" style={{ fontSize: 18 }}>Organization readiness</h2>
          <p className="mt-2" style={{ fontSize: 15 }}>{DEMO_ORG.name}: <strong>{bandFor(orgRating).label} · {orgRating}</strong> · rated {DEMO_ORG.ratedOn}. <Link className="ao-link" href="/demo/org">See the rating</Link></p>
        </section>

        <p className="ao-body-2 mt-6" style={{ maxWidth: 740 }}>
          <strong>Not shown yet:</strong> follow-up questions about housing, work and money at each check-in. The program doesn&apos;t define those questions yet, so the demo only shows measures the written standard already has.
        </p>
      </div>
    </main>
  );
}
