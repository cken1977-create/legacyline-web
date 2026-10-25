// Fictional demo data for design review on preview deployments only.
// "Maya Rivera" etc. are invented. Never real clients.
import type { Run } from "./frari";
import { type FollowUpAnswers, type FrariInputs, type Lifecycle, frariScore, stableHousing, steadyMoney, workingSteadily } from "./program";

const at = "2026-10-09T19:20:00Z";
export const DEMO_RUN: Run = {
  id: "run_7f3a9c1e", ruleset_version: "frari_individual_v1", input_event_hash: "a91c44be20d1f7e3", output_hash: "7f3a9c1e5b02d4aa", computed_at: at, triggered_by: "evaluator",
  dimension_scores: [
    { domain: "housing", score: 65, max_score: 100, rules_passed: ["housing_type_present", "housing_cost_present", "gov_id_verified"], rules_failed: ["address_present", "consent_granted"] },
    { domain: "workforce", score: 80, max_score: 100, rules_passed: ["employment_present", "employed", "income_documented"], rules_failed: ["employer_documented"] },
    { domain: "financial", score: 45, max_score: 100, rules_passed: ["income_documented", "housing_cost_present"], rules_failed: ["bank_statement_present", "consent_granted"] },
    { domain: "behavioral", score: 75, max_score: 100, rules_passed: ["intake_complete", "selfie_present", "gov_id_present"], rules_failed: ["consent_granted"] },
  ],
};

export const DEMO_PERSON = {
  frari: { evidenceEvents90d: 6, stage: "under_review", intakeFilled: 10, consent: "pending" } as FrariInputs,
  participantId: "ptc-demo-0001", firstName: "Maya", lastName: "Rivera", email: "maya.demo@example.com", registryId: "BRSA-26-7F3A0417", status: "under_review",
  intake: { employment_status: "employed_part_time", housing_type: "renting", monthly_income: "2400", monthly_housing_cost: "1100", employer_name: "", address: "", docs_uploaded: { gov_id: true, selfie: true, bank_statement: false } } as Record<string, any>,
  run: DEMO_RUN,
};

export const DEMO_CASES = [
  { id: "ptc-demo-0007", registry_id: "BRSA-26-7F3A0410", first_name: "Andre", last_name: "Wells", status: "certified", created_at: "2026-05-04T16:00:00Z", program: "Riverside Community Partners (demo)" },
  { id: "ptc-demo-0001", registry_id: "BRSA-26-7F3A0417", first_name: "Maya", last_name: "Rivera", status: "under_review", created_at: "2026-07-21T16:00:00Z", program: "Riverside Community Partners (demo)" },
  { id: "ptc-demo-0002", registry_id: "BRSA-26-7F3A0418", first_name: "Devon", last_name: "Park", status: "under_review", created_at: "2026-10-03T16:00:00Z", program: "Riverside Community Partners (demo)" },
  { id: "ptc-demo-0003", registry_id: "BRSA-26-7F3A0419", first_name: "Alana", last_name: "Brooks", status: "data_collecting", created_at: "2026-10-05T16:00:00Z", program: "Riverside Community Partners (demo)" },
  { id: "ptc-demo-0006", registry_id: "BRSA-26-7F3A0422", first_name: "Theo", last_name: "Grant", status: "data_collecting", created_at: "2026-10-01T16:00:00Z", program: "Riverside Community Partners (demo)" },
  { id: "ptc-demo-0004", registry_id: "BRSA-26-7F3A0420", first_name: "Samuel", last_name: "Ortiz", status: "evaluated", created_at: "2026-09-21T16:00:00Z", program: "Riverside Community Partners (demo)" },
  { id: "ptc-demo-0005", registry_id: "BRSA-26-7F3A0421", first_name: "Rosa", last_name: "Nguyen", status: "registered", created_at: "2026-10-08T16:00:00Z", program: "Riverside Community Partners (demo)" },
];

export const DEMO_TIMELINE = [
  { from_status: "data_collecting", to_status: "under_review", created_at: "2026-10-06T17:12:00Z", actor: "program desk" },
  { from_status: "registered", to_status: "data_collecting", created_at: "2026-07-23T16:00:00Z", actor: "system" },
];

export const DEMO_RUN_READY: Run = {
  id: "run_c41d0b77", ruleset_version: "frari_individual_v1", input_event_hash: "5e0b19aa77c2d310", output_hash: "c41d0b77e9a35f12", computed_at: "2026-10-08T21:05:00Z", triggered_by: "evaluator",
  dimension_scores: [
    { domain: "housing", score: 100, max_score: 100, rules_passed: ["housing_type_present", "housing_cost_present", "address_present", "gov_id_verified", "consent_granted"], rules_failed: [] },
    { domain: "workforce", score: 100, max_score: 100, rules_passed: ["employment_present", "employed", "income_documented", "employer_documented"], rules_failed: [] },
    { domain: "financial", score: 100, max_score: 100, rules_passed: ["income_documented", "housing_cost_present", "bank_statement_present", "consent_granted"], rules_failed: [] },
    { domain: "behavioral", score: 100, max_score: 100, rules_passed: ["intake_complete", "selfie_present", "gov_id_present", "consent_granted"], rules_failed: [] },
  ],
};

// ── FRARI v1.0.0 inputs per sample person (the published formula in lib/program.ts) ──
// Maya: 6 evidence events in 90 days, in review, 10 of 12 intake fields (no address, no bank
// statement), consent pending → 18 + 12.5 + 20.8 + 8 = 59 (Yellow).
export const DEMO_FRARI: Record<string, FrariInputs> = {
  "ptc-demo-0001": { evidenceEvents90d: 6, stage: "under_review", intakeFilled: 10, consent: "pending" },
  "ptc-demo-0002": { evidenceEvents90d: 4, stage: "under_review", intakeFilled: 10, consent: "granted" },
  "ptc-demo-0003": { evidenceEvents90d: 2, stage: "data_collecting", intakeFilled: 6, consent: "pending" },
  "ptc-demo-0006": { evidenceEvents90d: 3, stage: "data_collecting", intakeFilled: 8, consent: "granted" },
  "ptc-demo-0004": { evidenceEvents90d: 9, stage: "evaluated", intakeFilled: 12, consent: "granted" },
  "ptc-demo-0005": { evidenceEvents90d: 0, stage: "registered", intakeFilled: 3, consent: "pending" },
  "ptc-demo-0007": { evidenceEvents90d: 10, stage: "certified", intakeFilled: 12, consent: "granted" },
};

// ── One connected sample story ──
// Riverside Community Partners (fictional) joined the pilot Apr 27, 2026 (day 180 on the demo's
// "today", Oct 24, 2026). Maya, Samuel, Andre and the rest of the Program Desk are Riverside's
// participants; the same people are counted in the funder view and the pilot overview.
// Everything is generated from fixed seeds, so every visit shows the same numbers.
/** The one fictional partner organization used on every demo screen. */
export const DEMO_ORG = { name: "Riverside Community Partners (demo)", slug: "demo", ratedOn: "Oct 16, 2026", ratedAt: "2026-10-16T18:00:00Z" } as const;
export const DEMO_TODAY_ISO = "2026-10-24T18:00:00Z";
const TODAY = Date.parse(DEMO_TODAY_ISO);
export const daysBefore = (n: number) => new Date(TODAY - n * 864e5).toISOString();

export type DemoPilot = { name: string; start: string; city: string; size: number; evaluatorsCertified: number; toolLive: string | null; org: { status: "rated" | "in_progress" | "not_started"; note: string }; related?: boolean };
export const DEMO_PILOTS: DemoPilot[] = [
  { name: DEMO_ORG.name, start: "2026-04-27", city: "Albuquerque, NM", size: 15, evaluatorsCertified: 2, toolLive: "2026-05-26", org: { status: "rated", note: "Green 70 · rated Oct 16, 2026 · valid until Oct 16, 2027" } },
  { name: "Vizionz Sankofa (demo)", start: "2026-06-01", city: "Sample city", size: 18, evaluatorsCertified: 3, toolLive: "2026-06-29", org: { status: "in_progress", note: "Evidence in review (sample)" }, related: true },
  { name: "Northside Youth Works (demo)", start: "2026-09-14", city: "Sample city", size: 6, evaluatorsCertified: 0, toolLive: null, org: { status: "not_started", note: "Starts after day 30" } },
];
export const SELF_ENROLLED = "Self-enrolled";
export const DEMO_PROGRAMS = [...DEMO_PILOTS.map((p) => p.name), SELF_ENROLLED] as const;
export const RELATED_PARTY_NOTE = "Disclosure: Vizionz Sankofa is led by a member of the Kamili founder's family.";

export type CohortCheckin = { day: 30 | 90 | 180; inputs: FrariInputs; score: number };
export type CohortPerson = { id: string; program: string; enrolledDaysAgo: number; checkins: CohortCheckin[]; stageNow: Lifecycle; intakeNow: number; name?: string; registryId?: string; flagged?: boolean };

function rng(seed: number) { let x = seed >>> 0; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
const STAGES: Lifecycle[] = ["registered", "data_collecting", "under_review", "evaluated", "certified"];
const ck = (day: 30 | 90 | 180, inputs: FrariInputs): CohortCheckin => ({ day, inputs, score: frariScore(inputs).composite });
const ago = (iso: string) => Math.round((TODAY - Date.parse(iso)) / 864e5);

// Riverside's named participants (the people on every screen), with their real check-in history.
const NAMED_HISTORY: Record<string, CohortCheckin[]> = {
  "ptc-demo-0001": [ck(30, { evidenceEvents90d: 3, stage: "data_collecting", intakeFilled: 7, consent: "pending" }), ck(90, { evidenceEvents90d: 6, stage: "under_review", intakeFilled: 10, consent: "pending" })],
  "ptc-demo-0004": [ck(30, { evidenceEvents90d: 9, stage: "evaluated", intakeFilled: 12, consent: "granted" })],
  "ptc-demo-0007": [ck(30, { evidenceEvents90d: 4, stage: "data_collecting", intakeFilled: 9, consent: "granted" }), ck(90, { evidenceEvents90d: 8, stage: "evaluated", intakeFilled: 12, consent: "granted" })],
};
const OTHER_NAMES = ["Priya Shah", "Marcus Bell", "Hannah Cole", "Luis Romero", "Grace Kim", "Owen Fisher", "Talia Reed", "Ben Carter"];

export const DEMO_COHORT: CohortPerson[] = (() => {
  const r = rng(20261024);
  const out: CohortPerson[] = [];
  let n = 1;
  const gen = (program: string, maxDays: number, slow: boolean, name?: string, minDays = 12, fast = false, fixedDays?: number): CohortPerson => {
    const drawn = Math.floor(minDays + r() * (maxDays - minDays));
    const enrolledDaysAgo = fixedDays ?? drawn;
    const pace = (fast ? 0.9 : 0.55) + r() * (slow ? 0.55 : 0.8);
    const stall = r() < 0.2;
    const checkins: CohortCheckin[] = [];
    for (const day of [30, 90, 180] as const) {
      if (enrolledDaysAgo < day) break;
      const t = day / 180;
      const quiet = stall && day > 30;
      const stageIdx = Math.min(4, Math.floor(t * 4.4 * (quiet ? 0.6 : pace) + r() * 0.9));
      checkins.push(ck(day, {
        evidenceEvents90d: quiet ? Math.round(r() * 2) : Math.min(10, Math.round((1.5 + t * 7) * pace + r() * 2)),
        stage: STAGES[stageIdx],
        intakeFilled: Math.min(12, Math.round(5 + t * 11 * (quiet ? 0.5 : pace) + r() * 2)),
        consent: r() < 0.12 && day === 30 ? "pending" : "granted",
      }));
    }
    const last = checkins.at(-1)?.inputs;
    const stageNow: Lifecycle = last ? last.stage : enrolledDaysAgo > 14 ? "data_collecting" : "registered";
    return { id: `cohort-${String(n++).padStart(3, "0")}`, program, enrolledDaysAgo, checkins, stageNow, intakeNow: last?.intakeFilled ?? 4, name, flagged: stall && enrolledDaysAgo > 90 };
  };
  for (const p of DEMO_PILOTS) {
    const maxDays = ago(p.start + "T16:00:00Z");
    if (p.name === DEMO_ORG.name) {
      for (const c of DEMO_CASES) {
        const fr = DEMO_FRARI[c.id];
        out.push({ id: c.id, program: p.name, enrolledDaysAgo: ago(c.created_at), checkins: NAMED_HISTORY[c.id] ?? [], stageNow: c.status as Lifecycle, intakeNow: fr.intakeFilled, name: `${c.first_name} ${c.last_name}`, registryId: c.registry_id, flagged: c.id === "ptc-demo-0003" });
      }
      // Riverside enrolled most people in its first three months; the first three on launch day, so they reach day 180 today.
      OTHER_NAMES.forEach((nm, k) => out.push(gen(p.name, maxDays, false, nm, 95, true, k < 3 ? maxDays : undefined)));
    } else {
      for (let k = 0; k < p.size; k++) out.push(gen(p.name, maxDays, false));
    }
  }
  for (let k = 0; k < 10; k++) out.push(gen(SELF_ENROLLED, 285, true));
  return out;
})();

/** Checkpoint targets from the pilot terms v3 (proposals). */
export const PILOT_TARGETS = {
  30: { enrolled: 5, complete: 3, reviews: 1, evaluators: 0 },
  90: { enrolled: 15, complete: 10, reviews: 5, evaluators: 2 },
  180: { enrolled: 20, complete: 15, reviews: 10, evaluators: 2 },
} as const;

// ── Sample organization record (OBR organizational v1.0.0) ──
export const DEMO_OBR_PASSED = new Set<string>([
  "leadership_documented", "board_documented", "authorization_granted",
  "staff_count_documented", "training_documented", "behavioral_policy_present",
  "policies_active", "audit_present", "compliance_documented",
  "budget_documented", "funding_documented",
]);

// ── Fixed "today" for the demo so dates and countdowns never drift ──
export const DEMO_TODAY = "Oct 24, 2026";

// ── Maya's follow-up check-ins (PROPOSED question set, follow-up-system-v1.md) ──
// Enrolled Jul 21, 2026 (day 0). Day 30 Aug 20 · Day 90 Oct 19 · Day 180 due Jan 17, 2027.
export type PersonCheckIn = { day: 0 | 30 | 90 | 180; date: string; onTime: boolean | null; score: number | null; answers: FollowUpAnswers | null };
export const DEMO_PERSON_CHECKINS: PersonCheckIn[] = [
  { day: 0, date: "Jul 21, 2026", onTime: true, score: frariScore({ evidenceEvents90d: 1, stage: "registered", intakeFilled: 4, consent: "pending" }).composite,
    answers: { housing: "With family, not paying", housingMonths: 2, moves: 0, behindRent: false, working: false, hoursLastWeek: 0, weeksWorked4: 0, jobChange: "none", incomeRange: "Under $500", incomeTrend: "same", bank: false, billsOnTime: "some" } },
  { day: 30, date: "Aug 24, 2026", onTime: false, score: frariScore({ evidenceEvents90d: 3, stage: "data_collecting", intakeFilled: 7, consent: "pending" }).composite,
    answers: { housing: "With family, paying part", housingMonths: 3, moves: 0, behindRent: false, working: true, hoursLastWeek: 16, weeksWorked4: 2, jobChange: "started", incomeRange: "$500–999", incomeTrend: "more", bank: false, billsOnTime: "most" } },
  { day: 90, date: "Oct 19, 2026", onTime: true, score: frariScore({ evidenceEvents90d: 6, stage: "under_review", intakeFilled: 10, consent: "pending" }).composite,
    answers: { housing: "Own place, renting", housingMonths: 1, moves: 1, behindRent: false, working: true, hoursLastWeek: 24, weeksWorked4: 4, jobChange: "none", incomeRange: "$2,000–2,999", incomeTrend: "more", bank: false, billsOnTime: "all" } },
  { day: 180, date: "Jan 17, 2027", onTime: null, score: null, answers: null },
];
export const DEMO_PERSON_ENGAGEMENT = { signIns: 9, uploads: 6, checkInsOnTime: "2 of 3", lateNote: "Day 30 was 4 days late.", coaching: 7, responseDays: 1.5 };
export const DEMO_PERSON_REVIEW = { last: "Oct 19, 2026 (day 90)", next: "Jan 17, 2027 (day 180)", status: "Current", spot: "Not picked this quarter (Oct–Dec 2026). About 1 in 10 records are.", triggers: "Score rose 21 points since day 30 (over the 15-point line), so the day 90 re-review added a second evaluator's check of all 6 uploads. Confirmed, no issues." };
export const DEMO_COACH = { name: "D. Ellis (demo coach)", lastTouch: "Oct 21, 2026 (call, 25 min)", next: "Oct 28, 2026" };
/** Continuous coaching: each step is tied to a gap in Maya's record. */
export const DEMO_COACHING = [
  { gap: "Consent is pending", step: "Review and sign the data consent form together at the Oct 28 call.", effect: "Consent part goes from 40 to 100 (about +12 points)", due: "Oct 28" },
  { gap: "Address not on file", step: "Add the address from the Sep 15 lease to your record.", effect: "One more intake field (about +2 points)", due: "Nov 4" },
  { gap: "No bank statement", step: "Open the credit union account you asked about; upload the first statement.", effect: "One more intake field (about +2 points) and Financial evidence", due: "Nov 30" },
  { gap: "Housing not yet counted as stable (moved Sep 15)", step: "Stay current on rent. By day 180 you'll have been there 4 months, which counts as stable.", effect: "Housing outcome, not the score", due: "Jan 17" },
  { gap: "Working 24 hours a week", step: "Ask your manager about 30 hours; log your schedule each week.", effect: "Work outcome and Employment evidence", due: "Ongoing" },
];

// ── Cohort follow-up answers and engagement (separate seed so existing score numbers don't change) ──
export type CohortFollowUp = { answers: FollowUpAnswers; onTime: boolean; signIns: number; uploads: number; coaching: number; responseDays: number; reReviewed: boolean; reReviewChanged: boolean; triggered: boolean; spotCheck: boolean };
/** 1-in-10 spot check: a fixed hash of the person and period (mirrors the engine's rule). */
export function spotCheck(id: string, day: number): boolean { let h = 2166136261; for (const ch of `${id}|${day}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h % 10 === 0; }
export const DEMO_COHORT_FOLLOWUP: Record<string, Partial<Record<30 | 90 | 180, CohortFollowUp>>> = (() => {
  const r = rng(20261025);
  const out: Record<string, Partial<Record<30 | 90 | 180, CohortFollowUp>>> = {};
  const HOUSING = ["Own place, renting", "With family, paying part", "With family, not paying", "Shelter or transitional", "Own place, renting"];
  const INCOME = ["Under $500", "$500–999", "$1,000–1,499", "$1,500–1,999", "$2,000–2,999", "$3,000 or more"];
  for (const p of DEMO_COHORT) {
    out[p.id] = {};
    p.checkins.forEach((c, i) => {
      const q = Math.min(1, c.score / 85);            // engagement tracks score
      const working = r() < 0.35 + q * 0.6;
      const hours = working ? Math.round(12 + q * 22 + r() * 10) : 0;
      const hi = Math.min(4, Math.floor(q * 3.2 + r() * 1.6));
      const prev = i > 0 ? p.checkins[i - 1].score : c.score - 8;
      const answers: FollowUpAnswers = {
        housing: HOUSING[[3, 2, 1, 0, 4][hi]], housingMonths: Math.round(1 + r() * 8 * q + c.day / 40), moves: r() < 0.25 ? 1 : 0, behindRent: r() > 0.55 + q * 0.4,
        working, hoursLastWeek: hours, weeksWorked4: working ? Math.min(4, 2 + Math.round(r() * 2 + q)) : 0,
        jobChange: !working ? (r() < 0.25 ? "lost" : "none") : r() < 0.25 ? "started" : r() < 0.08 ? "changed" : "none",
        incomeRange: INCOME[Math.min(5, Math.floor(q * 4.5 + r() * 1.5))], incomeTrend: c.score > prev + 3 ? "more" : c.score < prev - 3 ? "less" : "same",
        bank: r() < 0.3 + q * 0.6, billsOnTime: q > 0.7 ? (r() < 0.7 ? "all" : "most") : q > 0.45 ? (r() < 0.5 ? "most" : "some") : "some",
      };
      const triggered = c.score - prev >= 15;
      const mine = p.id === DEMO_PERSON.participantId ? DEMO_PERSON_CHECKINS.find((x) => x.day === c.day) : undefined;
      if (mine?.answers) {
        out[p.id][c.day] = { answers: mine.answers, onTime: !!mine.onTime, signIns: DEMO_PERSON_ENGAGEMENT.signIns, uploads: c.inputs.evidenceEvents90d, coaching: 3, responseDays: DEMO_PERSON_ENGAGEMENT.responseDays, reReviewed: true, reReviewChanged: false, triggered, spotCheck: false };
        return;
      }
      out[p.id][c.day] = { answers, onTime: r() < 0.6 + q * 0.35, signIns: Math.round(2 + q * 12 + r() * 3), uploads: c.inputs.evidenceEvents90d, coaching: Math.round(1 + r() * 3 + q * 2), responseDays: Math.round((1 + (1 - q) * 5 + r()) * 10) / 10, reReviewed: true, reReviewChanged: r() < 0.18, triggered, spotCheck: spotCheck(p.id, c.day) };
    });
  }
  return out;
})();
export { stableHousing, steadyMoney, workingSteadily };

// ── Organization rating lifecycle: 1-year rating, annual recertification ──
export const DEMO_ORG_RENEWAL = { expiresOn: "Oct 16, 2027", renewalOpens: "Aug 17, 2027", previous: "First rating" };
/** Oversight log: append-only. Overseers flag, pause or send back with a reason; they cannot change a score. */
export const DEMO_OBR_OVERSIGHT = [
  { at: "Oct 9, 2026 · 2:10 PM MT", who: "M. Chen (demo overseer)", action: "Sent back", reason: "Board roster upload is unsigned. Please upload the signed roster from the Sep board meeting." },
  { at: "Oct 12, 2026 · 10:42 AM MT", who: "Riverside staff (demo)", action: "Evidence added", reason: "Signed board roster uploaded." },
  { at: "Oct 14, 2026 · 4:05 PM MT", who: "J. Okafor (demo evaluator)", action: "Evidence verified", reason: "11 of 16 items verified against the documents on file. Not on file: succession plan, turnover rate, full documentation, reserves, financial audit." },
  { at: "Oct 15, 2026 · 9:30 AM MT", who: "M. Chen (demo overseer)", action: "Flagged", reason: "Audit letter covers FY2024. Confirm no newer audit exists before the rating is issued." },
  { at: "Oct 16, 2026 · 11:55 AM MT", who: "M. Chen (demo overseer)", action: "Note", reason: "Confirmed FY2024 audit is the most recent completed. Flag cleared." },
  { at: "Oct 16, 2026 · 12:00 PM MT", who: "System (rules)", action: "Score computed", reason: "OBR organizational v1.0.0 computed 70 (Green) from the verified evidence. Valid until Oct 16, 2027." },
];

// ── Evaluator credentials: certification lasts 1 year ──
export const DEMO_EVALUATORS = [
  { name: "J. Okafor (demo)", role: "Certified Evaluator", certified: "Nov 3, 2025", expires: "Nov 3, 2026", status: "Renewal due in 10 days", renewing: true },
  { name: "M. Chen (demo)", role: "Senior Evaluator", certified: "Mar 2, 2026", expires: "Mar 2, 2027", status: "Current", renewing: false },
  { name: "A. Ruiz (demo)", role: "Certified Evaluator", certified: "Sep 18, 2025", expires: "Sep 18, 2026", status: "Lapsed: can't sign off until recertified", renewing: false },
];

/** Riverside's Program Desk: the same people the funder view counts. */
export const DEMO_DESK_PEOPLE = DEMO_COHORT.filter((p) => p.program === DEMO_ORG.name).map((p, i) => {
  const [first, ...rest] = (p.name ?? "Sample Person").split(" ");
  return { id: p.id, subject_number: 101 + i, first_name: first, last_name: rest.join(" "), status: p.stageNow as string, created_at: daysBefore(p.enrolledDaysAgo), flagged: !!p.flagged };
});

/** Sample records anyone can look up on the demo verify page. */
export const DEMO_VERIFY: Record<string, { registry_id: string; readiness_state: string; status: string; last_updated_at: string; standing: string; score?: number; ruleset_version: string; output_hash_short: string; as_of: string }> = {
  "BRSA-26-7F3A0410": { registry_id: "BRSA-26-7F3A0410", readiness_state: "GREEN", status: "certified", last_updated_at: "2026-09-30T20:00:00Z", standing: "certified", score: 100, ruleset_version: "frari-individual-v1.0.0", output_hash_short: "b82f11c0", as_of: "2026-09-30T20:00:00Z" },
  "BRSA-26-7F3A0417": { registry_id: "BRSA-26-7F3A0417", readiness_state: "YELLOW", status: "under_review", last_updated_at: "2026-10-19T19:20:00Z", standing: "yellow", score: 59, ruleset_version: "frari-individual-v1.0.0", output_hash_short: "7f3a9c1e", as_of: "2026-10-19T19:20:00Z" },
  "BRSA-26-7F3A0420": { registry_id: "BRSA-26-7F3A0420", readiness_state: "GREEN", status: "evaluated", last_updated_at: "2026-10-21T17:00:00Z", standing: "green", score: 91, ruleset_version: "frari-individual-v1.0.0", output_hash_short: "c41d0b77", as_of: "2026-10-21T17:00:00Z" },
};
