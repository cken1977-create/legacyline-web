import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MyRecord from "../MyRecord";
import { DEMO_PERSON } from "../../../lib/demo";

export const metadata: Metadata = { title: "Sample record", robots: { index: false, follow: false } };

// Design-review fixture. Never served on the production deployment.
export default function DemoRecord() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <MyRecord demo={DEMO_PERSON} />;
}
