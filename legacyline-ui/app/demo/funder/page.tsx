import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { DEMO_COHORT, DEMO_COHORT_FOLLOWUP, DEMO_OBR_PASSED, DEMO_ORG, DEMO_ORG_RENEWAL, DEMO_PROGRAMS, stableHousing, steadyMoney, workingSteadily } from "../../../lib/demo";
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

function outcomes(day: 30 | 90 | 180) {
  const rows = DEMO_COHORT.map((p) => DEMO_COHORT_FOLLOWUP[p.id][day]).filter(Boolean) as NonNullable<(typeof DEMO_COHORT_FOLLOWUP)[string][30]>[];
  const n = rows.length; const pct = (k: number) => (n ? `${Math.round((k / n) * 100)}%` : "—");
  const working = rows.filter((r) => r.answers.working);
  return {
    n,
    housing: pct(rows.filter((r) => stableHousing(r.answers)).length),
    work: pct(rows.filter((r) => workingSteadily(r.answers)).length),
    hours: median(working.map((r) => r.answers.hoursLastWeek)) ?? "—",
    started: rows.filter((r) => r.answers.jobChange === "started" || r.answers.jobChange === "changed").length,
    lost: rows.filter((r) => r.answers.jobChange === "lost").length,
    money: pct(rows.filter((r) => steadyMoney(r.answers)).length),
    onTime: pct(rows.filter((r) => r.onTime).length),
    signIns: median(rows.map((r) => r.signIns)) ?? "—",
    uploads: median(rows.map((r) => r.uploads)) ?? "—",
    coaching: n ? (rows.reduce((a, r) => a + r.coaching, 0) / n).toFixed(1) : "—",
    response: n ? (Math.round(median(rows.map((r) => r.responseDays * 10))!) / 10).toFixed(1) : "—",
    reviewed: rows.filter((r) => r.reReviewed).length,
    changed: rows.filter((r) => r.reReviewChanged).length,
    triggered: rows.filter((r) => r.triggered).length,
  };
}

function SimpleTable({ id, title, caption, cols, rows }: { id: string; title: string; caption: string; cols: string[]; rows: (string | number)[][] }) {
  return (
    <section className="ao-card mt-8" style={{ overflowX: "auto", padding: 0 }} aria-labelledby={id}>
      <h2 id={id} className="ao-h3" style={{ padding: "14px 16px 0", fontSize: 18 }}>{title}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
        <caption className="ao-meta" style={{ textAlign: "left", padding: "4px 16px 10px" }}>{caption}</caption>
        <thead><tr>{cols.map((c, i) => <th key={c} scope="col" style={i ? th : { ...th, textAlign: "left" }}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={String(r[0])}>{r.map((v, i) => i ? <td key={i} className="ao-mono" style={td}>{v}</td> : <th key={i} scope="row" style={{ ...td, textAlign: "left", fontWeight: 400 }}>{v}</th>)}</tr>)}</tbody>
      </table>
    </section>
  );
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
          <p className="mt-2" style={{ fontSize: 15 }}>{DEMO_ORG.name}: <strong>{bandFor(orgRating).label} · {orgRating}</strong> · rated {DEMO_ORG.ratedOn}, valid until {DEMO_ORG_RENEWAL.expiresOn} (organizations recertify every year). <Link className="ao-link" href="/demo/org">See the rating</Link></p>
        </section>

        <SimpleTable id="life" title="Housing, work and money at each check-in" caption="All programs · from the check-in questions (proposed set, awaiting approval) · sample data"
          cols={["Check-in", "Answered", "Stable housing", "Working steadily", "Median hours (working)", "Started or changed job", "Lost a job", "Steady money"]}
          rows={DAYS.map((d) => { const o = outcomes(d); return [`Day ${d}`, o.n, o.housing, o.work, o.hours, o.started, o.lost, o.money]; })} />
        <p className="ao-meta mt-2">Stable housing: own place or paying part, there 3+ months or no moves, not a month behind. Working steadily: 3+ of the last 4 weeks and 20+ hours. Steady money: income the same or more, and most bills on time.</p>

        <SimpleTable id="eng" title="Taking part" caption="All programs · engagement data collected between check-ins · sample data"
          cols={["Check-in", "On time", "Median sign-ins / month", "Median uploads (90 days)", "Coaching touches / person", "Median response (days)"]}
          rows={DAYS.map((d) => { const o = outcomes(d); return [`Day ${d}`, o.onTime, o.signIns, o.uploads, o.coaching, o.response]; })} />

        <SimpleTable id="rr" title="Scheduled re-reviews" caption="Evidence re-verified and score recomputed by the rules at every check-in · sample data"
          cols={["Check-in", "Re-reviews done", "Score changed after re-review", "Early re-review triggered"]}
          rows={DAYS.map((d) => { const o = outcomes(d); return [`Day ${d}`, o.reviewed, o.changed, o.triggered]; })} />
        <p className="ao-meta mt-2">Early re-review triggers: a jump of 15+ points, a burst of uploads right before a check-in, reused documents, answers that contradict the evidence, or a late check-in. Scores can&apos;t be coasted on: evidence stops counting after 90 days.</p>
      </div>
    </main>
  );
}
