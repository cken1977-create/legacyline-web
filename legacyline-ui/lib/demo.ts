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
  { id: "ptc-demo-0001", registry_id: "BRSA-26-7F3A0417", first_name: "Maya", last_name: "Rivera", status: "under_review", created_at: "2026-07-21T16:00:00Z", program: "Vizionz Sankofa (demo)" },
  { id: "ptc-demo-0002", registry_id: "BRSA-26-7F3A0418", first_name: "Devon", last_name: "Park", status: "under_review", created_at: "2026-10-03T16:00:00Z", program: "Vizionz Sankofa (demo)" },
  { id: "ptc-demo-0003", registry_id: "BRSA-26-7F3A0419", first_name: "Alana", last_name: "Brooks", status: "data_collecting", created_at: "2026-10-05T16:00:00Z", program: "Self-enrolled" },
  { id: "ptc-demo-0006", registry_id: "BRSA-26-7F3A0422", first_name: "Theo", last_name: "Grant", status: "data_collecting", created_at: "2026-10-01T16:00:00Z", program: "Self-enrolled" },
  { id: "ptc-demo-0004", registry_id: "BRSA-26-7F3A0420", first_name: "Samuel", last_name: "Ortiz", status: "evaluated", created_at: "2026-09-21T16:00:00Z", program: "Vizionz Sankofa (demo)" },
  { id: "ptc-demo-0005", registry_id: "BRSA-26-7F3A0421", first_name: "Rosa", last_name: "Nguyen", status: "registered", created_at: "2026-10-08T16:00:00Z", program: "Self-enrolled" },
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
};

// ── Sample cohort for the funder view: 180-day program, check-ins at day 30, 90, 180 ──
// Fully fictional and generated from a fixed seed, so every visit shows the same numbers.
/** The one fictional partner organization used on every demo screen. */
export const DEMO_ORG = { name: "Riverside Community Partners (demo)", slug: "demo", ratedOn: "Oct 16, 2026", ratedAt: "2026-10-16T18:00:00Z" } as const;
export const DEMO_PROGRAMS = ["Vizionz Sankofa (demo)", DEMO_ORG.name, "Self-enrolled"] as const;
export type CohortPerson = { id: string; program: string; enrolledDaysAgo: number; checkins: { day: 30 | 90 | 180; inputs: FrariInputs; score: number }[] };

function rng(seed: number) { let x = seed >>> 0; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
const STAGES: Lifecycle[] = ["registered", "data_collecting", "under_review", "evaluated", "certified"];

export const DEMO_COHORT: CohortPerson[] = (() => {
  const r = rng(20261024);
  const sizes = [18, 12, 10];
  const out: CohortPerson[] = [];
  let n = 1;
  DEMO_PROGRAMS.forEach((program, pi) => {
    for (let k = 0; k < sizes[pi]; k++) {
      const enrolledDaysAgo = Math.floor(60 + r() * 200); // 60–260 days in
      const pace = 0.55 + r() * (pi === 2 ? 0.55 : 0.8);   // self-enrolled move slower
      const stall = r() < 0.2;                              // some people go quiet after day 30
      const checkins: CohortPerson["checkins"] = [];
      for (const day of [30, 90, 180] as const) {
        if (enrolledDaysAgo < day) break;
        const t = day / 180;
        const quiet = stall && day > 30;
        const stageIdx = Math.min(4, Math.floor(t * 3.7 * (quiet ? 0.6 : pace) + r() * 0.9));
        const inputs: FrariInputs = {
          evidenceEvents90d: quiet ? Math.round(r() * 2) : Math.min(10, Math.round((1.5 + t * 7) * pace + r() * 2)),
          stage: STAGES[stageIdx],
          intakeFilled: Math.min(12, Math.round(5 + t * 6 * (quiet ? 0.5 : pace) + r() * 2)),
          consent: r() < 0.12 && day === 30 ? "pending" : "granted",
        };
        checkins.push({ day, inputs, score: frariScore(inputs).composite });
      }
      out.push({ id: `cohort-${String(n++).padStart(3, "0")}`, program, enrolledDaysAgo, checkins });
    }
  });
  return out;
})();

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
export const DEMO_PERSON_REVIEW = { last: "Oct 19, 2026 (day 90)", next: "Jan 17, 2027 (day 180)", status: "Current", triggers: "Score rose 21 points since day 30 (over the 15-point line), so the day 90 re-review added a second evaluator's check of all 6 uploads. Confirmed, no issues." };
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
export type CohortFollowUp = { answers: FollowUpAnswers; onTime: boolean; signIns: number; uploads: number; coaching: number; responseDays: number; reReviewed: boolean; reReviewChanged: boolean; triggered: boolean };
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
      const triggered = c.score - prev >= 15 && r() < 0.6;
      out[p.id][c.day] = { answers, onTime: r() < 0.6 + q * 0.35, signIns: Math.round(2 + q * 12 + r() * 3), uploads: c.inputs.evidenceEvents90d, coaching: Math.round(1 + r() * 3 + q * 2), responseDays: Math.round((1 + (1 - q) * 5 + r()) * 10) / 10, reReviewed: true, reReviewChanged: r() < 0.18, triggered };
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
