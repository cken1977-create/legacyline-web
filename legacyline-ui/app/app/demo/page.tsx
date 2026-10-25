import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MyRecord from "../MyRecord";
import { DEMO_FOLLOW, DEMO_PERSON } from "../../../lib/demo";
import { demoPagesAllowed } from "../../../lib/demo-mode";

export const metadata: Metadata = { title: "Sample record", robots: { index: false, follow: false } };

// Maya's person app with sample data: nudges on, check-ins, progress,
// re-review, coaching and consent. Never served on the real site.
export default function DemoRecord() {
  if (!demoPagesAllowed()) notFound();
  return <MyRecord demo={DEMO_PERSON} follow={DEMO_FOLLOW} nudgesOn />;
}
