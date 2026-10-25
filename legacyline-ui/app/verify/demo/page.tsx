import { notFound } from "next/navigation";
import type { Metadata } from "next";
import VerifyView from "../VerifyView";
import { DEMO_VERIFY } from "../../../lib/demo";

export const metadata: Metadata = { title: "Verify a record (sample)", robots: { index: false, follow: false } };

// Sample lookups for the standing demo. Never served on production; never calls the live registry.
export default function DemoVerify() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <VerifyView demo={DEMO_VERIFY} />;
}
