import { DEMO_COACH, DEMO_COACHING, DEMO_PERSON_CHECKINS, DEMO_PERSON_ENGAGEMENT, DEMO_PERSON_REVIEW } from "../../../lib/demo";
import { bandFor } from "../../../lib/bands";
import { stableHousing, steadyMoney, workingSteadily, trajectory } from "../../../lib/program";

const yes = (b: boolean) => <span style={{ color: b ? "var(--pine)" : "var(--ink-3)", fontWeight: 600 }}>{b ? "Yes" : "Not yet"}</span>;
const JOB: Record<string, string> = { none: "No change", started: "Started a job", left: "Left a job", lost: "Lost a job", changed: "Changed jobs" };

/** Person view: check-in timeline (proposed questions), engagement, scheduled re-review, continuous coaching. Sample data only. */
export default function PersonFollowUp() {
  const done = DEMO_PERSON_CHECKINS.filter((c) => c.answers);
  return (
    <>
      <section aria-labelledby="coach" className="mt-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="coach" className="ao-h2">Coaching: what we&apos;re working on</h2>
          <span className="ao-meta">{DEMO_COACH.name} · last touch {DEMO_COACH.lastTouch} · next {DEMO_COACH.next}</span>
        </div>
        <ol className="flex flex-col gap-2">
          {DEMO_COACHING.map((c, i) => (
            <li key={c.gap} className="ao-card p-4" style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 12 }}>
              <span className="ao-mono ao-meta">{i + 1}</span>
              <div><p className="ao-meta" style={{ color: "var(--ink-2)" }}>Gap: {c.gap}</p><p style={{ fontWeight: 600, fontSize: 15 }}>{c.step}</p><p className="ao-meta mt-0.5">{c.effect}</p></div>
              <span className="ao-mono ao-meta" style={{ whiteSpace: "nowrap" }}>by {c.due}</span>
            </li>
          ))}
        </ol>
        <p className="ao-meta mt-2">Coaching doesn&apos;t stop at certification. Steps update after every check-in and every new piece of evidence.</p>
      </section>

      <section aria-labelledby="checkins" className="mt-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h2 id="checkins" className="ao-h2">Check-ins</h2><span className="ao-meta">Housing, work and money questions (proposed set)</span></div>
        <div className="ao-card" style={{ overflowX: "auto", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <caption className="sr-only">Maya&apos;s check-in answers</caption>
            <thead><tr>{["", ...DEMO_PERSON_CHECKINS.map((c) => `Day ${c.day}`)].map((h, i) => <th key={i} scope="col" style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--linen)" }}>{h}</th>)}</tr></thead>
            <tbody>
              {([
                ["Date", (c) => <>{c.date}{c.onTime === false ? <span className="ao-meta"> · late</span> : c.onTime === null ? <span className="ao-meta"> · scheduled</span> : null}</>],
                ["Score", (c) => c.score == null ? "—" : <><span className="ao-mono">{c.score}</span> <span className="ao-meta">{bandFor(c.score).label}</span></>],
                ["Staying", (c) => c.answers!.housing],
                ["Time there / moves", (c) => `${c.answers!.housingMonths} mo · ${c.answers!.moves} move${c.answers!.moves === 1 ? "" : "s"}`],
                ["Stable housing", (c) => yes(stableHousing(c.answers!))],
                ["Working / hours last week", (c) => c.answers!.working ? `Yes · ${c.answers!.hoursLastWeek} hrs` : "No, looking"],
                ["Weeks worked (of 4) / job change", (c) => `${c.answers!.weeksWorked4} · ${JOB[c.answers!.jobChange]}`],
                ["Working steadily", (c) => yes(workingSteadily(c.answers!))],
                ["Income last month", (c) => `${c.answers!.incomeRange} (${c.answers!.incomeTrend})`],
                ["Bills on time / bank account", (c) => `${c.answers!.billsOnTime} · ${c.answers!.bank ? "yes" : "no"}`],
                ["Steady money", (c) => yes(steadyMoney(c.answers!))],
              ] as [string, (c: (typeof DEMO_PERSON_CHECKINS)[number]) => React.ReactNode][]).map(([label, f]) => (
                <tr key={label}><th scope="row" style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid var(--linen)", fontWeight: 500, color: "var(--ink-2)" }}>{label}</th>
                  {DEMO_PERSON_CHECKINS.map((c) => <td key={c.day} style={{ padding: "8px 12px", borderBottom: "1px solid var(--linen)" }}>{label === "Date" || label === "Score" || c.answers ? f(c) : "—"}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ao-meta mt-2">Trend since day 30: {trajectory(done[1].score!, done[2].score!)}. Answers are used for coaching and program outcomes; they never change the score directly.</p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="ao-card p-5" aria-labelledby="eng">
          <h2 id="eng" className="ao-h3" style={{ fontSize: 18 }}>Taking part</h2>
          <dl className="mt-3 grid gap-2" style={{ gridTemplateColumns: "1fr auto", fontSize: 14 }}>
            <dt>Sign-ins this month</dt><dd className="ao-mono">{DEMO_PERSON_ENGAGEMENT.signIns} days</dd>
            <dt>Evidence uploads (90 days)</dt><dd className="ao-mono">{DEMO_PERSON_ENGAGEMENT.uploads}</dd>
            <dt>Check-ins on time</dt><dd className="ao-mono">{DEMO_PERSON_ENGAGEMENT.checkInsOnTime}</dd>
            <dt>Coaching touches</dt><dd className="ao-mono">{DEMO_PERSON_ENGAGEMENT.coaching}</dd>
            <dt>Median response time</dt><dd className="ao-mono">{DEMO_PERSON_ENGAGEMENT.responseDays} days</dd>
          </dl>
          <p className="ao-meta mt-3">{DEMO_PERSON_ENGAGEMENT.lateNote} Late or missed check-ins prompt a coach call and an early re-review.</p>
        </div>
        <div className="ao-card p-5" aria-labelledby="rr">
          <h2 id="rr" className="ao-h3" style={{ fontSize: 18 }}>Scheduled re-review</h2>
          <dl className="mt-3 grid gap-2" style={{ gridTemplateColumns: "auto 1fr", fontSize: 14 }}>
            <dt className="ao-meta">Last</dt><dd>{DEMO_PERSON_REVIEW.last}</dd>
            <dt className="ao-meta">Next</dt><dd style={{ fontWeight: 600 }}>{DEMO_PERSON_REVIEW.next}</dd>
            <dt className="ao-meta">Status</dt><dd>{DEMO_PERSON_REVIEW.status}</dd>
            <dt className="ao-meta">Checks</dt><dd>{DEMO_PERSON_REVIEW.triggers}</dd>
          </dl>
          <p className="ao-meta mt-3">A score not re-reviewed on time shows as due, and evidence older than 90 days stops counting, so a score can&apos;t be coasted on.</p>
        </div>
      </section>
    </>
  );
}
