"use client";

// Person app follow-through: what to do now, check-ins (day 0/30/90/180,
// 17 questions, income as ranges), the person's own progress, re-reviews,
// coaching and consent. Rules: lib/person.ts (mirrors core followup.go).
import { useEffect, useState } from "react";
import Link from "next/link";
import { CoreError, core } from "../../lib/core";
import type { SlotState } from "../../lib/record";
import {
  CHECK_IN_QUESTIONS, type Answers, type CheckInRow, type Consent, INCOME_NOTE, type Nudge, RE_REVIEW_PLAIN, RE_REVIEW_RULE,
  type ReReview, checkInSchedule, coachingTips, label, personNudges, stableHousing, steadyMoney, workingSteadily,
} from "../../lib/person";

export type FollowData = {
  enrolledAt: string;
  checkIns: CheckInRow[];
  reReview: ReReview | null;
  consent: Consent;
  /** Demo only: a fixed "today" so the sample story always reads the same. */
  now?: string;
  coach?: { name: string; lastTouch: string; next: string };
};

const fmt = (d: Date | string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Denver" });
const URGENCY: Record<Nudge["urgency"], { chip: string; word: string }> = { now: { chip: "chip-amber", word: "Do now" }, soon: { chip: "chip-engine", word: "Coming up" }, info: { chip: "chip-neutral", word: "Good to know" } };

export default function FollowThrough({ pid, status, nextSteps, nudgesOn, demo, onDemoNote, children }: {
  pid: string; status: string; nextSteps: SlotState[]; nudgesOn: boolean; demo?: FollowData; onDemoNote?: (m: string) => void;
  /** Rendered right after "What to do now" (the record's next steps). */
  children?: React.ReactNode;
}) {
  const [d, setD] = useState<FollowData | null>(demo ?? null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState<number | null>(null);

  useEffect(() => {
    if (demo || !pid) return;
    (async () => {
      const get = async (p: string) => { try { return await core(p); } catch { return null; } };
      const [c, rr, cons, vault] = await Promise.all([get(`/participants/${pid}/checkins`), get(`/participants/${pid}/rereview`), get(`/participants/${pid}/consent`), get(`/participants/${pid}/vault`)]);
      if (!c && !rr) setErr("Your check-in schedule didn't load. Try again in a moment.");
      setD({
        enrolledAt: rr?.enrolled_at ?? vault?.created_at ?? new Date().toISOString(),
        checkIns: Array.isArray(c?.check_ins) ? c.check_ins : [],
        reReview: rr ? { status: rr.status, next_due_at: rr.next_due_at, certified_at: rr.certified_at, last_review_at: rr.last_review_at, open: rr.open } : null,
        consent: (["granted", "revoked", "pending"].includes(cons?.status) ? cons.status : "none") as Consent,
      });
    })();
  }, [demo, pid]);

  if (!d) return <>{children}{err && <p className="ao-meta">{err}</p>}</>;

  const now = d.now ? new Date(d.now) : new Date();
  const schedule = checkInSchedule(d.enrolledAt, d.checkIns, now);
  const done = schedule.filter((s) => s.row?.answers);
  const last = done[done.length - 1]?.row?.answers ?? null;
  const nudges = personNudges({ status, consent: d.consent, schedule, reReview: d.reReview, nextSteps, lastAnswers: last, now });

  async function submit(day: number, answers: Answers): Promise<string | null> {
    if (demo) {
      setD((x) => x && ({ ...x, checkIns: [...x.checkIns.filter((r) => r.day !== day), { day, answers, submitted_at: now.toISOString(), days_late: 0 }] }));
      onDemoNote?.("Demo: your answers are shown here but not saved.");
      return null;
    }
    try {
      await core(`/participants/${pid}/checkins`, { method: "POST", body: JSON.stringify({ day, answers }) });
      const c = await core(`/participants/${pid}/checkins`).catch(() => null);
      setD((x) => x && ({ ...x, checkIns: Array.isArray(c?.check_ins) ? c.check_ins : x.checkIns }));
      return null;
    } catch (e) {
      if (e instanceof CoreError && e.code === "self_check_in_off") return "Check-ins are done with your program staff for now. Your coach will go through these questions with you.";
      if (e instanceof CoreError && e.code === "check_in_not_open") return "This check-in isn't open yet.";
      if (e instanceof CoreError && e.code === "check_in_exists") return "This check-in is already done.";
      return "Your answers didn't save. Please try again.";
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {nudgesOn && nudges.length > 0 && (
        <section aria-labelledby="todo" className="ao-card p-5">
          <h2 id="todo" className="ao-h2">What to do now</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {nudges.map((n) => (
              <li key={n.id} className="flex flex-col gap-2 rounded-[10px] p-3 sm:flex-row sm:items-center" style={{ background: "var(--paper)", border: "1px solid var(--linen)" }}>
                <div className="min-w-0 flex-1">
                  <span className={`ao-chip ${URGENCY[n.urgency].chip}`} style={{ fontSize: 12 }}>{URGENCY[n.urgency].word}</span>
                  <p className="mt-1" style={{ fontSize: 15, fontWeight: 600 }}>{n.title}</p>
                  <p className="ao-body-2">{n.body}</p>
                </div>
                {n.action && (n.action.checkInDay !== undefined
                  ? <button className="ao-btn ao-btn-primary ao-btn-sm" onClick={() => { setForm(n.action!.checkInDay!); setTimeout(() => document.getElementById("checkin-form")?.scrollIntoView({ behavior: "smooth" }), 50); }}>{n.action.label}</button>
                  : demo ? <button className="ao-btn ao-btn-quiet ao-btn-sm" onClick={() => onDemoNote?.("Demo: this would open the step.")}>{n.action.label}</button>
                  : <Link className="ao-btn ao-btn-quiet ao-btn-sm" href={n.action.href!}>{n.action.label}</Link>)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {children}

      {/* Check-ins */}
      <section aria-labelledby="checkins" className="ao-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="checkins" className="ao-h2">Your check-ins</h2>
          <span className="ao-meta">Day 0, 30, 90 and 180 · about 5 minutes each</span>
        </div>
        <ol className="mt-3 flex flex-col gap-2">
          {schedule.map((s) => (
            <li key={s.day} className="flex items-center gap-3 rounded-[10px] px-3 py-2" style={{ border: "1px solid var(--linen)" }}>
              <span className="ao-mono" style={{ width: 64, fontSize: 13 }}>Day {s.day}</span>
              <span className="min-w-0 flex-1 ao-body-2">{s.status === "done" ? `Done ${fmt(s.row?.submitted_at ?? s.due)}${s.row?.days_late ? ` · ${s.row.days_late} days late` : ""}` : s.status === "upcoming" ? `Opens ${fmt(s.opens)} · due ${fmt(s.due)}` : s.status === "late" ? `${s.daysLate} days late · was due ${fmt(s.due)}` : `Open now · due ${fmt(s.due)}`}</span>
              {s.status === "done" ? <span className="ao-chip chip-green"><span className="ao-chip-dot" />Done</span>
                : s.status === "upcoming" ? <span className="ao-chip chip-none">Later</span>
                : <button className="ao-btn ao-btn-primary ao-btn-sm" onClick={() => setForm(s.day)}>Start</button>}
            </li>
          ))}
        </ol>
        <p className="ao-meta mt-2">Your answers help your coach and show how the program is doing (as counts, never names). They never change your score directly. {INCOME_NOTE}</p>
        {form !== null && <CheckInForm day={form} onCancel={() => setForm(null)} onSubmit={async (a) => { const e = await submit(form, a); if (!e) setForm(null); return e; }} />}
      </section>

      {/* Progress */}
      {done.length > 0 && (
        <section aria-labelledby="progress" className="ao-card p-5" style={{ overflowX: "auto" }}>
          <h2 id="progress" className="ao-h2">Your progress</h2>
          <table className="mt-3" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr>{["", ...done.map((s) => `Day ${s.day}`)].map((h, i) => <th key={i} scope="col" style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid var(--linen)" }}>{h}</th>)}</tr></thead>
            <tbody>
              {([
                ["Housing", (a: Answers) => label("housing", a.housing)],
                ["Work", (a: Answers) => `${label("working", a.working)}${a.hours_last_week !== "0" ? `, ${label("hours_last_week", a.hours_last_week)} hrs` : ""}`],
                ["Money last month", (a: Answers) => label("income_range", a.income_range)],
                ["Stable housing", (a: Answers) => (stableHousing(a) ? "Yes" : "Not yet")],
                ["Working steadily", (a: Answers) => (workingSteadily(a) ? "Yes" : "Not yet")],
                ["Steady money", (a: Answers) => (steadyMoney(a) ? "Yes" : "Not yet")],
              ] as [string, (a: Answers) => string][]).map(([l, f]) => (
                <tr key={l}><th scope="row" style={{ textAlign: "left", fontWeight: 500, padding: "6px 10px", borderBottom: "1px solid var(--linen)" }}>{l}</th>
                  {done.map((s) => <td key={s.day} style={{ padding: "6px 10px", borderBottom: "1px solid var(--linen)" }}>{f(s.row!.answers!)}</td>)}</tr>
              ))}
              {done.some((s) => typeof s.row?.score === "number") && (
                <tr><th scope="row" style={{ textAlign: "left", fontWeight: 500, padding: "6px 10px" }}>Score</th>{done.map((s) => <td key={s.day} className="ao-mono" style={{ padding: "6px 10px" }}>{s.row?.score ?? "—"}</td>)}</tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Coaching */}
        <section aria-labelledby="coaching" className="ao-card p-5">
          <h2 id="coaching" className="ao-h3" style={{ fontSize: 18 }}>Coaching</h2>
          {d.coach && <p className="ao-meta mt-1">{d.coach.name} · last talked {d.coach.lastTouch} · next {d.coach.next}</p>}
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 ao-body-2">
            {nextSteps.filter((s) => s.key !== "consent").slice(0, 1).map((s) => <li key={s.key}>{s.ask}. {s.why}</li>)}
            {coachingTips(last).map((t) => <li key={t}>{t}</li>)}
          </ul>
          <p className="ao-meta mt-2">Coaching keeps going after certification. Your steps update after every check-in and every new document.</p>
        </section>

        {/* Re-review */}
        <section aria-labelledby="rereview" className="ao-card p-5">
          <h2 id="rereview" className="ao-h3" style={{ fontSize: 18 }}>Re-review</h2>
          {d.reReview ? (
            <>
              <p className="mt-1" style={{ fontSize: 15, fontWeight: 600 }}>{RE_REVIEW_PLAIN[d.reReview.status]}</p>
              {d.reReview.next_due_at && <p className="ao-body-2">Next re-review: <strong>{fmt(d.reReview.next_due_at)}</strong></p>}
            </>
          ) : <p className="ao-body-2 mt-1">Your re-review schedule starts at your first check-in.</p>}
          <p className="ao-meta mt-2">{RE_REVIEW_RULE}</p>
        </section>
      </div>

      {/* Consent and privacy */}
      <section aria-labelledby="privacy" className="ao-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="privacy" className="ao-h3" style={{ fontSize: 18 }}>Your consent and privacy</h2>
          <span className={`ao-chip ${d.consent === "granted" ? "chip-green" : "chip-amber"}`}><span className="ao-chip-dot" />{d.consent === "granted" ? "Consent given" : d.consent === "revoked" ? "Consent turned off" : "Consent not signed yet"}</span>
        </div>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 ao-body-2">
          <li>Reviewers see your record only after you give consent.</li>
          <li>Anyone you share your Registry ID with sees your standing, never your files or your answers.</li>
          <li>Check-in answers are used for your coaching, and for program results as counts only, never with your name.</li>
          <li>You can stop your check-ins or turn off consent at any time. That is recorded, and your record is re-reviewed.</li>
        </ul>
        {demo ? <button className="ao-btn ao-btn-quiet ao-btn-sm mt-3" onClick={() => onDemoNote?.("Demo: consent can't be changed on the sample record.")}>Review or change consent</button>
          : <Link className="ao-btn ao-btn-quiet ao-btn-sm mt-3" href="/intake?slot=consent">Review or change consent</Link>}
      </section>
    </div>
  );
}

function CheckInForm({ day, onSubmit, onCancel }: { day: number; onSubmit: (a: Answers) => Promise<string | null>; onCancel: () => void }) {
  const [a, setA] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const required = CHECK_IN_QUESTIONS.filter((q) => !q.free);
  const left = required.filter((q) => !a[q.key]).length;
  return (
    <form id="checkin-form" className="mt-4 rounded-[12px] p-4" style={{ background: "var(--paper)", border: "1px solid var(--linen)" }}
      onSubmit={async (e) => { e.preventDefault(); if (left) { setMsg(`${left} question${left === 1 ? "" : "s"} left.`); return; } setBusy(true); const m = await onSubmit(a); setBusy(false); if (m) setMsg(m); }}>
      <h3 className="ao-h3" style={{ fontSize: 18 }}>Day {day} check-in</h3>
      <p className="ao-meta">17 questions. Pick the closest answer; ranges are fine.</p>
      {CHECK_IN_QUESTIONS.map((q, i) => {
        const head = i === 0 || CHECK_IN_QUESTIONS[i - 1].area !== q.area ? q.area : null;
        return (
          <fieldset key={q.key} className="mt-3">
            {head && <p className="ao-eyebrow mt-3">{head}</p>}
            <legend style={{ fontSize: 15, fontWeight: 600 }}>{i + 1}. {q.q}</legend>
            {q.free ? (
              <textarea className="mt-1 w-full rounded-[8px] p-2" maxLength={1000} rows={2} style={{ border: "1px solid var(--rule)", background: "var(--card)" }} value={a[q.key] ?? ""} onChange={(e) => setA({ ...a, [q.key]: e.target.value })} />
            ) : (
              <div className="mt-1 flex flex-wrap gap-2">
                {q.choices!.map(([v, l]) => (
                  <label key={v} className="ao-chip" style={{ cursor: "pointer", background: a[q.key] === v ? "var(--ink)" : "var(--card)", color: a[q.key] === v ? "var(--paper)" : "var(--ink)", border: "1px solid var(--rule)", fontSize: 14, padding: "6px 10px" }}>
                    <input type="radio" name={q.key} value={v} checked={a[q.key] === v} onChange={() => setA({ ...a, [q.key]: v })} className="sr-only" />{l}
                  </label>
                ))}
              </div>
            )}
          </fieldset>
        );
      })}
      {msg && <p role="status" className="mt-3 rounded-[8px] px-3 py-2" style={{ background: "var(--amber-tint)", fontSize: 14 }}>{msg}</p>}
      <div className="mt-4 flex gap-2">
        <button type="submit" className="ao-btn ao-btn-primary" disabled={busy}>{busy ? "Saving…" : "Send my answers"}</button>
        <button type="button" className="ao-btn ao-btn-quiet" onClick={onCancel}>Not now</button>
      </div>
    </form>
  );
}
