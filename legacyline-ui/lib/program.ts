// The written Kamili program, in one place. Every rule, weight, threshold and
// definition below is copied from Clarence's written program, with its source.
// Only people, organizations and numbers in the demo are sample data.
//
// Sources (see kamili-demo/kamili-real-program-map-v1.md for the full map):
//  [SF]  brsaregistry.com scoring-formula.html  (BRSA-SF-001, FRARI v1.0.0, published 2026-04-25)
//  [RS]  brsaregistry.com canonical-rulesets.html (BRSA-RS-001, published 2026-04-25)
//  [MSD] Drive: BRSA Master Standards Doctrine v1.0 (Feb 2026)
//  [SG]  Drive: BRSA Evaluator Study Guide (8 modules, 80 questions, 12 evidence domains, protocol index)
//  [PLT] Drive: BRSA Platform.pdf (Apr 2026), evaluator certification stages
//  [M046] legacyline-core migrations/046 frari_organization_v1 (rule points per organization area)

// ── The standard ───────────────────────────────────────────────────────────
export const STANDARD = {
  definition: "The observable, documented demonstration of behavioral stability, continuity, and protocol-aligned conduct over time.",
  notList: ["not inferred", "not predicted", "not assumed"],
  principles: [
    { name: "Observability", text: "Readiness must be based on observable behavior." },
    { name: "Documentation", text: "All readiness evidence must be documented." },
    { name: "Neutrality", text: "Measurement must remain neutral and free of interpretation." },
    { name: "Reproducibility", text: "Independent evaluators must reach the same classification using the same evidence." },
    { name: "Longitudinal continuity", text: "Readiness must be measured across time, not based on isolated events." },
  ],
  financial: "Financial readiness is documented behavior. It is not credit scoring and not predictive modeling.",
  source: "BRSA Master Standards Doctrine v1.0, Sections I, II, IX",
};

// ── Person score: FRARI v1.0.0 ─────────────────────────────────────────────
export const FRARI_INDIVIDUAL = {
  id: "frari-individual-v1.0.0",
  label: "FRARI v1.0.0",
  formula: "score = evidence × 0.30 + lifecycle × 0.25 + intake × 0.25 + consent × 0.20, rounded to the nearest whole number",
  source: "BRSA-SF-001 Scoring Formula and BRSA-RS-001 Canonical Rulesets (brsaregistry.com)",
};

export type FrariComponentKey = "evidence" | "lifecycle" | "intake" | "consent";
export const FRARI_COMPONENTS: { key: FrariComponentKey; label: string; weight: number; plain: string; rule: string }[] = [
  { key: "evidence", label: "Evidence engagement", weight: 0.30, plain: "How much documented evidence came in over the last 90 days.", rule: "Evidence events in the last 90 days, up to 10. Each one is worth 10 points. Older events don't count." },
  { key: "lifecycle", label: "Lifecycle progression", weight: 0.25, plain: "How far the record has moved through review.", rule: "Started 0 · Gathering 25 · In review 50 · Reviewed 75 · Certified 100. Revoked is 0." },
  { key: "intake", label: "Intake completeness", weight: 0.25, plain: "How much of the 12-field intake is filled in.", rule: "Fields filled out of 12, as a share of 100." },
  { key: "consent", label: "Consent compliance", weight: 0.20, plain: "Whether the person has said yes to the review.", rule: "Granted 100 · Pending 40 · Revoked or none 0." },
];

/** The 12 required intake fields, as published in BRSA-SF-001 §04. */
export const INTAKE_FIELDS = [
  "First name", "Last name", "Date of birth", "Email", "Phone", "Address",
  "Housing type", "Work status", "Monthly income", "Monthly housing cost", "Government ID uploaded", "Bank statement uploaded",
];

export const LIFECYCLE = ["registered", "data_collecting", "under_review", "evaluated", "certified"] as const;
export type Lifecycle = (typeof LIFECYCLE)[number] | "revoked";
export const LIFECYCLE_LABEL: Record<string, string> = { registered: "Started", data_collecting: "Gathering evidence", under_review: "In review", evaluated: "Reviewed", certified: "Certified", revoked: "Revoked" };

export type FrariInputs = { evidenceEvents90d: number; stage: Lifecycle; intakeFilled: number; consent: "granted" | "pending" | "revoked" | "none" };
export type FrariResult = { composite: number; parts: Record<FrariComponentKey, number> };

/**
 * FRARI v1.0.0 exactly as published. One reading call-out: the published
 * normalization line says "stage_index ÷ 5" while both pages also say
 * "Certified = 100"; with five stages (0–4) only ÷ 4 gives Certified = 100,
 * so this follows "Certified = 100". Flagged for Clarence in the program map.
 */
export function frariScore(i: FrariInputs): FrariResult {
  const evidence = (Math.min(Math.max(i.evidenceEvents90d, 0), 10) / 10) * 100;
  const idx = i.stage === "revoked" ? 0 : LIFECYCLE.indexOf(i.stage);
  const lifecycle = i.stage === "revoked" ? 0 : (Math.max(idx, 0) / 4) * 100;
  const intake = (Math.min(Math.max(i.intakeFilled, 0), 12) / 12) * 100;
  const consent = i.consent === "granted" ? 100 : i.consent === "pending" ? 40 : 0;
  const composite = Math.round(evidence * 0.3 + lifecycle * 0.25 + intake * 0.25 + consent * 0.2);
  return { composite, parts: { evidence: Math.round(evidence), lifecycle: Math.round(lifecycle), intake: Math.round(intake), consent } };
}

/** Score change between check-ins: the same ±3 rule the live engine uses (core readiness.go). */
export function trajectory(prev: number, now: number) { return now - prev > 3 ? "improving" : now - prev < -3 ? "declining" : "stable"; }

// ── Bands (same thresholds for people and organizations) ───────────────────
export const PUBLISHED_BANDS = [
  { key: "green", label: "Green", min: 70, max: 100, meaning: "Sufficient evidence of behavioral discipline, documentation integrity, and consistent pattern compliance." },
  { key: "yellow", label: "Yellow", min: 40, max: 69, meaning: "Evidence collection underway. Readiness trajectory is being established. Active engagement with the assessment process." },
  { key: "red", label: "Red", min: 0, max: 39, meaning: "Insufficient evidence or assessment not yet completed. Default state at registration." },
] as const;
export const BANDS_SOURCE = "BRSA-RS-001 (Green 70 and above, Yellow 40–69); band meanings from the brsaregistry.com readiness-state cards";

// ── The behavioral readiness instrument: 12 evidence domains ───────────────
export const EVIDENCE_DOMAINS = [
  { n: 1, name: "Identity Verification", types: "Government ID, legal name consistency, identity documentation" },
  { n: 2, name: "Contact Stability", types: "Address stability, contact information consistency" },
  { n: 3, name: "Housing Stability", types: "Lease documentation, housing history, residential consistency" },
  { n: 4, name: "Employment & Economic Activity", types: "Employment status, income activity, economic participation" },
  { n: 5, name: "Program Engagement", types: "Enrollment, attendance, participation in assigned programs" },
  { n: 6, name: "Compliance Behavior", types: "Adherence to program requirements, rule compliance" },
  { n: 7, name: "Behavioral Reliability", types: "Consistent attendance over time, behavioral follow-through" },
  { n: 8, name: "Social Stability", types: "Pro-social behavior, conflict resolution, mentorship seeking" },
  { n: 9, name: "Health & Wellbeing", types: "Health management, wellness behaviors, self-care activity" },
  { n: 10, name: "Skill Development", types: "Training enrollment, skill-building activity, educational participation" },
  { n: 11, name: "Self-Regulation", types: "Emotional management, impulse control, response to corrective feedback" },
  { n: 12, name: "Forward Readiness Signals", types: "Goal-setting, long-term thinking, demonstrated readiness for independence" },
];
export const EVIDENCE_DOMAINS_SOURCE = "BRSA Evaluator Study Guide, Module 6 and Quick Reference: 12 Evidence Domains";

// ── Evaluator rubric: protocol index + recording rules ─────────────────────
export const PROTOCOLS = [
  { ref: "BRSA-EV-PR-001", text: "Prepare before beginning an evaluation" },
  { ref: "BRSA-EV-PR-002", text: "Stay neutral during the evaluation" },
  { ref: "BRSA-EV-PR-003", text: "Follow the observation techniques and protocol sequence" },
  { ref: "BRSA-EV-PR-004", text: "Document observable behavior; score consistently" },
  { ref: "BRSA-EV-PR-005", text: "Submit the evaluation record" },
  { ref: "BRSA-EV-PR-006", text: "Record the timing and sequence of behavior" },
  { ref: "BRSA-EV-PR-007", text: "Complete every required field before submission" },
  { ref: "BRSA-EV-PR-008", text: "Preserve the chain of record; never alter after submission" },
  { ref: "BRSA-EV-PR-009", text: "Be authorized before beginning" },
  { ref: "BRSA-EV-PR-010", text: "Verify documentation before submission" },
  { ref: "BRSA-EV-PR-011", text: "No interpretation or assumptions in documentation" },
  { ref: "BRSA-EV-PR-012", text: "Report suspected integrity violations" },
];
export const EVENT_STEPS = ["Select the participant and confirm identity", "Select the correct evidence domain", "Record the evidence event: observable behavior only", "Verify before submission. Once submitted, the record cannot be altered"];
export const RECORDING_EXAMPLES = {
  write: ["Subject paused for four seconds before responding", "Attended 4 of 4 scheduled sessions in September", "Lease dated Aug 1 shows the same address as the ID"],
  never: ["Subject appeared nervous", "Subject appeared confused", "Participant is doing well"],
};
export const RUBRIC_SOURCE = "BRSA Evaluator Study Guide: Protocol Index, Modules 1, 2, 6, 7 and answer key Q3, Q13";

// ── Evaluator certification ────────────────────────────────────────────────
export const CERT_STAGES = [
  { name: "Doctrine training", text: "Study all 8 BRSA doctrine modules." },
  { name: "Knowledge assessment", text: "80-question exam, 10 per module. Pass with 80% (64 of 80) and at least 8 of 10 in each module." },
  { name: "Supervised practicum", text: "Evaluations under a certified Senior Evaluator before working alone." },
  { name: "Annual recertification", text: "Certification lasts one year. Evaluators recertify every year (and whenever the standard changes). Lapsed evaluators can't sign off reviews." },
];
export const CERT_SOURCE = "BRSA Platform (Apr 2026), Evaluator Study Guide passing standard, Evaluator Certification Doctrine Art. VII";

// ── Organization score: OBR organizational v1.0.0 ──────────────────────────
export type ObrAreaKey = "leadership" | "staff" | "policy" | "financial";
export const OBR = {
  id: "obr-organizational-v1.0.0",
  label: "OBR organizational v1.0.0",
  formula: "score = leadership × 0.30 + staff × 0.25 + policy × 0.25 + financial × 0.20",
  source: "BRSA-RS-001 (weights and area definitions); area points from frari_organization_v1 rules (legacyline-core migration 046)",
};
export const OBR_AREAS: { key: ObrAreaKey; label: string; weight: number; meaning: string; rules: { id: string; label: string; points: number }[] }[] = [
  { key: "leadership", label: "Leadership & governance", weight: 0.30, meaning: "Leadership, board structure, governance documents and decision-making accountability.", rules: [
    { id: "leadership_documented", label: "Leadership composition documented", points: 30 },
    { id: "board_documented", label: "Board structure documented", points: 25 },
    { id: "succession_present", label: "Succession plan documented", points: 25 },
    { id: "authorization_granted", label: "Authorization to assess is active", points: 20 } ] },
  { key: "staff", label: "Staff behavioral readiness", weight: 0.25, meaning: "Training completion, service delivery consistency, documentation discipline and professional conduct records.", rules: [
    { id: "staff_count_documented", label: "Staff count documented", points: 20 },
    { id: "turnover_documented", label: "Turnover rate documented and low", points: 25 },
    { id: "training_documented", label: "Training programs documented", points: 30 },
    { id: "behavioral_policy_present", label: "Behavioral policy documented", points: 25 } ] },
  { key: "policy", label: "Policy & compliance", weight: 0.25, meaning: "Written policies that are current and followed, compliance posture, incident and corrective-action records.", rules: [
    { id: "policies_active", label: "Active policies documented", points: 25 },
    { id: "audit_present", label: "Last audit date documented", points: 25 },
    { id: "compliance_documented", label: "Compliance history documented", points: 25 },
    { id: "documentation_status", label: "Documentation fully complete", points: 25 } ] },
  { key: "financial", label: "Financial health & sustainability", weight: 0.20, meaning: "Financial records, funding mix, reserves, and fiscal responsibility over the prior 12 months.", rules: [
    { id: "budget_documented", label: "Annual budget documented", points: 25 },
    { id: "funding_documented", label: "Funding sources documented", points: 25 },
    { id: "reserves_documented", label: "Financial reserves documented", points: 25 },
    { id: "audit_on_file", label: "Financial audit on file", points: 25 } ] },
];
export function obrScore(passed: Set<string>) {
  const areas = OBR_AREAS.map((a) => ({ ...a, score: a.rules.reduce((s, r) => s + (passed.has(r.id) ? r.points : 0), 0) }));
  const composite = Math.round(areas.reduce((s, a) => s + a.score * a.weight, 0));
  return { composite, areas };
}

// ── Annual renewal (Clarence, Oct 24 2026) ─────────────────────────────────
export const RENEWAL = {
  org: "An organization's rating lasts one year. Organizations recertify every year.",
  evaluator: "An evaluator's certification lasts one year. Evaluators recertify every year.",
  windowDays: 60, // renewal opens this many days before expiry (proposal)
};

// ── Organization score guardrail ───────────────────────────────────────────
export const OBR_GUARDRAIL = [
  "Evaluators enter and verify evidence. They don't score.",
  "Area scores are computed by the published organization rules from the verified evidence.",
  "A person oversees: they can flag, pause or send back a rating, always with a written reason that is logged.",
  "No one can type in or override a computed score.",
];

// ── Follow-up system v1.0 (APPROVED Oct 24 2026, follow-up-system-v1.md; engine: core followup.go) ──
export const FOLLOW_UP_VERSION = "Follow-up system v1.0 (approved Oct 24, 2026)";
export const FOLLOW_UP_DAYS = [0, 30, 90, 180] as const;
export type FollowUpDay = (typeof FOLLOW_UP_DAYS)[number];
export const FOLLOW_UP_AREAS = [
  { key: "housing", label: "Housing", questions: ["Where are you staying right now?", "How long have you been at this place?", "How many times have you moved since the last check-in?", "Are you behind on rent or housing costs?", "Do you expect to still be here at the next check-in?"] },
  { key: "work", label: "Work", questions: ["Are you working right now?", "About how many hours did you work last week?", "How many weeks did you work in the last 4?", "Since the last check-in, did you start, leave or change a job?", "Is your schedule steady week to week?"] },
  { key: "money", label: "Income and money", questions: ["About how much came in last month, from all sources? (ranges)", "Compared with the last check-in, is that more, the same or less?", "Do you have a bank or credit union account?", "Did you pay your main bills on time last month?", "Do you have any money set aside for an emergency?"] },
] as const;
export type FollowUpAnswers = {
  housing: string; housingMonths: number; moves: number; behindRent: boolean;
  working: boolean; hoursLastWeek: number; weeksWorked4: number; jobChange: "none" | "started" | "left" | "lost" | "changed";
  incomeRange: string; incomeTrend: "more" | "same" | "less"; bank: boolean; billsOnTime: "all" | "most" | "some" | "none";
};
export const stableHousing = (a: FollowUpAnswers) => /own place|paying part/i.test(a.housing) && (a.housingMonths >= 3 || a.moves === 0) && !a.behindRent;
export const workingSteadily = (a: FollowUpAnswers) => a.working && a.weeksWorked4 >= 3 && a.hoursLastWeek >= 20;
export const steadyMoney = (a: FollowUpAnswers) => a.incomeTrend !== "less" && (a.billsOnTime === "all" || a.billsOnTime === "most");

export const ENGAGEMENT_SIGNALS = [
  { key: "signIns", label: "Sign-ins", unit: "days this month" },
  { key: "uploads", label: "Evidence uploads", unit: "in the last 90 days" },
  { key: "checkIns", label: "Check-ins done on time", unit: "" },
  { key: "coaching", label: "Coaching touches", unit: "since enrolling" },
  { key: "responseDays", label: "Median response time", unit: "days" },
] as const;

export const RE_REVIEW_RULES = [
  "Re-reviews are scheduled at days 30, 90 and 180, then every 90 days after certification.",
  "An evaluator re-verifies the evidence; the rules recompute the score. Answers never change the score directly.",
  "A score past its re-review date shows as due. After 30 more days, a certified status is paused until the re-review is done.",
  "Evidence only counts for 90 days, so the score drops on its own if someone stops taking part.",
  "Early re-review if: score jumps 15+ points, 5+ uploads in 48 hours before a check-in, a document is reused, answers contradict the evidence, a check-in is 14+ days late, or consent changes.",
  "About 1 in 10 active records per organization is spot-checked each quarter, picked by a fixed formula so the choice can be audited.",
  "Income is asked as a range, never an exact amount.",
];
