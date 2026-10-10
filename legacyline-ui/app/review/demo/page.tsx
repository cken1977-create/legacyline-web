import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReadingRoom from "../ReadingRoom";
import { DEMO_CASES, DEMO_PERSON, DEMO_RUN, DEMO_TIMELINE } from "../../../lib/demo";

export const metadata: Metadata = { title: "Reading Room (sample)", robots: { index: false, follow: false } };

// Design-review fixture with fictional cases. Never served on the production deployment.
export default function DemoRoom() {
  if (process.env.VERCEL_ENV === "production") notFound();
  const details = Object.fromEntries(DEMO_CASES.map((c) => [c.id, c.id === DEMO_PERSON.participantId
    ? { run: DEMO_RUN, timeline: DEMO_TIMELINE, intake: DEMO_PERSON.intake }
    : { run: null, timeline: [], intake: null }]));
  return <ReadingRoom demo={{ cases: DEMO_CASES, details, reviewer: "reviewer.demo@example.com", initialCase: DEMO_PERSON.participantId }} />;
}
