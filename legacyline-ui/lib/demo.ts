// Fictional demo data for design review on preview deployments only.
// "Maya Rivera" etc. are invented. Never real clients.
import type { Run } from "./frari";
import { type FrariInputs, type Lifecycle, frariScore } from "./program";

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
  { id: "ptc-demo-0001", registry_id: "BRSA-26-7F3A0417", first_name: "Maya", last_name: "Rivera", status: "under_review", created_at: "2026-09-28T16:00:00Z", program: "Vizionz Sankofa (demo)" },
  { id: "ptc-demo-0002", registry_id: "BRSA-26-7F3A0418", first_name: "Devon", last_name: "Park", status: "under_review", created_at: "2026-10-03T16:00:00Z", program: "Vizionz Sankofa (demo)" },
  { id: "ptc-demo-0003", registry_id: "BRSA-26-7F3A0419", first_name: "Alana", last_name: "Brooks", status: "data_collecting", created_at: "2026-10-05T16:00:00Z", program: "Self-enrolled" },
  { id: "ptc-demo-0006", registry_id: "BRSA-26-7F3A0422", first_name: "Theo", last_name: "Grant", status: "data_collecting", created_at: "2026-10-01T16:00:00Z", program: "Self-enrolled" },
  { id: "ptc-demo-0004", registry_id: "BRSA-26-7F3A0420", first_name: "Samuel", last_name: "Ortiz", status: "evaluated", created_at: "2026-09-21T16:00:00Z", program: "Vizionz Sankofa (demo)" },
  { id: "ptc-demo-0005", registry_id: "BRSA-26-7F3A0421", first_name: "Rosa", last_name: "Nguyen", status: "registered", created_at: "2026-10-08T16:00:00Z", program: "Self-enrolled" },
];

export const DEMO_TIMELINE = [
  { from_status: "data_collecting", to_status: "under_review", created_at: "2026-10-06T17:12:00Z", actor: "program desk" },
  { from_status: "registered", to_status: "data_collecting", created_at: "2026-09-30T16:00:00Z", actor: "system" },
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
export const DEMO_PROGRAMS = ["Vizionz Sankofa (demo)", "Westside Reentry Partners (demo)", "Self-enrolled"] as const;
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
