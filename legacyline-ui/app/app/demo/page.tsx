import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MyRecord from "../MyRecord";
import { DEMO_PERSON } from "../../../lib/demo";

export const metadata: Metadata = { title: "Sample record", robots: { index: false, follow: false } };

// Sales demo fixture: fictional data only, no API calls. On production only when KAMILI_PUBLIC_DEMO=1.
export default function DemoRecord() {
  if (process.env.VERCEL_ENV === "production" && process.env.KAMILI_PUBLIC_DEMO !== "1") notFound();
  return <MyRecord demo={DEMO_PERSON} />;
}
