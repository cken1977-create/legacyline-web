import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MyRecord from "../MyRecord";
import { DEMO_PERSON } from "../../../lib/demo";
import PersonFollowUp from "../../_components/program/FollowUp";
import { demoPagesAllowed } from "../../../lib/demo-mode";

export const metadata: Metadata = { title: "Sample record", robots: { index: false, follow: false } };

// Design-review fixture. Never served on the production deployment.
export default function DemoRecord() {
  if (!demoPagesAllowed()) notFound();
  return <MyRecord demo={DEMO_PERSON} extra={<PersonFollowUp />} />;
}
