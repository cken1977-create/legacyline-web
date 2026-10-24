// Phase 0: a static map of FRARI frari_individual_v1 rules (legacyline-core migration 046)
// to plain-language copy. Points are the ruleset's real points, never invented.
// Phase 1 replaces this with GET /frari/rulesets/active.

export const RULESET_LABEL = "FRARI individual v1";
export const RULESET_VERSION = "frari_individual_v1";

export type AreaKey = "identity" | "housing" | "work" | "income" | "consent";

export const AREAS: { key: AreaKey; label: string; ident: string }[] = [
  { key: "identity", label: "Identity", ident: "var(--d-slateblue)" },
  { key: "housing", label: "Housing", ident: "var(--d-adobe)" },
  { key: "work", label: "Work", ident: "var(--d-juniper)" },
  { key: "income", label: "Income", ident: "var(--d-ledger)" },
  { key: "consent", label: "Consent", ident: "var(--d-plum)" },
];

/** points per FRARI domain, exactly as published in frari_individual_v1 */
export const RULES: Record<string, { domains: Record<string, number> }> = {
  housing_type_present: { domains: { housing: 20 } },
  housing_cost_present: { domains: { housing: 20, financial: 15 } },
  address_present: { domains: { housing: 15 } },
  gov_id_verified: { domains: { housing: 25 } },
  gov_id_present: { domains: { behavioral: 20 } },
  consent_granted: { domains: { housing: 20, financial: 20, behavioral: 25 } },
  employment_present: { domains: { workforce: 25 } },
  employed: { domains: { workforce: 30 } },
  employer_documented: { domains: { workforce: 20 } },
  income_documented: { domains: { workforce: 25, financial: 30 } },
  bank_statement_present: { domains: { financial: 35 } },
  intake_complete: { domains: { behavioral: 30 } },
  selfie_present: { domains: { behavioral: 25 } },
};

/** Evidence slots a person can fill. `rules` = the FRARI rules the slot feeds. */
export type Slot = {
  key: string;
  area: AreaKey;
  label: string;
  ask: string;
  why: string;
  kind: "Document" | "Answer" | "Consent";
  action: string;
  rules: string[];
};

export const SLOTS: Slot[] = [
  { key: "gov_id", area: "identity", label: "Government ID", ask: "Add a photo of your government ID", why: "It confirms the record is really yours.", kind: "Document", action: "Upload", rules: ["gov_id_verified", "gov_id_present"] },
  { key: "selfie", area: "identity", label: "Selfie with your ID", ask: "Add a selfie holding your ID", why: "It links you to the ID on file.", kind: "Document", action: "Upload", rules: ["selfie_present"] },
  { key: "housing_type", area: "housing", label: "Housing type", ask: "Tell us where you live now", why: "Renting, owning or staying with family all count.", kind: "Answer", action: "Answer", rules: ["housing_type_present"] },
  { key: "monthly_housing_cost", area: "housing", label: "Monthly housing cost", ask: "Add your monthly housing cost", why: "Shows what you carry each month.", kind: "Answer", action: "Answer", rules: ["housing_cost_present"] },
  { key: "address", area: "housing", label: "Address", ask: "Add your current address", why: "Programs use it to confirm housing.", kind: "Answer", action: "Answer", rules: ["address_present"] },
  { key: "employment_status", area: "work", label: "Work status", ask: "Tell us about your work", why: "Any status counts, including looking for work.", kind: "Answer", action: "Answer", rules: ["employment_present", "employed"] },
  { key: "employer_name", area: "work", label: "Employer", ask: "Confirm your employer", why: "Reviewers match it against your pay records.", kind: "Answer", action: "Answer", rules: ["employer_documented"] },
  { key: "monthly_income", area: "income", label: "Monthly income", ask: "Add your monthly income", why: "An honest number is more useful than a big one.", kind: "Answer", action: "Answer", rules: ["income_documented"] },
  { key: "bank_statement", area: "income", label: "Bank statement", ask: "Add a recent bank statement", why: "Lenders look for steady deposits over time.", kind: "Document", action: "Upload", rules: ["bank_statement_present"] },
  { key: "consent", area: "consent", label: "Consent to review", ask: "Review and grant consent to share", why: "Nothing is shared with a reviewer until you say so.", kind: "Consent", action: "Review", rules: ["consent_granted"] },
];

export function rulePoints(rule: string) {
  const d = RULES[rule]?.domains ?? {};
  const total = Object.values(d).reduce((a, b) => a + b, 0);
  return { total, areas: Object.keys(d).length, domains: d };
}

export function slotPoints(slot: Slot) {
  return slot.rules.reduce((a, r) => a + rulePoints(r).total, 0);
}

export type DimensionScore = { domain: string; score: number; max_score: number; rules_passed: string[] | null; rules_failed: string[] | null };
export type Run = { id: string; ruleset_version: string; input_event_hash: string; output_hash: string; dimension_scores: DimensionScore[]; computed_at: string; triggered_by: string };

/** Mirrors core frari/dimensions.go: composite = Σscore·100 / Σmax (integer). */
export function compositeOf(run: Run | null): number | null {
  if (!run || !Array.isArray(run.dimension_scores) || run.dimension_scores.length === 0) return null;
  let s = 0, m = 0;
  for (const d of run.dimension_scores) { s += d.score; m += d.max_score; }
  return m > 0 ? Math.floor((s * 100) / m) : null;
}

export function ruleSets(run: Run | null) {
  const passed = new Set<string>(), failed = new Set<string>();
  for (const d of run?.dimension_scores ?? []) {
    (d.rules_passed ?? []).forEach((r) => passed.add(r));
    (d.rules_failed ?? []).forEach((r) => failed.add(r));
  }
  return { passed, failed };
}

export const RULE_LABEL: Record<string, string> = {
  housing_type_present: "Housing type documented",
  housing_cost_present: "Housing cost documented",
  address_present: "Address documented",
  gov_id_verified: "Government ID on file",
  gov_id_present: "Government ID submitted",
  consent_granted: "Consent granted",
  employment_present: "Work status documented",
  employed: "Currently employed",
  employer_documented: "Employer on file",
  income_documented: "Income documented",
  bank_statement_present: "Bank statement on file",
  intake_complete: "Intake completed",
  selfie_present: "Identity selfie submitted",
};

export const DOMAIN_LABEL: Record<string, string> = { housing: "Housing", workforce: "Work", financial: "Financial", behavioral: "Consistency" };

export function shortHash(h?: string | null) { return h ? h.replace(/^sha256:/, "").slice(0, 4) : "—"; }

export function fmtMT(iso?: string | null, withTime = false) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { timeZone: "America/Denver", month: "short", day: "numeric", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) }) + (withTime ? " MT" : "");
}
