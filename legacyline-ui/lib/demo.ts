// Fictional demo data for design review on preview deployments only.
// "Maya Rivera" etc. are invented. Never real clients.
import type { Run } from "./frari";

const at = "2026-10-09T19:20:00Z";
export const DEMO_RUN: Run = {
  id: "run_7f3a9c1e", ruleset_version: "frari_individual_v1", input_event_hash: "a91c44be20d1f7e3", output_hash: "7f3a9c1e5b02d4aa", computed_at: at, triggered_by: "evaluator",
  dimension_scores: [
    { domain: "housing", score: 60, max_score: 100, rules_passed: ["housing_type_present", "housing_cost_present", "gov_id_verified"], rules_failed: ["address_present", "consent_granted"] },
    { domain: "workforce", score: 80, max_score: 100, rules_passed: ["employment_present", "employed", "income_documented"], rules_failed: ["employer_documented"] },
    { domain: "financial", score: 45, max_score: 100, rules_passed: ["income_documented", "housing_cost_present"], rules_failed: ["bank_statement_present", "consent_granted"] },
    { domain: "behavioral", score: 75, max_score: 100, rules_passed: ["intake_complete", "selfie_present", "gov_id_present"], rules_failed: ["consent_granted"] },
  ],
};

export const DEMO_PERSON = {
  participantId: "ptc-demo-0001", firstName: "Maya", lastName: "Rivera", email: "maya.demo@example.com", registryId: "BRSA-IND-2026-00417", status: "under_review",
  intake: { employment_status: "employed_part_time", housing_type: "renting", monthly_income: "2400", monthly_housing_cost: "1100", employer_name: "", address: "", docs_uploaded: { gov_id: true, selfie: true, bank_statement: false } } as Record<string, any>,
  run: DEMO_RUN,
};

export const DEMO_CASES = [
  { id: "ptc-demo-0001", registry_id: "BRSA-IND-2026-00417", first_name: "Maya", last_name: "Rivera", status: "under_review", created_at: "2026-09-28T16:00:00Z", program: "Vizionz Sankofa (demo)" },
  { id: "ptc-demo-0002", registry_id: "BRSA-IND-2026-00418", first_name: "Devon", last_name: "Park", status: "under_review", created_at: "2026-10-03T16:00:00Z", program: "Vizionz Sankofa (demo)" },
  { id: "ptc-demo-0003", registry_id: "BRSA-IND-2026-00419", first_name: "Alana", last_name: "Brooks", status: "data_collecting", created_at: "2026-10-05T16:00:00Z", program: "Self-enrolled" },
  { id: "ptc-demo-0006", registry_id: "BRSA-IND-2026-00422", first_name: "Theo", last_name: "Grant", status: "data_collecting", created_at: "2026-10-01T16:00:00Z", program: "Self-enrolled" },
  { id: "ptc-demo-0004", registry_id: "BRSA-IND-2026-00420", first_name: "Samuel", last_name: "Ortiz", status: "evaluated", created_at: "2026-09-21T16:00:00Z", program: "Vizionz Sankofa (demo)" },
  { id: "ptc-demo-0005", registry_id: "BRSA-IND-2026-00421", first_name: "Rosa", last_name: "Nguyen", status: "registered", created_at: "2026-10-08T16:00:00Z", program: "Self-enrolled" },
];

export const DEMO_TIMELINE = [
  { from_status: "data_collecting", to_status: "under_review", created_at: "2026-10-06T17:12:00Z", actor: "program desk" },
  { from_status: "registered", to_status: "data_collecting", created_at: "2026-09-30T16:00:00Z", actor: "system" },
];
