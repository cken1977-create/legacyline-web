// Person app: follow-through for one person, in line with the approved
// Follow-up system v1.0 (core followup.go, PR #22) and the published scoring.
//
// Nothing here changes a score. Scores come only from the published formula.
// This file turns the person's schedule into plain next steps ("nudges").
//
// Build rule: new nudges ship OFF. They show only when
// NEXT_PUBLIC_KAMILI_NUDGES=1 is set at build time (the demo sets it on).

import type { SlotState } from "./record";

export const NUDGES_ON = process.env.NEXT_PUBLIC_KAMILI_NUDGES === "1";

export const DAY_MS = 864e5;
export const CHECK_IN_DAYS = [0, 30, 90, 180] as const;
export const CHECK_IN_OPENS_DAYS_BEFORE = 7; // core: SelfCheckInOpensDaysBefore
export const LATE_DAYS = 14; // core: LateCheckInDays (prompts an early re-review)
export const RE_REVIEW_EVERY_DAYS = 90; // core: ReReviewEveryCertified
export const RE_REVIEW_GRACE_DAYS = 30; // core: ReReviewGrace
export const EVIDENCE_COUNTS_DAYS = 90; // FRARI: evidence events in the last 90 days

// ── The 17 check-in questions (core keys and allowed answers) ─────────────
export type Choice = [value: string, label: string];
export type Question = { key: string; area: "Housing" | "Work" | "Income and money" | "Wrapping up"; q: string; choices?: Choice[]; free?: boolean };
export const CHECK_IN_QUESTIONS: Question[] = [
  { key: "housing", area: "Housing", q: "Where are you staying right now?", choices: [["own_renting", "My own place, renting"], ["own_owned", "My own place, I own it"], ["family_paying_part", "With family or friends, paying part"], ["family_not_paying", "With family or friends, not paying"], ["shelter_transitional", "Shelter or transitional housing"], ["no_regular_place", "No regular place"], ["other", "Somewhere else"]] },
  { key: "housing_for", area: "Housing", q: "How long have you been at this place?", choices: [["under_1m", "Less than a month"], ["1_3m", "1 to 3 months"], ["3_6m", "3 to 6 months"], ["6_12m", "6 to 12 months"], ["over_1y", "More than a year"]] },
  { key: "moves", area: "Housing", q: "How many times have you moved since the last check-in?", choices: [["0", "None"], ["1", "Once"], ["2", "Twice"], ["3_plus", "3 or more"]] },
  { key: "behind_rent", area: "Housing", q: "Are you behind on rent or housing costs?", choices: [["no", "No"], ["under_1m", "Yes, less than a month"], ["1m_plus", "Yes, a month or more"], ["no_rent", "I don't pay rent"]] },
  { key: "expect_stay", area: "Housing", q: "Do you expect to still be here at the next check-in?", choices: [["yes", "Yes"], ["probably", "Probably"], ["not_sure", "Not sure"], ["no", "No"]] },
  { key: "working", area: "Work", q: "Are you working right now?", choices: [["one_job", "Yes, one job"], ["more_than_one", "Yes, more than one job"], ["looking", "No, I'm looking"], ["not_looking", "No, not looking right now"], ["school_training", "In school or training"]] },
  { key: "hours_last_week", area: "Work", q: "About how many hours did you work last week?", choices: [["0", "None"], ["1_10", "1 to 10"], ["11_20", "11 to 20"], ["21_30", "21 to 30"], ["31_40", "31 to 40"], ["over_40", "More than 40"]] },
  { key: "weeks_worked_4", area: "Work", q: "How many of the last 4 weeks did you work?", choices: [["0", "None"], ["1", "1 week"], ["2", "2 weeks"], ["3", "3 weeks"], ["4", "All 4"]] },
  { key: "job_change", area: "Work", q: "Since the last check-in, did your job change?", choices: [["none", "No change"], ["started", "I started a job"], ["left_by_choice", "I left a job by choice"], ["lost", "I lost a job"], ["changed", "I changed jobs"], ["more_than_one", "More than one of these"]] },
  { key: "schedule_steady", area: "Work", q: "Is your work schedule steady week to week?", choices: [["yes", "Yes"], ["mostly", "Mostly"], ["no", "No"]] },
  { key: "income_range", area: "Income and money", q: "About how much came in last month, from all sources?", choices: [["under_500", "Under $500"], ["500_999", "$500 to $999"], ["1000_1499", "$1,000 to $1,499"], ["1500_1999", "$1,500 to $1,999"], ["2000_2999", "$2,000 to $2,999"], ["3000_plus", "$3,000 or more"], ["prefer_not", "I'd rather not say"]] },
  { key: "income_trend", area: "Income and money", q: "Compared with the last check-in, is that more, the same, or less?", choices: [["more", "More"], ["same", "About the same"], ["less", "Less"]] },
  { key: "bank_account", area: "Income and money", q: "Do you have a bank or credit union account?", choices: [["yes", "Yes"], ["opening", "I'm opening one"], ["no", "No"]] },
  { key: "bills_on_time", area: "Income and money", q: "Did you pay your main bills on time last month?", choices: [["all", "All of them"], ["most", "Most of them"], ["some", "Some of them"], ["none", "None of them"]] },
  { key: "emergency_savings", area: "Income and money", q: "Do you have any money set aside for an emergency?", choices: [["none", "None"], ["under_100", "Under $100"], ["100_499", "$100 to $499"], ["500_plus", "$500 or more"], ["prefer_not", "I'd rather not say"]] },
  { key: "help_note", area: "Wrapping up", q: "What's the one thing that would help most before the next check-in? (optional)", free: true },
  { key: "consent_continue", area: "Wrapping up", q: "Do you still agree to these check-ins?", choices: [["yes", "Yes"], ["talk", "I want to talk about it"], ["no", "No, stop my check-ins"]] },
];
export const INCOME_NOTE = "Income is asked as a range, never an exact amount.";
export const label = (key: string, value?: string) => CHECK_IN_QUESTIONS.find((q) => q.key === key)?.choices?.find((c) => c[0] === value)?.[1] ?? value ?? "";

// ── Outcomes (same definitions as core; used for progress, never the score) ──
export type Answers = Record<string, string>;
export const stableHousing = (a: Answers) =>
  ["own_renting", "own_owned", "family_paying_part"].includes(a.housing) && (["3_6m", "6_12m", "over_1y"].includes(a.housing_for) || a.moves === "0") && a.behind_rent !== "1m_plus";
export const workingSteadily = (a: Answers) =>
  ["one_job", "more_than_one"].includes(a.working) && ["3", "4"].includes(a.weeks_worked_4) && ["21_30", "31_40", "over_40"].includes(a.hours_last_week);
export const steadyMoney = (a: Answers) => a.income_trend !== "less" && ["all", "most"].includes(a.bills_on_time);

// ── Schedule ───────────────────────────────────────────────────────────────
export type CheckInRow = { day: number; answers?: Answers | null; due_at?: string; submitted_at?: string | null; days_late?: number; score?: number | null };
export type SlotStatus = "done" | "open" | "late" | "upcoming";
export type ScheduleItem = { day: number; due: Date; opens: Date; status: SlotStatus; daysLate: number; row?: CheckInRow };

export function checkInSchedule(enrolledAt: string | Date, rows: CheckInRow[], now: Date): ScheduleItem[] {
  const start = new Date(enrolledAt).getTime();
  return CHECK_IN_DAYS.map((day) => {
    const due = new Date(start + day * DAY_MS);
    const opens = new Date(due.getTime() - CHECK_IN_OPENS_DAYS_BEFORE * DAY_MS);
    const row = rows.find((r) => r.day === day && (r.submitted_at || r.answers));
    const daysLate = Math.max(0, Math.floor((now.getTime() - due.getTime()) / DAY_MS));
    const status: SlotStatus = row ? "done" : now < opens ? "upcoming" : daysLate > 0 ? "late" : "open";
    return { day, due, opens, status, daysLate: row ? row.days_late ?? 0 : daysLate, row };
  });
}

// ── Re-review (from core GET /participants/:id/rereview) ───────────────────
export type ReReview = { status: "current" | "due" | "paused" | "overdue" | "program_ended"; next_due_at?: string | null; certified_at?: string | null; last_review_at?: string | null; open?: { kind: string; due_at: string; reasons?: string[] }[] };
export const RE_REVIEW_PLAIN: Record<ReReview["status"], string> = {
  current: "Your record is current.",
  due: "Your re-review is due. A reviewer re-checks what's on file; keep your documents up to date.",
  overdue: "Your re-review is past due. Talk with your coach to get it done.",
  paused: "Your certification is paused until your re-review is done. Talk with your coach.",
  program_ended: "Your program check-ins are finished.",
};
export const RE_REVIEW_RULE = `Re-reviews happen at each check-in, then every ${RE_REVIEW_EVERY_DAYS} days after certification. If one is late, there is a ${RE_REVIEW_GRACE_DAYS}-day grace period; after that a certification is paused until the re-review is done.`;

export type Consent = "granted" | "revoked" | "pending" | "none";

// ── Stage guide: Registered to Certified ──────────────────────────────────
export const STAGE_GUIDE: Record<string, { you: string; next: string }> = {
  registered: { you: "Sign your consent form and fill in your intake.", next: "Once those are in, you start gathering evidence." },
  data_collecting: { you: "Add the documents and answers on your list of next steps.", next: "When your record is complete enough, a certified reviewer reads it." },
  under_review: { you: "Nothing to do but keep your check-ins on time. Answer any request from your reviewer quickly.", next: "A second reviewer signs off before anyone can be certified." },
  evaluated: { you: "Read your results and work on the steps that are still open.", next: "Certification follows once the standard is met and two reviewers agree." },
  certified: { you: "Keep your documents current and your check-ins on time.", next: `Your record is re-reviewed every ${RE_REVIEW_EVERY_DAYS} days so your standing stays true.` },
};

// ── Coaching: plain tips from the latest answers (never changes the score) ─
export function coachingTips(a: Answers | null | undefined): string[] {
  if (!a) return [];
  const t: string[] = [];
  if (a.behind_rent === "1m_plus" || a.behind_rent === "under_1m") t.push("You said you're behind on rent. Ask your coach about rent help before it grows.");
  if (["shelter_transitional", "no_regular_place"].includes(a.housing)) t.push("Housing is the first priority. Your coach can connect you with housing programs.");
  if (a.expect_stay === "no" || a.expect_stay === "not_sure") t.push("If you may move soon, tell your coach now so your record stays complete.");
  if (a.working === "looking") t.push("Keep a simple list of jobs you apply to. It counts as evidence of follow-through.");
  if (a.job_change === "lost") t.push("Losing a job is hard. Tell your coach; there may be short-term help with bills.");
  if (a.bank_account === "no") t.push("A bank or credit union account makes it easier to show steady money. Ask your coach about no-fee accounts.");
  if (["some", "none"].includes(a.bills_on_time)) t.push("Pick one bill to get current first. Your coach can help you plan.");
  if (a.emergency_savings === "none") t.push("Even a small emergency fund helps. Try setting aside a little each payday.");
  if (a.consent_continue === "talk") t.push("You asked to talk about the check-ins. Your coach will reach out.");
  if (t.length === 0) t.push("You're steady. Keep your check-ins on time and your documents current.");
  return t.slice(0, 3);
}

// ── Nudges: what to do now, most urgent first ─────────────────────────────
export type Nudge = { id: string; kind: "consent" | "checkin" | "rereview" | "evidence" | "coaching" | "share"; urgency: "now" | "soon" | "info"; title: string; body: string; action?: { label: string; href?: string; checkInDay?: number } };

const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Denver" });

export function personNudges(p: {
  status: string; consent: Consent; schedule: ScheduleItem[]; reReview: ReReview | null; nextSteps: SlotState[]; lastAnswers?: Answers | null; now: Date;
}): Nudge[] {
  const n: Nudge[] = [];
  if (p.consent !== "granted") n.push({ id: "consent", kind: "consent", urgency: "now", title: p.consent === "revoked" ? "Your consent is turned off" : "Review and sign your consent form", body: p.consent === "revoked" ? "Nothing is shared and your record can't be reviewed until you turn consent back on. You can change it any time." : "Nothing is shared with a reviewer until you say so. Signing also adds points under the published formula.", action: { label: "Review consent", href: "/intake?slot=consent" } });
  for (const s of p.schedule) {
    if (s.status === "late") n.push({ id: `checkin-${s.day}`, kind: "checkin", urgency: "now", title: `Your day ${s.day} check-in is ${s.daysLate} day${s.daysLate === 1 ? "" : "s"} late`, body: s.daysLate >= LATE_DAYS ? `It takes about 5 minutes. At ${LATE_DAYS} or more days late, your record is re-reviewed early.` : `It takes about 5 minutes. After ${LATE_DAYS} days late, your record is re-reviewed early.`, action: { label: "Start check-in", checkInDay: s.day } });
    else if (s.status === "open") n.push({ id: `checkin-${s.day}`, kind: "checkin", urgency: "now", title: `Your day ${s.day} check-in is open`, body: `17 short questions about housing, work and money. Due ${fmt(s.due)}.`, action: { label: "Start check-in", checkInDay: s.day } });
  }
  const up = p.schedule.find((s) => s.status === "upcoming");
  if (up) n.push({ id: `checkin-${up.day}-soon`, kind: "checkin", urgency: "info", title: `Next check-in: day ${up.day}`, body: `Opens ${fmt(up.opens)}, due ${fmt(up.due)}.` });
  if (p.reReview && p.reReview.status !== "current" && p.reReview.status !== "program_ended")
    n.push({ id: "rereview", kind: "rereview", urgency: p.reReview.status === "due" ? "soon" : "now", title: p.reReview.status === "paused" ? "Your certification is paused" : p.reReview.status === "overdue" ? "Your re-review is past due" : "Your re-review is due", body: RE_REVIEW_PLAIN[p.reReview.status] + (p.reReview.next_due_at && p.reReview.status === "due" ? ` Grace period ends ${fmt(new Date(new Date(p.reReview.next_due_at).getTime() + RE_REVIEW_GRACE_DAYS * DAY_MS))}.` : "") });
  else if (p.reReview?.next_due_at && p.reReview.status === "current") {
    const days = Math.ceil((new Date(p.reReview.next_due_at).getTime() - p.now.getTime()) / DAY_MS);
    if (days <= 14) n.push({ id: "rereview-soon", kind: "rereview", urgency: "soon", title: `Re-review in ${days} day${days === 1 ? "" : "s"}`, body: "Make sure your documents are current. Evidence older than 90 days stops counting." });
  }
  const step = p.nextSteps[0];
  if (step) n.push({ id: `evidence-${step.key}`, kind: "evidence", urgency: "soon", title: step.ask, body: step.why, action: { label: step.action, href: `/intake?slot=${step.key}` } });
  for (const tip of coachingTips(p.lastAnswers).slice(0, 1)) n.push({ id: "coach", kind: "coaching", urgency: "info", title: "From your coaching plan", body: tip });
  if (p.status === "certified" && p.consent === "granted") n.push({ id: "share", kind: "share", urgency: "info", title: "Share your standing", body: "Give your Registry ID to a landlord or employer. They see your standing, never your files.", action: { label: "Share", href: "#share" } });
  const rank = { now: 0, soon: 1, info: 2 } as const;
  return n.sort((a, b) => rank[a.urgency] - rank[b.urgency]);
}
