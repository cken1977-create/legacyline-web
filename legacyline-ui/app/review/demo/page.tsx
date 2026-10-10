import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReadingRoom from "../ReadingRoom";
import { DEMO_CASES, DEMO_PERSON, DEMO_RUN, DEMO_RUN_READY, DEMO_TIMELINE } from "../../../lib/demo";

export const metadata: Metadata = { title: "Reading Room (sample)", robots: { index: false, follow: false } };

// Design-review fixture with fictional cases. Never served on the production deployment.
// ?case=ptc-demo-0004 shows the second-key (two-reviewer) certification state.
export default function DemoRoom() {
  if (process.env.VERCEL_ENV === "production") notFound();
  const details = Object.fromEntries(DEMO_CASES.map((c) => [c.id,
    c.id === DEMO_PERSON.participantId ? { run: DEMO_RUN, timeline: DEMO_TIMELINE, intake: DEMO_PERSON.intake }
    : c.id === "ptc-demo-0004" ? { run: DEMO_RUN_READY, timeline: [], intake: { docs_uploaded: { gov_id: true, selfie: true, bank_statement: true }, housing_type: "rent", monthly_housing_cost: "950", employment_status: "employed_full", employer_name: "Mesa Logistics", monthly_income: "3600", address: "1 Demo Way" } }
    : { run: null, timeline: [], intake: null }]));
  const evals = { "ptc-demo-0004": { status: "submitted", evaluator_email: "j.okafor.demo@example.com", recommended_next: "certification", narrative_notes: "Verified photo ID against the selfie, bank statement (Sept) matches stated income within 5%, lease shows the current address. Recommending certification." } };
  return <ReadingRoom demo={{ cases: DEMO_CASES, details, evals, reviewer: "reviewer.demo@example.com", initialCase: DEMO_PERSON.participantId }} />;
}
