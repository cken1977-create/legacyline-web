// GENERATED from Clarence's written program. Do not hand-edit.
// Sources: Drive "BRSA_Evaluator_Study_Guide" (module doctrine, protocol refs, key concepts,
// answer explanations) and legacyline-core migrations/058_evaluator_lockdown.up.sql (the live
// 80-question bank, which matches the study guide). One sample question per module only: the
// full bank is never shipped to the browser.

export type TrainingModule = { n: number; title: string; doctrine: string; protocols: string[]; concepts: string[]; sample: { q: string; options: string[]; correct: number; why: string } };

export const TRAINING_MODULES: TrainingModule[] = [
 {
  "n": 1,
  "title": "Behavioral Observation Fundamentals",
  "doctrine": "Behavior is recorded as action, not meaning. The evaluator's role is to observe and record — never to interpret, assume, or assign emotional meaning to what is witnessed.",
  "protocols": [
   "BRSA-EV-PR-001: Preparation before beginning an evaluation",
   "BRSA-EV-PR-002: Neutrality during evaluation",
   "BRSA-EV-PR-003: Observation techniques",
   "BRSA-EV-PR-004: Documentation of observable behavior"
  ],
  "concepts": [
   "The BRSA Evaluator's primary role is to observe behavior and record it exactly as it occurs",
   "Evaluators record action, not meaning — never interpret or assign emotional context",
   "Neutrality ensures consistency, audit integrity, and reliability of the BRSA standard",
   "Recording assumed emotions (e.g., 'appeared nervous') violates documentation standards",
   "Incomplete records compromise audit integrity",
   "The Evaluator Oath: Observe without bias, record without interpretation, uphold doctrine with neutrality and precision"
  ],
  "sample": {
   "q": "What is the primary role of a BRSA Evaluator?",
   "options": [
    "Interpret participant behavior and assign meaning",
    "Observe behavior and record it exactly as it occurs",
    "Score participants based on personal judgment",
    "Determine readiness outcomes independently"
   ],
   "correct": 1,
   "why": "The BRSA Evaluator observes and records only — never interprets or assigns meaning."
  }
 },
 {
  "n": 2,
  "title": "Documentation Protocol and Evidence Integrity",
  "doctrine": "Documentation is the permanent evaluation record. It reflects observable behavior only — never evaluator interpretation, participant self-reporting, or program outcomes.",
  "protocols": [
   "BRSA-EV-PR-005: Core documentation requirements",
   "BRSA-EV-PR-006: Recording timing and sequence",
   "BRSA-EV-PR-007: Documentation completeness before submission",
   "BRSA-EV-PR-008: Chain-of-record preservation after submission"
  ],
  "concepts": [
   "Documentation is the permanent evaluation record — not an administrative requirement",
   "Documentation reflects observable behavior only — never interpretation or self-reporting",
   "'Subject appeared confused' is an interpretation and violates doctrine",
   "Timing provides critical behavioral context and must be recorded",
   "All required fields must be complete before submission (BRSA-EV-PR-007)",
   "The chain-of-record ensures audit reliability after submission",
   "Post-submission alterations outside protocol violate BRSA-EV-PR-008"
  ],
  "sample": {
   "q": "What is the core doctrine of BRSA documentation?",
   "options": [
    "Documentation reflects evaluator interpretation",
    "Documentation reflects observable behavior only",
    "Documentation reflects participant self-reporting",
    "Documentation reflects program outcomes"
   ],
   "correct": 1,
   "why": "BRSA documentation doctrine: observable behavior only, never interpretation or self-report."
  }
 },
 {
  "n": 3,
  "title": "Protocol Compliance and Evaluation Submission",
  "doctrine": "Protocol is not guidance — it is requirement. Evaluators must follow the exact sequence of evaluation steps, obtain proper authorization, verify documentation, and submit in accordance with BRSA standards.",
  "protocols": [
   "BRSA-EV-PR-009: Evaluation authorization before beginning",
   "BRSA-EV-PR-010: Documentation verification before submission",
   "BRSA-EV-PR-003: Protocol sequence compliance",
   "BRSA-EV-PR-005: Submission of evaluation record"
  ],
  "concepts": [
   "Protocol compliance is mandatory — not discretionary or guidance-based",
   "Evaluations must be authorized before beginning (BRSA-EV-PR-009)",
   "Deviation from the protocol sequence introduces inconsistency and compromised reliability",
   "Documentation must be verified before submission to prevent permanent record errors",
   "Submission of the evaluation record is governed by BRSA-EV-PR-005",
   "Unauthorized evaluations violate BRSA-EV-PR-009 regardless of intent"
  ],
  "sample": {
   "q": "What is the core doctrine of protocol compliance in BRSA evaluation?",
   "options": [
    "Evaluators may use judgment when protocol is unclear",
    "Evaluators must follow protocol exactly",
    "Protocol is guidance not requirement",
    "Senior evaluators may modify protocol"
   ],
   "correct": 1,
   "why": "Protocol is mandatory requirement — not guidance, not discretionary."
  }
 },
 {
  "n": 4,
  "title": "Evaluation Integrity Violations and Prevention",
  "doctrine": "Evaluation integrity must be preserved at all times. Violations — including unauthorized evaluation activity, altered documentation, and concealed errors — compromise the reliability of the BRSA standard and must be reported immediately.",
  "protocols": [
   "BRSA-EV-PR-011: Documentation violations (interpretation, assumptions)",
   "BRSA-EV-PR-008: Prohibition on altering documentation outside protocol",
   "BRSA-EV-PR-009: Unauthorized evaluation activity",
   "BRSA-EV-PR-012: Reporting suspected integrity violations"
  ],
  "concepts": [
   "Evaluation integrity must be preserved at all times — no exceptions",
   "Altering documentation after submission violates BRSA-EV-PR-008",
   "Performing an evaluation without authorization violates BRSA-EV-PR-009",
   "Interpretation and assumptions in documentation violate BRSA-EV-PR-011",
   "Evaluators must report violations — they must never resolve them independently",
   "Concealing an integrity violation compromises standard reliability and institutional integrity",
   "Reporting protects the standard — it is a professional and doctrinal obligation"
  ],
  "sample": {
   "q": "What is the core doctrine of evaluation integrity?",
   "options": [
    "Integrity violations are acceptable if minor",
    "Evaluation integrity must be preserved at all times",
    "Senior evaluators may authorize exceptions",
    "Integrity applies only to final submissions"
   ],
   "correct": 1,
   "why": "Integrity must be preserved at all times — there are no minor violations or authorized exceptions."
  }
 },
 {
  "n": 5,
  "title": "Evaluation Practicum and Certification Assessment",
  "doctrine": "Certification requires demonstrated protocol competence — not just knowledge. The practicum tests applied ability to observe accurately, document correctly, verify before submission, and score within protocol criteria.",
  "protocols": [
   "BRSA-EV-PR-003: Protocol sequence in practicum",
   "BRSA-EV-PR-004: Scoring consistency",
   "BRSA-EV-PR-010: Verification before submission",
   "BRSA-EV-PR-005: Final submission and permanent record"
  ],
  "concepts": [
   "Module 5 tests applied competence — not just knowledge retention",
   "Certification requires demonstrated ability across all prior protocol areas",
   "Documentation in the practicum: record observable actions with timing, never interpret",
   "Verify documentation for accuracy and completeness before submission",
   "Scoring outside protocol criteria during practicum is disqualifying",
   "Submission is final and becomes part of the permanent record",
   "Successful completion qualifies for BRSA Apprentice Evaluator Certification",
   "Apprentice Evaluators may conduct independent evaluations within authorized scope"
  ],
  "sample": {
   "q": "What distinguishes Module 5 from Modules 1 through 4?",
   "options": [
    "It introduces new doctrine",
    "It is a demonstration module requiring applied competence not just knowledge",
    "It covers advanced scoring techniques",
    "It is optional for certification"
   ],
   "correct": 1,
   "why": "Module 5 is a practicum — it tests application of all prior doctrine, not knowledge recall."
  }
 },
 {
  "n": 6,
  "title": "The 12 Evidence Domains",
  "doctrine": "The BRSA Behavioral Readiness Evaluation Instrument organizes evidence into 12 defined domains. Evaluators record evidence events within domain boundaries — never outcome summaries. The readiness engine computes scores from recorded evidence using deterministic rules.",
  "protocols": [
   "12 evidence domains with specific boundaries",
   "Domain selection must match the observable evidence exactly",
   "Evaluators record evidence events — never outcome summaries or interpretations",
   "The readiness engine computes scores — not the evaluator"
  ],
  "concepts": [
   "There are exactly 12 evidence domains in the BRSA instrument",
   "Domain 1: Identity Verification — government ID, legal name consistency",
   "Domain 2: Contact Stability — address and contact information",
   "Domain 3: Housing Stability — lease documentation, housing history",
   "Domain 4: Employment and Economic Activity",
   "Domain 5: Program Engagement",
   "Domain 6: Compliance Behavior",
   "Domain 7: Behavioral Reliability — attendance, consistency over time",
   "Domain 8: Social Stability — pro-social behavior, conflict resolution, mentorship",
   "Domain 9: Health and Wellbeing",
   "Domain 10: Skill Development",
   "Domain 11: Self-Regulation — emotional management, impulse control, response to feedback",
   "Domain 12: Forward Readiness Signals — goal-setting, long-term thinking, readiness for independence",
   "The readiness engine computes scores using deterministic rules — not the evaluator",
   "Evaluators must never record outcome summaries like 'participant is doing well'"
  ],
  "sample": {
   "q": "How many evidence domains exist in the BRSA Behavioral Readiness Evaluation Instrument?",
   "options": [
    "8",
    "10",
    "12",
    "15"
   ],
   "correct": 2,
   "why": "The BRSA instrument has exactly 12 evidence domains."
  }
 },
 {
  "n": 7,
  "title": "Evidence Event Recording and Submission",
  "doctrine": "Evidence event submission is a precise, four-step process: (1) Select the participant and confirm identity. (2) Select the correct evidence domain. (3) Record the evidence event payload as observable behavior only. (4) Verify before submission. Submitted events are permanent and cannot be altered.",
  "protocols": [
   "Step 1: Select participant and confirm identity",
   "Step 2: Select evidence domain",
   "Step 3: Record evidence event — observable behavior only",
   "Step 4: Verify before submission — submission is final"
  ],
  "concepts": [
   "Step 1: Confirm participant identity before proceeding",
   "Step 2: Select the correct domain — wrong domain compromises readiness engine reliability",
   "Step 3: Evidence payload must reflect observable behavior only — never evaluator conclusions",
   "Step 4: Verify before submission — once submitted, the record cannot be altered",
   "Submitting an evidence event triggers the readiness computation cycle",
   "Recording an event in the wrong domain compromises readiness engine reliability",
   "'Participant seems unstable' in the payload violates evidence doctrine",
   "Post-submission alteration outside authorized protocol is prohibited"
  ],
  "sample": {
   "q": "What is the first step before recording any evidence event?",
   "options": [
    "Select the evidence domain",
    "Confirm participant identity",
    "Verify documentation",
    "Submit the prior session record"
   ],
   "correct": 1,
   "why": "Step 1 is always confirming participant identity before proceeding with any evidence event."
  }
 },
 {
  "n": 8,
  "title": "Evaluator Ethics, Boundaries, and Certification Maintenance",
  "doctrine": "Evaluator authority is bounded by protocol and ethics. BRSA Certified Evaluators must maintain professional boundaries, disclose conflicts of interest, uphold confidentiality, and complete required maintenance to preserve certification standing.",
  "protocols": [
   "Conflict of interest: disclose and recuse",
   "Confidentiality: participant data is never shared outside authorized channels",
   "Certification maintenance: required recertification to preserve standing",
   "Boundaries: evaluator authority is bounded by protocol — never expanded by experience"
  ],
  "concepts": [
   "Evaluator authority is bounded by protocol and ethics — experience does not expand authority",
   "Conflict of interest: disclose the relationship and recuse from the evaluation",
   "Confidentiality violations compromise participant trust and institutional integrity",
   "Certification must be maintained through required recertification — it does not persist indefinitely",
   "Evaluators must refuse assignments that create conflicts of interest",
   "Sharing participant data outside authorized channels is a confidentiality violation",
   "Lapsed certification means the evaluator may not conduct evaluations",
   "Boundaries protect both the participant and the integrity of the BRSA standard"
  ],
  "sample": {
   "q": "What is the core doctrine of evaluator authority in BRSA?",
   "options": [
    "Evaluator authority expands with experience",
    "Evaluator authority is bounded by protocol and ethics",
    "Senior evaluators have unlimited authority",
    "Authority is granted by the organization not BRSA"
   ],
   "correct": 1,
   "why": "Evaluator authority is always bounded by protocol and ethics — experience never expands authority."
  }
 }
];
